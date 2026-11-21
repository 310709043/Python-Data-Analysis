import http.client
import json
import queue
import sys
import threading
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

import client  # noqa: E402
import server  # noqa: E402


class FakeClock:
    def __init__(self, t: float = 1000.0) -> None:
        self.t = t

    def __call__(self) -> float:
        return self.t


@pytest.fixture
def clock():
    return FakeClock()


@pytest.fixture
def state(clock):
    return server.OfficeState(stale_after=60, done_hold=5, clock=clock)


# ----------------------------------------------------------------- 狀態邏輯
def test_new_agent_gets_defaults(state):
    result = state.apply({"agent": "coder", "status": "working", "task": " 寫測試 "})
    assert result["changed"] is True
    snap = state.snapshot()
    (agent,) = snap["agents"]
    assert agent["id"] == "coder" and agent["name"] == "coder"
    assert agent["status"] == "working" and agent["task"] == "寫測試"
    assert snap["log"][-1]["new"] is True


@pytest.mark.parametrize(
    "payload",
    [None, [], "x", {}, {"agent": "  "}, {"agent": "a", "status": "dancing"}],
)
def test_invalid_payloads_rejected(state, payload):
    with pytest.raises(ValueError):
        state.apply(payload)


def test_heartbeat_is_not_broadcast(state, clock):
    state.apply({"agent": "a", "status": "working", "task": "x"})
    q, _ = state.subscribe()
    clock.t += 10
    result = state.apply({"agent": "a", "status": "working", "task": "x"})
    assert result == {"changed": False, "event": None}
    assert q.empty()
    assert state.snapshot()["agents"][0]["updated"] == clock.t  # 但會刷新時間，避免被當成逾時


def test_task_is_kept_or_cleared(state):
    state.apply({"agent": "a", "status": "working", "task": "寫程式"})
    state.apply({"agent": "a", "status": "thinking"})  # 沒給 task：沿用
    assert state.snapshot()["agents"][0]["task"] == "寫程式"
    state.apply({"agent": "a", "status": "idle"})  # 回到待命：清空
    assert state.snapshot()["agents"][0]["task"] == ""
    state.apply({"agent": "a", "status": "working", "task": "x"})
    state.apply({"agent": "a", "status": "working", "task": None})  # 明確傳 null：清空
    assert state.snapshot()["agents"][0]["task"] == ""


def test_status_defaults_to_current_when_omitted(state):
    state.apply({"agent": "a", "status": "working", "task": "x"})
    state.apply({"agent": "a", "message": "順便說一聲"})
    assert state.snapshot()["agents"][0]["status"] == "working"


def test_completed_counts_each_transition_once(state):
    state.apply({"agent": "a", "status": "done"})
    state.apply({"agent": "a", "status": "done", "task": "again"})  # 仍是 done，不重複計
    assert state.snapshot()["completed"] == 1
    state.apply({"agent": "a", "status": "working"})
    state.apply({"agent": "a", "status": "done"})
    assert state.snapshot()["completed"] == 2


def test_offline_removes_agent_and_unknown_offline_is_noop(state):
    state.apply({"agent": "a", "status": "idle"})
    assert state.remove("a") is True
    assert state.snapshot()["agents"] == []
    assert state.remove("ghost") is False


def test_agent_limit(state):
    for i in range(server.MAX_AGENTS):
        state.apply({"agent": f"a{i}", "status": "idle"})
    with pytest.raises(ValueError):
        state.apply({"agent": "one-too-many", "status": "idle"})


def test_field_lengths_are_clamped(state):
    state.apply({"agent": "a" * 200, "status": "working", "task": "t" * 1000, "name": "n" * 100})
    agent = state.snapshot()["agents"][0]
    assert len(agent["id"]) == 64 and len(agent["task"]) == 200 and len(agent["name"]) == 40


def test_sweep_idles_stale_and_finished_agents(state, clock):
    state.apply({"agent": "stale", "status": "working", "task": "x"})
    state.apply({"agent": "fresh", "status": "working", "task": "x"})
    state.apply({"agent": "fin", "status": "done"})
    q, _ = state.subscribe()
    clock.t += 6  # done 超過停留時間
    state.sweep()
    by_id = {a["id"]: a for a in state.snapshot()["agents"]}
    assert by_id["fin"]["status"] == "idle" and by_id["stale"]["status"] == "working"
    clock.t += 55  # 距離上次回報 61 秒
    state.apply({"agent": "fresh", "status": "working", "task": "x"})  # 心跳
    state.sweep()
    by_id = {a["id"]: a for a in state.snapshot()["agents"]}
    assert by_id["stale"]["status"] == "idle" and by_id["fresh"]["status"] == "working"
    assert q.get_nowait()["auto"] is True
    assert all(e["auto"] is False for e in state.snapshot()["log"])  # 自動事件不進紀錄


