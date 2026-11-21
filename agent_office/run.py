#!/usr/bin/env python3
"""包住一個指令，在它執行期間把進度即時回報給 Agent Office。

適合無人值守的用法（`claude -p`、`codex exec`、或任何腳本）：

    python agent_office/run.py --agent coder --name Coder --role 工程師 -- \\
        claude -p "修正 issue #12 並補上測試"

    python agent_office/run.py --agent reviewer --name Reviewer --role 審查員 -- \\
        codex exec "審查目前的 git diff"

    python agent_office/run.py --agent nightly --task "夜間資料更新" -- python update.py

行為
  * 開始 → 思考中；結束 → 完成（結束碼為 0）或出錯（非 0）。
  * 指令是 claude / codex 時，會讀它的結構化輸出，把「正在執行哪個指令、編輯哪個檔案」
    之類的細節即時顯示在頭上的對話框。
      - claude -p ...   會自動補上 --output-format stream-json --verbose
      - codex exec ...  會自動補上 --json
    這時畫面上印的是整理後的文字（最後的回覆）；若解析不出文字，會改印原始輸出，不會讓內容消失。
    你自己已經指定輸出格式的話，這支腳本不會改動它，原始輸出會原樣轉印。
  * 其他指令：標準輸入輸出完全不經手，只回報開始與結束。
  * 結束碼與子程序一致；按 Ctrl-C 會轉送給子程序。
  * 伺服器沒開也沒關係：連續失敗幾次後就不再嘗試，指令照常執行。
"""
from __future__ import annotations

import argparse
import json
import os
import signal
import subprocess
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import adapters  # noqa: E402
import client  # noqa: E402

PARSERS = {"claude": adapters.from_claude_stream, "codex": adapters.from_codex_exec}


class Reporter:
    def __init__(self, office: client.Office, agent: str, name: str | None, role: str | None, kind: str) -> None:
        self.office, self.agent, self.name, self.role, self.kind = office, agent, name, role, kind
        self.failures = 0
        self.last: tuple | None = None
        self.sent_identity = False

    def send(self, status: str, task: str | None = None, *, quiet: bool = False, message: str | None = None) -> None:
        key = (status, task)
        if key == self.last and not message:
            return
        if self.failures >= 3:  # 伺服器沒開：放棄，不要拖慢真正的工作
            return
        extra = {}
        if not self.sent_identity:
            extra = {"name": self.name or self.agent, "role": self.role, "kind": self.kind or None}
        ok = self.office.report(self.agent, status, task, quiet=quiet, message=message, **extra)
        self.failures = 0 if ok else self.failures + 1
        if ok:
            self.sent_identity = True
            self.last = key


def prepare(cmd: list[str], parse: str) -> tuple[list[str], str, bool]:
    """決定要用哪個解析器，必要時補上結構化輸出的參數。回傳 (指令, 解析器, 是否改過輸出格式)。"""
    exe = os.path.basename(cmd[0]).lower()
    exe = exe[:-4] if exe.endswith(".exe") else exe
    chosen = parse if parse != "auto" else (exe if exe in PARSERS else "none")
    if chosen not in ("claude", "codex", "none"):
        raise SystemExit(f"--parse 不支援：{chosen}")
    if parse != "auto" and exe not in PARSERS:
        return cmd, chosen, False  # 強制指定解析器，但不是已知的指令：不亂改它的參數
    if chosen == "claude" and any(a in ("-p", "--print") for a in cmd):
        if not any(a == "--output-format" or a.startswith("--output-format=") for a in cmd):
            return cmd + ["--output-format", "stream-json", "--verbose"], "claude", True
    elif chosen == "codex" and "exec" in cmd[1:]:
        if "--json" not in cmd and "--experimental-json" not in cmd:
            i = cmd.index("exec", 1)
            return cmd[: i + 1] + ["--json"] + cmd[i + 1 :], "codex", True
    return cmd, chosen, False


def run(cmd: list[str], rep: Reporter, parse: str, task: str | None) -> int:
    cmd, chosen, rewritten = prepare(cmd, parse)
    rep.kind = rep.kind or (chosen if chosen in PARSERS else "")
    rep.send("thinking", task or "開始處理")

    if chosen == "none":
        child = subprocess.Popen(cmd)
        rc = _wait(child)
        rep.send("done" if rc == 0 else "error", task or ("完成" if rc == 0 else f"結束碼 {rc}"))
        return rc

    parser = PARSERS[chosen]
    child = subprocess.Popen(cmd, stdout=subprocess.PIPE, text=True, encoding="utf-8", errors="replace", bufsize=1)
    raw_lines: list[str] = []
    texts: list[str] = []
    final = None
    try:
        for line in child.stdout:
            raw_lines.append(line)
            if not rewritten:
                sys.stdout.write(line)
                sys.stdout.flush()
            try:
                obj = json.loads(line)
            except ValueError:
                continue
            mapped = parser(obj) if isinstance(obj, dict) else None
            if not mapped:
                continue
            if mapped.get("text"):
                texts.append(mapped["text"])
            if mapped.get("final"):
                final = mapped
            rep.send(mapped["status"], mapped.get("task"), quiet=bool(mapped.get("quiet")))
    except KeyboardInterrupt:
        child.send_signal(signal.SIGINT)
    rc = _wait(child)

    if rewritten:  # 我們改了輸出格式，所以要把人看得懂的內容印回去
        shown = (final or {}).get("text") if final and final.get("text") else "\n".join(t for t in texts[-1:] if t)
        sys.stdout.write((shown.rstrip("\n") + "\n") if shown else "".join(raw_lines))
        sys.stdout.flush()

    if final is None or (rc != 0 and final["status"] != "error"):
        final = {"status": "done" if rc == 0 else "error", "task": "完成" if rc == 0 else f"結束碼 {rc}"}
    rep.send(final["status"], final.get("task"))
    return rc


def _wait(child: subprocess.Popen) -> int:
    while True:
        try:
            return child.wait()
        except KeyboardInterrupt:
            child.send_signal(signal.SIGINT)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="執行指令並把進度回報給 Agent Office",
        usage="run.py --agent ID [選項] -- 指令 [參數...]",
    )
    parser.add_argument("--agent", required=True, help="員工代號（同一位員工每次用同一個）")
    parser.add_argument("--name", help="顯示名稱")
    parser.add_argument("--role", help="職稱")
    parser.add_argument("--kind", choices=["claude", "codex"], help="引擎；不指定時依指令自動判斷")
    parser.add_argument("--task", help="任務描述（沒指定就顯示指令即時的動作）")
    parser.add_argument("--parse", choices=["auto", "claude", "codex", "none"], default="auto")
    parser.add_argument("--url", help="伺服器位置，預設 http://127.0.0.1:8765 或環境變數 AGENT_OFFICE_URL")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    cmd = args.command[1:] if args.command[:1] == ["--"] else args.command
    if not cmd:
        parser.error("請在 -- 後面接要執行的指令")

    rep = Reporter(client.Office(args.url, timeout=0.4), args.agent, args.name, args.role, args.kind or "")
    try:
        rc = run(cmd, rep, args.parse, args.task)
    except FileNotFoundError:
        rep.send("error", f"找不到指令：{cmd[0]}")
        print(f"找不到指令：{cmd[0]}", file=sys.stderr)
        rc = 127
    sys.exit(rc)


if __name__ == "__main__":
    main()
