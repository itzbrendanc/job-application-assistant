#!/usr/bin/env bash
set -euo pipefail

docker build -t jaa-api-test -f apps/api/Dockerfile apps/api
docker run --rm -t jaa-api-test python -m pytest -q

