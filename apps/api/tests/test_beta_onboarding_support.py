from __future__ import annotations

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.deps import get_current_user
from app.api.routers import auth as auth_router
from app.api.routers.waitlist import router as waitlist_router
from app.api.routers.support import router as support_router
from app.api.routers.admin.beta_invites import router as admin_beta_invites_router
from app.api.routers.admin.waitlist import router as admin_waitlist_router
from app.api.routers.admin.support import router as admin_support_router
from app.core import config
from app.db.base import Base
from app.db.session import get_db
from app.models.beta.beta_invite import BetaInvite, BetaInviteStatus
from app.models.user import User


def make_app(*, admin_email: str = "admin@example.com"):
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(auth_router.router)
    app.include_router(waitlist_router)
    app.include_router(support_router)
    app.include_router(admin_beta_invites_router)
    app.include_router(admin_waitlist_router)
    app.include_router(admin_support_router)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    def override_user() -> User:
        return User(email="user@example.com", password_hash=None, auth_provider="password")  # type: ignore[arg-type]

    app.dependency_overrides[get_current_user] = override_user

    config.settings.admin_emails = admin_email
    config.settings.beta_invite_only = False
    return app, TestingSessionLocal


def test_waitlist_submission():
    app, _ = make_app()
    client = TestClient(app)
    r = client.post("/api/waitlist", json={"email": "test@example.com", "source": "homepage"})
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_support_submission():
    app, _ = make_app()
    client = TestClient(app)
    r = client.post("/api/support", json={"email": "test@example.com", "subject": "Help", "message": "Something broke"})
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_non_admin_blocked_for_admin_routes():
    app, _ = make_app(admin_email="admin@example.com")
    client = TestClient(app)
    # current user is user@example.com, not admin
    r = client.get("/api/admin/waitlist")
    assert r.status_code == 403


def test_admin_can_list_waitlist_and_create_invite():
    app, SessionLocal = make_app(admin_email="admin@example.com")

    def override_admin_user() -> User:
        return User(email="admin@example.com", password_hash=None, auth_provider="password")  # type: ignore[arg-type]

    app.dependency_overrides[get_current_user] = override_admin_user
    client = TestClient(app)

    client.post("/api/waitlist", json={"email": "wl@example.com", "source": "homepage"})

    r = client.get("/api/admin/waitlist")
    assert r.status_code == 200
    assert any(row["email"] == "wl@example.com" for row in r.json())

    r2 = client.post("/api/admin/beta-invites", json={"email": "wl@example.com"})
    assert r2.status_code == 200
    assert "invite_code" in r2.json()


def test_invite_code_required_when_beta_invite_only():
    app, SessionLocal = make_app(admin_email="admin@example.com")
    config.settings.beta_invite_only = True
    client = TestClient(app)

    r = client.post("/api/auth/signup", json={"email": "inv@example.com", "password": "password123"})
    assert r.status_code == 403

    db = SessionLocal()
    inv = BetaInvite(email="inv@example.com", invite_code="code123", status=BetaInviteStatus.pending, invited_by_user_id=None)
    db.add(inv)
    db.commit()
    db.close()

    r2 = client.post("/api/auth/signup", json={"email": "inv@example.com", "password": "password123", "invite_code": "code123"})
    assert r2.status_code == 200
    assert "access_token" in r2.json()

