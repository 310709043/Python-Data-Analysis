"""回報 agent 狀態給 Agent Office 的小工具（只用標準函式庫）。

    import client
    office = client.Office()                      # 或設定環境變數 AGENT_OFFICE_URL
    office.report("coder", "working", "撰寫登入 API", name="Coder", role="工程師")
    office.handoff("coder", "reviewer", "請幫我審查")   # coder 拿著文件走去 reviewer 的座位

    with office.working("coder", "跑單元測試"):    # 進入時工作中，正常離開時完成，例外時出錯
        run_tests()

回報失敗（伺服器沒開、網路不通）會被吞掉並回傳 False，不會讓你的 agent 因此當掉。
"""
from __future__ import annotations

import json
import os
import urllib.error
import urllib.request
from contextlib import contextmanager
from typing import Iterator

DEFAULT_URL = "http://127.0.0.1:8765"


class Office:
    def __init__(self, url: str | None = None, timeout: float = 1.0) -> None:
        self.url = (url or os.environ.get("AGENT_OFFICE_URL") or DEFAULT_URL).rstrip("/")
        self.timeout = timeout

    def report(
        self,
        agent: str,
        status: str | None = None,
        task: str | None = ...,  # type: ignore[assignment]
        *,
        name: str | None = None,
        role: str | None = None,
        kind: str | None = None,
        animal: str | None = None,
        message: str | None = None,
        to: str | None = None,
        quiet: bool = False,
    ) -> bool:
        """回報一次狀態。status: idle / thinking / working / waiting / error / done。

        task 不傳＝沿用目前的任務；傳 None 或 "" ＝清空。
        """
        payload: dict = {"agent": agent}
        if status is not None:
            payload["status"] = status
        if task is not ...:
            payload["task"] = task
        for key, value in (("name", name), ("role", role), ("kind", kind), ("animal", animal), ("message", message), ("to", to)):
            if value is not None:
                payload[key] = value
        if quiet:
            payload["quiet"] = True
        return self._post("/api/event", payload)

    def handoff(self, agent: str, to: str, message: str | None = None, status: str = "idle") -> bool:
        """agent 把成果交給另一位（畫面上會拿著文件走過去）。送出後 agent 預設回到待命。"""
        return self.report(agent, status, message=message, to=to)

    def leave(self, agent: str) -> bool:
        return self.report(agent, "offline")

    @contextmanager
    def working(self, agent: str, task: str, **kwargs) -> Iterator[None]:
        self.report(agent, "working", task, **kwargs)
        try:
            yield
        except BaseException as exc:
            self.report(agent, "error", f"{task}（{type(exc).__name__}）")
            raise
        else:
            self.report(agent, "done", task)

    def _post(self, path: str, payload: dict) -> bool:
        request = urllib.request.Request(
            self.url + path,
            data=json.dumps(payload, ensure_ascii=False).encode(),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                return response.status == 200
        except (urllib.error.URLError, OSError, ValueError):
            return False


_default = Office()
report = _default.report
handoff = _default.handoff
leave = _default.leave
working = _default.working
