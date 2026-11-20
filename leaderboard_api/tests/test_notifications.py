from datetime import timedelta

from conftest import ADMIN, link, log, log_and_confirm, login, signup


def notes(client, h, filter="all"):
    r = client.get(f"/notifications?filter={filter}", headers=h)
    assert r.status_code == 200, r.text
    return r.json()


def kinds(client, h):
    return [n["kind"] for n in notes(client, h)]


def opt_in(client, h):
    assert client.patch("/me/settings", json={"show_on_leaderboard": True}, headers=h).status_code == 200


# ── 伴侶邀請 ─────────────────────────────────────────


def test_partner_request_and_accept_notifications(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link_id = client.post("/partners", json={"nickname": "bob"}, headers=ha).json()["id"]

    [n] = [x for x in notes(client, hb) if x["kind"] == "partner_request"]
    assert n["message"] == "alice 想加你為伴侶"
    assert n["actionable"] is True and n["link_id"] == link_id and n["read"] is False
    assert [x["kind"] for x in notes(client, hb, "todo")] == ["partner_request"]

    client.post(f"/partners/{link_id}/accept", headers=hb)
    # 接受之後就不需要處理了
    assert notes(client, hb, "todo") == []
    [acc] = [x for x in notes(client, ha) if x["kind"] == "partner_accepted"]
    assert acc["message"] == "bob 接受了你的伴侶邀請"


def test_rejecting_partner_sends_no_notification(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link_id = client.post("/partners", json={"nickname": "bob"}, headers=ha).json()["id"]
    client.post(f"/partners/{link_id}/reject", headers=hb)
    assert "partner_accepted" not in kinds(client, ha)


# ── 紀錄 ─────────────────────────────────────────────


def test_encounter_pending_and_confirmed_notifications(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    # 台灣時間 11/20 21:00
    enc_id = log(client, ha, b, clock.t - timedelta(hours=1)).json()["id"]

    [p] = notes(client, hb, "todo")
    assert p["kind"] == "encounter_pending" and p["encounter_id"] == enc_id
    assert p["message"] == "alice 記錄了你們 11/20 的一次，等你確認"

    client.post(f"/encounters/{enc_id}/confirm", headers=hb)
    assert notes(client, hb, "todo") == []
    [c] = [x for x in notes(client, ha) if x["kind"] == "encounter_confirmed"]
    assert c["message"] == "bob 確認了你們 11/20 的紀錄，雙方各 +1"


def test_flagged_confirmation_says_under_review(client, clock):
    a, ha = signup(client, "alice", device="same-phone")
    b, hb = signup(client, "sock", device="same-phone")
    link(client, ha, hb, "sock")
    enc = log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    [c] = [x for x in notes(client, ha) if x["kind"] == "encounter_confirmed"]
    assert c["message"].endswith("審核通過後就會計入")

    client.post(f"/admin/encounters/{enc['id']}/review", json={"decision": "clear"}, headers=ADMIN)
    for h, other in ((ha, "sock"), (hb, "alice")):
        [r] = [x for x in notes(client, h) if x["kind"] == "review_cleared"]
        assert r["message"] == f"你和 {other} 11/20 的紀錄審核通過，已經計入"

    # 同樣的決定再送一次不會重複通知
    client.post(f"/admin/encounters/{enc['id']}/review", json={"decision": "clear"}, headers=ADMIN)
    assert kinds(client, ha).count("review_cleared") == 1


def test_review_void_notifies_both(client, clock):
    a, ha = signup(client, "alice", device="same-phone")
    b, hb = signup(client, "sock", device="same-phone")
    link(client, ha, hb, "sock")
    enc = log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    client.post(f"/admin/encounters/{enc['id']}/review", json={"decision": "void"}, headers=ADMIN)
    assert "review_voided" in kinds(client, ha)
    assert "review_voided" in kinds(client, hb)


def test_expired_encounter_notifies_initiator_once(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    log(client, ha, b, clock.t - timedelta(hours=1))
    clock.advance(hours=25)

    # 多個請求都會觸發過期檢查，但只能通知一次
    client.get("/me/stats", headers=hb)
    client.get("/encounters", headers=ha)
    expired = [x for x in notes(client, ha) if x["kind"] == "encounter_expired"]
    assert len(expired) == 1
    assert expired[0]["message"] == "bob 沒有在 24 小時內確認，11/20 的紀錄已作廢"
    # bob 那邊的待確認通知不再需要處理
    assert notes(client, hb, "todo") == []


def test_age_verified_notification_only_on_first_verification(client, clock):
    uid, h = signup(client, "alice", verify_age=False)
    client.post(f"/admin/users/{uid}/age-verification", json={"verified": True}, headers=ADMIN)
    client.post(f"/admin/users/{uid}/age-verification", json={"verified": True}, headers=ADMIN)
    assert kinds(client, h).count("age_verified") == 1
    assert notes(client, h)[0]["message"] == "18 歲驗證通過，可以開始記錄了"


# ── 已讀 ─────────────────────────────────────────────


def test_unread_count_and_mark_read(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")  # bob: age_verified + partner_request
    assert client.get("/notifications/unread-count", headers=hb).json() == {"unread": 2}

    first = notes(client, hb)[0]["id"]
    assert client.post(f"/notifications/{first}/read", headers=hb).status_code == 204
    assert client.get("/notifications/unread-count", headers=hb).json() == {"unread": 1}

    # 不能把別人的通知標成已讀
    assert client.post(f"/notifications/{first}/read", headers=ha).status_code == 404

    assert client.post("/notifications/read-all", headers=hb).status_code == 204
    assert client.get("/notifications/unread-count", headers=hb).json() == {"unread": 0}
    assert all(n["read"] for n in notes(client, hb))


def test_pagination_with_before_id(client, clock):
    uid, h = signup(client, "alice")
    others = [signup(client, f"user{i}") for i in range(4)]
    for _, ho in others:
        client.post("/partners", json={"nickname": "alice"}, headers=ho)
    first_page = client.get("/notifications?limit=2", headers=h).json()
    assert len(first_page) == 2
    rest = client.get(f"/notifications?limit=10&before_id={first_page[-1]['id']}", headers=h).json()
    ids = [n["id"] for n in first_page + rest]
    assert ids == sorted(ids, reverse=True) and len(ids) == len(set(ids)) == 5


# ── 排名上升 ─────────────────────────────────────────


def test_rank_up_notification(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    c, hc = signup(client, "carol")
    d, hd = signup(client, "dave")
    clock.advance(days=31)
    ha, hb, hc, hd = (login(client, n) for n in ("alice", "bob", "carol", "dave"))
    for h in (ha, hb, hc, hd):
        opt_in(client, h)
    link(client, ha, hb, "bob")
    link(client, hc, hd, "dave")

    # carol/dave 兩次、alice/bob 一次
    log_and_confirm(client, hc, hd, d, clock.t - timedelta(hours=5))
    log_and_confirm(client, hc, hd, d, clock.t - timedelta(hours=4))
    log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=3))

    # 第一次只記錄名次，不發通知
    assert client.post("/admin/jobs/rank-notifications", headers=ADMIN).json() == {"sent": 0}

    # alice/bob 再兩次，超過 carol/dave
    log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=2))
    log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    assert client.post("/admin/jobs/rank-notifications", headers=ADMIN).json() == {"sent": 2}
    [r] = [x for x in notes(client, ha) if x["kind"] == "rank_up"]
    assert r["message"] == "你的本月排名上升到第 1 名"
    assert "rank_up" not in kinds(client, hc)

    # 名次沒變就不再通知
    assert client.post("/admin/jobs/rank-notifications", headers=ADMIN).json() == {"sent": 0}


def test_rank_resets_when_leaving_leaderboard(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    clock.advance(days=31)
    ha, hb = login(client, "alice"), login(client, "bob")
    opt_in(client, ha)
    link(client, ha, hb, "bob")
    log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    client.post("/admin/jobs/rank-notifications", headers=ADMIN)

    # 關掉公開 → 掉出排行榜，名次清空；再打開不會被當成「上升」
    client.patch("/me/settings", json={"show_on_leaderboard": False}, headers=ha)
    client.post("/admin/jobs/rank-notifications", headers=ADMIN)
    opt_in(client, ha)
    assert client.post("/admin/jobs/rank-notifications", headers=ADMIN).json() == {"sent": 0}


# ── 刪除帳號 ─────────────────────────────────────────


def test_deleted_actor_is_anonymized_in_notifications(client, clock):
    a, ha = signup(client, "alice")
    b, hb = signup(client, "bob")
    link(client, ha, hb, "bob")
    assert client.delete("/me", headers=hb).status_code == 204

    [acc] = [x for x in notes(client, ha) if x["kind"] == "partner_accepted"]
    assert acc["actor_nickname"] is None
    assert acc["message"] == "對方 接受了你的伴侶邀請"


# ── 登出 ─────────────────────────────────────────────


def test_logout_only_this_device(client, clock):
    a, h1 = signup(client, "alice")
    h2 = login(client, "alice")
    assert client.post("/auth/logout", headers=h1).status_code == 204
    assert client.get("/me", headers=h1).status_code == 401
    assert client.get("/me", headers=h2).status_code == 200


def test_logout_all_devices(client, clock):
    a, h1 = signup(client, "alice")
    h2 = login(client, "alice")
    assert client.post("/auth/logout-all", headers=h2).status_code == 204
    assert client.get("/me", headers=h1).status_code == 401
    assert client.get("/me", headers=h2).status_code == 401


def test_logout_all_does_not_erase_device_history(client, clock):
    """作弊的人不能靠「登出所有裝置」清掉共用裝置的痕跡。"""
    a, ha = signup(client, "alice", device="same-phone")
    b, hb = signup(client, "sock", device="same-phone")
    link(client, ha, hb, "sock")
    client.post("/auth/logout-all", headers=ha)
    client.post("/auth/logout-all", headers=hb)

    # 各自換一台新裝置重新登入，從新裝置記錄和確認
    hb = login(client, "sock", device="other-phone")
    ha = login(client, "alice", device="third-phone")
    enc = log_and_confirm(client, ha, hb, b, clock.t - timedelta(hours=1))
    assert enc["review_status"] == "flagged"
