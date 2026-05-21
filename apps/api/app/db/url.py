from __future__ import annotations

from urllib.parse import urlparse


def normalize_database_url(url: str) -> str:
    """
    Ensure SQLAlchemy uses psycopg v3 for Postgres connections.

    Render/Railway/Heroku-style DATABASE_URL values are commonly:
      - postgres://...
      - postgresql://...

    SQLAlchemy interprets those as the default driver (often psycopg2).
    This project uses psycopg v3, so we normalize to:
      - postgresql+psycopg://...
    """
    u = (url or "").strip()
    if not u:
        return u

    # Leave non-Postgres URLs unchanged (sqlite, etc.)
    scheme = urlparse(u).scheme.lower()
    if scheme.startswith("sqlite"):
        return u

    # Already pinned to psycopg v3.
    if scheme == "postgresql+psycopg":
        return u

    # Normalize common provider schemes that default to psycopg2.
    if scheme in {"postgres", "postgresql"}:
        # Replace only the scheme prefix; preserve the rest unchanged.
        return "postgresql+psycopg" + u[len(scheme) :]

    return u

