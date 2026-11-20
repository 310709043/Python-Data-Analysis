from datetime import timedelta

from conftest import ADMIN, link, log, log_and_confirm, login, signup


def opt_in(client, h):
    assert client.patch("/me/settings", json={"show_on_leaderboard": True}, headers=h).status_code == 200


def test_full_flow_mutual_confirmation(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    clock.advance(days=31)  # 過了新帳號試用期
    ha, hb = login(client, "alice"), login(client, "bob")  # 登入 30 天過期

    r = log(client, ha, b, clock.t - timedelta(hours=1))
    assert r.status_code == 201
    assert r.json()["status"] == "pending" and r.json()["counted"] is False

    # 還沒確認前不計分
    assert client.get("/me/stats", headers=ha).json()["counted"] == 0
    incoming = client.get("/encounters/incoming", headers=hb).json()
    assert [e["id"] for e in incoming] == [r.json()["id"]]

    r = client.post(f"/encounters/{r.json()['id']}/confirm", headers=hb)
    assert r.status_code == 200 and r.json()["counted"] is True
    assert client.get("/me/stats", headers=ha).json()["counted"] == 1
    assert client.get("/me/stats", headers=hb).json()["counted"] == 1

    # 預設不公開
    assert client.get("/leaderboard", headers=ha).json() == []
    opt_in(client, ha)
    opt_in(client, hb)
    board = client.get("/leaderboard?period=week", headers=ha).json()
    assert board == [
        {"rank": 1, "nickname": "alice", "count": 1},
        {"rank": 1, "nickname": "bob", "count": 1},
    ]


def test_new_accounts_not_on_leaderboard(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    opt_in(client, ha)
    assert client.get("/leaderboard", headers=ha).json() == []


def test_requires_partner_link(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    r = log(client, ha, b, clock.t)
    assert r.status_code == 403 and r.json()["error"] == "not_partners"


def test_requires_age_verification_and_consent(client, clock):
    _, h_noage = signup(client, "noage", verify_age=False)
    r = client.post("/partners", json={"nickname": "noage"}, headers=h_noage)
    assert r.json()["error"] == "age_not_verified"

    _, h_noconsent = signup(client, "noconsent", consent=False)
    r = client.post("/partners", json={"nickname": "noage"}, headers=h_noconsent)
    assert r.json()["error"] == "consent_required"


def test_time_rules(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    assert log(client, ha, b, clock.t + timedelta(hours=1)).json()["error"] == "occurred_in_future"
    assert log(client, ha, b, clock.t - timedelta(days=8)).json()["error"] == "too_old"


def test_min_interval_and_daily_cap(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    # 台灣時間 2026-11-20 00:30 = UTC 11-19 16:30
    day_start = clock.t.replace(hour=16, minute=30) - timedelta(days=1)

    assert log(client, ha, b, day_start).status_code == 201
    r = log(client, ha, b, day_start + timedelta(minutes=10))
    assert r.status_code == 429 and r.json()["error"] == "too_frequent"

    for i in range(1, 5):
        assert log(client, ha, b, day_start + timedelta(hours=i)).status_code == 201
    r = log(client, ha, b, day_start + timedelta(hours=5))
    assert r.status_code == 429 and r.json()["error"] == "daily_cap_reached"


def test_only_partner_can_confirm_and_expiry(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    enc_id = log(client, ha, b, clock.t).json()["id"]

    assert client.post(f"/encounters/{enc_id}/confirm", headers=ha).status_code == 404

    clock.advance(hours=25)
    r = client.post(f"/encounters/{enc_id}/confirm", headers=hb)
    assert r.status_code == 404 or r.json()["error"] == "not_pending"
    mine = client.get("/encounters", headers=ha).json()
    assert mine[0]["status"] == "expired"


def test_partner_capacity_checked_privately_on_confirm(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    c, hc = signup(client, "carol")
    link(client, ha, hb, "bob")
    link(client, hc, hb, "bob")
    t = clock.t - timedelta(hours=2)
    log_and_confirm(client, hc, hb, b, t)

    # alice 看不到 bob 跟 carol 的紀錄，所以建立會成功
    r = log(client, ha, b, t + timedelta(minutes=10))
    assert r.status_code == 201
    # bob 確認時才擋下，錯誤只有 bob 看得到
    r = client.post(f"/encounters/{r.json()['id']}/confirm", headers=hb)
    assert r.status_code == 429 and r.json()["error"] == "too_frequent"


def test_shared_device_is_flagged_until_reviewed(client, clock):
    a, ha = signup(client, "alice", device="same-phone")
    b, hb = signup(client, "sockpuppet", device="same-phone")
    link(client, ha, hb, "sockpuppet")
    enc = log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    assert enc["review_status"] == "flagged" and enc["counted"] is False

    stats = client.get("/me/stats", headers=ha).json()
    assert stats["counted"] == 0 and stats["under_review"] == 1

    flagged = client.get("/admin/encounters/flagged", headers=ADMIN).json()
    assert flagged[0]["flag_reasons"] == "shared_device"
    client.post(f"/admin/encounters/{enc['id']}/review", json={"decision": "clear"}, headers=ADMIN)
    assert client.get("/me/stats", headers=ha).json()["counted"] == 1


def test_pair_burst_flagged(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    start = clock.t.replace(hour=16, minute=30) - timedelta(days=1)
    results = [log_and_confirm(client, ha, hb, b, start + timedelta(hours=i)) for i in range(4)]
    assert [r["review_status"] for r in results] == ["ok", "ok", "ok", "flagged"]


def test_ring_detection(client, clock):
    users = [signup(client, n) for n in ("r1", "r2", "r3")]
    (a, ha), (b, hb), (c, hc) = users
    link(client, ha, hb, "r2")
    link(client, hb, hc, "r3")
    link(client, hc, ha, "r1")
    # 一對真情侶，不該被抓
    x, hx = signup(client, "xavier")
    y, hy = signup(client, "yuki")
    link(client, hx, hy, "yuki")

    for _ in range(6):
        clock.advance(days=1)
        t = clock.t
        log_and_confirm(client, ha, hb, b, t - timedelta(hours=3))
        log_and_confirm(client, hb, hc, c, t - timedelta(hours=2))
        log_and_confirm(client, hc, ha, a, t - timedelta(hours=1))
        log_and_confirm(client, hx, hy, y, t - timedelta(hours=1))
        log_and_confirm(client, hy, hx, x, t - timedelta(hours=3))

    r = client.post("/admin/jobs/detect-rings", headers=ADMIN)
    assert r.json()["rings"] == [sorted([a, b, c])]
    assert client.get("/me/stats", headers=ha).json()["counted"] == 0
    assert client.get("/me/stats", headers=hx).json()["counted"] == 12


def test_partner_reject_cooldown(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link_id = client.post("/partners", json={"nickname": "bob"}, headers=ha).json()["id"]
    client.post(f"/partners/{link_id}/reject", headers=hb)
    r = client.post("/partners", json={"nickname": "bob"}, headers=ha)
    assert r.status_code == 429 and r.json()["error"] == "cooldown"
    clock.advance(days=31)
    ha = login(client, "alice")
    assert client.post("/partners", json={"nickname": "bob"}, headers=ha).status_code == 201


def test_unlinking_cancels_pending(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    log(client, ha, b, clock.t)
    link_id = client.get("/partners", headers=ha).json()[0]["id"]
    assert client.delete(f"/partners/{link_id}", headers=hb).status_code == 204
    assert client.get("/encounters", headers=ha).json()[0]["status"] == "cancelled"


def test_delete_account(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=2))
    pending_id = log(client, ha, b, clock.t).json()["id"]

    assert client.delete("/me", headers=hb).status_code == 204
    assert client.get("/me", headers=hb).status_code == 401

    mine = {e["id"]: e for e in client.get("/encounters", headers=ha).json()}
    assert mine[pending_id]["status"] == "cancelled"
    assert all(e["other_user_id"] is None and e["other_nickname"] is None for e in mine.values())
    # alice 自己的已確認紀錄保留
    assert client.get("/me/stats", headers=ha).json()["counted"] == 1
    # 暱稱釋出，可以被別人註冊
    signup(client, "bob")


def test_otp_wrong_code_and_attempt_limit(client, clock):
    r = client.post("/auth/otp/request", json={"phone": "0912345678"})
    code = r.json()["dev_code"]
    wrong = "000000" if code != "000000" else "111111"
    for _ in range(5):
        r = client.post("/auth/otp/verify", json={"phone": "0912345678", "code": wrong, "nickname": "zed"})
        assert r.json()["error"] == "invalid_code"
    r = client.post("/auth/otp/verify", json={"phone": "0912345678", "code": code, "nickname": "zed"})
    assert r.json()["error"] == "too_many_attempts"


def test_admin_endpoints_require_token(client, clock):
    a, _ = signup(client, "alice")
    r = client.post(f"/admin/users/{a}/age-verification", json={"verified": True})
    assert r.status_code == 403


def test_unconfirmed_incoming_does_not_block_confirmation(client, clock):
    """別人發來、還沒確認的紀錄不能佔用我的額度（否則別人可以用待確認紀錄卡住我）。"""
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    c, hc = signup(client, "carol")
    link(client, ha, hb, "bob")
    link(client, hc, hb, "bob")
    t = clock.t - timedelta(hours=2)
    from_a = log(client, ha, b, t).json()["id"]
    from_c = log(client, hc, b, t + timedelta(minutes=10)).json()["id"]

    # bob 可以確認其中一筆
    assert client.post(f"/encounters/{from_c}/confirm", headers=hb).status_code == 200
    # 另一筆跟已確認的太接近，才會被擋
    r = client.post(f"/encounters/{from_a}/confirm", headers=hb)
    assert r.status_code == 429 and r.json()["error"] == "too_frequent"


def test_many_incoming_requests_do_not_exhaust_daily_cap(client, clock):
    b, hb = signup(client, "bob")
    senders = [signup(client, f"user{i}") for i in range(6)]
    day_start = clock.t.replace(hour=16, minute=30) - timedelta(days=1)
    ids = []
    for i, (_, h) in enumerate(senders):
        link(client, h, hb, "bob")
        ids.append(log(client, h, b, day_start + timedelta(hours=i)).json()["id"])

    results = [client.post(f"/encounters/{i}/confirm", headers=hb) for i in ids]
    assert [r.status_code for r in results] == [200] * 5 + [429]
    assert results[-1].json()["error"] == "daily_cap_reached"


def test_own_outgoing_pending_still_reserves_capacity(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    c, hc = signup(client, "carol")
    link(client, ha, hb, "bob")
    link(client, ha, hc, "carol")
    t = clock.t - timedelta(hours=1)
    assert log(client, ha, b, t).status_code == 201
    r = log(client, ha, c, t + timedelta(minutes=10))
    assert r.status_code == 429 and r.json()["error"] == "too_frequent"
