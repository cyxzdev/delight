#!/bin/sh
# Build Delight's web app and hand it to the running app server.
set -e
# One build at a time (several people/agents may run this at once).
if [ -z "$DELIGHT_BUILD_LOCKED" ]; then DELIGHT_BUILD_LOCKED=1 exec lockf -k /tmp/delight-build.lock "$0" "$@"; fi
cd "$(dirname "$0")/../fluxer_app"
export CC_wasm32_unknown_unknown=zig-wasm-cc AR_wasm32_unknown_unknown=zig-wasm-ar
pnpm build > /tmp/fx-build.log 2>&1 || { grep -iE "error|failed" /tmp/fx-build.log | head -20; exit 1; }
cd ../deploy/self-hosting
docker compose restart app-proxy >/dev/null 2>&1
echo "built and deployed"
