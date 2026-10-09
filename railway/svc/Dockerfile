# Fluxer's small Rust services in one container: snowflakes, users, gifs, messages and unfurl
# (each as router + shard 0), plus push. Upstream runs these as 11 containers.
FROM ghcr.io/fluxerapp/fluxer-users:v1
COPY --from=ghcr.io/fluxerapp/fluxer-snowflakes:v1 /usr/local/bin/fluxer-snowflakes /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-gifs:v1 /usr/local/bin/fluxer-gifs /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-messages:v1 /usr/local/bin/fluxer-messages /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-unfurl:v1 /usr/local/bin/fluxer-unfurl /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-push:v1 /usr/local/bin/fluxer-push /usr/local/bin/
COPY railway/svc/run.sh /usr/local/bin/run-all.sh
CMD ["/usr/bin/bash", "/usr/local/bin/run-all.sh"]
