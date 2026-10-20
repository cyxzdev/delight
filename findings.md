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
- Checkpoint 2 integrates source commits 51–54 through `0ef1cd14c3be963c99e70c3b9bf1a2ad19a40f7b`, committed and pushed by the user as `9c149eefc`. Checkpoint 3 and the profile-effect/HMR fix were later committed and pushed by the user as `be99c9db8`.
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

## Checkpoint 3: upstream commit 55 (committed and pushed)

- `7a4aa42d4b5fa6b7cd67ed7fa97350117c4e9601` changed 84 upstream paths. The user committed and pushed checkpoint 3 as `be99c9db8`. Upstream scope includes Nordic billing currencies, subscribing during gift/grace time, Stripe gift-trial reversal/metadata, premium subscription UI state, and translations.
- Verification: 288 API tests across 9 files passed; 15 frontend premium tests across 2 files passed; app typecheck passed; targeted Rust proxy route test passed; `cargo build -p fluxer-dev` passed.
- The change remains inside the current Delight project and the app retains Delight identity. The authenticated profile-effect save is still untested; HMR was verified in an isolated browser.

## Checkpoint 4: upstream commits 56–70

- Applied 15 first-parent commits through `4da8dec4ac251ddb0b92f213158995d93591e5df`, covering 241 upstream paths. Features include public threads and Plutonium, desktop browser sign-in handoff, trusted CA use, user-confirmed update application, self-hosted media recovery, instance branding, and related fixes.
- Resolved the OAuth overlap by preserving Delight's application-name normalization and using upstream's active-instance product name in the session-expired message. Selected upstream's rewritten updater test file because the upstream update-gate change removes the local permission-mode test it had replaced.
- Four additional local Windows test paths brought this batch to 245 code/test paths; five portability edits also touched the upstream-changed `BootstrapEntry` test. Five progress records made the staged checkpoint total 250. No unresolved paths remained. The user later committed and pushed checkpoint 4 as `081140f4b`.
- Verification passed: 209 API tests, 62 app tests, 1,021 schema tests, 382 tests across 22 affected desktop test files, and TypeScript checks for API, app, desktop, and schema. CSS module declarations were generated before app typechecking.
- A broader desktop run had 1,350 passing, 12 failing, and 8 skipped tests. The remaining failures are in unchanged tests for Linux desktop-entry behavior, Windows file/symlink assumptions, and native passkey initialization. npm registry DNS failures prevented pnpm dependency reconciliation, so local installed test/typecheck executables were used.
- Checkpoint 4 was committed and pushed as `081140f4b`. Checkpoint 5 is now staged, and the next source commit after it is `ae820ba4e`.

## Checkpoint 5: forum, media, and thread follow-ups

- Commits 71–100 apply 212 upstream paths, staged in the user's active project. The patch check and three-way application completed without conflicts, including 38 same-path source/Delight divergences.
- Forum post uploads now determine media-required validation from `CloudUpload`'s actual draft attachments. Forum post lists include all known posts (including closed posts) and sort archived posts. This is a forum/media follow-up, not a claim that every media-proxy change in the 561-commit range is complete.
- Thread work includes focus and keyboard containment in the creation pane, scrollable member lists, confirmation before leaving private threads, thread browser context menus/debug actions, and correct sidebar unread behavior for joined threads in muted communities. The initial public Threads/Forum feature landed in checkpoint 4.
- Verification passed: 302 API, 114 focused app, 16 desktop, 313 Rust admin, 11 focused Gateway EUnit, 184 errors-package, and 1,021 schema tests. API, app, desktop, errors, and schema typechecks passed.
- Full app suite: 1,419 assertions passed, then Vitest reported two unhandled `Idle.applyIdleState()` timer exceptions from unchanged tests. Running those two files alone passed all 6 tests; neither file nor `Idle.ts` is part of this batch.
- Full Gateway EUnit repeatedly reports 42 passed, 0 failed, 5 cancelled. The reproducible cancellation is in unchanged `call_ringing:apply_pending_ringing_publishes_one_ring_per_new_user_test/0` during `meck` mock startup; the changed Gateway test module itself passes. This remains an unrelated test-suite issue to revisit in final audit.

## Generated source inventory

