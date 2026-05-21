from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.routers.telemetry.router import router as telemetry_router
from app.db.base import Base
from app.db.session import get_db
from fastapi import FastAPI


def make_test_app():
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()
    app.include_router(telemetry_router)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    return app


def test_analytics_accepts_valid_event():
    app = make_test_app()
    client = TestClient(app)
    r = client.post(
        "/api/telemetry/analytics",
        json={"event_name": "resume_uploaded", "properties": {"surface": "test"}, "source": "web"},
    )
    assert r.status_code == 200


def test_analytics_rejects_invalid_event():
    app = make_test_app()
    client = TestClient(app)
    r = client.post("/api/telemetry/analytics", json={"event_name": "not_real", "properties": {}, "source": "web"})
    assert r.status_code == 400


def test_feedback_accepts_valid_feedback():
    app = make_test_app()
    client = TestClient(app)
    r = client.post(
        "/api/telemetry/feedback",
        json={"email": "a@b.com", "category": "beta", "message": "hello", "rating": 5, "source_page": "/feedback"},
    )
    assert r.status_code == 200

