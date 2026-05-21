#!/bin/sh
set -eu

export PYTHONPATH=/app

echo "[api] Running Alembic migrations..."
alembic upgrade head

echo "[api] Starting uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
