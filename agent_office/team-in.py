#!/usr/bin/env python3
"""讓整個團隊進辦公室待命（一打開就看到大家站在同一個空間）。
之後你用哪個 office-xxx 視窗工作，對應那隻就會自己動起來。"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import client

office = client.Office()
TEAM = [
    ("pm",     "專案PM", "專案負責", "bear"),
    ("dev",    "工程師", "寫程式",   "cat"),
    ("mkt",    "行銷",   "行銷",     "fox"),
    ("boss",   "主管",   "管理",     "panda"),
    ("review", "審查員", "審查",     "penguin"),
]
ok = 0
for agent, name, role, animal in TEAM:
    if office.report(agent, "idle", "待命中", name=name, role=role, animal=animal):
        ok += 1
        print(f"  🪑 {name}（{role}）進場")
print(f"\n{'✅' if ok else '⚠️'} {ok}/{len(TEAM)} 位員工已在辦公室待命"
      + ("" if ok else " —— 伺服器沒開？先跑 python3 agent_office/server.py"))
