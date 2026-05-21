#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "Refusing to run: DATABASE_URL is empty."
  echo "Set DATABASE_URL to your target Postgres connection string."
  exit 1
fi

echo "Running Alembic migrations against DATABASE_URL..."

pushd "apps/api" >/dev/null

if [[ ! -f "alembic.ini" ]]; then
  echo "FAIL: apps/api/alembic.ini not found"
  exit 1
fi

if ! command -v alembic >/dev/null 2>&1; then
  echo "FAIL: alembic not found in PATH."
  echo "Activate your venv and install requirements, then retry."
  exit 1
fi

alembic upgrade head

popd >/dev/null

echo "Migrations applied successfully."

