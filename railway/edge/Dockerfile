# Delight edge: the one public service. Routes to the backend over Railway's private network
# and serves the static assets (with Delight's avatars and icons) itself.
FROM ghcr.io/fluxerapp/fluxer-static@sha256:e88902218e68d92f5393a06c48437b1367aedaa28671fb2aecb5475b5a3e840e
COPY delight/avatars/ /srv/fluxer-static/avatars/
COPY delight/web/ /srv/fluxer-static/web/
COPY railway/edge/Caddyfile /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
