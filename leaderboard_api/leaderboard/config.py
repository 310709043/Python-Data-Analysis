"""設定：全部從環境變數讀取。"""
import os

# DEV_MODE=1 時，簡訊驗證碼會直接回傳在 API 回應裡，方便本機測試。正式環境絕對不要開。
DEV_MODE = os.environ.get("DEV_MODE", "0") == "1"

# 用來雜湊手機號碼、裝置 ID、驗證碼的密鑰。正式環境一定要設，而且不能外流。
APP_SECRET = os.environ.get("APP_SECRET", "")
if not APP_SECRET:
    if not DEV_MODE:
        raise RuntimeError("正式環境必須設定 APP_SECRET")
    APP_SECRET = "dev-only-secret-do-not-use-in-production"

# 管理後台 API 用的 token（審核、年齡驗證）。沒設定時管理 API 全部拒絕。
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./leaderboard.db")

# 隱私權政策版本。改版時換這個值，所有人都要重新同意才能繼續記錄。
PRIVACY_POLICY_VERSION = os.environ.get("PRIVACY_POLICY_VERSION", "2026-11-01")
