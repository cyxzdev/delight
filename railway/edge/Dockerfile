# Delight edge: the one public service. Routes to the backend over Railway's private network
# and serves the static assets (with Delight's avatars and icons) itself.
FROM ghcr.io/fluxerapp/fluxer-static:v1
COPY delight/avatars/ /srv/fluxer-static/avatars/
COPY delight/web/ /srv/fluxer-static/web/
COPY railway/edge/Caddyfile /etc/caddy/Caddyfile
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
