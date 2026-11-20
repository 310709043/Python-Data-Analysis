"""防作弊規則。所有數字都集中在檔案開頭，可以依營運狀況調整。

分成兩類：
- 硬性規則 (RuleError)：直接拒絕，例如沒年齡驗證、時間在未來、超過每日上限。
- 標記規則 (flags)：照樣記錄，但暫停計分、送人工審核，例如同一台裝置登入雙方帳號。
"""
from collections import defaultdict
from datetime import datetime, timedelta

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.orm import Session

from .config import PRIVACY_POLICY_VERSION
from .models import AuthSession, Encounter, PartnerLink, User

# ── 時間規則 ────────────────────────────────────────────
CONFIRM_WINDOW = timedelta(hours=24)  # 對方要在多久內確認
MAX_BACKDATE = timedelta(days=7)  # 最多補記幾天前的紀錄
MAX_FUTURE_SKEW = timedelta(minutes=5)  # 容許的手機時鐘誤差
MIN_INTERVAL = timedelta(minutes=30)  # 同一人兩筆紀錄的最短間隔
DAILY_CAP = 5  # 同一人每天（台灣時間）最多幾筆
LOCAL_UTC_OFFSET = timedelta(hours=8)  # 「每天」以台灣時間切換

# ── 排行榜 ─────────────────────────────────────────────
LEADERBOARD_PROBATION = timedelta(days=30)  # 新帳號滿 30 天才上榜

# ── 標記規則 ───────────────────────────────────────────
PAIR_DAILY_FLAG_AT = 4  # 同一對同一天第 4 筆起送審

# ── 小圈圈互刷偵測（批次） ─────────────────────────────
RING_WINDOW = timedelta(days=30)
RING_MIN_SIZE = 3  # 3 人以上的封閉群組
RING_CREATED_SPREAD = timedelta(hours=72)  # 全部帳號在 72 小時內註冊
RING_MIN_PER_MEMBER = 10  # 每人 30 天內至少 10 筆

# ── 伴侶邀請 ───────────────────────────────────────────
PARTNER_REREQUEST_COOLDOWN = timedelta(days=30)  # 被拒絕後多久才能再邀請

ACTIVE_STATUSES = ("pending", "confirmed")
COUNTED_REVIEW = ("ok", "cleared")


class RuleError(Exception):
    def __init__(self, code: str, message: str, status: int = 422):
        super().__init__(message)
        self.code = code
        self.message = message
        self.status = status


def involves(user_id: int):
    return or_(Encounter.initiator_id == user_id, Encounter.partner_id == user_id)


def is_counted():
    return and_(Encounter.status == "confirmed", Encounter.review_status.in_(COUNTED_REVIEW))


def ordered_pair(a: int, b: int) -> tuple[int, int]:
    return (a, b) if a < b else (b, a)


def local_day_bounds(t: datetime) -> tuple[datetime, datetime]:
    """回傳 t 所在的「台灣時間這一天」對應的 UTC 起訖。"""
    local = t + LOCAL_UTC_OFFSET
    start = datetime(local.year, local.month, local.day) - LOCAL_UTC_OFFSET
    return start, start + timedelta(days=1)


def expire_stale(db: Session, now: datetime) -> None:
    db.execute(
        update(Encounter)
        .where(Encounter.status == "pending", Encounter.expires_at <= now)
        .values(status="expired")
    )


# ── 硬性規則 ───────────────────────────────────────────


def check_self_eligible(user: User) -> None:
    if not user.age_verified:
        raise RuleError("age_not_verified", "需要先完成 18 歲以上的年齡驗證", 403)
    if user.consent_version != PRIVACY_POLICY_VERSION:
        raise RuleError("consent_required", "需要先同意最新版的隱私權政策", 403)


def check_partner_eligible(user: User | None) -> None:
    # 刻意不說明原因，避免透露對方的帳號狀態。
    if (
        user is None
        or user.deleted_at is not None
        or not user.age_verified
        or user.consent_version != PRIVACY_POLICY_VERSION
    ):
        raise RuleError("partner_not_eligible", "對方目前無法參與記錄", 403)


