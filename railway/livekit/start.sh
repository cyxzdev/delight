#!/bin/sh
# LIVEKIT_PUBLIC_TCP_PORT / LIVEKIT_PUBLIC_IP: the Railway TCP proxy's port and address.
cat > /tmp/livekit.yaml <<YAML
port: 7880
log_level: info
rtc:
  tcp_port: ${LIVEKIT_PUBLIC_TCP_PORT}
  udp_port: 7882
  use_external_ip: false
  node_ip: "${LIVEKIT_PUBLIC_IP}"
webhook:
  api_key: ${LIVEKIT_API_KEY}
  urls:
    - http://api:8080/webhooks/livekit
YAML
export LIVEKIT_KEYS="${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}"
socat TCP-LISTEN:7881,fork,reuseaddr TCP:127.0.0.1:${LIVEKIT_PUBLIC_TCP_PORT} &
exec /livekit-server --config /tmp/livekit.yaml