- `docs/upstream-sync/commit-inventory.md` contains all 561 commit SHAs, dates, titles, PR references when present, and per-commit changed paths.
- The commit-title category counts independently match the supplied breakdown exactly: 352 bug fixes, 123 features, 11 performance, 16 refactors, and 59 maintenance/other.
- `docs/upstream-sync/file-inventory.md` contains 7,943 rename-aware endpoint status rows across 7,952 distinct source/target paths.
- These are inventory facts only; the generated per-commit impact/test/status fields remain pending review.

## TypeScript hot reload on the Windows development mount

- `tsx watch` was configured for the API and Worker, but a live edit to the API entrypoint did not restart the running process in the Docker devcontainer.
- A focused Node probe confirmed the mount behavior: native `fs.watch` emitted no change event, while `fs.watchFile` polling observed the changed size/mtime after the host write propagated into the container.
- `tools/dev/watch_tsx.mjs` now polls API `src/`, workspace package `src/` directories, and TS runtime/config files only through the `fluxer-dev` API/Worker tasks. It restarts the existing TSX entrypoint on changes; production launch/build commands are unaffected.
- Live verification: a temporary comment changed the API child PID and triggered Worker restart messages; restoring the source triggered another restart. API `/_health`, the frontend app proxy, and the Gateway readiness endpoint returned 200 after recovery. A separate CSS probe produced Rspack HMR invalid/hash/ok cycles over the `/ws` proxy.
- The first polling-wrapper attempt launched the `.bin/tsx` shell shim via Node and failed with a shell-script syntax error. Spawning the shim as the executable fixed the launch. Rust/Gateway polling was also explored, then removed after ten watchers stalled on mounted filesystem reads; it is not needed for the requested React/TypeScript dev reload.

## Gateway verification caveat for checkpoint 6

- `gateway_cluster_membership_tests` passed 21/21 when run alone, but its 300 ms concurrency assertion failed in two combined EUnit runs. Treat the combined-run failure as unresolved/flaky until reproduced under a quieter test environment.
- The isolated `presence_cache_tests` run reported a `meck_proc:start/2` timeout in the existing `rebalance_drop_does_not_suppress_repair_test`. That test was already present in the staged checkpoint; the new grace-expiry test passed in the same run. Re-run the affected Gateway suite later, and keep the failure visible in the final test report if the test harness still times out.

## Report-flow checkpoint 7

- Upstream commit 110 touches API, schema, admin, client UI, and locale catalogs. The staged application of its locale patch conflicted only with a Japanese translation that said Delight where upstream expected Fluxer. All other hunks applied; the obsolete translation belonged to a report screen removed by the same change, so that entry was removed while retaining Delight branding in active UI copy.
- `ReportRepositoryPostgresKv.test.ts` originally could not reach its ephemeral Docker Postgres from the Windows-backed devcontainer because it bound to host loopback. Added explicit host/bind-address test environment overrides with safe local defaults; the integration test then passed 10/10.
- The API report suites passed after the locale and Docker test setup were complete. The OpenAPI generator test requires longer than Vitest's default 60-second `beforeAll` hook on this checkout; a 300-second isolated rerun passed. Do not interpret the initial timeout as a generator failure.

## Upstream commit 113 — merge findings

- The user's pushed `79b499382` tree already contains commit 111's docs tooling fix and commit 112's NCMEC removal; the old progress entries that said 111 was next were stale. The preserved original staged diff remains recoverable as `stash@{0}`.
- Commit 113's source patch conflicts are limited to brand-sensitive app constants, the language settings UI, and existing locale catalogs. Keep Delight's product API/HQ/canary names, dynamic local support email, and translation aliases because active Delight code imports them. Adopt the upstream runtime `productName` behavior for language settings rather than copying a Fluxer string.
- Merged the five newly introduced safety/help messages from each of the 34 upstream locale catalogs without replacing local translations. Strict Lingui compilation passed.
- The upstream `.env.example` change did not account for optional variables read by Delight's compose extension. The existing env coverage test found `DELIGHT_ADMIN_USER_IDS` and `DELIGHT_FLUXER_ORIGIN`; added commented, non-secret declarations to restore the discoverability contract and verified the whole config package (309 tests).
- API/Postgres integration tests launched their own Docker service but pinned the host mapping to `127.0.0.1`, inaccessible from this mounted devcontainer. Added explicit test-only host and bind-address environment variables with loopback defaults, and confirmed the repository tests pass using `host.docker.internal` / `0.0.0.0`.
- Documentation coverage remains incomplete: 221 reported issues, mostly from the checker parsing two audit-action tables as empty and self-hosting installer/config environment mismatch reports. Other route/spec, Gateway, security-field, and rate-limit checks passed. These are open follow-ups; don't claim the documentation audit is clean.
- Runtime dev checks passed at the app, API, and Delight sidecar endpoints; unauthenticated effect save returns 401 rather than the earlier 405. The HMR and TypeScript polling mechanisms were verified earlier with live file edits. Host-accessible Gateway readiness currently returns 403, which differs from the prior in-container readiness verification and should be rechecked if needed.


