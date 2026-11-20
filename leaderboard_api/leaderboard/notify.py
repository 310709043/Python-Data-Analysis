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


def send_push(user_id: int) -> None:
    """推播只送固定文字，不帶任何名字或紀錄內容，避免出現在別人看得到的鎖定畫面上。"""
    # TODO: 串接推播服務。標題固定「你有一則新通知」，點開 App 才看得到內容。
    log.info("push user=%s: 你有一則新通知", user_id)
