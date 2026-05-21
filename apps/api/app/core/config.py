from __future__ import annotations

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.db.url import normalize_database_url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file="../../.env", extra="ignore")

    app_env: str = "local"
    app_origin: str = "http://localhost:3000"
    cors_origins: str | None = None

    database_url: str = "postgresql+psycopg://app:app@localhost:5432/appdb"

    jwt_issuer: str = "job-app-assistant"
    jwt_audience: str = "job-app-assistant-web"
    jwt_secret: str = "dev-only-change-me"

    ai_provider: str = "stub"
    ai_api_key: str | None = None

    # Stripe
    stripe_secret_key: str | None = None
    stripe_webhook_secret: str | None = None
    stripe_price_pro_monthly: str | None = None
    stripe_price_pro_annual: str | None = None
    stripe_success_url: str | None = None
    stripe_cancel_url: str | None = None

    # Optional encryption key (Fernet)
    fernet_secret: str | None = None

    # Observability
    sentry_dsn: str | None = None
    sentry_env: str = "local"

    admin_emails: str | None = None
    beta_invite_only: bool = False

    @field_validator("database_url")
    @classmethod
    def _normalize_db_url(cls, v: str) -> str:
        return normalize_database_url(v)


settings = Settings()
