"""次數排行榜 API：雙方確認制。

流程：
1. 手機簡訊登入 → 同意隱私權政策 → 後台／KYC 完成 18 歲驗證
2. 互相加為伴侶（一方邀請、另一方接受）
3. 一方記錄一次 → 對方 24 小時內確認 → 才算進雙方次數
4. 系統自動標記可疑紀錄，人工審核後才決定是否計分
"""
from contextlib import asynccontextmanager
from datetime import timedelta

from fastapi import Depends, FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session

from . import clock, rules
from .config import DEV_MODE, PRIVACY_POLICY_VERSION
from .db import Base, engine, get_db
from .models import AuthSession, DeviceSighting, Encounter, Notification, OtpCode, PartnerLink, User
from .notifications import encounter_date, is_actionable, notify, render
from .notify import send_sms
from .schemas import (
    AgeVerificationIn,
    ConsentIn,
    EncounterIn,
    EncounterOut,
    FlaggedEncounterOut,
    LeaderboardRow,
    MeOut,
    NotificationOut,
    OtpRequestIn,
    OtpRequestOut,
    OtpVerifyIn,
    PartnerLinkOut,
    PartnerRequestIn,
    ReviewIn,
    SettingsIn,
    StatsOut,
    TokenOut,
    UnreadCountOut,
)
from .security import (
    device_hash,
    get_current_session,
    get_current_user,
    new_otp_code,
    new_token,
    normalize_phone,
    otp_hash,
    phone_hash,
    require_admin,
    token_hash,
)

OTP_TTL = timedelta(minutes=5)
OTP_MAX_PER_HOUR = 5
OTP_MAX_ATTEMPTS = 5
SESSION_TTL = timedelta(days=30)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # 開發用：自動建表。正式環境請改用 Alembic 做 migration。
    Base.metadata.create_all(engine)
    yield


app = FastAPI(title="Leaderboard API", lifespan=lifespan)


@app.exception_handler(rules.RuleError)
async def rule_error_handler(_req: Request, exc: rules.RuleError):
    return JSONResponse(status_code=exc.status, content={"error": exc.code, "message": exc.message})


def err(status: int, code: str, message: str):
    raise rules.RuleError(code, message, status)


# ── 登入 ───────────────────────────────────────────────


@app.post("/auth/otp/request", response_model=OtpRequestOut)
def otp_request(body: OtpRequestIn, db: Session = Depends(get_db)):
    phone = normalize_phone(body.phone)
    if phone is None:
        err(422, "invalid_phone", "手機號碼格式不正確")
    now = clock.now()
    ph = phone_hash(phone)
    recent = db.scalar(
        select(func.count())
        .select_from(OtpCode)
        .where(OtpCode.phone_hash == ph, OtpCode.created_at > now - timedelta(hours=1))
    )
    if recent >= OTP_MAX_PER_HOUR:
        err(429, "too_many_requests", "請稍後再試")
    code = new_otp_code()
    db.add(OtpCode(phone_hash=ph, code_hash=otp_hash(ph, code), created_at=now, expires_at=now + OTP_TTL))
    db.commit()
    send_sms(phone, code)
    return OtpRequestOut(sent=True, dev_code=code if DEV_MODE else None)


