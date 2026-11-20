import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

os.environ.setdefault("DEV_MODE", "1")
os.environ.setdefault("ADMIN_TOKEN", "test-admin")
os.environ.setdefault("DATABASE_URL", "sqlite://")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402
from sqlalchemy.pool import StaticPool  # noqa: E402

import leaderboard.clock  # noqa: E402
from leaderboard.config import PRIVACY_POLICY_VERSION  # noqa: E402
from leaderboard.db import Base, get_db, make_engine  # noqa: E402
from leaderboard.main import app  # noqa: E402

ADMIN = {"X-Admin-Token": "test-admin"}


class FakeClock:
    def __init__(self):
        # 2026-11-20 22:00 台灣時間
        self.t = datetime(2026, 11, 20, 14, 0)

    def __call__(self):
        return self.t

    def advance(self, **kw):
        self.t += timedelta(**kw)


@pytest.fixture
def clock(monkeypatch):
    fc = FakeClock()
    monkeypatch.setattr(leaderboard.clock, "now", fc)
    return fc


@pytest.fixture
def client(clock):
    engine = make_engine("sqlite://", poolclass=StaticPool)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)

    def override():
        db = Session()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override
    yield TestClient(app)
    app.dependency_overrides.clear()


def iso(dt: datetime) -> str:
    return dt.replace(tzinfo=timezone.utc).isoformat()


_phone_counter = [0]
_accounts: dict[str, tuple[str, str]] = {}


def login(client, nickname):
    """重新登入（session 30 天過期）。回傳新的 headers。"""
    phone, device = _accounts[nickname]
    code = client.post("/auth/otp/request", json={"phone": phone}).json()["dev_code"]
    r = client.post("/auth/otp/verify", json={"phone": phone, "code": code}, headers={"X-Device-Id": device})
    assert r.status_code == 200 and r.json()["is_new"] is False, r.text
    return {"Authorization": f"Bearer {r.json()['token']}", "X-Device-Id": device}


def signup(client, nickname, *, device=None, verify_age=True, consent=True):
    """建立一個帳號，回傳 (user_id, headers)。"""
    _phone_counter[0] += 1
    phone = f"09{_phone_counter[0]:08d}"
    device = device or f"device-{nickname}"
    r = client.post("/auth/otp/request", json={"phone": phone})
    assert r.status_code == 200, r.text
    code = r.json()["dev_code"]
    r = client.post(
        "/auth/otp/verify",
        json={"phone": phone, "code": code, "nickname": nickname},
        headers={"X-Device-Id": device},
    )
    assert r.status_code == 200, r.text
    uid = r.json()["user_id"]
    _accounts[nickname] = (phone, device)
    headers = {"Authorization": f"Bearer {r.json()['token']}", "X-Device-Id": device}
    if consent:
        assert client.post("/me/consent", json={"version": PRIVACY_POLICY_VERSION}, headers=headers).status_code == 200
    if verify_age:
        r = client.post(f"/admin/users/{uid}/age-verification", json={"verified": True}, headers=ADMIN)
        assert r.status_code == 200, r.text
    return uid, headers


def link(client, h_a, h_b, nickname_b):
    r = client.post("/partners", json={"nickname": nickname_b}, headers=h_a)
    assert r.status_code == 201, r.text
    r = client.post(f"/partners/{r.json()['id']}/accept", headers=h_b)
    assert r.status_code == 200, r.text


def log(client, h, partner_id, when):
    return client.post("/encounters", json={"partner_id": partner_id, "occurred_at": iso(when)}, headers=h)


def log_and_confirm(client, h_a, h_b, b_id, when):
    r = log(client, h_a, b_id, when)
    assert r.status_code == 201, r.text
    r = client.post(f"/encounters/{r.json()['id']}/confirm", headers=h_b)
    assert r.status_code == 200, r.text
    return r.json()
