# Agent Office

一間像素風的虛擬辦公室，每個 AI agent 是一隻可愛的動物（貓、狗、兔子、熊貓、狐狸、小熊、青蛙、企鵝），讓你「看著」牠們上班：

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

## 第一次使用（約 5 分鐘）

辦公室跑在**你自己的電腦**上（你的 Claude Code / Codex 也在那裡跑），所以以下都在你的電腦操作。
需要 Python 3.9 以上，不用安裝任何套件。

**1. 取得程式**

```bash
git clone https://github.com/310709043/Python-Data-Analysis.git
cd Python-Data-Analysis
git checkout claude/wonderful-newton-vjbdr1   # 這個功能還在這個分支上，合併進主分支後就不用這行
```

**2. 先看示範，確認畫面正常**

```bash
python3 agent_office/server.py --demo
```

打開 <http://127.0.0.1:8765>，會看到七隻動物分成兩條產線在工作。看夠了按 `Ctrl-C` 關掉。

**3. 啟動真正的辦公室（不帶 `--demo`），並留著這個終端機不要關**

```bash
python3 agent_office/server.py
```

重新整理瀏覽器，這時辦公室是空的。

**4. 讓你的第一個 agent 進來**，開另一個終端機，挑一種：

- *馬上試試看（不用改任何設定）*：用 `run.py` 包住一次 Claude Code 或 Codex 的執行

  ```bash
  python3 agent_office/run.py --agent coder --name Coder --animal cat -- claude -p "用一句話介紹這個專案"
  python3 agent_office/run.py --agent reviewer --name Reviewer --animal panda -- codex exec "用一句話介紹這個專案"
  ```

  貓會從門口走進來，坐到座位上，頭上顯示牠正在做的事，結束後去休息區。

- *平常互動使用*：一行指令把 hook 裝進設定檔（會保留你原有的設定並先備份）

  ```bash
  # Claude Code：裝在你要用它的專案裡（或改成 ~/.claude/settings.json 讓所有專案都生效）
  python3 agent_office/install_hooks.py claude --agent coder --name Coder --role 工程師 --animal cat --write .claude/settings.json
  # Codex
  python3 agent_office/install_hooks.py codex --agent reviewer --name Reviewer --role 審查員 --animal panda --write ~/.codex/hooks.json
  ```

  重新啟動 Claude Code / Codex，之後你每送出一個需求，牠就會在辦公室裡開始工作。

**5. 之後的日常**：先 `python3 agent_office/server.py`，再照常使用你的 agent。
不想用某位員工了：`install_hooks.py ... --remove --write 同一個檔案`。

只想先看畫面、不啟動伺服器：`python3 agent_office/build_standalone.py`，雙擊產生的 `agent_office/dist/agent-office.html`（示範模式）。

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
| `name` `role` `kind` `animal` | 顯示名稱、職稱、引擎（`claude` / `codex`，名冊會顯示標籤）、角色動物（`cat` `dog` `rabbit` `panda` `fox` `bear` `frog` `penguin`；不指定就依代號自動挑，盡量不重複），通常只需第一次給 |
| `message` | 在頭上冒出一個虛線對話框（4.5 秒），並寫入動態紀錄 |
| `to` | 另一位 agent 的代號。會觸發「拿文件走過去交接」動畫 |
| `quiet` | `true`＝只更新畫面，不寫入動態紀錄（適合很頻繁的小事件） |

其他端點：`DELETE /api/agent/<id>`（讓 agent 下班）、`GET /api/state`（目前快照）、
`GET /api/stream`（SSE，瀏覽器用的即時串流）。

行為細節：

- 重複回報同樣的狀態與任務視為心跳：只刷新時間，不產生動態。
- 處於 `thinking` / `working` / `waiting` 的 agent 超過 `--stale` 秒（預設 180）沒回報，
  會自動回到待命，避免 agent 當掉後一直「假裝在工作」。
- 辦公室有 8 張辦公桌。超過 8 位員工時，多出來的人只會待在休息區（名冊與對話框仍會更新）。

### 接上 Claude Code 與 Codex

兩種方式可以混用：**hook** 適合平常在終端機互動使用的 agent；**`run.py`** 適合 `claude -p` / `codex exec` 這類無人值守的執行。

先決定每位員工的代號、名字、職稱、動物。同一位員工每次都用同一個 `--agent`，畫面上就是同一個人。
不指定的話，每個工作階段會變成一位新員工（名字會是「引擎 + 資料夾名稱」）。

#### 方式一：hook（互動使用）

最省事的做法是用安裝器（見上面「第一次使用」第 4 步），它會產生下面這些設定並安全地合併進你的設定檔。
想手動貼的話，不加 `--write` 它就只印出 JSON。下面是它產生的內容，供你看懂或手動調整：

`hooks/agent_hook.py` 同時支援兩邊，用 `--kind claude` 或 `--kind codex` 區分，名冊會顯示引擎標籤。

Claude Code：在 `.claude/settings.json`（或 `~/.claude/settings.json`）加入。
每個事件都掛同一支腳本，這裡以 `Bash` 工具為例，要涵蓋所有工具就用 `"matcher": "*"`：

```json
{
  "hooks": {
    "SessionStart":     [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }],
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }],
    "PreToolUse":       [{ "matcher": "*", "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }],
    "PostToolUse":      [{ "matcher": "*", "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }],
    "Notification":     [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }],
    "Stop":             [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }],
    "SessionEnd":       [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind claude --agent coder --name Coder --role 工程師" }] }]
  }
}
```

