#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${WEB_BASE_URL:-}" ]]; then
  echo "Missing WEB_BASE_URL (e.g. https://your-web-domain.com or http://localhost:3000)"
  exit 1
fi

if [[ -z "${API_BASE_URL:-}" ]]; then
  echo "Missing API_BASE_URL (e.g. https://api.yourdomain.com or http://localhost:8000)"
  exit 1
fi

WEB="${WEB_BASE_URL%/}"
API="${API_BASE_URL%/}"

echo "Smoke test:"
echo "  WEB_BASE_URL=$WEB"
echo "  API_BASE_URL=$API"
echo

function check_200() {
  local url="$1"
  local name="$2"
  local code
  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" != "200" ]]; then
    echo "FAIL: $name ($url) expected 200, got $code"
    exit 1
  fi
  echo "OK:   $name (200)"
}

check_200 "$WEB/" "web homepage"
check_200 "$WEB/pricing" "web pricing"
check_200 "$WEB/download" "web download"
check_200 "$API/healthz" "api healthz"

# Optional beta-only check: waitlist endpoint.
# This is intentionally blocked in production to avoid polluting real waitlists.
if [[ "${ALLOW_SMOKE_WAITLIST:-}" == "1" ]]; then
  echo
  echo "Optional: waitlist submission (ALLOW_SMOKE_WAITLIST=1)"
  code="$(curl -sS -o /dev/null -w "%{http_code}" \
    -H "Content-Type: application/json" \
    -d '{"email":"smoke-test@example.com","source":"smoke_test"}' \
    "$API/api/waitlist" || true)"
  if [[ "$code" != "200" && "$code" != "204" ]]; then
    echo "FAIL: waitlist expected 200/204, got $code"
    exit 1
  fi
  echo "OK:   waitlist accepted ($code)"
fi

echo
echo "Smoke test passed."

