# LiveKit for voice/video. Railway only forwards TCP, and its TCP proxy exposes a different public port
# than the container port, so LiveKit listens for ICE-TCP on the public port number and socat bridges
# the proxy's target port (7881) to it.
FROM livekit/livekit-server:v1.12.0
RUN apk add --no-cache socat
COPY railway/livekit/start.sh /start.sh
ENTRYPOINT ["/bin/sh", "/start.sh"]