Codex：寫在 `~/.codex/hooks.json`，結構相同，事件名稱改用 Codex 有的那幾個
（`SessionStart` `UserPromptSubmit` `PreToolUse` `PostToolUse` `PermissionRequest` `Stop`），`--kind codex`：

```json
{
  "hooks": {
    "UserPromptSubmit": [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind codex --agent reviewer --name Reviewer --role 審查員" }] }],
    "PreToolUse":       [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind codex --agent reviewer --name Reviewer --role 審查員" }] }],
    "PostToolUse":      [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind codex --agent reviewer --name Reviewer --role 審查員" }] }],
    "PermissionRequest":[{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind codex --agent reviewer --name Reviewer --role 審查員" }] }],
    "Stop":             [{ "hooks": [{ "type": "command", "command": "python3 /絕對路徑/agent_office/hooks/agent_hook.py --kind codex --agent reviewer --name Reviewer --role 審查員" }] }]
  }
}
```

事件對應：

| 事件 | 畫面 |
| --- | --- |
| `SessionStart` | 員工到辦公室報到（待命） |
| `UserPromptSubmit` | 思考中 |
| `PreToolUse` | 工作中，任務寫出工具與內容（「執行指令：pytest -q」「編輯 app.py」） |
| `PostToolUse` | 思考中（分析結果；只更新畫面，不寫入動態紀錄） |
| `Notification` / `PermissionRequest` | 等待中（等你回覆或授權） |
| `Stop` | 完成，幾秒後回到待命 |
| `SessionEnd` | 下班（Codex 沒有這個事件，靠逾時自動待命） |

腳本逾時只有 0.5 秒、永遠以 0 結束、不輸出任何內容，不會拖慢或影響兩邊的 CLI。

> **驗證程度**：Claude Code 這一側，欄位與事件對應沿用 Claude Code 的 hook 格式，用模擬的 stdin 驗證過。
> Codex 這一側我讀不到官方文件（這個環境擋了該網域，也沒有安裝 codex），
> 設定格式與 stdin 欄位是依第三方整理的資料寫的，解析一律寬鬆處理（缺欄位或沒看過的事件只會被忽略）。
> 如果你的 Codex 版本沒有事件進來，先手動確認腳本本身沒問題：
> `echo '{"hook_event_name":"Stop","session_id":"t1"}' | python3 agent_office/hooks/agent_hook.py --kind codex --name Test`，
> 辦公室裡應該出現一位 Test；有的話問題就在 Codex 端的 hook 設定，把它實際送出的 JSON 貼給我我就能對齊。
> 另外有資料指出 Codex 的 `PreToolUse`/`PostToolUse` 目前只涵蓋 Bash 工具，所以只改檔案的動作可能看不到。

#### 方式二：`run.py`（`claude -p` / `codex exec` / 任何腳本）

```bash
python agent_office/run.py --agent coder --name Coder --role 工程師 -- \
    claude -p "修正 issue #12 並補上測試" --allowedTools Bash,Edit

python agent_office/run.py --agent reviewer --name Reviewer --role 審查員 -- \
    codex exec "審查目前的 git diff"
```

- 開始 → 思考中；結束碼 0 → 完成；非 0 → 出錯。結束碼會原樣傳回，Ctrl-C 會轉送給子程序。
- 指令是 `claude -p` 時會自動補上 `--output-format stream-json --verbose`；`codex exec` 會自動補上 `--json`。
  這樣才能即時看到它正在執行哪個指令、改哪個檔案。這種情況下終端機印出的是整理後的最後回覆；
  若解析不出文字，會改印原始輸出，內容不會消失。你自己已經指定輸出格式時，不會改動你的參數，輸出原樣轉印。
- 其他指令（例如 `python update.py`）完全不經手標準輸入輸出，只回報開始與結束。
- 伺服器沒開時，連續失敗 3 次後就不再嘗試，指令照常執行。

> **驗證程度**：`claude -p` 這條路我用真實的 Claude Code 端到端跑過（輸出格式與工具事件都對得上，測試用的樣本也是真實輸出）。
> `codex exec --json` 這條路只用依官方文件事件名稱手寫的合成樣本測過，沒有真實的 Codex 輸出可對照；
> 欄位名稱若和實際不同，畫面至少仍會顯示開始與結束，並且印出原始輸出。

#### 讓 Claude Code 與 Codex 組成團隊

每位員工一個終端機（或一個 `run.py` 指令），`--agent` 取不同的值。要讓它們「交接」，
在流程裡呼叫 `office.handoff("coder", "reviewer", "請審查")`（或 `POST /api/event` 帶 `to`）即可，
例如在你的調度腳本裡，一個 agent 跑完、換下一個接手的地方。

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
├── adapters.py          Claude Code / Codex 事件 → 狀態的對應規則（hook 與 run.py 共用）
├── install_hooks.py     一行指令把 hook 裝進 Claude Code / Codex 的設定檔（安全合併、可移除）
├── run.py               包住 claude -p / codex exec / 任何指令並即時回報
├── hooks/agent_hook.py  Claude Code 與 Codex 共用的 hook
├── build_standalone.py  打包成單一 HTML
├── static/              前端（index.html / style.css / office.js）
└── tests/test_office.py
```

測試：`pip install pytest && python -m pytest agent_office/tests -q`
