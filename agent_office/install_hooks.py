#!/usr/bin/env python3
"""產生（或合併進設定檔）Claude Code / Codex 的 hook 設定，讓它們把進度回報給 Agent Office。

    # 只印出設定，自己貼上
    python agent_office/install_hooks.py claude --agent coder --name Coder --role 工程師 --animal cat

    # 直接合併進設定檔（會保留你原有的其他設定，並先備份成 <檔名>.agent-office.bak）
    python agent_office/install_hooks.py claude --agent coder --name Coder --animal cat --write .claude/settings.json
    python agent_office/install_hooks.py codex  --agent reviewer --name Reviewer --animal panda --write ~/.codex/hooks.json

重複執行是安全的：同一個 --agent 的舊設定會被換成新的，不會重複掛。
要換掉某位員工，用 --remove 加上同一個 --agent 與 --write 即可。
"""
from __future__ import annotations

import argparse
import json
import os
import shlex
import subprocess
import sys
from pathlib import Path

HOOK = Path(__file__).resolve().parent / "hooks" / "agent_hook.py"

# 事件 -> 是否需要 matcher（工具類事件要用 "*" 才會涵蓋所有工具）
EVENTS = {
    "claude": {
        "SessionStart": False, "UserPromptSubmit": False, "PreToolUse": True, "PostToolUse": True,
        "Notification": False, "Stop": False, "SessionEnd": False,
    },
    "codex": {
        "UserPromptSubmit": False, "PreToolUse": True, "PostToolUse": True, "PermissionRequest": False, "Stop": False,
    },
}


def _join(parts: list[str]) -> str:
    return subprocess.list2cmdline(parts) if os.name == "nt" else shlex.join(parts)


def build_command(kind: str, agent: str, name: str | None, role: str | None, animal: str | None) -> str:
    parts = [sys.executable, str(HOOK), "--kind", kind, "--agent", agent]
    for flag, value in (("--name", name), ("--role", role), ("--animal", animal)):
        if value:
            parts += [flag, value]
    return _join(parts)


def _is_ours(command: str, agent: str) -> bool:
    try:
        parts = shlex.split(command, posix=os.name != "nt")
    except ValueError:
        return False
    return any(p.endswith("agent_hook.py") for p in parts) and "--agent" in parts and parts[parts.index("--agent") + 1] == agent


def merge(config: dict, kind: str, agent: str, command: str | None) -> dict:
    """把這位員工的 hook 合併進 config。command 為 None 代表只移除。其他設定原封不動。"""
    hooks = config.setdefault("hooks", {})
    if not isinstance(hooks, dict):
        raise ValueError("設定檔裡的 hooks 不是物件，請手動檢查")
    for event, needs_matcher in EVENTS[kind].items():
        groups = hooks.setdefault(event, [])
        if not isinstance(groups, list):
            raise ValueError(f"hooks.{event} 不是陣列，請手動檢查")
        for group in groups:  # 先移除這位員工舊的設定
            if isinstance(group, dict) and isinstance(group.get("hooks"), list):
                group["hooks"] = [h for h in group["hooks"] if not (isinstance(h, dict) and _is_ours(str(h.get("command", "")), agent))]
        groups[:] = [g for g in groups if not (isinstance(g, dict) and g.get("hooks") == [])]
        if command is not None:
            group = {"hooks": [{"type": "command", "command": command}]}
            if needs_matcher:
                group = {"matcher": "*", **group}
            groups.append(group)
        if not groups:
            del hooks[event]
    if not hooks:
        config.pop("hooks", None)
    return config


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("kind", choices=["claude", "codex"])
    parser.add_argument("--agent", required=True, help="員工代號（同一位員工用同一個）")
    parser.add_argument("--name")
    parser.add_argument("--role")
    parser.add_argument("--animal", help="shin nene masao bo kazama hiroshi misae shiro（小新風）或 cat dog rabbit panda fox bear frog penguin（動物）；不指定就依代號自動挑")
    parser.add_argument("--write", type=Path, help="合併進這個設定檔；沒指定就只印到螢幕")
    parser.add_argument("--remove", action="store_true", help="移除這位員工的 hook（需搭配 --write）")
    args = parser.parse_args()
    if args.remove and not args.write:
        parser.error("--remove 需要搭配 --write")

    command = None if args.remove else build_command(args.kind, args.agent, args.name, args.role, args.animal)
    path = args.write.expanduser() if args.write else None
    config: dict = {}
    if path and path.exists():
        try:
            config = json.loads(path.read_text(encoding="utf-8") or "{}")
            if not isinstance(config, dict):
                raise ValueError("最外層不是物件")
        except ValueError as exc:
            raise SystemExit(f"讀不懂 {path}（{exc}）。沒有改動任何東西；請先修好或移除那個檔案。")
    try:
        merged = merge(config, args.kind, args.agent, command)
    except ValueError as exc:
        raise SystemExit(f"{exc}。沒有改動任何東西。")

    text = json.dumps(merged, ensure_ascii=False, indent=2) + "\n"
    if not path:
        print(text, end="")
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        backup = path.with_name(path.name + ".agent-office.bak")
        if not backup.exists():
            backup.write_text(path.read_text(encoding="utf-8"), encoding="utf-8")
    path.write_text(text, encoding="utf-8")
    verb = "已移除" if args.remove else "已寫入"
    print(f"{verb} {args.agent} 的 {args.kind} hook：{path}")
    if not args.remove:
        print("重新啟動 Claude Code / Codex 後生效。")


if __name__ == "__main__":
    main()
