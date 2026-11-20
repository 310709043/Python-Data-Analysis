"""通知與簡訊的接口。上線時換成真正的推播／簡訊服務（例如 Firebase、三竹簡訊、Twilio）。"""
import logging

from .config import DEV_MODE

log = logging.getLogger("leaderboard.notify")


def send_sms(phone: str, code: str) -> None:
    if DEV_MODE:
        log.info("[DEV] SMS to %s: %s", phone, code)
    else:
        # TODO: 串接簡訊服務。不要把驗證碼寫進 log。
        log.info("SMS code sent to ***%s", phone[-3:])


def notify(user_id: int, kind: str, payload: dict) -> None:
    # TODO: 串接推播。通知內容不要包含敏感字眼，例如只寫「你有一筆待確認的紀錄」。
    log.info("notify user=%s kind=%s payload=%s", user_id, kind, payload)