def test_subscribe_gets_snapshot_then_events(state):
    state.apply({"agent": "a", "status": "idle"})
    q, snap = state.subscribe()
    assert [a["id"] for a in snap["agents"]] == ["a"]
    state.apply({"agent": "b", "status": "working", "to": "a"})
    event = q.get_nowait()
    assert event["agent"] == "b" and event["to"] == "a"
    state.unsubscribe(q)
    state.apply({"agent": "c", "status": "idle"})
    assert q.empty()


def test_slow_subscriber_is_dropped(state):
    q, _ = state.subscribe()
    for i in range(1001):
        state.apply({"agent": "a", "status": "working", "task": str(i)})
    assert q not in state._subscribers


# ----------------------------------------------------------------- HTTP
def _request(addr, method, path, body=None, headers=None):
    conn = http.client.HTTPConnection(*addr, timeout=3)
    conn.request(method, path, body=body, headers=headers or {})
    resp = conn.getresponse()
    data = resp.read()
    conn.close()
    return resp.status, data


def test_http_event_roundtrip(live):
    _, _, addr = live
    status, data = _request(addr, "POST", "/api/event", json.dumps({"agent": "a", "status": "working", "task": "測試"}))
    assert status == 200 and json.loads(data) == {"ok": True, "changed": True}
    status, data = _request(addr, "GET", "/api/state")
    snap = json.loads(data)
    assert status == 200 and snap["agents"][0]["task"] == "測試"
    status, _ = _request(addr, "DELETE", "/api/agent/a")
    assert status == 200
    assert json.loads(_request(addr, "GET", "/api/state")[1])["agents"] == []
    assert _request(addr, "DELETE", "/api/agent/a")[0] == 404


@pytest.mark.parametrize(
    "body, code",
    [("not json", 400), ("[]", 400), ('{"agent":"a","status":"nope"}', 400), ("x" * (server.MAX_BODY + 1), 413)],
)
def test_http_rejects_bad_events(live, body, code):
    _, _, addr = live
    assert _request(addr, "POST", "/api/event", body)[0] == code


def test_http_routes_and_static(live):
    _, _, addr = live
    assert _request(addr, "GET", "/api/nope")[0] == 404
    assert _request(addr, "POST", "/api/other", "{}")[0] == 404
    status, html = _request(addr, "GET", "/")
    assert status == 200 and b"Agent Office" in html
    assert _request(addr, "GET", "/office.js")[0] == 200
    assert _request(addr, "GET", "/../server.py")[0] in (403, 404)


def test_sse_stream_sends_snapshot_then_events(live):
    srv, _, addr = live
    srv.office_state.apply({"agent": "a", "status": "idle", "name": "Alice"})
    conn = http.client.HTTPConnection(*addr, timeout=5)
    conn.request("GET", "/api/stream")
    resp = conn.getresponse()
    assert resp.status == 200 and resp.getheader("Content-Type").startswith("text/event-stream")
    got: queue.Queue = queue.Queue()

    def reader():
        buf = b""
        while True:
            chunk = resp.fp.readline()
            if not chunk:
                return
            buf += chunk
            if buf.endswith(b"\n\n"):
                got.put(buf.decode())
                buf = b""

    threading.Thread(target=reader, daemon=True).start()
    blocks = []
    while not any("event: snapshot" in b for b in blocks):
        blocks.append(got.get(timeout=3))
    snapshot = next(b for b in blocks if "event: snapshot" in b)
    assert json.loads(snapshot.split("data: ", 1)[1])["agents"][0]["name"] == "Alice"
    srv.office_state.apply({"agent": "a", "status": "working", "task": "新任務"})
    event = got.get(timeout=3)
    assert json.loads(event.split("data: ", 1)[1])["task"] == "新任務"
    conn.close()


# ----------------------------------------------------------------- client
def test_client_reports_and_context_manager(live):
    srv, url, _ = live
    office = client.Office(url)
    assert office.report("a", "working", "寫程式", name="Alice", role="工程師") is True
    agent = srv.office_state.snapshot()["agents"][0]
    assert (agent["name"], agent["role"], agent["task"]) == ("Alice", "工程師", "寫程式")

    office.report("a", "thinking")  # 沒給 task：沿用
    assert srv.office_state.snapshot()["agents"][0]["task"] == "寫程式"

    with office.working("a", "跑測試"):
        assert srv.office_state.snapshot()["agents"][0]["status"] == "working"
    assert srv.office_state.snapshot()["agents"][0]["status"] == "done"

    with pytest.raises(RuntimeError):
        with office.working("a", "會失敗的工作"):
            raise RuntimeError("boom")
    last = srv.office_state.snapshot()["agents"][0]
    assert last["status"] == "error" and "RuntimeError" in last["task"]

    assert office.handoff("a", "b", "交給你") is True
    event = srv.office_state.snapshot()["log"][-1]
    assert event["to"] == "b" and event["status"] == "idle"
    assert office.leave("a") is True


def test_client_swallows_connection_errors():
    assert client.Office("http://127.0.0.1:9", timeout=0.2).report("a", "working") is False
