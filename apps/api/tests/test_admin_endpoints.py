from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.admin_deps import require_admin
from app.api.deps import get_current_user
from app.api.routers.admin.analytics import router as admin_analytics_router
from app.api.routers.admin.feedback import router as admin_feedback_router
from app.db.base import Base
from app.db.session import get_db
from app.models.telemetry.analytics_event import AnalyticsEvent
from app.models.telemetry.feedback_message import FeedbackMessage
from app.models.user import User


def make_app(*, admin_email: str):
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(admin_analytics_router)
    app.include_router(admin_feedback_router)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    # Admin list is set via env/config; set env var and reload settings field manually.
    os.environ["ADMIN_EMAILS"] = admin_email

    # Override auth to inject a user.
    def override_current_user() -> User:
        return User(email="user@example.com", password_hash=None, auth_provider="password")  # type: ignore[arg-type]

    app.dependency_overrides[get_current_user] = override_current_user
    return app, TestingSessionLocal


def test_non_admin_blocked(monkeypatch):
    from app.core import config

    config.settings.admin_emails = "admin@example.com"
    app, _ = make_app(admin_email="admin@example.com")
    client = TestClient(app)
    r = client.get("/api/admin/analytics/summary")
    assert r.status_code == 403


def test_admin_can_access_summary():
    from app.core import config

    config.settings.admin_emails = "admin@example.com"
    app, SessionLocal = make_app(admin_email="admin@example.com")

    def override_admin_user() -> User:
        return User(email="admin@example.com", password_hash=None, auth_provider="password")  # type: ignore[arg-type]

    app.dependency_overrides[get_current_user] = override_admin_user
    client = TestClient(app)

    # seed one event
    db = SessionLocal()
    db.add(AnalyticsEvent(user_id=None, anonymous_id="a", event_name="checkout_started", properties={}, source="web"))
    db.commit()
    db.close()

    r = client.get("/api/admin/analytics/summary")
    assert r.status_code == 200
    assert r.json()["checkout_started"] == 1


def test_admin_can_list_feedback_and_mark_reviewed():
    from app.core import config

    config.settings.admin_emails = "admin@example.com"
    app, SessionLocal = make_app(admin_email="admin@example.com")

    def override_admin_user() -> User:
        return User(email="admin@example.com", password_hash=None, auth_provider="password")  # type: ignore[arg-type]

    app.dependency_overrides[get_current_user] = override_admin_user
    client = TestClient(app)

    db = SessionLocal()
    msg = FeedbackMessage(email="a@b.com", category="beta", message="hello", rating=5, source_page="/feedback", reviewed=False, internal_note=None)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    fid = str(msg.id)
    db.close()

    r = client.get("/api/admin/feedback")
    assert r.status_code == 200
    assert len(r.json()) == 1

    r2 = client.patch(f"/api/admin/feedback/{fid}", json={"reviewed": True})
    assert r2.status_code == 200
    assert r2.json()["reviewed"] is True

