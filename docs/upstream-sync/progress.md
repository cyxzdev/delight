# Upstream synchronization checkpoints

## Checkpoint 1 — first 50 post-base commits

- Source range: `f3c777b2446961352b7153a19e347c26ec74ba8e..6de6be23581c96b33c40584948c92788f4323d12` along upstream first-parent history.
- Target overall range remains pinned to `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits total).
- Integration is being performed directly in `D:\Haze\delight`, branch `delight`, as requested. The original 11 staged user paths remain preserved in `stash@{0}`.
- Local merge commit: `5d13a9c03` (`Merge Fluxer upstream checkpoint 1 (50 commits)`). It has not been pushed.
- Resolved 10 merge conflicts and retained Delight-specific routing, auth split-panel layout, spark/wordmark, and Delight/Premium product defaults. See [conflict-resolution.md](conflict-resolution.md).
- Added channel-type icons in the existing create-channel chooser.
- Added migration handling and a fixture for the Delight profile-effect preference; normalized Windows path separators in a registry test; updated Premium fallback tests for Delight defaults.

### Checks

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | Passed |
| `pnpm --filter fluxer_app run generate:css-types` | Passed |
| `pnpm --filter fluxer_app run typecheck:only` | Passed |
| `pnpm --filter fluxer_app run test -- --maxWorkers=4 --testTimeout=60000` | Passed: 101 files, 1,392 tests |
| Unresolved Git paths | 0 |
| `git diff --check` | No whitespace errors; only LF/CRLF notice for `.gitignore` |

## Checkpoint 2 — commits 51–54

- Upstream source checkpoint ends at `0ef1cd14c3be963c99e70c3b9bf1a2ad19a40f7b` (commit 54).
- The user completed and pushed the merge as `9c149eefcfe94a3c25fcb71bf9203197bd5baffb`; the agent did not commit or push.
- 54 of 310 post-base commits are integrated; 256 remain. There is no open merge. At the last check, `HEAD` matched `origin/delight`.
- Integrated desktop proxy-detection/fallback and splash diagnostics changes across 30 paths.
- Eight affected desktop test files: 195 passed, 3 skipped, 0 failed. The skipped cases require POSIX filesystem mode bits and remain enabled on Linux.
- `pnpm --filter fluxer_desktop exec tsc --noEmit`, `pnpm --filter fluxer_app run typecheck:only`, and Gateway wire-transport test (18/18) passed.

## Checkpoint 3 — commit 55 (committed and pushed)

- Source: `7a4aa42d4b5fa6b7cd67ed7fa97350117c4e9601` (`feat(premium): native Nordic prices and subscribing during grace`).
- Applied as one reviewable checkpoint: 84 upstream changed paths, with 12 scoped local proxy/HMR, Windows test-portability, and progress-record paths also staged (96 paths total); 0 merge conflicts. Upstream changes cover gift-trial metadata/reversal, subscription-period handling, Nordic currency selection, gift/grace subscription actions, related translations, and tests.
- Tests: 9 API test files passed (288 tests); 2 frontend premium test files passed (15 tests); app typecheck passed; the proxy route Rust test passed (1 test); `cargo build -p fluxer-dev` passed.
- `pnpm --filter fluxer_api run typecheck`: passed.
- Rspack development build compiled successfully with 160 CSS module-order warnings and no compile errors. The running dev endpoint `/` returned 200.
- The user committed and pushed checkpoint 3 as `be99c9db8`. The local profile-effect and HMR fixes are included.

## Local profile-effect and hot-reload fix (verified and committed)

- `ProfileEffectStore` correctly sends `PUT /delight/effects/@me`; the sidecar supports that method. The dev proxy lacked a `/delight` route and the devcontainer lacked the sidecar, so the request fell through to the GET/HEAD-only app proxy. Reproduction returned `405 Allow: GET,HEAD`; `GET /delight/health` returned the app shell instead of sidecar health.
- Added a devcontainer Delight sidecar with a named persistent SQLite volume, a prefix-stripping `/delight` proxy route, and route-rewrite unit coverage.
- Enabled Rspack HMR/live reload, restored the dev-server client/WebSocket defaults, routed `/ws` to the app server, added the local WebSocket CSP allowance, and enabled 1-second source polling for the Windows-mounted devcontainer tree.
- Compose config validation and targeted proxy unit test passed. Sidecar health is green: `/delight/health` returns 200. An unauthenticated `PUT /delight/effects/@me` now returns the sidecar's expected 401 rather than 405; an authenticated save has not been exercised.
- Two issues blocked the clean browser: gzip compression stalled the 1.6 MB entry bundle, and the default HMR client tried `ws://localhost:3000/ws`, which CSP blocked. Development-only Rspack compression is disabled, and `client.webSocketURL` now points to `ws://localhost:8088/ws` through the dev proxy. The app process was restarted to apply the config.
- Isolated Chrome now loads the Delight sign-in page, opens `ws://localhost:8088/ws`, receives `hot`, `liveReload`, and successful `hash`/`ok` frames, and reports no CSP, console, or page errors. An uncompressed request for `main.js` returns all 1,603,622 bytes in about 0.23 seconds even when the client advertises gzip.
- A temporary CSS comment triggered a browser-client HMR update. The file was restored byte-for-byte; the restored build completed, and `/` and `/delight/health` returned 200. Authenticated profile-effect persistence remains untested; without a session, the same PUT endpoint returns the expected 401 instead of 405.
- Initial all-task dev startup timed out at Gateway readiness after 300 seconds. Starting app, API/services, and Gateway independently restored the local services; API health and Gateway readiness now return 200.
- User owns all commits and pushes. No deployment has occurred. The original 11 staged user paths remain preserved in `stash@{0}`.