@app.post("/auth/otp/verify", response_model=TokenOut)
def otp_verify(body: OtpVerifyIn, db: Session = Depends(get_db), dev: str | None = Depends(device_hash)):
    phone = normalize_phone(body.phone)
    if phone is None:
        err(422, "invalid_phone", "手機號碼格式不正確")
    now = clock.now()
    ph = phone_hash(phone)
    user = db.scalar(select(User).where(User.phone_hash == ph))

    if user is None:
        if not body.nickname:
            err(422, "nickname_required", "新帳號需要設定暱稱")
        if body.nickname.lower().startswith("deleted-"):
            err(422, "nickname_reserved", "這個暱稱不能使用")
        if db.scalar(select(User.id).where(User.nickname == body.nickname)):
            err(409, "nickname_taken", "暱稱已被使用")

    otp = db.scalar(
        select(OtpCode)
        .where(OtpCode.phone_hash == ph, OtpCode.used_at.is_(None), OtpCode.expires_at > now)
        .order_by(OtpCode.id.desc())
    )
    if otp is None:
        err(400, "invalid_code", "驗證碼錯誤或已過期")
    otp.attempts += 1
    if otp.attempts > OTP_MAX_ATTEMPTS:
        otp.used_at = now
        db.commit()
        err(429, "too_many_attempts", "錯誤次數過多，請重新取得驗證碼")
    if otp.code_hash != otp_hash(ph, body.code):
        db.commit()
        err(400, "invalid_code", "驗證碼錯誤或已過期")
    otp.used_at = now

    is_new = user is None
    if is_new:
        user = User(nickname=body.nickname, phone_hash=ph, created_at=now)
        db.add(user)
        db.flush()

    if dev is not None:
        sighting = db.get(DeviceSighting, (user.id, dev))
        if sighting is None:
            db.add(DeviceSighting(user_id=user.id, device_hash=dev, first_seen_at=now, last_seen_at=now))
        else:
            sighting.last_seen_at = now

    token = new_token()
    db.add(
        AuthSession(
            token_hash=token_hash(token),
            user_id=user.id,
            device_hash=dev,
            created_at=now,
            expires_at=now + SESSION_TTL,
        )
    )
    db.commit()
    return TokenOut(token=token, user_id=user.id, is_new=is_new)


@app.post("/auth/logout", status_code=204)
def logout(sess: AuthSession = Depends(get_current_session), db: Session = Depends(get_db)):
    """登出這台裝置：只刪掉目前這個 token。"""
    db.delete(sess)
    db.commit()