def get_link(db: Session, a: int, b: int) -> PartnerLink | None:
    low, high = ordered_pair(a, b)
    return db.scalar(
        select(PartnerLink).where(PartnerLink.user_low_id == low, PartnerLink.user_high_id == high)
    )


def check_linked(db: Session, a: int, b: int) -> None:
    link = get_link(db, a, b)
    if link is None or link.status != "accepted":
        raise RuleError("not_partners", "雙方要先互相加為伴侶才能記錄", 403)


def check_occurred_at(occurred_at: datetime, now: datetime) -> None:
    if occurred_at > now + MAX_FUTURE_SKEW:
        raise RuleError("occurred_in_future", "時間不能在未來")
    if occurred_at < now - MAX_BACKDATE:
        raise RuleError("too_old", f"只能補記 {MAX_BACKDATE.days} 天內的紀錄")


def check_capacity(db: Session, user_id: int, occurred_at: datetime, exclude_id: int | None = None) -> None:
    """檢查同一人的間隔與每日上限。

    注意：建立紀錄時只檢查發起人自己；對方的上限在「對方按確認」時才檢查，
    錯誤訊息只給對方看，避免發起人從錯誤推測出對方跟別人的紀錄。
    """
    base = [involves(user_id), Encounter.status.in_(ACTIVE_STATUSES), Encounter.review_status != "void"]
    if exclude_id is not None:
        base.append(Encounter.id != exclude_id)

    near = db.scalar(
        select(func.count())
        .select_from(Encounter)
        .where(
            *base,
            Encounter.occurred_at > occurred_at - MIN_INTERVAL,
            Encounter.occurred_at < occurred_at + MIN_INTERVAL,
        )
    )
    if near:
        minutes = int(MIN_INTERVAL.total_seconds() // 60)
        raise RuleError("too_frequent", f"兩筆紀錄之間至少要間隔 {minutes} 分鐘", 429)

    start, end = local_day_bounds(occurred_at)
    same_day = db.scalar(
        select(func.count())
        .select_from(Encounter)
        .where(*base, Encounter.occurred_at >= start, Encounter.occurred_at < end)
    )
    if same_day >= DAILY_CAP:
        raise RuleError("daily_cap_reached", f"每天最多記錄 {DAILY_CAP} 次", 429)


# ── 標記規則 ───────────────────────────────────────────


def user_devices(db: Session, user_id: int) -> set[str]:
    """這個帳號用過的所有裝置雜湊（登入紀錄 + 記錄／確認時的裝置）。"""
    devices = set(
        db.scalars(
            select(AuthSession.device_hash).where(
                AuthSession.user_id == user_id, AuthSession.device_hash.is_not(None)
            )
        )
    )
    devices |= set(
        db.scalars(
            select(Encounter.initiator_device_hash).where(
                Encounter.initiator_id == user_id, Encounter.initiator_device_hash.is_not(None)
            )
        )
    )
    devices |= set(
        db.scalars(
            select(Encounter.partner_device_hash).where(
                Encounter.partner_id == user_id, Encounter.partner_device_hash.is_not(None)
            )
        )
    )
    return devices


def compute_flags(db: Session, enc: Encounter) -> list[str]:
    flags: list[str] = []
    a, b = enc.initiator_id, enc.partner_id

    # 1. 同一台裝置出現在雙方帳號 → 很可能一個人開兩個帳號自己確認。
    #    （同一個 IP 不算，兩人在一起本來就常用同一個 Wi-Fi。）
    devices_a = user_devices(db, a)
    devices_b = user_devices(db, b)
    if enc.initiator_device_hash:
        devices_a.add(enc.initiator_device_hash)
    if enc.partner_device_hash:
        devices_b.add(enc.partner_device_hash)
    if devices_a & devices_b:
        flags.append("shared_device")

    # 2. 同一對同一天次數異常多。
    start, end = local_day_bounds(enc.occurred_at)
    pair_same_day = db.scalar(
        select(func.count())
        .select_from(Encounter)
        .where(
            Encounter.id != enc.id,
            Encounter.status == "confirmed",
            Encounter.review_status != "void",
            Encounter.occurred_at >= start,
            Encounter.occurred_at < end,
            or_(
                and_(Encounter.initiator_id == a, Encounter.partner_id == b),
                and_(Encounter.initiator_id == b, Encounter.partner_id == a),
            ),
        )
    )
    if pair_same_day + 1 >= PAIR_DAILY_FLAG_AT:
        flags.append("pair_burst")

    return flags


def add_flags(enc: Encounter, flags: list[str]) -> None:
    if not flags:
        return
    reasons = set(filter(None, (enc.flag_reasons or "").split(",")))
    reasons.update(flags)
    enc.flag_reasons = ",".join(sorted(reasons))
    enc.review_status = "flagged"


def detect_rings(db: Session, now: datetime) -> list[list[int]]:
    """找出「一群差不多同時註冊、只跟彼此大量互相確認」的帳號，標記送審。

    建議用排程每天跑一次（呼叫 POST /admin/jobs/detect-rings）。
    兩人情侶不會被抓，因為門檻是 3 人以上。
    """
    since = now - RING_WINDOW
    rows = db.execute(
        select(Encounter.initiator_id, Encounter.partner_id).where(
            is_counted(),
            Encounter.occurred_at >= since,
            Encounter.initiator_id.is_not(None),
            Encounter.partner_id.is_not(None),
        )
    ).all()

    adj: dict[int, set[int]] = defaultdict(set)
    per_user: dict[int, int] = defaultdict(int)
    for a, b in rows:
        adj[a].add(b)
        adj[b].add(a)
        per_user[a] += 1
        per_user[b] += 1

    seen: set[int] = set()
    rings: list[list[int]] = []
    for start in list(adj):
        if start in seen:
            continue
        comp, stack = [], [start]
        seen.add(start)
        while stack:
            u = stack.pop()
            comp.append(u)
            for v in adj[u]:
                if v not in seen:
                    seen.add(v)
                    stack.append(v)

        if len(comp) < RING_MIN_SIZE:
            continue
        if min(per_user[u] for u in comp) < RING_MIN_PER_MEMBER:
            continue
        created = db.scalars(select(User.created_at).where(User.id.in_(comp))).all()
        if max(created) - min(created) > RING_CREATED_SPREAD:
            continue

        rings.append(sorted(comp))
        encounters = db.scalars(
            select(Encounter).where(
                Encounter.initiator_id.in_(comp),
                Encounter.partner_id.in_(comp),
                Encounter.status == "confirmed",
                Encounter.review_status == "ok",
                Encounter.occurred_at >= since,
            )
        ).all()
        for enc in encounters:
            add_flags(enc, ["suspected_ring"])
    return rings


# ── 排行榜 ─────────────────────────────────────────────

PERIODS = {"week": timedelta(days=7), "month": timedelta(days=30), "all": None}


def leaderboard(db: Session, now: datetime, period: str, limit: int) -> list[tuple[int, str, int]]:
    """回傳 [(名次, 暱稱, 次數)]。同分同名次。

    只計算：雙方確認 + 沒被標記（或審核通過）+ 本人願意公開 + 年齡已驗證 + 帳號滿試用期。
    """
    conds = [is_counted()]
    span = PERIODS[period]
    if span is not None:
        conds.append(Encounter.occurred_at >= now - span)

    sides = (
        select(Encounter.initiator_id.label("uid")).where(*conds, Encounter.initiator_id.is_not(None))
    ).union_all(
        select(Encounter.partner_id.label("uid")).where(*conds, Encounter.partner_id.is_not(None))
    ).subquery()

    count_col = func.count().label("n")
    rows = db.execute(
        select(User.nickname, count_col)
        .join(sides, sides.c.uid == User.id)
        .where(
            User.show_on_leaderboard.is_(True),
            User.age_verified.is_(True),
            User.deleted_at.is_(None),
            User.created_at <= now - LEADERBOARD_PROBATION,
        )
        .group_by(User.id, User.nickname)
        .order_by(count_col.desc(), User.id)
        .limit(limit)
    ).all()

    result, rank, prev = [], 0, None
    for i, (nickname, n) in enumerate(rows, start=1):
        if n != prev:
            rank, prev = i, n
        result.append((rank, nickname, n))
    return result
