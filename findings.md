# Findings

## Upstream references

- Official remote already configured: `https://github.com/fluxerapp/fluxer.git`.
- Baseline: `f32356801d569afd570c5a8357d38fa932a44c69`, authored `2026-09-19T01:22:17+02:00`.
- Target: `b8d43af1919fa0e96382577899241535c71be694`, authored `2026-10-19T00:25:00+02:00` (2026-10-18 22:25 UTC).
- `git rev-list --count BASE..TARGET` returns **561**.
- Target subject: `fix(app): show mention names in suggested thread titles (#3531)`.

## Local repository baseline

- Workspace: `D:\Haze\delight`.
- Current branch: `delight`; last observed `HEAD` and `origin/delight` were both `9c149eefcfe94a3c25fcb71bf9203197bd5baffb`.
- Branch: `delight`; `HEAD=7ca7ebee85d16101c6430a25a7083ea4d03bff7f`.
- HEAD subject: `LiveKit on Railway: bridge ICE-TCP to the container address, not loopback`.
- HEAD parent: `50c80dc727dfb83366415c5382bce2ea1900c213` (2026-10-09, `Railway app build: turn off pnpm's deps check before scripts`).
- Common base between that parent and the requested target: `f3c777b2446961352b7153a19e347c26ec74ba8e` (2026-10-04, upstream NATS IPv4/boot-race fix).
- There are 33 commits reachable from the local parent and not from the target, and 310 commits reachable from the target and not from that parent. Resolve this divergence through actual diff review; do not assume all 33 are Delight-specific or safe to drop.
- The parent commit and target have common ancestor `f3c777b2446961352b7153a19e347c26ec74ba8e`. There are 251 range commits through that common ancestor and 310 commits after it on the target. The local branch has 33 commits after the common ancestor plus its one current HEAD commit (34 total).
- Clone was shallow before fetching the pinned target and local parent. It has since been unshallowed from `origin/delight`; `git rev-parse --is-shallow-repository` now returns `false`.
- `origin` is `https://github.com/cyxzdev/delight.git`; `upstream` is the official Fluxer remote.
- The original checkout had 11 staged paths, including `config/env/development.env`, `package.json`, workspace config, Docker/devcontainer changes, a DNS validation service/test, and a local Cargo wrapper. They are preserved with index state in `stash@{0}`. Do not print environment values; restore and verify these edits after the upstream checkpoints.
- Package metadata retains upstream identifiers in some packages. The user confirmed the product identity is Delight; runtime branding and the reviewed auth layout preserve Delight.
- User clarified that local Delight identity is intentional and must be preserved. The supplied prompt's WARIF name is superseded for this project by the user's direct clarification.
- Created local recoverable reference `backup/delight-before-fluxer-sync-2026-10` at the starting commit. Integration is now occurring in the actual project checkout at `D:\Haze\delight`, on `delight`, per the user's explicit request.
- The preserved staged patch's only `development.env` user-edited key identified before integration was `LOG_LEVEL`; keep all environment values out of logs and commit descriptions.
- `task_plan.md`, `findings.md`, and `progress.md` did not exist at task start.

## Channel-type chooser

- `fluxer_app/src/features/channel/components/modals/ChannelCreateModal.tsx` renders the chooser through the shared `RadioGroup` and now displays the option icon alongside its label and description.
- Text, Announcement, Voice, and Link choices reuse the existing channel icon mapping and radio-group content renderer.
- The change stays within the modal's existing CSS module, Lingui, and icon-library patterns; responsive, theme, and RTL visual checks remain pending.

## Evidence limitations

