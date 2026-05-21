from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings

app = FastAPI(title="Job Application Assistant API", version="0.1.0")

@app.get("/healthz")
def healthz() -> dict:
    return {"ok": True}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.app_origin] if settings.app_origin else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
