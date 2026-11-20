# 次數排行榜 API：雙方確認制

一筆紀錄要**雙方都確認**才會計分。系統再用規則和人工審核擋掉作假。
網站不收任何照片、影片或描述，只記錄「誰和誰、什麼時間、對方有沒有確認」。

> 沒有任何方法能證明一筆紀錄真的發生過。這套設計的目的是讓作假**很麻煩、很容易被抓**，
> 並且讓排行榜上的每一筆都經過兩個實名（手機驗證）、年滿 18 歲的帳號同意。

## 快速開始

```bash
cd leaderboard_api
pip install -r requirements.txt
DEV_MODE=1 ADMIN_TOKEN=change-me uvicorn leaderboard.main:app --reload
```

打開 http://localhost:8000/docs 可以直接試每支 API。
`DEV_MODE=1` 時簡訊驗證碼會出現在 API 回應的 `dev_code`，正式環境不要開。

跑測試：

```bash
pytest -q
```

## 使用流程

```
註冊（手機簡訊）→ 同意隱私權政策 → 18 歲驗證（後台／KYC）
        ↓
A 邀請 B 成為伴侶 → B 接受
        ↓
A 記錄一次（選 B、選時間） → B 收到通知
        ↓
B 在 24 小時內按「確認」 ──→ 雙方各 +1（若被系統標記則先送審）
        └─ 按「否認」或逾時 ──→ 不計分
```

## 防作弊規則

數字都在 `leaderboard/rules.py` 開頭，可以直接調整。

| 規則 | 預設值 | 違反時 |
|---|---|---|
| 必須先互加伴侶 | — | 拒絕 |
| 年滿 18 歲驗證、同意最新版隱私權政策 | — | 拒絕 |
| 對方確認期限 | 24 小時 | 逾時作廢 |
| 不能記錄未來的時間 | 容許 5 分鐘誤差 | 拒絕 |
| 最多補記 | 7 天內 | 拒絕 |
| 同一人兩筆的最短間隔 | 30 分鐘 | 拒絕 |
| 同一人每天上限（台灣時間） | 5 次 | 拒絕 |
| 同一台裝置登入過雙方帳號 | — | 標記送審 |
| 同一對同一天 | 第 4 次起 | 標記送審 |
| 3 人以上、72 小時內註冊、只跟彼此大量互刷 | 每人 30 天 ≥ 10 次 | 標記送審（每日排程） |
| 新帳號上榜 | 註冊滿 30 天 | 不上榜 |

幾個刻意的設計：
- **同一個 IP 不算可疑**：兩人在一起本來就常用同一個 Wi-Fi。
- **對方的上限在對方確認時才檢查**：錯誤只給對方看，A 不會從錯誤訊息推測出 B 跟別人有紀錄。
- **被標記不等於作廢**：只是暫停計分，人工審核後選 `clear`（恢復計分）或 `void`（永久不算）。
- **預設不公開**：使用者要自己到設定打開才會出現在排行榜，排行榜只顯示暱稱。

## API 一覽

需要登入的 API 都要帶 `Authorization: Bearer <token>`。建議所有請求都帶 `X-Device-Id`
（App 安裝時產生一次的隨機 ID），防作弊會用到。

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/auth/otp/request` | 寄簡訊驗證碼 `{phone}` |
| POST | `/auth/otp/verify` | 驗證並登入 `{phone, code, nickname?}`，新帳號要帶暱稱 |
| GET | `/privacy-policy/version` | 目前的隱私權政策版本 |
| GET | `/me` | 我的帳號狀態 |
| POST | `/me/consent` | 同意隱私權政策 `{version}` |
| PATCH | `/me/settings` | `{show_on_leaderboard}` 是否公開上榜 |
| GET | `/me/stats` | 已計分／審核中／待對方確認／待我確認 |
| DELETE | `/me` | 刪除帳號 |
| GET | `/partners` | 我的伴侶與邀請 |
| POST | `/partners` | 邀請 `{nickname}` |
| POST | `/partners/{id}/accept` · `/reject` | 接受／拒絕邀請 |
| DELETE | `/partners/{id}` | 解除關係（待確認的紀錄一併取消） |
| POST | `/encounters` | 記錄一次 `{partner_id, occurred_at}`（時間要帶時區） |
| GET | `/encounters` | 我的紀錄 |
| GET | `/encounters/incoming` | 等我確認的紀錄 |
| POST | `/encounters/{id}/confirm` · `/reject` | 對方確認／否認 |
| POST | `/encounters/{id}/cancel` | 發起人撤回 |
| GET | `/leaderboard?period=week\|month\|all` | 排行榜 |

管理 API（帶 `X-Admin-Token`）：

| 方法 | 路徑 | 說明 |
|---|---|---|
| POST | `/admin/users/{id}/age-verification` | 設定 18 歲驗證結果（給 KYC webhook 用） |
| GET | `/admin/encounters/flagged` | 待審核清單 |
| POST | `/admin/encounters/{id}/review` | `{decision: clear\|void}` |
| POST | `/admin/jobs/detect-rings` | 跑小圈圈互刷偵測（建議每天排程） |

## 資料表

完整 PostgreSQL 建表語法在 `schema.sql`（由 `python scripts/dump_schema.py > schema.sql` 產生）。

| 資料表 | 用途 |
|---|---|
| `users` | 暱稱、手機雜湊、年齡驗證、同意紀錄、是否公開 |
| `otp_codes` | 簡訊驗證碼（只存雜湊） |
| `auth_sessions` | 登入 token（只存雜湊）＋裝置雜湊 |
| `partner_links` | 伴侶關係，同一對只有一列 |
| `encounters` | 每筆紀錄：雙方、時間、確認狀態、審核狀態 |

## 隱私與個資

「性生活」屬於個資法第 6 條的**特種個資**，原則上禁止蒐集，必須有當事人明確的書面同意。這套程式碼已經做到下面幾點：
- **不存明碼個資**：手機號碼、裝置 ID 只存加了密鑰的雜湊，資料庫外洩也反推不出來。
- **同意有版本**：同意紀錄帶版本號，政策改版後所有人要重新同意才能繼續記錄。
- **雙方都同意**：伴侶要雙方同意才能互相記錄，每筆紀錄也要對方確認。
- **可以刪除帳號**：刪除後身分資料清空，暱稱釋出；對方的紀錄保留，但不再連到這個人。

## 上線前還要做

- [ ] **簡訊服務**：串接真正的簡訊服務（`notify.py` 的 `send_sms`）
- [ ] **年齡驗證**：串接 18 歲驗證（KYC 服務的 webhook 呼叫 `/admin/users/{id}/age-verification`）
- [ ] **推播通知**：串接推播（`notify.py` 的 `notify`），通知文字不要出現敏感字眼
- [ ] **資料庫**：改用 PostgreSQL ＋ Alembic 管理 migration，不要用自動建表
- [ ] **環境變數**：設定 `APP_SECRET`（長隨機字串，不可外流）、`ADMIN_TOKEN`，關掉 `DEV_MODE`
- [ ] **加密與流量限制**：全站 HTTPS，加上 API 流量限制（例如 nginx 或 Cloudflare）
- [ ] **排程**：每天排程呼叫 `/admin/jobs/detect-rings`
- [ ] **法律審閱**：請律師審閱隱私權政策與服務條款