## Upstream commit 114 — merge and verification findings

- The only content conflicts were in the 34 app PO catalogs, where local translations differed from upstream. Added the three new source message entries per catalog without replacing existing Delight translations; strict Lingui compilation passed.
- API tests passed 101/101, email 479/479, LocaleService 101/101, i18n CompileMessage 7/7, and generated OpenAPI tests 24/24. The OpenAPI test required 185 seconds; use extended Vitest hook/test timeouts for this generator on the current checkout.
- API and app TypeScript checks passed. The dev frontend's old Rspack process stopped responding after the patch; the supervised app-task restart restored HTTP 200 on both the `8088` proxy and direct `3000` frontend. Preserve this runtime observation and recheck after later large batches.
- After commit 114, 196 upstream first-parent commits remain. The next is `6534ee430`, affecting admin moderation/report flows, admin layout/components, and a few API/docs paths.


## Upstream commit 115 — admin report resolution and layout

- This change requires an explicit supported report resolution and keeps the optional reporter comment separate. It also updates admin/report presentation and audit/report APIs. The rendered report form and API route must remain consistent: `resolution` is the enum choice; `public_comment` is optional free text.
- The patch touched 57 files. Initial index-based application skipped four paths already diverged from the pinned upstream parent; a content-based three-way merge from parent `4db13b037` merged the full target cleanly while preserving Delight edits. A dry-run merge check confirmed all 56 existing files plus the new plural helper match the merged result, with no conflicts.
- Full admin Rust tests and formatting passed; focused API tests passed 23/23 and API typecheck passed. App proxy and API health remained 200.
- Upstream docs audit remains unresolved at 221 findings from checkpoint 113; commit 116 is a docs-only British-English wording sweep and is next in range.


## Upstream commit 116 — documentation wording

- The British-English sweep changes `catalog` to `catalogue`, `percent` to `per cent`, and similar wording in eight docs pages. Direct patch check and application passed.
- Docs scripts passed 33/33 tests and style verification over 104 pages/2,067 tables. The outstanding 221 coverage findings are unrelated and remain open.
- Commit 117's 1,527-path cleanup required a Delight-specific deletion audit; the results are recorded in the dedicated section below.


## Upstream commit 117 — dead-code cleanup integration

- Upstream changed 1,527 paths (108 deletions and 1,419 modifications). Reviewed deletion impact against current app imports and route usage instead of blindly accepting the source-side dead-code label.
- Retained the Delight-only `FluxerLogo.tsx` and restored `ClientDeveloperSettingsTab.tsx` after app typechecking showed it is still imported by the active developer portal. Both are intentional local exceptions to upstream deletions.
- Merged all 34 locale catalogs against the upstream cleanup, retaining 1,360 active local-only entries and 204 local translation edits while removing 570 stale entries. Strict Lingui compilation passed.
- Resolved local/upstream CSS and constants overlap while preserving the active Delight entity-icon styles, Delight branding, support-email policy, docs/download URLs, and avatar palette. A second app typecheck passed after restoring the developer settings tab.
- The full app suite initially exposed three timeouts: hook-order source parsing and two large persisted-store source scans. Reworked traversal to use directory entries, excluded test/fixture files from the hook scan, and reused the persisted-store inventory. Focused reruns passed (HookOrder 1/1; LegacyAppStorageKeyMap 21/21) and the full app suite then passed (105 files; 1,421 tests).
- Three Rust desktop workflow tests initially failed only because the checked-in YAML used CRLF and the parser searched for LF-delimited job headers. The test helper now normalizes line endings; `cargo test -p fluxer-ci --lib desktop::tests` passed 50/50.
- The first whole-workspace run hit a stale native C object with a seven-argument ABI while current Rust/C sources agree on five arguments. GDB identified the mismatch at `fluxer_vips_probe_animated`; cleaning only generated `fluxer-media-proxy` artifacts forced a rebuild, and the isolated native-validator test then passed.
- Docker-backed Rust integration tests originally bound a chosen port to host loopback, which the workspace container could not reach. Added test-only `FLUXER_TEST_POSTGRES_HOST` and `FLUXER_TEST_POSTGRES_BIND_ADDRESS` overrides with `127.0.0.1` defaults, and changed both `fluxer_svc` harnesses to ask Docker for a published ephemeral port. All four PostgreSQL integration tests passed; dynamic assignment also avoids host-reserved-port collisions.
- The app-proxy SPA suite inherited `MEDIA_ENDPOINT` from the developer environment, making two link-preconnect expectations nondeterministic. Its shared fixture now resets that option unless a test explicitly enables it. The official-shell test now checks Delight branding. Focused SPA tests passed 32/32.
- Final Rust verification passed: `cargo test --workspace` and `cargo fmt --all -- --check`. The full app suite, app typecheck, and strict Lingui compile also passed. Existing `Atomic::fetch_update` deprecation warnings remain non-fatal.
- Source commit 118 (`82abd03a371c85a5194deadcf0c1bdc0564dad0b`) is the next commit and remains untouched. There are 193 first-parent commits after 117.

