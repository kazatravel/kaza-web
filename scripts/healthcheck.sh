#!/usr/bin/env bash
set -euo pipefail

URL="${1:-https://kaza-web-1.vercel.app/}"

echo "== Kaza Web Healthcheck =="
echo "Time: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
echo "URL:  ${URL}"
echo

echo "-- HEAD / (expect 200, no x-vercel-error)"
# Print a compact header set for logging
curl -sSI "${URL}" | sed -n '1,25p'

echo
status=$(curl -sSI "${URL}" | head -n 1 | awk '{print $2}')
if [[ "${status}" != "200" ]]; then
  echo "FAIL: expected HTTP 200, got ${status}" >&2
  exit 2
fi

if curl -sSI "${URL}" | tr -d '\r' | grep -qi '^x-vercel-error:'; then
  echo "FAIL: x-vercel-error present" >&2
  exit 3
fi

echo "OK: prod looks healthy"
