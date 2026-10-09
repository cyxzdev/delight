# Delight web app: builds our fork of fluxer_app and serves it with the upstream app-proxy binary.
FROM node:26-trixie-slim AS app-build
WORKDIR /usr/src/app
RUN npm install -g pnpm@11.27.0
RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates build-essential clang \
	&& rm -rf /var/lib/apt/lists/*
ENV RUSTUP_HOME=/usr/local/rustup CARGO_HOME=/usr/local/cargo PATH=/usr/local/cargo/bin:$PATH
RUN curl --retry 3 --retry-all-errors --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs \
	| sh -s -- -y --no-modify-path --profile minimal --default-toolchain 1.98.1 --target wasm32-unknown-unknown

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches/ ./patches/
COPY fluxer_app/package.json ./fluxer_app/
COPY packages/constants/package.json ./packages/constants/
COPY packages/date_utils/package.json ./packages/date_utils/
COPY packages/geo_utils/package.json ./packages/geo_utils/
COPY packages/instance_bootstrap/package.json ./packages/instance_bootstrap/
COPY packages/limits/package.json ./packages/limits/
COPY packages/schema/package.json ./packages/schema/
COPY packages/snowflake/package.json ./packages/snowflake/
COPY packages/voice_engine_v2/package.json ./packages/voice_engine_v2/
COPY fluxer_app/pkgs/list_utils/package.json ./fluxer_app/pkgs/list_utils/
COPY fluxer_app/pkgs/number_utils/package.json ./fluxer_app/pkgs/number_utils/
COPY fluxer_app/pkgs/livekit-client/package.json ./fluxer_app/pkgs/livekit-client/
RUN pnpm install --frozen-lockfile --filter fluxer_app...

COPY tsconfigs ./tsconfigs
COPY packages/constants/ ./packages/constants/
COPY packages/date_utils/ ./packages/date_utils/
COPY packages/geo_utils/ ./packages/geo_utils/
COPY packages/instance_bootstrap/ ./packages/instance_bootstrap/
COPY packages/limits/ ./packages/limits/
COPY packages/schema/ ./packages/schema/
COPY packages/snowflake/ ./packages/snowflake/
COPY packages/voice_engine_v2/ ./packages/voice_engine_v2/
COPY packages/fonts/css/ ./packages/fonts/css/
COPY packages/fonts/files/ ./packages/fonts/files/
COPY packages/fonts/NOTICE.md packages/fonts/LICENSE-IBM-PLEX.txt ./packages/fonts/
COPY packages/markdown_parser/rust/Cargo.toml ./packages/markdown_parser/rust/
COPY packages/markdown_parser/rust/.cargo/ ./packages/markdown_parser/rust/.cargo/
COPY packages/markdown_parser/rust/benches/parser.rs ./packages/markdown_parser/rust/benches/
COPY packages/markdown_parser/rust/src/ ./packages/markdown_parser/rust/src/
COPY tools/ci/ ./tools/ci/
COPY fluxer_app/index.html fluxer_app/lingui.config.js fluxer_app/package.json fluxer_app/postcss.config.js fluxer_app/rspack.config.mjs fluxer_app/tsconfig.base.json fluxer_app/tsconfig.json ./fluxer_app/
COPY fluxer_app/pkgs/list_utils/ ./fluxer_app/pkgs/list_utils/
COPY fluxer_app/pkgs/number_utils/ ./fluxer_app/pkgs/number_utils/
COPY fluxer_app/pkgs/livekit-client/ ./fluxer_app/pkgs/livekit-client/
COPY fluxer_app/rust/ ./fluxer_app/rust/
COPY fluxer_app/scripts/ ./fluxer_app/scripts/
COPY fluxer_app/src/ ./fluxer_app/src/
RUN cd fluxer_app && NODE_OPTIONS=--max-old-space-size=8192 pnpm build && find dist -name '*.map' -delete

FROM ghcr.io/fluxerapp/fluxer-app-proxy-self-hosted@sha256:440d1bb9100c11698ca85f6a300cf6df54ecdd795a8b18728a8630d67e424071
USER root
RUN rm -rf /srv/app/static
COPY --from=app-build /usr/src/app/fluxer_app/dist /srv/app/static
USER 65532:65532
ENV FLUXER_APP_PROXY_HOST="0.0.0.0"