- Checkpoint 1 has been integrated through `6de6be23581c96b33c40584948c92788f4323d12`; all 10 merge conflicts are documented in `docs/upstream-sync/conflict-resolution.md`.
- Checkpoint 2 integrates source commits 51–54 through `0ef1cd14c3be963c99e70c3b9bf1a2ad19a40f7b`, committed and pushed by the user as `9c149eefc`. The current code work remains uncommitted, per the user's instruction.
- Checkpoint 1 app typecheck passed, and the app suite passed with 101 files and 1,392 tests. This does not establish final sync completion.
- For commits 51–54, eight changed desktop test files passed with 195 pass / 3 Windows-only POSIX checks skipped / 0 failures; desktop TSC, app typecheck, and the Gateway transport test passed.
- Security, migration-wide, performance, full application visual, responsive, and RTL review remain to be completed across the remaining checkpoints.

## Profile-effect 405 root cause

- `ProfileEffectStore.saveOwnChoice()` correctly sends `PUT /delight/effects/@me`.
- `delight/service/server.ts` supports that exact `PUT` route and strips the `/delight` prefix at the edge.
- The local dev proxy had no `/delight` route, and the devcontainer did not start the Delight sidecar. Requests fell through to `fluxer_app_proxy`, which serves only GET/HEAD. Reproduction returned `405 Method Not Allowed` with `Allow: GET,HEAD`; `GET /delight/health` returned the app shell rather than the sidecar.
- The fix adds a devcontainer sidecar, a persistent named development data volume, and a `/delight` proxy route to `delight-service:3000` with prefix stripping. The exact route rewrite has a Rust unit test.
- HMR had been disabled by `hot: false`, `liveReload: false`, `client: false`, and `webSocketServer: false`. The config now enables hot/live reload, restores the dev-server client and WebSocket defaults, routes `/ws` through the local dev proxy, adds the local WebSocket origin to CSP, and polls the mounted source tree once per second in development.
- Runtime checks on `localhost:8088` and `127.0.0.1:8088`: sidecar health 200; unauthenticated `PUT /delight/effects/@me` returns 401 (expected without a session) rather than 405. The isolated browser revealed a slow gzip response for the 1.6 MB dev entry and a CSP-blocked HMR socket aimed at port 3000. Development-only compression was disabled and the HMR client was directed through `ws://localhost:8088/ws`. Chrome now loads the sign-in screen, receives `hot`/`liveReload` and successful HMR hash/ok frames, and has no CSP/console/page errors. A temporary CSS probe was restored byte-for-byte and the rebuilt app returned 200. Authenticated profile-effect persistence is not exercised.
- The first all-task development startup timed out after 300 seconds waiting for Gateway readiness. Separate app, API/services, and Gateway task startup restored health; Gateway now responds at `127.0.0.1:8771/_health/ready`. Development data volumes were not reset.

## Checkpoint 3: upstream commit 55

- `7a4aa42d4b5fa6b7cd67ed7fa97350117c4e9601`, 84 upstream paths, is applied as a staged, uncommitted merge with zero conflicts. There are 96 staged paths total after adding 12 local files for proxy/HMR, Windows test portability, and persistent progress records. Upstream scope includes Nordic billing currencies, subscribing during gift/grace time, Stripe gift-trial reversal/metadata, premium subscription UI state, and translations.
- Verification: 288 API tests across 9 files passed; 15 frontend premium tests across 2 files passed; app typecheck passed; targeted Rust proxy route test passed; `cargo build -p fluxer-dev` passed.
- The change remains inside the current Delight project and the app retains Delight identity. No commit, push, or deployment occurred.
- The next source commit is `1515a8487f987fd8ebf9621b31e422339c2e8b4d` (commit 56, two desktop outbound-HTTP paths). The current Git merge must be completed by the user before the next merge; the user owns all commits and pushes.

## Generated source inventory

- `docs/upstream-sync/commit-inventory.md` contains all 561 commit SHAs, dates, titles, PR references when present, and per-commit changed paths.
- The commit-title category counts independently match the supplied breakdown exactly: 352 bug fixes, 123 features, 11 performance, 16 refactors, and 59 maintenance/other.
- `docs/upstream-sync/file-inventory.md` contains 7,943 rename-aware endpoint status rows across 7,952 distinct source/target paths.
- These are inventory facts only; the generated per-commit impact/test/status fields remain pending review.