## Checkpoint 4 — commits 56–70 (committed and pushed)

- Source range: `1515a8487f987fd8ebf9621b31e422339c2e8b4d..4da8dec4ac251ddb0b92f213158995d93591e5df` (15 first-parent commits).
- Applied 241 upstream paths spanning threads, desktop browser handoff and update behavior, trusted certificates, streamed request bodies, self-host media recovery, instance branding, and related fixes.
- OAuth conflict resolution keeps Delight's `displayApplicationName()` for app labels and upstream's `getActiveInstanceProductName()` for session-expired copy. `Updater.test.mjs` uses the upstream rewrite aligned with the new update-gate behavior.
- Four additional Windows test paths and five portability edits normalize CRLF in `BootstrapEntry`, `MainAppEntry`, and `WindowChrome`, and normalize path separators in `ChannelIsolation` and `SplashBundleOwnership`. `BootstrapEntry` is within the upstream paths; the other four tests add paths. The staged checkpoint contains 245 code/test paths plus these five progress files: 250 total.
- Verification passed: 18 API test files / 209 tests; 4 app test files / 62 tests; full schema suite / 1,021 tests; 22 affected desktop test files / 382 tests; API, app, desktop, and schema TypeScript checks. CSS module types were regenerated before app typechecking.
- The broader desktop suite reports 1,350 passed, 12 failed, 8 skipped. Remaining failures are in unchanged tests requiring Linux-specific entry behavior, Windows filesystem/symlink handling, or a native passkey backend not available on this host. npm registry DNS failures prevented pnpm dependency reconciliation, so local installed executables ran the checks.
- The user committed and pushed checkpoint 4 as `081140f4b`; the agent made no commit or push.

## Checkpoint 5 — commits 71–100 (staged, uncommitted)

- Source range: `0906a85d6f6fde6d341d143d291a31ad7bbbedb3..94f123905065ee322dcbe67809eedb294c3bad47` (30 first-parent commits; 212 upstream paths).
- Applied in the active `D:\Haze\delight` project checkout. The three-way patch check and application completed without unresolved paths; 38 source-vs-Delight overlapping paths applied cleanly.
- Forum and media: forum post attachments are derived from the actual `CloudUpload` draft attachments, and forum post lists include known/closed posts with stable archived sorting. Thread follow-ups improve keyboard/focus behavior, member-list scrolling, private-thread leave confirmation, context-menu actions, and muted-community sidebar behavior.
- Tests passed: API 17 files / 302; focused app 8 files / 114; desktop 3 files / 16; Rust admin 313; focused Gateway EUnit 11; errors package 12 files / 184; schema package 34 files / 1,021. API, app, desktop, errors, and schema typechecks passed after regenerating app CSS declarations.
- Full app suite: 104 files / 1,419 assertions passed, but Vitest exited nonzero for two unhandled Idle timer exceptions in unchanged test files. Both affected files pass isolated (6 tests total); neither those tests nor `Idle.ts` changed in this batch.
- Full Gateway EUnit ran twice and consistently exits nonzero: 42 passed, 0 failed, 5 cancelled because the unchanged `call_ringing` test cannot start its `meck` mock within the timeout. The isolated module reproduces it; `call_ringing.erl` is outside this source range. The changed Gateway test module passes its focused 11 tests.
- Checkpoint 5 has 212 upstream code paths and five updated progress records staged (217 total); no commit or push was made by the agent. `HEAD` and `origin/delight` are `081140f4b`.
- Overall progress is 100 of 310 post-base commits, with 210 remaining. The original 11 user paths remain saved in `stash@{0}` for restoration after upstream checkpoints.

Next: the user commits/pushes checkpoint 5, then integration continues at commit 101 (`ae820ba4ea8bc0c1413706f6829559662035e108`). Channel chooser visual verification, original-stash restoration, and final traceability/security/migration/performance review remain pending.