## Batch 1 — commits 118–181 findings

- Patch review found 39 conflict paths: all 34 locale catalogs plus five TypeScript files. Catalogs needed additive message reconciliation; source conflicts were resolved by preserving Delight's dynamic theme and branding values, Premium default, profile-modal layout, and active local behavior while taking upstream behavior where compatible. No unresolved index paths remain.
- Upstream removes the JavaScript `libfluxcore` wrapper and its `fast-png` / `jpeg-js` dependencies in favor of generated WASM. The ignored local `fluxer_app/pkgs/libfluxcore` artifact is stale and still imports those packages, so Vitest cannot load nine app test files (two of the 22 focused changed files). The codegen command requires a wasm target and clang backend absent on this host; no Docker daemon is available. Keep the intended package removals; regenerate the artifact in an environment with the required Rust/WASM toolchain before treating app tests as fully green.
- `ThreadMaintenanceSweeps.test.ts` had a POSIX-only suffix assertion for an OS-native path. Reproduction was isolated to that assertion; changing it to `path.join('channels', threadId, 'messages.json')` made the focused test pass and the full API suite passed on rerun.
- `fluxer_admin/build.rs` selected the Unix `tailwindcss` shell shim even on Windows. It now picks the generated `.cmd` shim and invokes it through `cmd /C`; full admin tests then passed (206/206).
- `tools/dev/src/tunnel.rs` used `std::os::unix::net::UnixStream` unconditionally. The Unix probe is now cfg-gated and non-Unix returns false; `cargo test -p fluxer-dev` passes 15/15 on Windows.
- The Rust CI tests had POSIX path strings in two Windows assertions. They now construct expected paths with `PathBuf`; `cargo test -p fluxer-ci` passes 182/182.
- Desktop failures in this host run are not from the batch's changed assertions: 1,097 passed, 7 failed, 5 skipped. Failed cases require the unavailable native Passkey backend or POSIX symlink semantics on Windows.
- Full checks completed: API 5,108 passed / 83 skipped; app TSC, API TSC, desktop TSC, strict Lingui (34 catalogs), generated theme check, `cargo fmt --all -- --check`, and `git diff --check` passed. The app test load failures above remain open pending WASM code generation.

## Batch 2 — manual conflict review and early verification

- The 64-commit patch changes 3,271 source paths. It applied cleanly except for overlapping app, API test, desktop test, and CI files; the temporary index is only a patching aid. The actual checkout index stays empty.
- Kept the local developer portal/settings changes, Delight badges and profile frames/effects in `UserProfileModal`, `UserProfileBadges`, `ProfilePreview`, and settings routing while adopting upstream DM-action sharing, centered modal behavior, user message descriptors, and `onAvatarClick` support.
- The upstream Caddyfile/chart parity test exposed that the Compose file uses a Delight admin wrapper while the generic Helm chart targets `admin:8080`. Kept the `/delight/*` sidecar route in both deployment entrypoints and adapted the parity test to normalize only the optional Delight admin wrapper name.
- The upstream `Authentication.authToken` getter was removed in favor of the shared session manager. App TSC reproduced four failures in Delight badge/effect/frame stores. Updating those stores to read `SessionManager.token` cleared the errors; the app typecheck passed.
- Migrated API Postgres integration tests to upstream's shared `startPostgresKv` helper while retaining the local host/bind overrides required by Docker-in-Docker. Focused API tests: 75 passed, 26 skipped due to Docker availability.
- Upstream removed What's New files whose entries list is empty and the `AvatarMediaUtils` duplicate of `AvatarUtils`; no active references remain. Retained the startup and deep-link assertions from `MainAppEntry.test.mjs` and `ChannelIsolation.test.mjs`; they pass with the Windows architecture env set.
- The full Rust CI crate passed 127/127 after normalizing workflow CRLFs. `cargo test --workspace --exclude fluxer-media-proxy` passed; the full workspace is blocked by unavailable Windows `pkg-config`/libvips for the media proxy. API full suite and typecheck completed successfully as documented below.

