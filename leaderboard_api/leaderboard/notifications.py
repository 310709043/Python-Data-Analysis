"""站內通知：建立、組文字、判斷還需不需要處理。"""
import json

from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from . import clock
from .models import Encounter, Notification, PartnerLink, User
from .notify import send_push


def notify(
    db: Session,
    user_id: int | None,
    kind: str,
    *,
    actor_id: int | None = None,
    encounter_id: int | None = None,
    link_id: int | None = None,
    data: dict | None = None,
) -> None:
    """建立一則通知（跟著呼叫端的交易一起 commit），並送出不含內容的推播。"""
    if user_id is None:
        return
    db.add(
        Notification(
            user_id=user_id,
            kind=kind,
            actor_id=actor_id,
            encounter_id=encounter_id,
            link_id=link_id,
            data=json.dumps(data, ensure_ascii=False) if data else None,
            created_at=clock.now(),
        )
    )
    # TODO: 正式環境改成 commit 之後才送（例如 outbox 表或背景工作），避免交易失敗卻已經推播。
    send_push(user_id)


def encounter_date(enc: Encounter) -> str:
    return clock.local_date_str(enc.occurred_at)


def render(n: Notification, actor: User | None) -> str:
    data = json.loads(n.data) if n.data else {}
    who = actor.nickname if actor is not None and actor.deleted_at is None else "對方"
    date = data.get("date", "")
    if n.kind == "partner_request":
        return f"{who} 想加你為伴侶"
    if n.kind == "partner_accepted":
        return f"{who} 接受了你的伴侶邀請"
    if n.kind == "encounter_pending":
        return f"{who} 記錄了你們 {date} 的一次，等你確認"
    if n.kind == "encounter_confirmed":
        if data.get("flagged"):
            return f"{who} 確認了你們 {date} 的紀錄，審核通過後就會計入"
        return f"{who} 確認了你們 {date} 的紀錄，雙方各 +1"
    if n.kind == "encounter_expired":
        return f"{who} 沒有在 24 小時內確認，{date} 的紀錄已作廢"
    if n.kind == "review_cleared":
        return f"你和 {who} {date} 的紀錄審核通過，已經計入"
    if n.kind == "review_voided":
        return f"你和 {who} {date} 的紀錄沒有通過審核，不會計分"
    if n.kind == "age_verified":
        return "18 歲驗證通過，可以開始記錄了"
    if n.kind == "rank_up":
        return f"你的本月排名上升到第 {data.get('rank')} 名"
    return "你有一則新通知"


def actionable_clause():
    """SQL 版的「需要處理」條件。查詢時要 outer join Encounter 和 PartnerLink。

    - encounter_pending：那筆紀錄還在等這個人確認
    - partner_request：邀請還在等這個人回應，而且這則通知屬於「目前這一次」邀請。
      同一對人重新邀請會重用同一列 PartnerLink（created_at 會更新），
      比它早的邀請通知就不算了。
    """
    return or_(
        and_(
            Notification.kind == "encounter_pending",
            Encounter.status == "pending",
            Encounter.partner_id == Notification.user_id,
        ),
        and_(
            Notification.kind == "partner_request",
            PartnerLink.status == "pending",
            PartnerLink.requested_by != Notification.user_id,
            Notification.created_at >= PartnerLink.created_at,
        ),
    )


def is_actionable(db: Session, n: Notification) -> bool:
    """和 actionable_clause() 同樣的條件，單筆判斷用。"""
    if n.kind == "encounter_pending" and n.encounter_id is not None:
        enc = db.get(Encounter, n.encounter_id)
        return enc is not None and enc.status == "pending" and enc.partner_id == n.user_id
    if n.kind == "partner_request" and n.link_id is not None:
        link = db.get(PartnerLink, n.link_id)
        return (
            link is not None
            and link.status == "pending"
            and link.requested_by != n.user_id
            and n.created_at >= link.created_at
        )
    return False
