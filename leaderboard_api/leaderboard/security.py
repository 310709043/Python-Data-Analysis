"""雜湊、登入驗證、管理員驗證。"""
import hashlib
import hmac
import re
import secrets

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from . import clock
from .config import ADMIN_TOKEN, APP_SECRET
from .db import get_db
from .models import AuthSession, User


def keyed_hash(value: str) -> str:
    """HMAC-SHA256。資料庫外洩時，沒有 APP_SECRET 也反推不出手機號碼。"""
    return hmac.new(APP_SECRET.encode(), value.encode(), hashlib.sha256).hexdigest()


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def new_token() -> str:
    return secrets.token_urlsafe(32)


def new_otp_code() -> str:
    return f"{secrets.randbelow(10**6):06d}"


_E164 = re.compile(r"^\+[1-9]\d{7,14}$")


def normalize_phone(raw: str) -> str | None:
    """接受台灣手機 09xxxxxxxx 或國際格式 +8869xxxxxxxx，統一成 E.164。"""
    p = re.sub(r"[\s\-()]", "", raw)
    if re.fullmatch(r"09\d{8}", p):
        p = "+886" + p[1:]
    return p if _E164.fullmatch(p) else None


def phone_hash(phone: str) -> str:
    return keyed_hash("phone:" + phone)


def otp_hash(phone_h: str, code: str) -> str:
    return keyed_hash(f"otp:{phone_h}:{code}")


def device_hash(x_device_id: str | None = Header(default=None)) -> str | None:
    """前端在每個請求帶 X-Device-Id（安裝 App 時產生一次並保存的隨機 ID）。"""
    if not x_device_id:
        return None
    return keyed_hash("device:" + x_device_id[:128])


def get_current_session(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> AuthSession:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "missing_token")
    sess = db.get(AuthSession, token_hash(authorization.removeprefix("Bearer ").strip()))
    if sess is None or sess.expires_at <= clock.now():
        raise HTTPException(401, "invalid_token")
    return sess


def get_current_user(
    sess: AuthSession = Depends(get_current_session),
    db: Session = Depends(get_db),
) -> User:
    user = db.get(User, sess.user_id)
    if user is None or user.deleted_at is not None:
        raise HTTPException(401, "invalid_token")
    return user


def require_admin(x_admin_token: str | None = Header(default=None)) -> None:
    if not ADMIN_TOKEN or not x_admin_token or not hmac.compare_digest(x_admin_token, ADMIN_TOKEN):
        raise HTTPException(403, "admin_only")
