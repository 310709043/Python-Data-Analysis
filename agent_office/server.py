#!/usr/bin/env python3
"""Agent Office 伺服器（只用標準函式庫，免安裝）。

各個 agent 用 HTTP 回報自己的狀態，瀏覽器透過 SSE 即時看到辦公室畫面。

    python agent_office/server.py --demo        # 啟動並跑內建示範
    python agent_office/server.py --port 8765   # 只啟動，等待真實 agent 回報

API
    POST   /api/event        回報狀態（JSON，見 README）
    DELETE /api/agent/<id>   讓 agent 下班
    GET    /api/state        目前所有 agent 與最近事件
    GET    /api/stream       SSE：先送 snapshot，之後送每個事件
"""
from __future__ import annotations

import argparse
import json
import queue
import threading
import time
from collections import deque
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any, Callable
from urllib.parse import unquote, urlparse

STATIC_DIR = Path(__file__).resolve().parent / "static"

STATUSES = {"idle", "thinking", "working", "waiting", "error", "done", "offline"}
ACTIVE_STATUSES = {"thinking", "working", "waiting"}
MAX_AGENTS = 64
LOG_SIZE = 200
MAX_BODY = 64 * 1024


class OfficeState:
    """所有 agent 的即時狀態。執行緒安全。"""

    def __init__(
        self,
        stale_after: float = 180.0,
        done_hold: float = 6.0,
        clock: Callable[[], float] = time.time,
    ) -> None:
        self.stale_after = stale_after
        self.done_hold = done_hold
        self._clock = clock
        self._lock = threading.RLock()
        self._agents: dict[str, dict[str, Any]] = {}
        self._log: deque[dict[str, Any]] = deque(maxlen=LOG_SIZE)
        self._completed = 0
        self._subscribers: set[queue.Queue] = set()

    # ------------------------------------------------------------------ 寫入
    def apply(self, payload: Any, *, auto: bool = False) -> dict[str, Any]:
        """套用一筆事件。回傳 {"changed": bool, "event": dict | None}。

        格式錯誤時丟出 ValueError。狀態與任務都沒變的重複回報視為心跳，
        只更新時間，不廣播也不寫入紀錄。
        """
        if not isinstance(payload, dict):
            raise ValueError("body must be a JSON object")
        agent_id = str(payload.get("agent", "")).strip()[:64]
        if not agent_id:
            raise ValueError("'agent' is required")

        with self._lock:
            now = self._clock()
            current = self._agents.get(agent_id)

            status = payload.get("status")
            if status is None:
                status = current["status"] if current else "idle"
            status = str(status).strip().lower()
            if status not in STATUSES:
                raise ValueError(f"'status' must be one of {sorted(STATUSES)}")

            if current is None:
                if status == "offline":
                    return {"changed": False, "event": None}
                if len(self._agents) >= MAX_AGENTS:
                    raise ValueError(f"too many agents (max {MAX_AGENTS})")
                current = {
                    "id": agent_id,
                    "name": agent_id,
                    "role": "",
                    "kind": "",
                    "status": "idle",
                    "task": "",
                    "since": now,
                    "updated": now,
                }
                is_new = True
            else:
                is_new = False

            prev_status = current["status"]
            prev_task = current["task"]

            if payload.get("name") is not None:
                current["name"] = str(payload["name"]).strip()[:40] or agent_id
            if payload.get("role") is not None:
                current["role"] = str(payload["role"]).strip()[:40]
            if payload.get("kind") is not None:
                current["kind"] = str(payload["kind"]).strip().lower()[:20]

            if "task" in payload:
                task = "" if payload["task"] is None else str(payload["task"]).strip()[:200]
            elif status in ("idle", "offline"):
                task = ""
            else:
                task = prev_task

            message = str(payload.get("message") or "").strip()[:300]
            quiet = bool(payload.get("quiet"))  # 即時顯示，但不寫入動態紀錄（例如每次工具呼叫後的「分析結果」）
            to = str(payload.get("to") or "").strip()[:64]

            meaningful = (
                is_new
                or status != prev_status
                or task != prev_task
                or bool(message)
                or bool(to)
            )
            current["updated"] = now
            if not meaningful:
                self._agents[agent_id] = current
                return {"changed": False, "event": None}

            if status != prev_status or is_new:
                current["since"] = now
            current["status"] = status
            current["task"] = task
            if status == "done" and prev_status != "done":
                self._completed += 1

            event = {
                "ts": now,
                "agent": agent_id,
                "name": current["name"],
                "role": current["role"],
                "kind": current["kind"],
                "status": status,
                "task": task,
                "message": message,
                "to": to,
                "new": is_new,
                "auto": auto,
                "quiet": quiet,
            }
            if status == "offline":
                self._agents.pop(agent_id, None)
            else:
                self._agents[agent_id] = current
            if not auto and not quiet:
                self._log.append(event)
            self._broadcast(event)
            return {"changed": True, "event": event}

    def remove(self, agent_id: str) -> bool:
        return self.apply({"agent": agent_id, "status": "offline"})["changed"]

    def sweep(self) -> None:
        """長時間沒回報的 agent 自動回到待命；完成狀態停留一小段時間後回到待命。"""
        with self._lock:
            now = self._clock()
            todo: list[str] = []
            for agent in self._agents.values():
                idle_for = now - agent["updated"]
                if agent["status"] in ACTIVE_STATUSES and idle_for > self.stale_after:
                    todo.append(agent["id"])
                elif agent["status"] in ("done", "error") and (
                    now - agent["since"] > (self.done_hold if agent["status"] == "done" else self.stale_after)
                ):
                    todo.append(agent["id"])
            for agent_id in todo:
                self.apply({"agent": agent_id, "status": "idle"}, auto=True)

    # ------------------------------------------------------------------ 讀取
    def snapshot(self) -> dict[str, Any]:
        with self._lock:
            return self._snapshot_locked()

    def _snapshot_locked(self) -> dict[str, Any]:
        return {
            "server_time": self._clock(),
            "completed": self._completed,
            "agents": [dict(a) for a in self._agents.values()],
            "log": list(self._log),
        }

    # ------------------------------------------------------------------ 訂閱
    def subscribe(self) -> tuple[queue.Queue, dict[str, Any]]:
        """回傳 (queue, snapshot)。兩者在同一把鎖內取得，所以不會漏掉事件。"""
        q: queue.Queue = queue.Queue(maxsize=1000)
        with self._lock:
            self._subscribers.add(q)
            return q, self._snapshot_locked()

    def unsubscribe(self, q: queue.Queue) -> None:
        with self._lock:
            self._subscribers.discard(q)

    def _broadcast(self, event: dict[str, Any]) -> None:
        for q in list(self._subscribers):
            try:
                q.put_nowait(event)
            except queue.Full:  # 太慢的瀏覽器直接丟掉，重連後會拿到新的 snapshot
                self._subscribers.discard(q)


