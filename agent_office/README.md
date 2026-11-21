# Agent Office

一間像素風的虛擬辦公室，讓你「看著」自己的 AI agent 上班：

| agent 狀態 | 辦公室裡的樣子 |
| --- | --- |
| `working` 工作中 | 坐在自己的座位敲鍵盤，螢幕捲動程式碼，頭上顯示目前任務 |
| `thinking` 思考中 | 單手托腮，螢幕游標閃爍，任務後面跳動的 `...` |
| `waiting` 等待中 | 左右張望，螢幕顯示 `?`（例如等你授權、等外部資源） |
| `error` 出錯了 | 抱頭、身體抖動、螢幕閃紅光並冒煙 |
| `done` 完成 | 舉手歡呼，螢幕打勾，幾秒後自動回到待命 |
| `idle` 待命 | 離開座位，到休息區坐沙發、喝咖啡、聊天 |
| 交接（`to`） | 拿著文件走到同事的座位，交給對方後再回去 |

另外有：員工名冊（含目前任務與已進行時間）、動態紀錄、牆上的任務看板（依實際狀態更新）、
日夜主題（跟隨系統深淺色）。

## 快速開始

不需要安裝任何套件（只用 Python 標準函式庫，Python 3.9+）。

```bash
python agent_office/server.py --demo
```

打開 <http://127.0.0.1:8765>，會看到七位示範員工分成兩條產線在工作。
要接上自己的 agent，把 `--demo` 拿掉，讓 agent 回報狀態即可。

只想先看看畫面、不啟動伺服器：

```bash
python agent_office/build_standalone.py   # 產生 agent_office/dist/agent-office.html
```

雙擊那個檔案就能開（示範模式，內容是瀏覽器模擬的）。

## 讓你的 agent 回報狀態

### Python

```python
import sys; sys.path.insert(0, "agent_office")
import client

office = client.Office()          # 預設 http://127.0.0.1:8765，可用環境變數 AGENT_OFFICE_URL 覆寫

office.report("coder", "working", "撰寫登入 API", name="Coder", role="工程師")
office.report("coder", "thinking")                       # 沒傳 task：沿用目前任務
office.handoff("coder", "reviewer", "請幫我審查")         # coder 拿文件走去 reviewer 的座位

with office.working("coder", "跑單元測試"):               # 進入=工作中，正常離開=完成，丟例外=出錯
    run_tests()
```

回報失敗（伺服器沒開、網路不通）會被吞掉並回傳 `False`，不會讓你的 agent 因此中斷。

### 任何語言：一個 HTTP 請求

```bash
curl -X POST http://127.0.0.1:8765/api/event \
  -H 'Content-Type: application/json' \
  -d '{"agent":"coder","name":"Coder","role":"工程師","status":"working","task":"撰寫登入 API"}'
```

| 欄位 | 說明 |
| --- | --- |
| `agent` | 必填。唯一代號，同一個 agent 每次用同一個值 |
| `status` | `idle` `thinking` `working` `waiting` `error` `done` `offline`。省略＝維持目前狀態 |
| `task` | 目前在做什麼（最多 200 字）。省略＝沿用；`null` 或 `""`＝清空；回到 `idle` 會自動清空 |
| `name` `role` | 顯示名稱與職稱，通常只需第一次給 |
| `message` | 在頭上冒出一個虛線對話框（4.5 秒），並寫入動態紀錄 |
| `to` | 另一位 agent 的代號。會觸發「拿文件走過去交接」動畫 |

其他端點：`DELETE /api/agent/<id>`（讓 agent 下班）、`GET /api/state`（目前快照）、
`GET /api/stream`（SSE，瀏覽器用的即時串流）。

行為細節：

- 重複回報同樣的狀態與任務視為心跳：只刷新時間，不產生動態。
- 處於 `thinking` / `working` / `waiting` 的 agent 超過 `--stale` 秒（預設 180）沒回報，
  會自動回到待命，避免 agent 當掉後一直「假裝在工作」。
- 辦公室有 8 張辦公桌。超過 8 位員工時，多出來的人只會待在休息區（名冊與對話框仍會更新）。

### 接上 Claude Code

`hooks/claude_code_hook.py` 會把 Claude Code 的 hook 事件轉成狀態回報，
每個 Claude Code 工作階段就是辦公室裡的一位員工。在 `.claude/settings.json` 加入：

```json
{
  "hooks": {
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/claude_code_hook.py" }] }],
    "PreToolUse":       [{ "matcher": "*", "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/claude_code_hook.py" }] }],
    "Notification":     [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/claude_code_hook.py" }] }],
    "Stop":             [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/claude_code_hook.py" }] }],
    "SessionEnd":       [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/claude_code_hook.py" }] }]
  }
}
```

對應：送出需求→思考中、使用工具→工作中（任務會寫出是哪個指令/檔案）、
等你授權→等待中、回合結束→完成、結束工作階段→下班。
用 `OFFICE_AGENT_NAME` / `OFFICE_AGENT_ROLE` / `OFFICE_AGENT_ID` 環境變數可以改名。
腳本逾時只有 0.5 秒且永遠以 0 結束，不會拖慢或擋住 Claude Code。

> 這支 hook 我用模擬的 hook 輸入（stdin JSON）驗證過事件對應與回報流程，
> 還沒在真實的 Claude Code 工作階段裡跑過；若你的版本 hook 欄位名稱不同，改 `build_event()` 即可。

### 接上其他框架（LangGraph、CrewAI、自製 agent loop…）

在你的 agent 開始/結束每個步驟、呼叫工具、拋出例外的地方各加一行 `office.report(...)` 即可。
框架本身不需要改。

## 安全性

伺服器預設只監聽 `127.0.0.1`，而且沒有驗證機制：能連到它的人都能假冒任何 agent 回報狀態。
`--host 0.0.0.0` 只應該在可信任的內網使用。

## 檔案

```
agent_office/
├── server.py            伺服器（狀態 + HTTP + SSE，標準函式庫）
├── client.py            回報狀態用的 Python 小工具
├── demo.py              示範團隊（也可當接入範例：python agent_office/demo.py）
├── hooks/claude_code_hook.py
├── build_standalone.py  打包成單一 HTML
├── static/              前端（index.html / style.css / office.js）
└── tests/test_office.py
```

測試：`pip install pytest && python -m pytest agent_office/tests -q`