@app.post("/auth/logout-all", status_code=204)
def logout_all(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """登出所有裝置：刪掉這個帳號全部的 token。裝置紀錄 (device_sightings) 保留，防作弊要用。"""
    db.execute(delete(AuthSession).where(AuthSession.user_id == user.id))
    db.commit()


# ── 我的帳號 ───────────────────────────────────────────


@app.get("/privacy-policy/version")
def privacy_policy_version():
    return {"version": PRIVACY_POLICY_VERSION}


def me_out(user: User) -> MeOut:
    return MeOut(
        id=user.id,
        nickname=user.nickname,
        age_verified=user.age_verified,
        consent_version=user.consent_version,
        privacy_policy_version=PRIVACY_POLICY_VERSION,
        show_on_leaderboard=user.show_on_leaderboard,
        created_at=clock.to_aware(user.created_at),
        leaderboard_eligible_from=clock.to_aware(user.created_at + rules.LEADERBOARD_PROBATION),
    )


@app.get("/me", response_model=MeOut)
def get_me(user: User = Depends(get_current_user)):
    return me_out(user)


@app.post("/me/consent", response_model=MeOut)
def give_consent(body: ConsentIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.version != PRIVACY_POLICY_VERSION:
        err(422, "wrong_version", "請同意最新版的隱私權政策")
    user.consent_version = body.version
    user.consent_at = clock.now()
    db.commit()
    return me_out(user)


@app.patch("/me/settings", response_model=MeOut)
def update_settings(body: SettingsIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user.show_on_leaderboard = body.show_on_leaderboard
    db.commit()
    return me_out(user)


@app.get("/me/stats", response_model=StatsOut)
def my_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rules.expire_stale(db, clock.now())
    db.commit()

    def count(*conds):
        return db.scalar(select(func.count()).select_from(Encounter).where(*conds))

    return StatsOut(
        counted=count(rules.involves(user.id), rules.is_counted()),
        under_review=count(
            rules.involves(user.id), Encounter.status == "confirmed", Encounter.review_status == "flagged"
        ),
        pending_outgoing=count(Encounter.initiator_id == user.id, Encounter.status == "pending"),
        pending_incoming=count(Encounter.partner_id == user.id, Encounter.status == "pending"),
    )


@app.delete("/me", status_code=204)
def delete_me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """刪除帳號：抹除個人身分。對方的紀錄保留，但不再連到這個人。"""
    uid, now = user.id, clock.now()
    db.execute(
        update(Encounter).where(rules.involves(uid), Encounter.status == "pending").values(status="cancelled")
    )
    db.execute(
        update(Encounter)
        .where(Encounter.initiator_id == uid)
        .values(initiator_id=None, initiator_device_hash=None)
    )
    db.execute(
        update(Encounter).where(Encounter.partner_id == uid).values(partner_id=None, partner_device_hash=None)
    )
    db.execute(
        delete(PartnerLink).where((PartnerLink.user_low_id == uid) | (PartnerLink.user_high_id == uid))
    )
    db.execute(delete(AuthSession).where(AuthSession.user_id == uid))
    db.execute(delete(DeviceSighting).where(DeviceSighting.user_id == uid))
    db.execute(delete(Notification).where(Notification.user_id == uid))
    db.execute(update(Notification).where(Notification.actor_id == uid).values(actor_id=None))
    if user.phone_hash:
        db.execute(delete(OtpCode).where(OtpCode.phone_hash == user.phone_hash))
    user.phone_hash = None
    user.nickname = f"deleted-{uid}"
    user.show_on_leaderboard = False
    user.consent_version = None
    user.consent_at = None
    user.deleted_at = now
    db.commit()


# ── 伴侶 ───────────────────────────────────────────────


def link_out(link: PartnerLink, me_id: int, db: Session) -> PartnerLinkOut:
    other_id = link.user_high_id if link.user_low_id == me_id else link.user_low_id
    other = db.get(User, other_id)
    return PartnerLinkOut(
        id=link.id,
        other_user_id=other_id,
        other_nickname=other.nickname,
        status=link.status,
        requested_by_me=link.requested_by == me_id,
        created_at=clock.to_aware(link.created_at),
    )


def get_my_link(db: Session, link_id: int, me_id: int) -> PartnerLink:
    link = db.get(PartnerLink, link_id)
    if link is None or me_id not in (link.user_low_id, link.user_high_id):
        err(404, "not_found", "找不到這個邀請")
    return link


@app.get("/partners", response_model=list[PartnerLinkOut])
def list_partners(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    links = db.scalars(
        select(PartnerLink)
        .where(
            (PartnerLink.user_low_id == user.id) | (PartnerLink.user_high_id == user.id),
            PartnerLink.status.in_(("pending", "accepted")),
        )
        .order_by(PartnerLink.created_at.desc())
    ).all()
    return [link_out(link, user.id, db) for link in links]


@app.post("/partners", response_model=PartnerLinkOut, status_code=201)
def request_partner(body: PartnerRequestIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rules.check_self_eligible(user)
    now = clock.now()
    other = db.scalar(select(User).where(User.nickname == body.nickname, User.deleted_at.is_(None)))
    if other is None or other.id == user.id:
        err(404, "user_not_found", "找不到這個暱稱")

    link = rules.get_link(db, user.id, other.id)
    if link is not None:
        if link.status in ("pending", "accepted"):
            err(409, "already_exists", "已經是伴侶或邀請中")
        if (
            link.status == "rejected"
            and link.requested_by == user.id
            and link.responded_at is not None
            and now - link.responded_at < rules.PARTNER_REREQUEST_COOLDOWN
        ):
            err(429, "cooldown", "對方拒絕後需要等一段時間才能再邀請")
        link.status, link.requested_by, link.created_at, link.responded_at = "pending", user.id, now, None
    else:
        low, high = rules.ordered_pair(user.id, other.id)
        link = PartnerLink(user_low_id=low, user_high_id=high, requested_by=user.id, status="pending", created_at=now)
        db.add(link)
    db.flush()
    notify(db, other.id, "partner_request", actor_id=user.id, link_id=link.id)
    db.commit()
    return link_out(link, user.id, db)


@app.post("/partners/{link_id}/accept", response_model=PartnerLinkOut)
def accept_partner(link_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rules.check_self_eligible(user)
    link = get_my_link(db, link_id, user.id)
    if link.status != "pending" or link.requested_by == user.id:
        err(409, "not_acceptable", "這個邀請無法接受")
    link.status, link.responded_at = "accepted", clock.now()
    notify(db, link.requested_by, "partner_accepted", actor_id=user.id, link_id=link.id)
    db.commit()
    return link_out(link, user.id, db)


@app.post("/partners/{link_id}/reject", response_model=PartnerLinkOut)
def reject_partner(link_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    link = get_my_link(db, link_id, user.id)
    if link.status != "pending" or link.requested_by == user.id:
        err(409, "not_rejectable", "這個邀請無法拒絕")
    link.status, link.responded_at = "rejected", clock.now()
    db.commit()
    return link_out(link, user.id, db)


@app.delete("/partners/{link_id}", status_code=204)
def remove_partner(link_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """任一方都可以解除伴侶關係（或撤回邀請）。雙方之間待確認的紀錄一併取消。"""
    link = get_my_link(db, link_id, user.id)
    if link.status not in ("pending", "accepted"):
        err(409, "not_active", "這個關係已經不存在")
    link.status, link.responded_at = "revoked", clock.now()
    a, b = link.user_low_id, link.user_high_id
    db.execute(
        update(Encounter)
        .where(
            Encounter.status == "pending",
            ((Encounter.initiator_id == a) & (Encounter.partner_id == b))
            | ((Encounter.initiator_id == b) & (Encounter.partner_id == a)),
        )
        .values(status="cancelled")
    )
    db.commit()


# ── 紀錄 ───────────────────────────────────────────────


def encounter_out(enc: Encounter, me_id: int, db: Session) -> EncounterOut:
    mine = enc.initiator_id == me_id
    other_id = enc.partner_id if mine else enc.initiator_id
    other = db.get(User, other_id) if other_id is not None else None
    return EncounterOut(
        id=enc.id,
        i_am_initiator=mine,
        other_user_id=other_id,
        other_nickname=other.nickname if other else None,
        occurred_at=clock.to_aware(enc.occurred_at),
        status=enc.status,
        review_status=enc.review_status,
        counted=enc.status == "confirmed" and enc.review_status in rules.COUNTED_REVIEW,
        created_at=clock.to_aware(enc.created_at),
        expires_at=clock.to_aware(enc.expires_at),
    )


@app.post("/encounters", response_model=EncounterOut, status_code=201)
def create_encounter(
    body: EncounterIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    dev: str | None = Depends(device_hash),
):
    now = clock.now()
    rules.expire_stale(db, now)
    if body.partner_id == user.id:
        err(422, "self_partner", "不能記錄自己")
    rules.check_self_eligible(user)
    rules.check_linked(db, user.id, body.partner_id)
    partner = db.get(User, body.partner_id)
    rules.check_partner_eligible(partner)

    occurred_at = clock.to_naive_utc(body.occurred_at)
    rules.check_occurred_at(occurred_at, now)
    rules.lock_users(db, user.id)
    rules.check_capacity(db, user.id, occurred_at)

    enc = Encounter(
        initiator_id=user.id,
        partner_id=partner.id,
        occurred_at=occurred_at,
        status="pending",
        review_status="ok",
        created_at=now,
        expires_at=now + rules.CONFIRM_WINDOW,
        initiator_device_hash=dev,
    )
    db.add(enc)
    db.flush()
    notify(
        db, partner.id, "encounter_pending",
        actor_id=user.id, encounter_id=enc.id, data={"date": encounter_date(enc)},
    )
    db.commit()
    return encounter_out(enc, user.id, db)


@app.get("/encounters", response_model=list[EncounterOut])
def list_encounters(
    limit: int = Query(50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rules.expire_stale(db, clock.now())
    db.commit()
    encs = db.scalars(
        select(Encounter).where(rules.involves(user.id)).order_by(Encounter.occurred_at.desc()).limit(limit)
    ).all()
    return [encounter_out(e, user.id, db) for e in encs]


@app.get("/encounters/incoming", response_model=list[EncounterOut])
def incoming_encounters(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """等我確認的紀錄。"""
    rules.expire_stale(db, clock.now())
    db.commit()
    encs = db.scalars(
        select(Encounter)
        .where(Encounter.partner_id == user.id, Encounter.status == "pending")
        .order_by(Encounter.created_at)
    ).all()
    return [encounter_out(e, user.id, db) for e in encs]


def get_pending_for(db: Session, enc_id: int, user_id: int, role: str) -> Encounter:
    enc = db.get(Encounter, enc_id)
    owner = enc.partner_id if (enc and role == "partner") else (enc.initiator_id if enc else None)
    if enc is None or owner != user_id:
        err(404, "not_found", "找不到這筆紀錄")
    if enc.status != "pending":
        err(409, "not_pending", f"這筆紀錄目前狀態是 {enc.status}，無法操作")
    return enc


@app.post("/encounters/{enc_id}/confirm", response_model=EncounterOut)
def confirm_encounter(
    enc_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    dev: str | None = Depends(device_hash),
):
    now = clock.now()
    rules.expire_stale(db, now)
    db.commit()
    enc = get_pending_for(db, enc_id, user.id, role="partner")
    rules.lock_users(db, enc.initiator_id, user.id)
    db.refresh(enc)  # 上鎖後重讀，避免同時被撤回或重複確認
    if enc.status != "pending":
        err(409, "not_pending", f"這筆紀錄目前狀態是 {enc.status}，無法操作")

    rules.check_self_eligible(user)
    rules.check_partner_eligible(db.get(User, enc.initiator_id))
    rules.check_linked(db, enc.initiator_id, user.id)
    rules.check_capacity(db, user.id, enc.occurred_at, exclude_id=enc.id)

    enc.partner_device_hash = dev
    enc.status = "confirmed"
    enc.responded_at = now
    rules.add_flags(enc, rules.compute_flags(db, enc))
    notify(
        db, enc.initiator_id, "encounter_confirmed",
        actor_id=user.id, encounter_id=enc.id,
        data={"date": encounter_date(enc), "flagged": enc.review_status == "flagged"},
    )
    db.commit()
    return encounter_out(enc, user.id, db)


@app.post("/encounters/{enc_id}/reject", response_model=EncounterOut)
def reject_encounter(enc_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = clock.now()
    rules.expire_stale(db, now)
    db.commit()
    enc = get_pending_for(db, enc_id, user.id, role="partner")
    enc.status, enc.responded_at = "rejected", now
    db.commit()
    return encounter_out(enc, user.id, db)


@app.post("/encounters/{enc_id}/cancel", response_model=EncounterOut)
def cancel_encounter(enc_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    now = clock.now()
    rules.expire_stale(db, now)
    db.commit()
    enc = get_pending_for(db, enc_id, user.id, role="initiator")
    enc.status, enc.responded_at = "cancelled", now
    db.commit()
    return encounter_out(enc, user.id, db)


# ── 排行榜 ─────────────────────────────────────────────


@app.get("/leaderboard", response_model=list[LeaderboardRow])
def get_leaderboard(
    period: str = Query("month", pattern="^(week|month|all)$"),
    limit: int = Query(50, ge=1, le=200),
    _user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = rules.leaderboard(db, clock.now(), period, limit)
    return [LeaderboardRow(rank=r, nickname=n, count=c) for r, _uid, n, c in rows]


# ── 通知 ───────────────────────────────────────────────


@app.get("/notifications", response_model=list[NotificationOut])
def list_notifications(
    filter: str = Query("all", pattern="^(all|todo)$"),
    limit: int = Query(50, ge=1, le=100),
    before_id: int | None = Query(None, ge=1),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """新的在前。用 before_id 往前翻頁。filter=todo 只回傳還需要處理的。"""
    rules.expire_stale(db, clock.now())
    db.commit()
    query = select(Notification).where(Notification.user_id == user.id)
    if filter == "todo":
        query = query.where(Notification.kind.in_(("encounter_pending", "partner_request")))
    if before_id is not None:
        query = query.where(Notification.id < before_id)
    # todo 要在 Python 端再篩一次（看對應的紀錄／邀請還在不在等），所以多拿一些
    batch = db.scalars(query.order_by(Notification.id.desc()).limit(limit * 3 if filter == "todo" else limit)).all()

    out = []
    for n in batch:
        actionable = is_actionable(db, n)
        if filter == "todo" and not actionable:
            continue
        actor = db.get(User, n.actor_id) if n.actor_id is not None else None
        out.append(
            NotificationOut(
                id=n.id,
                kind=n.kind,
                message=render(n, actor),
                actor_nickname=actor.nickname if actor is not None and actor.deleted_at is None else None,
                encounter_id=n.encounter_id,
                link_id=n.link_id,
                actionable=actionable,
                read=n.read_at is not None,
                created_at=clock.to_aware(n.created_at),
            )
        )
        if len(out) >= limit:
            break
    return out


@app.get("/notifications/unread-count", response_model=UnreadCountOut)
def unread_count(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rules.expire_stale(db, clock.now())
    db.commit()
    n = db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
    )
    return UnreadCountOut(unread=n)


@app.post("/notifications/{notif_id}/read", status_code=204)
def mark_read(notif_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.get(Notification, notif_id)
    if n is None or n.user_id != user.id:
        err(404, "not_found", "找不到這則通知")
    if n.read_at is None:
        n.read_at = clock.now()
        db.commit()


@app.post("/notifications/read-all", status_code=204)
def mark_all_read(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.execute(
        update(Notification)
        .where(Notification.user_id == user.id, Notification.read_at.is_(None))
        .values(read_at=clock.now())
    )
    db.commit()


# ── 管理後台 ───────────────────────────────────────────


@app.post("/admin/users/{user_id}/age-verification", dependencies=[Depends(require_admin)])
def set_age_verification(user_id: int, body: AgeVerificationIn, db: Session = Depends(get_db)):
    """由 KYC 服務的 webhook 或人工審核呼叫。"""
    user = db.get(User, user_id)
    if user is None or user.deleted_at is not None:
        raise HTTPException(404, "user_not_found")
    newly_verified = body.verified and not user.age_verified
    user.age_verified = body.verified
    if newly_verified:
        notify(db, user.id, "age_verified")
    db.commit()
    return {"id": user.id, "age_verified": user.age_verified}


@app.get(
    "/admin/encounters/flagged",
    response_model=list[FlaggedEncounterOut],
    dependencies=[Depends(require_admin)],
)
def list_flagged(db: Session = Depends(get_db)):
    encs = db.scalars(
        select(Encounter).where(Encounter.review_status == "flagged").order_by(Encounter.occurred_at)
    ).all()
    return [
        FlaggedEncounterOut(
            id=e.id,
            initiator_id=e.initiator_id,
            partner_id=e.partner_id,
            occurred_at=clock.to_aware(e.occurred_at),
            flag_reasons=e.flag_reasons,
            review_status=e.review_status,
        )
        for e in encs
    ]


@app.post("/admin/encounters/{enc_id}/review", dependencies=[Depends(require_admin)])
def review_encounter(enc_id: int, body: ReviewIn, db: Session = Depends(get_db)):
    enc = db.get(Encounter, enc_id)
    if enc is None:
        raise HTTPException(404, "not_found")
    new_status = "cleared" if body.decision == "clear" else "void"
    if enc.review_status != new_status:
        enc.review_status = new_status
        kind = "review_cleared" if new_status == "cleared" else "review_voided"
        data = {"date": encounter_date(enc)}
        notify(db, enc.initiator_id, kind, actor_id=enc.partner_id, encounter_id=enc.id, data=data)
        notify(db, enc.partner_id, kind, actor_id=enc.initiator_id, encounter_id=enc.id, data=data)
    db.commit()
    return {"id": enc.id, "review_status": enc.review_status}


@app.post("/admin/jobs/detect-rings", dependencies=[Depends(require_admin)])
def run_ring_detection(db: Session = Depends(get_db)):
    rings = rules.detect_rings(db, clock.now())
    db.commit()
    return {"rings": rings}


@app.post("/admin/jobs/rank-notifications", dependencies=[Depends(require_admin)])
def run_rank_notifications(db: Session = Depends(get_db)):
    sent = rules.notify_rank_changes(db, clock.now())
    db.commit()
    return {"sent": sent}
