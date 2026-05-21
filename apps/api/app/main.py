from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(title="Job Application Assistant API", version="0.1.0")

@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}

@app.get("/api/healthz-auth")
def healthz_auth() -> dict:
    # Debug helper: confirms auth routes should be available at /api/auth/*
    return {"ok": True, "auth_base": "/api/auth", "signup": "/api/auth/signup", "login": "/api/auth/login"}

app.add_middleware(
    CORSMiddleware,
    # Support comma-separated origins for Vercel preview + production.
    allow_origins=[o.strip() for o in settings.app_origin.split(",") if o.strip()] if settings.app_origin else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
