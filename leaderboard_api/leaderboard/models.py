"""資料表結構。

設計原則：
- 不存明碼手機號碼、不存裝置 ID 原值，只存加密金鑰雜湊（HMAC）。
- 不收任何照片、影片或描述，只存「誰和誰、什麼時間、雙方是否確認」。
- 一筆紀錄 (encounter) 同時算進雙方的次數，必須由對方確認才算數。
"""
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column

from . import clock
from .db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    nickname: Mapped[str] = mapped_column(String(32), unique=True)
    # HMAC(手機號碼)。刪除帳號時清成 NULL。
    phone_hash: Mapped[str | None] = mapped_column(String(64), unique=True)
    # 年滿 18 歲驗證。只能由後台或 KYC 服務設定，使用者自己不能改。
    age_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    # 是否公開在排行榜。預設不公開，使用者要自己打開。
    show_on_leaderboard: Mapped[bool] = mapped_column(Boolean, default=False)
    # 同意的隱私權政策版本與時間（個資法第 6 條特種個資需要明確同意）。
    consent_version: Mapped[str | None] = mapped_column(String(32))
    consent_at: Mapped[datetime | None] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=lambda: clock.now())
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime)


class OtpCode(Base):
    """簡訊驗證碼。只存雜湊值。"""

    __tablename__ = "otp_codes"

    id: Mapped[int] = mapped_column(primary_key=True)
    phone_hash: Mapped[str] = mapped_column(String(64), index=True)
    code_hash: Mapped[str] = mapped_column(String(64))
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    used_at: Mapped[datetime | None] = mapped_column(DateTime)


class AuthSession(Base):
    """登入 token。只存 SHA-256 雜湊；device_hash 用來偵測一台裝置登入多個帳號。"""

    __tablename__ = "auth_sessions"

    token_hash: Mapped[str] = mapped_column(String(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    device_hash: Mapped[str | None] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime)
    expires_at: Mapped[datetime] = mapped_column(DateTime)


class PartnerLink(Base):
    """伴侶關係。雙方互相同意後 (accepted) 才能互相記錄。

    user_low_id 一律是兩人中較小的 id，確保同一對只有一列。
    status: pending / accepted / rejected / revoked
    """

    __tablename__ = "partner_links"
    __table_args__ = (
        UniqueConstraint("user_low_id", "user_high_id", name="uq_partner_pair"),
        CheckConstraint("user_low_id < user_high_id", name="ck_partner_order"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_low_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    user_high_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    requested_by: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[str] = mapped_column(String(16), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime)


class Encounter(Base):
    """一次紀錄。

    status（流程狀態）:
        pending   等對方確認（24 小時內）
        confirmed 對方已確認
        rejected  對方否認
        expired   超過時限沒確認
        cancelled 發起人撤回，或任一方刪帳號／解除伴侶關係
    review_status（防作弊審核）:
        ok        正常，計分
        flagged   被系統標記，暫停計分，等人工審核
        cleared   審核通過，計分
        void      審核判定作假，永久不計分

    任一方刪除帳號時，對應的 *_id 與裝置雜湊會被清成 NULL；另一方的紀錄照樣保留。
    """

    __tablename__ = "encounters"
    __table_args__ = (
        Index("ix_enc_initiator_time", "initiator_id", "occurred_at"),
        Index("ix_enc_partner_time", "partner_id", "occurred_at"),
        Index("ix_enc_status_expires", "status", "expires_at"),
        Index("ix_enc_review", "review_status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    initiator_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    partner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    occurred_at: Mapped[datetime] = mapped_column(DateTime)
    status: Mapped[str] = mapped_column(String(16), default="pending")
    review_status: Mapped[str] = mapped_column(String(16), default="ok")
    flag_reasons: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime)
    expires_at: Mapped[datetime] = mapped_column(DateTime)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime)
    initiator_device_hash: Mapped[str | None] = mapped_column(String(64))
    partner_device_hash: Mapped[str | None] = mapped_column(String(64))
