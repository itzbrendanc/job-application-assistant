from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app.api.routers.auth import router as auth_router
from app.core import config


def test_preflight_options_for_signup_allows_vercel_origin():
    # Simulate production config: APP_ORIGIN + CORS_ORIGINS
    config.settings.app_origin = "https://job-application-assistant-web-t225-aahieeek2.vercel.app"
    config.settings.cors_origins = "https://job-application-assistant-web-t225-aahieeek2.vercel.app"

    app = FastAPI()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(
            dict.fromkeys(
                [
                    o.strip()
                    for o in f"{config.settings.app_origin},{config.settings.cors_origins}".split(",")
                    if o.strip()
                ]
            )
        ),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.include_router(auth_router)

    client = TestClient(app)
    r = client.options(
        "/api/auth/signup",
        headers={
            "Origin": "https://job-application-assistant-web-t225-aahieeek2.vercel.app",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type",
        },
    )
    assert r.status_code in (200, 204)
    assert r.headers.get("access-control-allow-origin") == "https://job-application-assistant-web-t225-aahieeek2.vercel.app"
    assert r.headers.get("access-control-allow-credentials") == "true"