def _sse(data: Any, event: str | None = None) -> bytes:
    head = f"event: {event}\n" if event else ""
    return f"{head}data: {json.dumps(data, ensure_ascii=False)}\n\n".encode()


class OfficeHandler(SimpleHTTPRequestHandler):
    state: OfficeState
    verbose = False

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(STATIC_DIR), **kwargs)

    def log_message(self, fmt: str, *args: Any) -> None:
        if self.verbose:
            super().log_message(fmt, *args)

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    # -- helpers
    def _json(self, code: int, body: Any) -> None:
        raw = json.dumps(body, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    # -- routes
    def do_GET(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/state":
            self._json(HTTPStatus.OK, self.state.snapshot())
        elif path == "/api/stream":
            self._stream()
        elif path.startswith("/api/"):
            self._json(HTTPStatus.NOT_FOUND, {"error": "not found"})
        else:
            super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        if urlparse(self.path).path != "/api/event":
            return self._json(HTTPStatus.NOT_FOUND, {"error": "not found"})
        try:
            length = int(self.headers.get("Content-Length") or 0)
        except ValueError:
            length = -1
        if length < 0 or length > MAX_BODY:
            return self._json(HTTPStatus.REQUEST_ENTITY_TOO_LARGE, {"error": "body too large"})
        try:
            payload = json.loads(self.rfile.read(length) or b"null")
            result = self.state.apply(payload)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return self._json(HTTPStatus.BAD_REQUEST, {"error": "invalid JSON"})
        except ValueError as exc:
            return self._json(HTTPStatus.BAD_REQUEST, {"error": str(exc)})
        self._json(HTTPStatus.OK, {"ok": True, "changed": result["changed"]})

    def do_DELETE(self) -> None:  # noqa: N802
        path = urlparse(self.path).path
        if not path.startswith("/api/agent/"):
            return self._json(HTTPStatus.NOT_FOUND, {"error": "not found"})
        removed = self.state.remove(unquote(path[len("/api/agent/"):]))
        self._json(HTTPStatus.OK if removed else HTTPStatus.NOT_FOUND, {"ok": removed})

    def _stream(self) -> None:
        q, snapshot = self.state.subscribe()
        try:
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/event-stream; charset=utf-8")
            self.send_header("X-Accel-Buffering", "no")
            self.send_header("Connection", "keep-alive")
            self.end_headers()
            self.wfile.write(b"retry: 2000\n\n" + _sse(snapshot, "snapshot"))
            self.wfile.flush()
            while True:
                try:
                    event = q.get(timeout=15)
                    self.wfile.write(_sse(event))
                except queue.Empty:
                    self.wfile.write(b": ping\n\n")
                self.wfile.flush()
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError, OSError):
            pass
        finally:
            self.state.unsubscribe(q)


def make_server(
    host: str = "127.0.0.1",
    port: int = 8765,
    state: OfficeState | None = None,
    verbose: bool = False,
) -> ThreadingHTTPServer:
    state = state or OfficeState()
    handler = type("BoundHandler", (OfficeHandler,), {"state": state, "verbose": verbose})
    server = ThreadingHTTPServer((host, port), handler)
    server.daemon_threads = True
    server.office_state = state  # type: ignore[attr-defined]
    return server


def _sweeper(state: OfficeState, stop: threading.Event) -> None:
    while not stop.wait(1.0):
        state.sweep()


def main() -> None:
    parser = argparse.ArgumentParser(description="Agent Office 伺服器")
    parser.add_argument("--host", default="127.0.0.1", help="預設只開放本機")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--stale", type=float, default=180.0, help="多久沒回報就自動待命（秒）")
    parser.add_argument("--demo", action="store_true", help="同時啟動內建示範團隊")
    parser.add_argument("-v", "--verbose", action="store_true", help="印出每個 HTTP 請求")
    args = parser.parse_args()

    state = OfficeState(stale_after=args.stale)
    server = make_server(args.host, args.port, state, args.verbose)
    stop = threading.Event()
    threading.Thread(target=_sweeper, args=(state, stop), daemon=True).start()

    url = f"http://{'127.0.0.1' if args.host in ('0.0.0.0', '') else args.host}:{args.port}"
    if args.demo:
        import client
        import demo

        threading.Thread(
            target=demo.run, args=(client.Office(url), stop), daemon=True
        ).start()
    print(f"Agent Office 已啟動：{url}" + ("（示範模式）" if args.demo else ""))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n下班囉。")
    finally:
        stop.set()
        server.server_close()


if __name__ == "__main__":
    main()
