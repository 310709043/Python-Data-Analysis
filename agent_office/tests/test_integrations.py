"""Claude Code / Codex 的接入：事件對應、hook、run.py 包裝器。"""
import argparse
import importlib.util
import json
import os
import queue
import subprocess
import sys
import textwrap
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures"
sys.path.insert(0, str(ROOT))

import adapters  # noqa: E402
import run as run_module  # noqa: E402


def load_jsonl(name):
    return [json.loads(line) for line in (FIXTURES / name).read_text(encoding="utf-8").splitlines() if line.strip()]


# ----------------------------------------------------------------- adapters
def test_claude_stream_fixture_maps_to_expected_sequence():
    """fixture 是真實 `claude -p --output-format stream-json --verbose` 的輸出（已去識別化）。"""
    mapped = [m for m in (adapters.from_claude_stream(o) for o in load_jsonl("claude_stream.jsonl")) if m]
    assert [(m["status"], m["task"]) for m in mapped] == [
        ("thinking", "開始處理"),
        ("working", "執行指令：echo hello"),
        ("thinking", "分析工具結果"),
        ("thinking", "撰寫回覆"),
        ("done", "完成"),
    ]
    assert mapped[-1]["final"] is True and mapped[-1]["text"] == "done"


def test_codex_exec_fixture_maps_to_expected_sequence():
    mapped = [m for m in (adapters.from_codex_exec(o) for o in load_jsonl("codex_exec.jsonl")) if m]
    assert [(m["status"], m["task"]) for m in mapped] == [
        ("thinking", "開始處理"),
        ("thinking", "先看一下專案結構"),
        ("working", "執行指令：pytest -q"),
        ("thinking", "分析指令結果"),
        ("working", "修改 app.py"),
        ("working", "呼叫 docs.search"),
        ("thinking", "撰寫回覆"),
        ("done", "完成"),
    ]
    assert mapped[-1]["final"] is True
    assert mapped[-2]["text"] == "已修正並通過測試"


def test_failed_runs_map_to_error():
    r = adapters.from_claude_stream({"type": "result", "subtype": "error_max_turns", "is_error": True, "result": ""})
    assert r["status"] == "error" and r["final"]
    r = adapters.from_codex_exec({"type": "turn.failed", "error": {"message": "boom"}})
    assert r == {"status": "error", "task": "boom", "final": True}
    assert "final" not in adapters.from_codex_exec({"type": "error", "message": "retrying"})  # 可能會重試，不算結束


@pytest.mark.parametrize(
    "obj",
    [{}, {"type": 5}, {"type": "assistant"}, {"type": "assistant", "message": {"content": "str"}},
     {"type": "user", "message": None}, {"type": "item.started"}, {"type": "item.started", "item": []},
     {"type": "item.completed", "item": {"type": "file_change", "changes": "x"}}, {"type": "stream_event"}],
)
def test_adapters_never_raise_on_unexpected_shapes(obj):
    adapters.from_claude_stream(obj)
    adapters.from_codex_exec(obj)


def test_describe_tool_covers_both_engines():
    d = adapters.describe_tool
    assert d("Bash", {"command": "ls -la"}) == "執行指令：ls -la"
    assert d("Bash", {"command": ["git", "status"]}) == "執行指令：git status"
    assert d("apply_patch", {}) == "編輯 檔案"
    assert d("Edit", {"file_path": "/x/y.py"}) == "編輯 y.py"
    assert d("mcp__docs__search", {}) == "呼叫 docs.search"
    assert d("", None) == "使用工具"


def test_from_hook_events():
    f = adapters.from_hook
    assert f({"hook_event_name": "SessionStart"})["status"] == "idle"
    assert f({"hook_event_name": "UserPromptSubmit"})["status"] == "thinking"
    pre = f({"hook_event_name": "PreToolUse", "tool_name": "Bash", "tool_input": {"command": "pytest"}})
    assert pre == {"status": "working", "task": "執行指令：pytest"}
    assert f({"hook_event_name": "PostToolUse"})["quiet"] is True
    perm = f({"hook_event_name": "PermissionRequest", "tool_name": "Bash", "tool_input": {"command": "rm x"}})
    assert perm["status"] == "waiting" and "rm x" in perm["message"]
    assert f({"hook_event_name": "Notification", "message": "需要授權"})["message"] == "需要授權"
    assert f({"hook_event_name": "Stop"})["status"] == "done"
    assert f({"hook_event_name": "SessionEnd"})["status"] == "offline"
    assert f({"hook_event_name": "Unknown"}) is None


