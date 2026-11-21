#!/usr/bin/env python3
"""Claude Code 與 Codex 共用的 hook：把 hook 事件轉成 Agent Office 的狀態回報。

在兩邊的 hook 設定裡掛同一支腳本即可，用參數指定這位員工是誰（見 README）：

    python3 agent_office/hooks/agent_hook.py --kind claude --name Coder --role 工程師
    python3 agent_office/hooks/agent_hook.py --kind codex  --name Reviewer --role 審查員

不給 --agent 時，用「引擎 + session id」當代號，所以每個工作階段會是一位獨立的員工；
想讓同一位員工跨工作階段保持同一個人，就指定 --agent。
也可以用環境變數 OFFICE_AGENT_ID / OFFICE_AGENT_NAME / OFFICE_AGENT_ROLE / AGENT_OFFICE_URL。

這支腳本永遠以 0 結束、逾時只有 0.5 秒，而且不輸出任何內容，不會拖慢或影響 Claude Code / Codex。
"""
import argparse
import json
import os
import sys
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import adapters  # noqa: E402


def build_event(data, args):
    mapped = adapters.from_hook(data)
    if mapped is None:
        return None
    session = str(data.get("session_id") or "session")[:8]
    cwd = os.path.basename(str(data.get("cwd") or "").rstrip("/\\"))
    kind = args.kind or os.environ.get("OFFICE_AGENT_KIND") or ""
    label = adapters.KIND_LABEL.get(kind, "Agent")
    event = {
        "agent": args.agent or os.environ.get("OFFICE_AGENT_ID") or f"{kind or 'agent'}-{session}",
        "name": args.name or os.environ.get("OFFICE_AGENT_NAME") or (f"{label} {cwd}" if cwd else f"{label} {session[:4]}"),
        "role": args.role or os.environ.get("OFFICE_AGENT_ROLE") or "",
        "kind": kind,
        "animal": args.animal or os.environ.get("OFFICE_AGENT_ANIMAL"),
    }
    event.update(mapped)
    return event


def main():
    try:
        parser = argparse.ArgumentParser(add_help=False)
        parser.add_argument("--kind", choices=["claude", "codex"], default=None)
        parser.add_argument("--agent")
        parser.add_argument("--name")
        parser.add_argument("--role")
        parser.add_argument("--animal")
        args, _ = parser.parse_known_args()
        data = json.load(sys.stdin)
        event = build_event(data if isinstance(data, dict) else {}, args)
        if event:
            url = (os.environ.get("AGENT_OFFICE_URL") or "http://127.0.0.1:8765").rstrip("/")
            request = urllib.request.Request(
                url + "/api/event",
                data=json.dumps(event, ensure_ascii=False).encode(),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            urllib.request.urlopen(request, timeout=0.5).read()
    except BaseException:
        pass


if __name__ == "__main__":
    main()
    sys.exit(0)
