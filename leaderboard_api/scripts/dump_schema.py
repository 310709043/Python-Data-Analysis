"""輸出 PostgreSQL 版的建表 SQL：python scripts/dump_schema.py > schema.sql"""
import os
import sys
from pathlib import Path

os.environ.setdefault("DEV_MODE", "1")
os.environ.setdefault("DATABASE_URL", "sqlite://")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy.dialects import postgresql  # noqa: E402
from sqlalchemy.schema import CreateIndex, CreateTable  # noqa: E402

from leaderboard import models  # noqa: E402,F401
from leaderboard.db import Base  # noqa: E402

dialect = postgresql.dialect()
print("-- 由 scripts/dump_schema.py 產生，請勿手動修改\n")
for table in Base.metadata.sorted_tables:
    print(str(CreateTable(table).compile(dialect=dialect)).strip() + ";\n")
    for index in sorted(table.indexes, key=lambda i: i.name):
        print(str(CreateIndex(index).compile(dialect=dialect)).strip() + ";")
    print()
