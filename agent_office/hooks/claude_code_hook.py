#!/usr/bin/env python3
"""把 Claude Code 的 hook 事件轉成 Agent Office 的狀態回報。

在 .claude/settings.json 的 hooks 裡，對下列事件各掛一次這支腳本即可（見 README）：
UserPromptSubmit / PreToolUse / Notification / Stop / SessionEnd

每個 Claude Code 工作階段會成為辦公室裡的一位員工。可用環境變數改名：
    OFFICE_AGENT_ID / OFFICE_AGENT_NAME / OFFICE_AGENT_ROLE / AGENT_OFFICE_URL

這支腳本永遠以 0 結束、逾時很短，不會拖慢或擋住 Claude Code。
"""
import json
import os
import sys
import urllib.request


def describe(tool: str, tool_input: dict) -> str:
    def short(text: object, n: int = 40) -> str:
        text = " ".join(str(text or "").split())
        return text if len(text) <= n else text[: n - 1] + "…"

    name = os.path.basename(str(tool_input.get("file_path") or tool_input.get("path") or ""))
    if tool == "Bash":
        return "執行指令：" + short(tool_input.get("command"))
    if tool in ("Edit", "MultiEdit", "Write", "NotebookEdit"):
        return "編輯 " + (name or "檔案")
    if tool == "Read":
        return "閱讀 " + (name or "檔案")
    if tool in ("Grep", "Glob"):
        return "搜尋：" + short(tool_input.get("pattern"))
    if tool in ("Task", "Agent"):
        return "委派子任務：" + short(tool_input.get("description"))
    if tool in ("WebFetch", "WebSearch"):
        return "上網查資料"
    return short(tool)


def build_event(data: dict) -> dict | None:
    hook = data.get("hook_event_name")
    session = str(data.get("session_id") or "session")[:8]
    event = {
        "agent": os.environ.get("OFFICE_AGENT_ID") or f"claude-{session}",
        "name": os.environ.get("OFFICE_AGENT_NAME") or f"Claude {session[:4]}",
        "role": os.environ.get("OFFICE_AGENT_ROLE") or "Claude Code",
    }
    if hook == "UserPromptSubmit":
        return {**event, "status": "thinking", "task": "閱讀你的需求"}
    if hook == "PreToolUse":
        tool_input = data.get("tool_input") if isinstance(data.get("tool_input"), dict) else {}
        return {**event, "status": "working", "task": describe(str(data.get("tool_name") or ""), tool_input)}
    if hook == "Notification":
        return {**event, "status": "waiting", "task": "等你回覆或授權", "message": str(data.get("message") or "")[:120]}
    if hook == "Stop":
        return {**event, "status": "done", "task": "這一輪完成"}
    if hook == "SessionEnd":
        return {**event, "status": "offline"}
    return None


def main() -> None:
    try:
        data = json.load(sys.stdin)
        event = build_event(data if isinstance(data, dict) else {})
        if event:
            url = (os.environ.get("AGENT_OFFICE_URL") or "http://127.0.0.1:8765").rstrip("/")
            request = urllib.request.Request(
                url + "/api/event",
                data=json.dumps(event, ensure_ascii=False).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(request, timeout=0.5).read()
    except Exception:
        pass


if __name__ == "__main__":
    main()
    sys.exit(0)
