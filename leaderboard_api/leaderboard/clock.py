"""統一的時間來源。資料庫裡一律存「不帶時區的 UTC 時間」。

測試時可以替換 now() 來模擬時間經過。
"""
from datetime import datetime, timezone


def now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def to_naive_utc(dt: datetime) -> datetime:
    """把帶時區的時間轉成不帶時區的 UTC。"""
    return dt.astimezone(timezone.utc).replace(tzinfo=None)


def to_aware(dt: datetime | None) -> datetime | None:
    """輸出給前端時補上 UTC 時區。"""
    return dt.replace(tzinfo=timezone.utc) if dt is not None else None
