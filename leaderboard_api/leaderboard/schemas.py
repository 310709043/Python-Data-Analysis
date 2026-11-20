from datetime import datetime
from typing import Literal

from pydantic import AwareDatetime, BaseModel, Field



class OtpRequestIn(BaseModel):
    phone: str = Field(max_length=32)


class OtpRequestOut(BaseModel):
    sent: bool
    dev_code: str | None = None  # 只有 DEV_MODE 才會有值


class OtpVerifyIn(BaseModel):
    phone: str = Field(max_length=32)
    code: str = Field(pattern=r"^\d{6}$")
    # 新帳號才需要；已註冊的人再次登入不用帶
    nickname: str | None = Field(default=None, min_length=2, max_length=32, pattern=r"^[\w\-]+$")


class TokenOut(BaseModel):
    token: str
    user_id: int
    is_new: bool


class ConsentIn(BaseModel):
    version: str


class SettingsIn(BaseModel):
    show_on_leaderboard: bool


class MeOut(BaseModel):
    id: int
    nickname: str
    age_verified: bool
    consent_version: str | None
    privacy_policy_version: str
    show_on_leaderboard: bool
    created_at: datetime
    leaderboard_eligible_from: datetime


class StatsOut(BaseModel):
    counted: int  # 雙方確認、正式計分
    under_review: int  # 雙方確認，但被系統標記審核中
    pending_outgoing: int  # 我發出、等對方確認
    pending_incoming: int  # 對方發出、等我確認


class PartnerRequestIn(BaseModel):
    nickname: str = Field(min_length=2, max_length=32)


class PartnerLinkOut(BaseModel):
    id: int
    other_user_id: int
    other_nickname: str
    status: str
    requested_by_me: bool
    created_at: datetime


class EncounterIn(BaseModel):
    partner_id: int
    occurred_at: AwareDatetime  # 必須帶時區，例如 2026-11-20T22:00:00+08:00


class EncounterOut(BaseModel):
    id: int
    i_am_initiator: bool
    other_user_id: int | None
    other_nickname: str | None
    occurred_at: datetime
    status: str
    review_status: str
    counted: bool
    created_at: datetime
    expires_at: datetime


class LeaderboardRow(BaseModel):
    rank: int
    nickname: str
    count: int


class AgeVerificationIn(BaseModel):
    verified: bool


class ReviewIn(BaseModel):
    decision: Literal["clear", "void"]


class FlaggedEncounterOut(BaseModel):
    id: int
    initiator_id: int | None
    partner_id: int | None
    occurred_at: datetime
    flag_reasons: str | None
    review_status: str


class NotificationOut(BaseModel):
    id: int
    kind: str
    message: str  # 已組好的中文文字，前端可以直接顯示
    actor_nickname: str | None  # 對方刪除帳號後為 None
    encounter_id: int | None
    link_id: int | None
    actionable: bool  # 還需要這個人處理（確認紀錄或回應邀請）
    read: bool
    created_at: datetime


class UnreadCountOut(BaseModel):
    unread: int
