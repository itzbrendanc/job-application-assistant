from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.routers.auth import router as auth_router
from app.core.security import hash_password, verify_password
from app.db.base import Base
from app.db.session import get_db
from app.models.user import User


def make_app():
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(auth_router)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return app, TestingSessionLocal


def test_normal_signup_works_and_no_plaintext_password_stored():
    app, SessionLocal = make_app()
    client = TestClient(app)

    raw = "password123"
    r = client.post("/api/auth/signup", json={"email": "pw@example.com", "password": raw})
    assert r.status_code == 200
    assert "access_token" in r.json()

    db = SessionLocal()
    u = db.query(User).filter(User.email == "pw@example.com").one()
    assert u.password_hash is not None
    assert u.password_hash != raw
    assert verify_password(raw, u.password_hash) is True
    db.close()

def test_hash_and_verify_work_for_normal_password():
    pw = "TestPassword123!"
    assert len(pw.encode("utf-8")) == 16
    h = hash_password(pw)
    assert isinstance(h, str) and h
    assert verify_password(pw, h) is True


def test_signup_with_test_password_works():
    app, _ = make_app()
    client = TestClient(app)
    r = client.post("/api/auth/signup", json={"email": "ok@example.com", "password": "TestPassword123!"})
    assert r.status_code == 200


def test_signup_password_over_72_bytes_returns_validation_error():
    app, _ = make_app()
    client = TestClient(app)

    too_long = "a" * 73  # 73 bytes in UTF-8
    r = client.post("/api/auth/signup", json={"email": "toolong@example.com", "password": too_long})
    assert r.status_code == 422


def test_password_validation_allows_unicode_under_72_bytes():
    # Two non-ASCII chars here, but still well under bcrypt's 72-byte limit.
    app, _ = make_app()
    client = TestClient(app)

    pw = "pāsswörd123!"  # unicode, < 72 bytes
    assert len(pw.encode("utf-8")) < 72
    r = client.post("/api/auth/signup", json={"email": "unicode@example.com", "password": pw})
    assert r.status_code == 200
