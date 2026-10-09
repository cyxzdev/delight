# Delight sidecars: delight-svc (profile effects, badges, frames) on :3000 and the admin rebrand proxy on :3001.
FROM oven/bun:1-alpine
WORKDIR /app
COPY delight/service/ /app/
COPY delight/badges/ /badges/
COPY delight/frames/ /frames/
COPY delight/effects/ /effects/
ENV DATA_DIR=/data DELIGHT_BADGE_ASSET_DIR=/badges DELIGHT_FRAME_ASSET_DIR=/frames DELIGHT_EFFECT_ASSET_DIR=/effects HOST=::
CMD ["sh", "-c", "PORT=3001 bun run /app/admin-proxy.ts & PORT=3000 exec bun run /app/server.ts"]
