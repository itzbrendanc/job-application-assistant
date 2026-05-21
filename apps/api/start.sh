#!/bin/sh
set -eu

echo "[api] Running Alembic migrations..."
alembic upgrade head

echo "[api] Starting uvicorn..."
exec uvicorn app.main_check:app --host 0.0.0.0 --port "${PORT:-8000}"

