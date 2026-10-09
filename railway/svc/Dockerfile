# Fluxer's small Rust services in one container: snowflakes, users, gifs, messages and unfurl
# (each as router + shard 0), plus push. Upstream runs these as 11 containers.
FROM ghcr.io/fluxerapp/fluxer-users@sha256:7fb89cb57cfbd8ca82c3fa665146679160dd66666c6f6f5a458157a19f3219a5
COPY --from=ghcr.io/fluxerapp/fluxer-snowflakes@sha256:dbb7d23459967e2e64c077bee9e6a838025bb593026eb648f608cafb78191594 /usr/local/bin/fluxer-snowflakes /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-gifs@sha256:b684bedce7c2e5e08231f37129cdd29a74c1667b5285c7eed40061f0b00eabdf /usr/local/bin/fluxer-gifs /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-messages@sha256:16d5c919a28924a68c5a347aa923d2ffbc7cd8d089605a142565fe1030c5e83e /usr/local/bin/fluxer-messages /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-unfurl@sha256:a78e6d3dced02cb54bef1cf5c3ebd7d1998bc3e053204c67264b530cc599c7fe /usr/local/bin/fluxer-unfurl /usr/local/bin/
COPY --from=ghcr.io/fluxerapp/fluxer-push@sha256:00947691ed7a75ce14f143c8dcceff689c9782fb59d10fe4638e6b60c6b7d19d /usr/local/bin/fluxer-push /usr/local/bin/
COPY railway/svc/run.sh /usr/local/bin/run-all.sh
CMD ["/usr/bin/bash", "/usr/local/bin/run-all.sh"]