## Batch 2 verification findings — 2026-10-20

- The first Rust workspace run exposed that the new `fluxer_common::now_ms` implementation used Unix-only `clock_gettime`. Kept the Unix implementation and added a `std::time::Instant` fallback for non-Unix targets, plus a monotonicity test. `cargo test -p fluxer_common` passed 52/52; the workspace excluding native `fluxer-media-proxy` then passed.
- The same Rust run caught a stale Fluxer title assertion in the self-hosted Delight SPA test. Updated it to the shipped Delight title; `fluxer_app_proxy` passed 142/142.
- `fluxer-media-proxy` cannot build on this Windows host because `pkg-config` and system libvips are unavailable. The full workspace command therefore stops at its native build script; all other workspace crates passed with `cargo test --workspace --exclude fluxer-media-proxy`.
- App Vitest ran 95 files: 83 passed and 12 could not load due the ignored stale `fluxer_app/pkgs/libfluxcore` artifact importing upstream-removed `fast-png` and `jpeg-js`; 1,116 assertions passed. Do not re-add those dependencies to conceal the stale artifact. Regenerate WASM in an environment with its wasm target and clang when available.
- API Vitest passed 4,754 tests across 576 files; 93 tests in five files were skipped, including Docker-backed PostgreSQL integration cases. API and app TypeScript checks passed.
- Test review found no must-fix quality issues in the adapted regression and parity assertions. The custom Helm test continues to check the `/delight` route while normalizing only the known Compose/Helm admin service-name difference.

## Batch 3 verification findings — 2026-10-20

- Reviewed five three-way conflicts. The color-system reorganization replaced Fluxer's hue with the preserved Delight violet and grayscale neutrals; the manifest and generated CSS were regenerated from that source. The desktop settings resolution kept the upstream external links/layout and restored the local Developer Portal item with its unsaved-changes guard.
- The first `cargo test --workspace --exclude fluxer-media-proxy` run exposed a test-helper bug: `split(",\n")` did not split CRLF source, so the admin parity test attributed purchase reasons to the reports limit. Replacing the split with `.lines().next()` made `fluxer_admin` pass 134/134; the full supported Rust workspace then passed with one build job.
- A new app test pinned the upstream `support@fluxer.com` address even though the runtime derives `SUPPORT_EMAIL` from the active host. Updated the test to compare against the configured `SUPPORT_EMAIL_MAILTO`; it passes and keeps the Delight/instance support-email policy intact.
- The 11 original user edits were restored from `stash@{0}` into the current working tree after integration. Compose changes were merged with the upstream Delight sidecar and service definitions: removed the stale per-package `node_modules`/Cargo cache mounts, selected project-local `.cargo-home` and `.pnpm-store`, and retained Valkey's 16379 host default. The stash itself remains intact as a backup.
- Restored email DNS logic to treat `ENOTFOUND` on MX as a reason to check A/AAAA records before rejecting the address. The targeted service suite passes 13/13 and API TypeScript passes.
- Changed app tests pass in 11 files / 2,326 assertions. Two voice test files do not load because the ignored WASM wrapper is stale and imports removed `jpeg-js`; WASM/clang is unavailable. Do not re-add the removed dependency.
- All 13 changed desktop test files pass. The broader Windows desktop run still fails where tests require an initialized native Passkeys backend. The `fluxer-media-proxy` crate remains host-blocked by missing `pkg-config`/libvips, and Gateway EUnit cannot run without Erlang/rebar3.
- Final workspace state is uncommitted: `HEAD`/`origin/delight` remain `9fc3400073bfffdcf75a5b19b5a6c6dd92782737`; real index has zero staged and unresolved paths. No commit or push was made.
