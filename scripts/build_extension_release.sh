#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Building extension release..."
npm run build -w apps/extension

DATE="$(date +%F)"
OUT="extension-release-${DATE}.zip"

DIST_DIR="apps/extension/dist"
if [[ ! -d "$DIST_DIR" ]]; then
  echo "FAIL: expected ${DIST_DIR} to exist after build"
  exit 1
fi

if ! command -v zip >/dev/null 2>&1; then
  echo "FAIL: zip command not found."
  exit 1
fi

echo "Packaging ${DIST_DIR} -> ${OUT}"
rm -f "$OUT"
pushd "$DIST_DIR" >/dev/null
zip -qr "../../${OUT}" .
popd >/dev/null

echo
echo "Created release artifact: ${OUT}"
echo "Note: The extension API base URL is configured by the user in the Side Panel (stored in chrome.storage.sync)."
echo "      Ensure your production API URL is communicated in /download and onboarding docs."

