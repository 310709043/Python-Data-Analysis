"""把 Claude Code / Codex 的事件轉成 Agent Office 的狀態回報。

三個來源共用這裡的對應規則：
    from_hook(data, kind)          hook 的 stdin JSON（Claude Code 與 Codex 的 hooks 欄位相近）
    from_claude_stream(obj)        `claude -p --output-format stream-json --verbose` 的一行輸出
    from_codex_exec(obj)           `codex exec --json` 的一行輸出

每個函式回傳 None（這個事件不用理會）或 dict：
    {"status", "task", "quiet", "final", "text"}
        quiet  只更新畫面，不寫入動態紀錄
        final  這個事件代表一次執行結束
        text   給人看的文字（run.py 在不顯示原始 JSON 時會印出來）

所有解析都寫得寬鬆：欄位缺少、型別不對、出現沒看過的事件類型，都只會被忽略，不會丟例外。
"""
from __future__ import annotations

import os
from typing import Any

KIND_LABEL = {"claude": "Claude", "codex": "Codex"}


def short(text: Any, n: int = 40) -> str:
    text = " ".join(str(text or "").split())
    return text if len(text) <= n else text[: n - 1] + "…"


def _command_text(value: Any) -> str:
    if isinstance(value, (list, tuple)):
        value = " ".join(str(v) for v in value)
    return short(value)


def describe_tool(tool: str, tool_input: Any) -> str:
    """把一次工具呼叫轉成一句看得懂的任務描述（Claude Code 與 Codex 的工具名稱都處理）。"""
    tool_input = tool_input if isinstance(tool_input, dict) else {}
    path = os.path.basename(str(tool_input.get("file_path") or tool_input.get("path") or ""))
    low = tool.lower()
    if tool == "Bash" or low in ("shell", "exec_command", "local_shell", "container.exec"):
        return "執行指令：" + _command_text(tool_input.get("command") or tool_input.get("cmd"))
    if tool in ("Edit", "MultiEdit", "Write", "NotebookEdit") or low in ("apply_patch", "applypatch"):
        return "編輯 " + (path or "檔案")
    if tool == "Read":
        return "閱讀 " + (path or "檔案")
    if tool in ("Grep", "Glob"):
        return "搜尋：" + short(tool_input.get("pattern"))
    if tool in ("Task", "Agent"):
        return "委派子任務：" + short(tool_input.get("description"))
    if tool in ("WebFetch", "WebSearch") or "web_search" in low:
        return "上網查資料"
    if tool.startswith("mcp__"):
        parts = tool.split("__")
        return "呼叫 " + ".".join(parts[1:]) if len(parts) > 2 else "呼叫 MCP 工具"
    return short(tool) or "使用工具"


# --------------------------------------------------------------------- hooks
def from_hook(data: dict) -> dict | None:
    event = data.get("hook_event_name")
    if event == "SessionStart":
        return {"status": "idle", "task": ""}
    if event == "UserPromptSubmit":
        return {"status": "thinking", "task": "閱讀你的需求"}
    if event == "PreToolUse":
        return {"status": "working", "task": describe_tool(str(data.get("tool_name") or ""), data.get("tool_input"))}
    if event == "PostToolUse":
        return {"status": "thinking", "task": "分析執行結果", "quiet": True}
    if event in ("Notification", "PermissionRequest"):
        message = data.get("message")
        if event == "PermissionRequest" and not message:
            message = "需要你的授權：" + describe_tool(str(data.get("tool_name") or ""), data.get("tool_input"))
        return {"status": "waiting", "task": "等你回覆或授權", "message": short(message, 120)}
    if event == "Stop":
        return {"status": "done", "task": "這一輪完成"}
    if event == "SessionEnd":
        return {"status": "offline"}
    return None


# --------------------------------------------------------------- Claude Code
def from_claude_stream(obj: dict) -> dict | None:
    kind = obj.get("type")
    if kind == "system" and obj.get("subtype") == "init":
        return {"status": "thinking", "task": "開始處理"}
    if kind == "assistant":
        content = (obj.get("message") or {}).get("content")
        if not isinstance(content, list):
            return None
        texts = [b.get("text", "") for b in content if isinstance(b, dict) and b.get("type") == "text"]
        for block in content:  # 一則訊息可能同時有文字與工具呼叫：以工具為準
            if isinstance(block, dict) and block.get("type") == "tool_use":
                return {
                    "status": "working",
                    "task": describe_tool(str(block.get("name") or ""), block.get("input")),
                    "text": "\n".join(texts),
                }
        if texts:
            return {"status": "thinking", "task": "撰寫回覆", "text": "\n".join(texts)}
        if any(isinstance(b, dict) and b.get("type") == "thinking" for b in content):
            return {"status": "thinking", "task": "思考中", "quiet": True}
        return None
    if kind == "user":
        content = (obj.get("message") or {}).get("content")
        if isinstance(content, list) and any(isinstance(b, dict) and b.get("type") == "tool_result" for b in content):
            return {"status": "thinking", "task": "分析工具結果", "quiet": True}
        return None
    if kind == "result":
        failed = bool(obj.get("is_error")) or str(obj.get("subtype") or "success") != "success"
        text = str(obj.get("result") or "")
        if failed:
            return {"status": "error", "task": short(text or obj.get("subtype") or "執行失敗", 60), "final": True, "text": text}
        return {"status": "done", "task": "完成", "final": True, "text": text}
    return None


# --------------------------------------------------------------------- Codex
def from_codex_exec(obj: dict) -> dict | None:
    kind = str(obj.get("type") or "")
    if kind == "turn.started":
        return {"status": "thinking", "task": "開始處理"}
    if kind == "turn.completed":
        return {"status": "done", "task": "完成", "final": True}
    if kind == "turn.failed":
        err = obj.get("error")
        message = err.get("message") if isinstance(err, dict) else err
        return {"status": "error", "task": short(message or "執行失敗", 60), "final": True}
    if kind == "error":
        # 串流中的 error 不一定代表整次失敗（可能會重試），所以不標成 final
        return {"status": "error", "task": short(obj.get("message") or "發生錯誤", 60)}
    if kind.startswith("item."):
        item = obj.get("item")
        item = item if isinstance(item, dict) else {}
        item_type = str(item.get("type") or "")
        done = kind == "item.completed"
        if item_type == "agent_message":
            return {"status": "thinking", "task": "撰寫回覆", "text": str(item.get("text") or "") if done else ""}
        if item_type == "reasoning":
            return {"status": "thinking", "task": short(item.get("text"), 40) or "思考中", "quiet": True}
        if item_type == "command_execution":
            if done:
                return {"status": "thinking", "task": "分析指令結果", "quiet": True}
            return {"status": "working", "task": "執行指令：" + _command_text(item.get("command"))}
        if item_type == "file_change":
            changes = item.get("changes")
            first = changes[0] if isinstance(changes, list) and changes and isinstance(changes[0], dict) else {}
            return {"status": "working", "task": "修改 " + (os.path.basename(str(first.get("path") or "")) or "檔案")}
        if item_type == "mcp_tool_call":
            return {"status": "working", "task": "呼叫 " + ".".join(str(x) for x in (item.get("server"), item.get("tool")) if x)}
        if item_type == "web_search":
            return {"status": "working", "task": "上網查資料"}
        if item_type in ("todo_list", "plan_update", "plan"):
            return {"status": "working", "task": "更新計畫", "quiet": True}
    return None