# ----------------------------------------------------------------- hook 腳本
def load_hook():
    spec = importlib.util.spec_from_file_location("agent_hook", ROOT / "hooks" / "agent_hook.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def ns(**kw):
    return argparse.Namespace(**{"kind": None, "agent": None, "name": None, "role": None, **kw})


def test_hook_identity(monkeypatch):
    hook = load_hook()
    for key in ("OFFICE_AGENT_ID", "OFFICE_AGENT_NAME", "OFFICE_AGENT_ROLE", "OFFICE_AGENT_KIND"):
        monkeypatch.delenv(key, raising=False)
    data = {"hook_event_name": "Stop", "session_id": "abcdef123456", "cwd": "/home/me/shop"}
    ev = hook.build_event(data, ns(kind="codex"))
    assert ev["agent"] == "codex-abcdef12" and ev["name"] == "Codex shop" and ev["kind"] == "codex"
    ev = hook.build_event(data, ns(kind="claude", agent="coder", name="Coder", role="工程師"))
    assert (ev["agent"], ev["name"], ev["role"], ev["kind"], ev["status"]) == ("coder", "Coder", "工程師", "claude", "done")
    monkeypatch.setenv("OFFICE_AGENT_NAME", "小明")
    assert hook.build_event(data, ns(kind="claude"))["name"] == "小明"
    assert hook.build_event({"hook_event_name": "Nope"}, ns()) is None


def test_hook_script_end_to_end(live):
    srv, url, _ = live
    payload = {"hook_event_name": "PreToolUse", "session_id": "s1", "cwd": "/w/app", "tool_name": "Bash", "tool_input": {"command": "make"}}
    env = {**os.environ, "AGENT_OFFICE_URL": url}
    done = subprocess.run(
        [sys.executable, str(ROOT / "hooks" / "agent_hook.py"), "--kind", "codex", "--agent", "rev", "--name", "Reviewer", "--role", "審查員"],
        input=json.dumps(payload), text=True, env=env, capture_output=True, timeout=10,
    )
    assert done.returncode == 0 and done.stdout == "" and done.stderr == ""
    (agent,) = srv.office_state.snapshot()["agents"]
    assert (agent["id"], agent["kind"], agent["status"], agent["task"]) == ("rev", "codex", "working", "執行指令：make")


@pytest.mark.parametrize("stdin", ["", "garbage", "[]", "null", '{"hook_event_name": 7}'])
def test_hook_script_never_fails(stdin):
    env = {**os.environ, "AGENT_OFFICE_URL": "http://127.0.0.1:9"}
    done = subprocess.run([sys.executable, str(ROOT / "hooks" / "agent_hook.py"), "--kind", "claude"], input=stdin, text=True, env=env, capture_output=True, timeout=10)
    assert done.returncode == 0 and done.stdout == ""


# ----------------------------------------------------------------- run.py
@pytest.mark.parametrize(
    "cmd, parse, expected_cmd, expected_parser, rewritten",
    [
        (["claude", "-p", "hi"], "auto", ["claude", "-p", "hi", "--output-format", "stream-json", "--verbose"], "claude", True),
        (["claude", "-p", "hi", "--output-format", "json"], "auto", None, "claude", False),
        (["claude", "-p", "hi", "--output-format=stream-json"], "auto", None, "claude", False),
        (["claude"], "auto", None, "claude", False),  # 互動模式不動它
        (["codex", "exec", "go"], "auto", ["codex", "exec", "--json", "go"], "codex", True),
        (["/usr/bin/codex", "exec", "--json", "go"], "auto", None, "codex", False),
        (["codex", "review"], "auto", None, "codex", False),
        (["python", "x.py"], "auto", None, "none", False),
        (["python", "x.py"], "claude", None, "claude", False),  # 強制解析，但不亂改未知指令的參數
    ],
)
def test_prepare(cmd, parse, expected_cmd, expected_parser, rewritten):
    out_cmd, parser, did = run_module.prepare(cmd, parse)
    assert out_cmd == (expected_cmd or cmd) and parser == expected_parser and did is rewritten


def make_fake(tmp_path, name, body):
    path = tmp_path / name
    path.write_text(f"#!{sys.executable}\n" + textwrap.dedent(body), encoding="utf-8")
    path.chmod(0o755)
    return str(path)


def run_wrapped(url, *args, timeout=30):
    return subprocess.run(
        [sys.executable, str(ROOT / "run.py"), "--url", url, *args], capture_output=True, text=True, timeout=timeout
    )


def drain(q):
    events = []
    while True:
        try:
            events.append(q.get_nowait())
        except queue.Empty:
            return events


def test_run_claude_wrapper_streams_progress_and_prints_result(live, tmp_path):
    srv, url, _ = live
    q, _ = srv.office_state.subscribe()
    fake = make_fake(tmp_path, "claude", f"""
        import sys
        a = sys.argv[1:]
        assert "--output-format" in a and "stream-json" in a and "--verbose" in a, a
        sys.stdout.write(open({str(FIXTURES / 'claude_stream.jsonl')!r}, encoding="utf-8").read())
    """)
    proc = run_wrapped(url, "--agent", "coder", "--name", "Coder", "--role", "工程師", "--", fake, "-p", "hi")
    assert proc.returncode == 0, proc.stderr
    assert proc.stdout == "done\n"
    events = drain(q)
    assert [(e["status"], e["task"]) for e in events] == [
        ("thinking", "開始處理"), ("working", "執行指令：echo hello"), ("thinking", "分析工具結果"),
        ("thinking", "撰寫回覆"), ("done", "完成"),
    ]
    assert events[0]["name"] == "Coder" and events[0]["role"] == "工程師" and events[0]["kind"] == "claude"
    assert [e["quiet"] for e in events] == [False, False, True, False, False]


def test_run_codex_wrapper_inserts_json_flag(live, tmp_path):
    srv, url, _ = live
    q, _ = srv.office_state.subscribe()
    fake = make_fake(tmp_path, "codex", f"""
        import sys
        assert sys.argv[1:] == ["exec", "--json", "fix it"], sys.argv
        sys.stdout.write(open({str(FIXTURES / 'codex_exec.jsonl')!r}, encoding="utf-8").read())
    """)
    proc = run_wrapped(url, "--agent", "rev", "--", fake, "exec", "fix it")
    assert proc.returncode == 0, proc.stderr
    assert proc.stdout == "已修正並通過測試\n"
    events = drain(q)
    assert events[0]["kind"] == "codex"
    assert [e["status"] for e in events][-1] == "done"
    assert any(e["task"] == "修改 app.py" for e in events)


def test_run_prints_raw_output_when_nothing_could_be_parsed(live, tmp_path):
    _, url, _ = live
    fake = make_fake(tmp_path, "codex", """
        print('{"type":"something.new","payload":1}')
        print("plain line")
    """)
    proc = run_wrapped(url, "--agent", "x", "--", fake, "exec", "go")
    assert proc.returncode == 0
    assert proc.stdout == '{"type":"something.new","payload":1}\nplain line\n'  # 內容不會憑空消失


def test_run_generic_command_reports_exit_code(live):
    srv, url, _ = live
    q, _ = srv.office_state.subscribe()
    proc = run_wrapped(url, "--agent", "job", "--task", "夜間更新", "--", sys.executable, "-c", "print('hi'); raise SystemExit(3)")
    assert proc.returncode == 3 and proc.stdout == "hi\n"
    events = drain(q)
    assert [(e["status"], e["task"]) for e in events] == [("thinking", "夜間更新"), ("error", "夜間更新")]
    ok = run_wrapped(url, "--agent", "job", "--task", "夜間更新", "--", sys.executable, "-c", "pass")
    assert ok.returncode == 0 and srv.office_state.snapshot()["agents"][0]["status"] == "done"


def test_run_keeps_working_when_server_is_down():
    proc = run_wrapped("http://127.0.0.1:9", "--agent", "a", "--", sys.executable, "-c", "print('still runs')")
    assert proc.returncode == 0 and proc.stdout == "still runs\n"


def test_run_missing_command_and_usage_errors():
    proc = run_wrapped("http://127.0.0.1:9", "--agent", "a", "--", "definitely-not-a-command-xyz")
    assert proc.returncode == 127 and "找不到指令" in proc.stderr
    assert run_wrapped("http://127.0.0.1:9", "--agent", "a").returncode == 2
