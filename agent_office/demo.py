"""示範用的虛擬團隊：兩條產線同時跑，讓辦公室看起來有人在忙。

    python agent_office/demo.py [--url http://127.0.0.1:8765]

也可以當作「怎麼把真實 agent 接上來」的範例：每個 `o.report(...)` 都是一次狀態回報。
"""
from __future__ import annotations

import argparse
import random
import threading

import client

TEAM = [
    ("planner", "Planner", "規劃師", "claude", "fox"),
    ("researcher", "Researcher", "研究員", "claude", "rabbit"),
    ("coder", "Coder", "工程師", "codex", "cat"),
    ("reviewer", "Reviewer", "審查員", "claude", "panda"),
    ("tester", "Tester", "測試員", "codex", "frog"),
    ("analyst", "Analyst", "資料分析", "claude", "dog"),
    ("writer", "Writer", "文件撰寫", "claude", "penguin"),
]

FEATURES = ["新增使用者登入功能", "修正訂單金額計算", "串接第三方付款 API", "優化首頁載入速度", "重構資料匯入流程"]
TOPICS = ["電商銷售資料", "使用者留存分析", "競品功能比較", "客服工單趨勢", "廣告投放成效"]


class _Stop(Exception):
    pass


class _Track:
    def __init__(self, office: client.Office, stop: threading.Event) -> None:
        self.o = office
        self.stop = stop

    def wait(self, lo: float, hi: float | None = None) -> None:
        if self.stop.wait(random.uniform(lo, hi if hi is not None else lo)):
            raise _Stop

    def do(self, who: str, status: str, task: str, lo: float, hi: float | None = None) -> None:
        self.o.report(who, status, task)
        self.wait(lo, hi)

    def hand(self, a: str, b: str, message: str) -> None:
        self.o.handoff(a, b, message)
        self.wait(3.0, 3.6)  # 留時間讓畫面上的人走過去


def feature_line(t: _Track) -> None:
    f = random.choice(FEATURES)
    t.do("planner", "thinking", f"分析需求：{f}", 3, 5)
    t.do("planner", "working", "拆解任務、排定優先順序", 4, 6)
    t.hand("planner", "coder", "任務清單好了，交給你")
    t.do("coder", "thinking", "設計實作方式", 3, 4)
    t.do("coder", "working", f"撰寫程式：{f}", 7, 10)
    t.hand("coder", "reviewer", "請幫我審查這份修改")
    t.do("reviewer", "working", "逐行審查程式碼", 5, 7)
    if random.random() < 0.3:
        t.hand("reviewer", "coder", "有兩處邏輯要調整")
        t.do("coder", "working", "依審查意見修改", 5, 7)
        t.hand("coder", "reviewer", "改好了，再看一次")
        t.do("reviewer", "working", "重新審查", 3, 5)
    t.o.report("reviewer", "done", "審查通過")
    t.wait(1.5)
    t.hand("reviewer", "tester", "可以開始測試")
    t.do("tester", "working", "執行單元測試與整合測試", 5, 7)
    if random.random() < 0.35:
        t.do("tester", "error", "3 個測試案例未通過", 3, 4)
        t.hand("tester", "coder", "測試失敗，請看報告")
        t.do("coder", "working", "修正失敗的案例", 5, 7)
        t.hand("coder", "tester", "修好了，再跑一次")
        t.do("tester", "working", "重新執行測試", 4, 6)
    t.o.report("tester", "done", "全部測試通過")
    t.wait(2.5)
    t.o.report("tester", "idle")
    t.o.report("coder", "idle")
    t.wait(4, 8)


def research_line(t: _Track) -> None:
    topic = random.choice(TOPICS)
    t.do("researcher", "working", f"蒐集資料：{topic}", 5, 7)
    if random.random() < 0.4:
        t.do("researcher", "waiting", "等待資料庫存取權限", 4, 6)
    t.hand("researcher", "analyst", "原始資料已整理")
    t.do("analyst", "thinking", "規劃分析方法", 3, 4)
    t.do("analyst", "working", f"清洗與分析：{topic}", 7, 10)
    t.hand("analyst", "writer", "圖表與結論在這裡")
    t.do("writer", "working", "撰寫分析報告", 7, 9)
    t.o.report("writer", "done", "報告完成")
    t.wait(2.5)
    t.o.report("writer", "idle")
    t.wait(5, 9)


def run(office: client.Office, stop: threading.Event | None = None) -> None:
    stop = stop or threading.Event()
    for agent_id, name, role, kind, animal in TEAM:
        office.report(agent_id, "idle", name=name, role=role, kind=kind, animal=animal)
        if stop.wait(0.6):
            return

    def loop(line, delay: float) -> None:
        t = _Track(office, stop)
        try:
            t.wait(delay)
            while True:
                line(t)
        except _Stop:
            pass

    threads = [
        threading.Thread(target=loop, args=(feature_line, 1.0), daemon=True),
        threading.Thread(target=loop, args=(research_line, 6.0), daemon=True),
    ]
    for th in threads:
        th.start()
    stop.wait()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Agent Office 示範團隊")
    parser.add_argument("--url", default=None)
    args = parser.parse_args()
    event = threading.Event()
    try:
        run(client.Office(args.url), event)
    except KeyboardInterrupt:
        event.set()