## Historical continuation checkpoint — Batch 1 complete — 2026-10-20

- The user pushed the prior integration as `9fc3400073bfffdcf75a5b19b5a6c6dd92782737`. Work is in the actual `D:\Haze\delight` checkout on `delight`; `HEAD` and `origin/delight` remain at that SHA. User-owned commit/push policy is unchanged.
- Completed source first-parent commits 118–181 (64 commits), `82abd03a371c85a5194deadcf0c1bdc0564dad0b..e87b593f46aa933232f33094ca4c31a6e8a74131`; 2,837 unique source paths. Reviewed 39 conflicts (34 locale catalogs and five TS files) and preserved Delight-specific branding, premium/runtime defaults, profile modal layout, and local-only active tests.
- Passing checks: API suite 584 files / 5,108 tests (4 files / 83 skipped); Rust admin 206, CI 182, dev 15; API/app/desktop TypeScript; strict Lingui all 34 catalogs; theme-variable generator check; `cargo fmt --all -- --check`; `git diff --check`.
- The app suite executed 1,120 tests successfully. Nine test files could not load from the stale ignored `pkgs/libfluxcore` output, which still imports upstream-removed `fast-png` / `jpeg-js`; focused changed app tests passed 360 tests, with two files blocked by that same import. WASM code generation is blocked by the missing wasm target/clang toolchain on this host; Docker is unavailable.
- Desktop main/preload/common run: 1,097 passed, 7 failed, 5 skipped. The host-sensitive failures concern a missing native Passkey backend and POSIX symlink expectations on Windows. Desktop typecheck passed.
- Windows issues found and fixed during verification: Unix Docker-socket probing cfg, admin Tailwind `.cmd` launch, CRLF handling in the theme generator, Rust test path portability, and the API harvest test's path suffix.
- The integration diff remains unstaged and uncommitted: index empty, zero unresolved paths. Current worktree status reports 2,833 changed paths; no commit or push was made by Codex. Next range is Batch 2, source commits 182–245 (64 commits), `d59ddc22146f89974fa22c5c8d266e8d00d02ea5..e403fb6cce65241456ab9884f8a8efb6fec52d8a`.

## Batch 2 — source inventory entries 433–496 — verified

- Integrated 64 commits, `e87b593f46aa933232f33094ca4c31a6e8a74131..e403fb6cce65241456ab9884f8a8efb6fec52d8a`, across 3,271 upstream paths. Manually reconciled 15 overlapping paths in `D:\Haze\delight`; real index empty; no commit or push.
- Preserved Delight branding, settings/developer portal, badge/profile customizations, `/delight` sidecar route, and valid local desktop regressions. API Postgres tests use the shared helper and retain the host/bind overrides.
- API: 576 files passed / 5 skipped; 4,754 tests passed / 93 skipped; API TSC passed. App: 83 files and 1,116 tests passed; 12 test files could not load from stale ignored `pkgs/libfluxcore` imports of removed `fast-png`/`jpeg-js`; app TSC passed.
- Rust: full workspace excluding `fluxer-media-proxy` passed, as did `fluxer_common` 52/52 and `fluxer-ci` 127/127. `fluxer_app_proxy` passed 142/142 after correcting a Fluxer title expectation to Delight. `cargo fmt --all -- --check` passed. Building `fluxer-media-proxy` is blocked by missing Windows `pkg-config`/libvips.
- Fixed Windows monotonic time in `fluxer_common::now_ms` with an `Instant` fallback. Desktop and API typechecks passed; desktop tests 11/11; Helm parity 2/2; `git diff --check` passed.
- Next: source entries 497–561 (65 commits), `e403fb6cce65241456ab9884f8a8efb6fec52d8a..b8d43af1919fa0e96382577899241535c71be694`.

## Final upstream sync and GitHub publication — 2026-10-20

- Completed all 561 pinned upstream commits, including Batch 3 entries 497–561, while preserving Delight branding and local customizations.
- At the user request, committed and pushed 5,366 changed paths as 1352b5aa9c977e5f9e3a14d546e4e18ad286dc27 (feat: integrate Fluxer upstream updates) to origin/delight.
- Post-push verification: HEAD and origin/delight match at 1352b5aa9c977e5f9e3a14d546e4e18ad286dc27; the index and working tree are clean.
- The API, supported Rust workspace, package suites, and changed app/desktop paths passed as recorded in the Batch 3 results. Known environment limits remain: two voice suites need regenerated ignored WASM output; media-proxy needs Windows pkg-config/libvips; Gateway EUnit needs Erlang/rebar3; the broader desktop suite needs a native Passkeys backend. Cross-theme and RTL visual review remains open.
- Development runtime checks returned HTTP 200 from localhost:8088, localhost:3000, and localhost:8080/_health; HMR and API/worker source polling were verified in the development checkpoint.
