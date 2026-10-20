# Fluxer upstream synchronization plan for Delight

## Goal

Audit the verified Fluxer range `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits), integrate applicable final behavior into the local product without losing project-specific work, add channel-type icons to the create-channel chooser, and record reproducible verification evidence.

## Constraints

- Preserve the user's 11 original staged paths; they are restored as working-tree changes after integration and remain backed up in `stash@{0}`.
- Do not commit or push on the user's behalf; the user owns commits and pushes. Do not deploy, reset data, replace credentials, or weaken security.
- Perform integration directly in the user's project checkout `D:\Haze\delight`, on branch `delight`; the user explicitly asked for updates in their project files, not a separate worktree.
- Treat the supplied enterprise prompt as task requirements, not as independent authority to overwrite local customizations.
- Work in bounded subsystem stages; record findings and verification before advancing.
- Preserve the user's confirmed Delight identity and design. Do not rename the product to WARIF.

## Phases

1. **Baseline and safety — complete**
   - Confirm repository graph, refs, local modifications, package/runtime, and verification commands.
   - Protect the original staged changes in a recoverable stash and work in the actual project checkout.
   - Record exact source SHAs and rollback reference.
2. **Complete source inventory — complete (all 561 entries inventoried and integrated by recorded batches)**
   - Enumerate all 561 commits and all endpoint and historical changed paths.
   - Produce commit, file, and category registries without guessing per-commit disposition.
3. **Delight customization and conflict review — complete through the pinned upstream target**
   - Resolve the ten first-checkpoint conflicts against the existing Delight implementation.
   - Preserve Delight/Premium branding, the auth split-panel layout, and the Delight spark in the reviewed auth files.
   - User confirmed: preserve the local Delight brand and design.
4. **Incremental integration — all three bounded batches complete; verification caveats recorded**
   - Integrate the verified final upstream behavior by dependency-ordered subsystem batches.
   - Run targeted checks after each batch and record evidence before proceeding.
   - Resolve every conflict based on local behavior and upstream intent.
   - Batch 1: source inventory entries 369–432 (64 commits), from parent `93d1f8af4662c79d795805913e220b6a3c2e71f3` through `e87b593f46aa933232f33094ca4c31a6e8a74131` — integrated and verified; app WASM and host-sensitive desktop caveats are recorded below.
   - Batch 2: source inventory entries 433–496 (64 commits), from `e87b593f46aa933232f33094ca4c31a6e8a74131` through `e403fb6cce65241456ab9884f8a8efb6fec52d8a` — integrated and verified in this continuation.
   - Batch 3: source inventory entries 497–561 (65 commits), from `e403fb6cce65241456ab9884f8a8efb6fec52d8a` through pinned target `b8d43af1919fa0e96382577899241535c71be694` — integrated; five conflicts were reviewed and resolved while preserving Delight branding and the developer portal.
   - The prior checkpoint is source inventory entry 368 (`93d1f8af4`). The remaining 193 source commits are entries 369–561, split into the three batches above.
   - Checkpoint 1 covers commits 1–50 after the common base (`5d13a9c03`).
   - Checkpoint 2 covers commits 51–54, ending at `0ef1cd14c3`; the user committed and pushed the integration as `9c149eefc`.
   - Checkpoint 3 (commit 55, `7a4aa42d4b`) and the profile-effect/HMR fix were committed and pushed by the user as `be99c9db8`.
   - Checkpoint 4 covers commits 56–70 through `4da8dec4ac251ddb0b92f213158995d93591e5df`; the user committed and pushed it as `081140f4b`.
   - Verification for checkpoint 4: 209 API tests, 62 app tests, 1,021 schema tests, and 382 tests across 22 affected desktop test files passed; API, app, desktop, and schema TypeScript checks passed. A broader desktop suite had 1,350 passing, 12 host-sensitive failures, and 8 skipped tests; details are recorded in `progress.md`.
   - Checkpoint 5 covers commits 71–100 through `94f123905`: 212 upstream paths were staged in the user's project checkout, with zero unresolved conflicts. The user has since committed and pushed later checkpoints; the latest remote is now `79b499382`.
   - Checkpoint 5 verification: 302 API, 114 focused app, 16 desktop, 313 Rust admin, 11 targeted Gateway EUnit, 184 errors-package, and 1,021 schema tests passed. The full app run had 1,419 assertions pass plus 2 unhandled Idle timer exceptions in unchanged tests; both tests pass isolated. Full Gateway EUnit cancels 5 tests on a reproducible `meck` startup timeout in unchanged `call_ringing` tests.
   - API, app, desktop, errors, and schema TypeScript checks passed. The user owns all commits and pushes; preserve the project's current index/worktree state and do not commit or push.
   - **Batch 1 verification (2026-10-20):** API 584 files / 5,108 tests passed (4 files / 83 tests skipped); admin 206, CI 182, and dev 15 Rust tests passed; API/app/desktop TypeScript checks and all 34 strict Lingui catalogs passed; `cargo fmt --all -- --check`, `git diff --check`, and the theme-variable `--check` passed. The app suite ran 1,120 tests successfully but 9 files could not load because the ignored `pkgs/libfluxcore` artifact is stale and imports removed `fast-png`/`jpeg-js`; focused changed app tests ran 360 successfully with two files blocked by the same artifact. The required WASM toolchain is unavailable here (no wasm target/clang; Docker unavailable). Desktop main/preload/common tests: 1,097 passed, 7 failed, 5 skipped; failures are Windows host limitations (native Passkeys and POSIX symlink expectations). Windows fixes included in this batch: cfg-gated Unix Docker socket probing, `.cmd` Tailwind invocation, path-separator-safe API assertion, generated CSS/CRLF handling, and portable Rust path assertions. Current worktree is direct in `D:\Haze\delight`, index empty, no unresolved paths, no commit/push.
5. **Channel chooser icons — implemented; theme/RTL visual review remains a separate follow-up**
   - Render a channel-type icon, label, and description for each existing radio option in the channel creation modal.
   - Still verify the rendered chooser across supported themes, responsive layout, and RTL where available.
6. **Batch verification and audit notes — complete for the three integration batches; host-limited checks are documented**
   - Record test/typecheck/build results and remaining host/toolchain constraints in `progress.md`, `findings.md`, and `docs/upstream-sync/`.
   - Broader security, migration, performance, and visual reviews are not represented as complete by the batch test results.
7. **Local development path and hot reload — verified in the live development stack**
   - Fix the 405 on profile-effect saves by routing `/delight/*` to the Delight sidecar in local development.
   - Enable Rspack HMR, proxy `/ws` to the app dev server, allow the local WebSocket through CSP, and poll the Windows-mounted source tree in development.
   - Runtime on both `localhost:8088` and `127.0.0.1:8088`: `/delight/health` returns 200; unauthenticated `PUT /delight/effects/@me` returns the sidecar's expected 401 instead of 405. The authenticated profile save was not exercised.
   - The isolated browser exposed two HMR client blockers: the dev bundle was slowly gzip-compressed, and the client targeted `localhost:3000/ws` while the app is served through `localhost:8088`. Development compression is now disabled and the client WebSocket URL targets `/ws` on the proxy port.
   - Isolated Chrome now loads the sign-in page, connects to `ws://localhost:8088/ws`, receives `hot`/`liveReload`, and completes HMR `hash`/`ok` cycles without CSP or page errors. A temporary CSS edit was observed through the browser client; the exact original source bytes were restored and the rebuilt app and sidecar health returned 200.
   - A live Windows-mounted edit to `fluxer_api/src/AppEntrypoint.ts` did not reach Node's native `fs.watch`, while `fs.watchFile` polling detected the same edit. API and Worker now run through `tools/dev/watch_tsx.mjs`, which polls API and shared package sources and restarts the TypeScript entrypoint in development. A runtime probe changed the API process PID and showed API/Worker restart messages; both probes were restored and the API health and app proxy returned 200.
   - `cargo fmt --manifest-path tools/dev/Cargo.toml --check`, `cargo test -p fluxer-dev` (66 passed), and `node --check tools/dev/watch_tsx.mjs` passed. Production build commands are unchanged.

## Decisions

| Decision | Rationale |
|---|---|
| Pin the requested target SHA rather than silently following `upstream/main` | The requested comparison is immutable and bounded to a specific date. |
| Preserve the staged user diff in the original checkout | Existing staged edits predate this task and must not be overwritten. |
| Inspect the fork graph before choosing merge versus adaptation | The local parent diverges from the requested target. |
| Preserve Delight branding | User clarified that the actual local product identity is Delight. |
| Verify and integrate in upstream first-parent checkpoints | This provides testable intermediate states instead of one unverified final merge. |
| Add the Delight sidecar to the devcontainer stack | The app already calls `/delight/effects/@me`; the dev proxy previously fell through to the app proxy, which only accepts GET/HEAD. |
| Poll the Rspack source watcher and TypeScript sources in development | Docker Desktop's Windows bind mount did not deliver complete `fs.watch` events; polling produced reproducible CSS HMR and API/Worker restarts. Production config is unchanged. |

## Errors encountered

| Error | Attempt | Resolution |
|---|---|---|
| PowerShell parsed an unquoted `^{commit}` revision incorrectly in `git cat-file` | 1 | Queried objects by SHA directly; fetching the pinned target verified both commits. |
| GitHub web comparison page could not be fetched by the browser connector | 1 | Used the official upstream Git remote and verified the immutable Git objects locally. |
| PowerShell `Set-Content -Encoding Byte` is unsupported on this host | 1 | Saved the staged patch with `git diff --binary --output=...`; source index and working files stayed unchanged. |
| First Compose invocation tried the default Valkey host port 6379, while the running stack uses 16379 | 1 | Started only the Delight sidecar with `--no-deps`; restored Valkey with `FLUXER_DEV_VALKEY_PORT=16379` and restarted the workspace container. Data volumes were retained. |
| Historical dev launcher path was absent in this checkout | 1 | Started the project stack with `cargo run -p fluxer-dev -- dev`. |
| Full dev startup initially timed out waiting for Gateway after 300 seconds | 1 | The Rust NIFs and Erlang Gateway dependencies were cold. Retried app, API/services, and Gateway separately; Gateway now reports ready at `127.0.0.1:8771/_health/ready`. |
| Running the dev proxy route test from Windows host failed to compile an existing `std::os::unix` reference in `tools/dev/src/tunnel.rs` | 1 | Ran the route test in the project's Linux devcontainer; it passed (1 test). The unrelated host-platform compile path remains unchanged. |
| pnpm attempted to reconcile workspace dependencies and failed against intermittent npm registry DNS errors | 1 | Used the existing local Vitest, TypeScript, and tsx executables directly; all recorded focused tests and checks then completed. |
| Ten `cargo watch` processes stalled while scanning Rust sources through the Windows-mounted tree | 1 | Stopped the out-of-scope Rust watcher experiment and restored the standard Rust/Gateway dev tasks; the requested React and TypeScript watchers were retained. |
| `tsx watch` did not restart after Windows-mounted TypeScript edits | 1 | Confirmed `fs.watch` emitted no event while `fs.watchFile` polling detected the change; added and runtime-verified a development-only poller for API/Worker sources. |
| First TypeScript poller attempt executed the `.bin/tsx` shell shim with Node | 1 | Spawned the executable shim directly; API and Worker then started and passed live restart checks. |
| Desktop source-inspection tests assumed LF endings or POSIX path separators on Windows | 1 | Normalized source text and resolved test paths before comparison; the affected desktop test set now passes. |

## Continuation baseline before Batches 1–3 — 2026-10-20

- The user's latest push is `9fc3400073bfffdcf75a5b19b5a6c6dd92782737` on `origin/delight`; the original 11 staged user paths remain safely preserved in `stash@{0}`.
- Upstream commits 113–117 are integrated in `D:\Haze\delight`; Delight identity, runtime defaults, support-email policy, and existing translations were preserved. The current index already contains staged project changes; Codex did not stage, commit, or push them during this continuation.
- Commits 113–114 added runtime product/guidelines behavior, report/kick/locale improvements, and new messages in 34 locale catalogs. Strict Lingui compilation passed for both. Commit 113 also added optional Delight sidecar variables to `deploy/self-hosting/.env.example` and test-only Postgres host/bind overrides after existing coverage/integration tests exposed those needs.
- Commit 113 verification: API affected suite 355 passed plus 16 optional Postgres cases skipped in the combined run; Postgres-enabled repository test 75/75; app 71/71; errors 76/76; email 407/407; schema 1,075/1,075; config 309/309; desktop 5/5; Rust admin crate passed. API/app/desktop typechecks passed. Docs sidebar, schema checks (4,131 field comparisons), style, and 33 docs tests passed.
- Commit 114 verification: API 101/101; email 479/479; LocaleService 101/101; i18n CompileMessage 7/7; OpenAPI generator 24/24 (185 seconds with extended timeout). API/app typechecks and strict Lingui compilation passed.
- Commit 115 adapts upstream admin moderation/report behavior, including requiring a resolution choice, separating the optional public comment, and adjusting report/admin layouts. The source-range merge was checked against all 57 touched paths: 56 existing files merged and one new file added, with zero unresolved overlaps. `cargo fmt --check` and the full `cargo test -p fluxer_admin` passed; API AdminGuildRoutes and ModerationEvents tests passed 23/23; API TypeScript check passed.
- `VerifyDocsCoverage.ts` remains red with 221 reported issues: its audit-action parser reads two admin tables as empty, and the self-hosting installer/config docs have env-coverage mismatches. Other route/spec, Gateway event/opcode, security-field, and rate-limit checks passed. Resolve or clearly classify remaining documentation findings before final audit.
- Latest runtime checks: app proxy `8088` and API `8080/_health` return 200 after the work. Delight sidecar/effect route and HMR behavior were verified in earlier checkpoints. Recheck Gateway readiness if needed; an earlier host probe returned 403.
- Commit 117 (`93d1f8af4`, “refactor: remove dead code (#3337)”) is integrated. The complete app suite passed 1,421/1,421; app TypeScript and strict Lingui compilation passed. `cargo test --workspace` and `cargo fmt --all -- --check` passed after the test-harness fixes documented in `findings.md`.
- The commit-117 deletion audit retained two Delight-only active files (`FluxerLogo.tsx` and `ClientDeveloperSettingsTab.tsx`), reconciled all 34 locale catalogs, and resolved 11 CSS overlaps and 2 additional source overlaps. Details and the Windows CRLF test-helper correction are in `findings.md`.
- The user committed and pushed the prior checkpoint. Current `HEAD` and `origin/delight` are both `9fc3400073bfffdcf75a5b19b5a6c6dd92782737`; the checkout and index were clean at the start of this continuation. The original 11 staged user paths remain in `stash@{0}`; do not alter that stash.
- **193 first-parent commits remain after 117.** The user asked to split them into three stages and verify each stage before advancing. Batch 1 is 118–181 (64 commits); its upstream tree changes 2,837 unique paths. This is the source diff size, not an expected staged-file count; overlaps must be reviewed to preserve Delight customizations.
- Channel chooser icons, forum/media attachments, threads, and the `/delight/effects/@me` proxy fix are already present in earlier user-pushed checkpoints. Theme/RTL/responsive visual checks and the final full-range audit remain pending.
- Rollback reference: `backup/delight-before-fluxer-sync-2026-10`. Do not commit, push, deploy, or drop the preserved stash.

## Next Step

The pinned upstream range is fully integrated. Review the unstaged project changes and commit/push them when ready. The remaining host/toolchain and visual checks are listed in the Batch 3 record; no upstream commits remain in this range.

## Batch 3 — complete — 2026-10-20

- Integrated source entries 497–561 (65 commits), `e403fb6cce65241456ab9884f8a8efb6fec52d8a..b8d43af1919fa0e96382577899241535c71be694`, across 788 upstream paths. All 561 inventory entries are now integrated; zero upstream commits remain in the requested range.
- Reviewed five conflicts in the color-system generator, desktop settings, two CSS modules, and the generated theme manifest. Kept Delight's purple/neutral palette and re-added the local Developer Portal item to the upstream desktop settings layout.
- Restored the user's original 11 staged changes into the project working tree and retained `stash@{0}` as a backup. This includes the local Cargo launcher, local pnpm/Cargo cache settings, Valkey port 16379, `LOG_LEVEL=info`, and email DNS fallback behavior. Preserved the upstream Delight sidecar and current compose services. The actual Git index remains empty; no commit or push was made.
- API full suite: 594 files passed, 5 skipped; 5,234 tests passed, 98 skipped. API TypeScript passed. The restored email DNS regression suite passed 13/13.
- Changed frontend tests: 11 files passed (2,326 tests); two voice suites could not load because the ignored stale `fluxer_app/pkgs/libfluxcore` output still imports removed `jpeg-js`. App TypeScript passed after regenerating theme and CSS module declarations.
- Changed desktop tests: 13 files passed. The broader Windows desktop suite still has host-only Passkeys failures because the native backend is not initialized on this machine. Desktop TypeScript passed.
- Changed package suites passed: config 278, constants 171, i18n 204, errors 25 (678 total). `cargo test --workspace --exclude fluxer-media-proxy -j 1` and `cargo fmt --all -- --check` passed. `fluxer-media-proxy` still needs Windows `pkg-config`/libvips; Gateway EUnit could not run because Erlang and `rebar3` are not installed.
- The first Rust pass found a CRLF-sensitive parser in an admin test helper; changed it to read line-by-line, then verified `fluxer_admin` 134/134 and reran the full supported Rust workspace successfully. Theme generation, Docker Compose config validation, JSON parsing, Node syntax, and `git diff --check` passed.
- Remaining unverified work is environmental/visual: regenerate the ignored app WASM artifact with the missing wasm/clang toolchain before claiming the two blocked voice tests or full app suite green; provision native Passkeys, libvips, and Erlang to run the corresponding host suites; perform cross-theme/RTL visual review if required.
- Final Git checkpoint: `HEAD` and `origin/delight` remain `9fc3400073bfffdcf75a5b19b5a6c6dd92782737`; zero staged paths and zero unresolved conflicts. The user retains commit/push ownership.

## Batch 2 — verification complete — 2026-10-20

- Source entries 433–496 (64 commits), `e87b593f46aa933232f33094ca4c31a6e8a74131..e403fb6cce65241456ab9884f8a8efb6fec52d8a`; integrated in the user's actual checkout. The original 11 staged user paths remain in `stash@{0}`; no commit or push was made.
- API full suite: 576 files passed, 5 skipped; 4,754 tests passed and 93 skipped. API TypeScript check passed. Docker-backed Postgres cases are among the skipped tests.
- App full suite: 83 files and 1,116 tests passed; 12 files failed to load because the ignored generated `fluxer_app/pkgs/libfluxcore` still imports removed `fast-png`/`jpeg-js` packages. App TypeScript check passed; focused changed app tests and desktop entry/channel tests passed earlier in this batch.
- Rust: `cargo test --workspace --exclude fluxer-media-proxy` passed; `cargo test -p fluxer_common` passed 52/52; `cargo test -p fluxer-ci` passed 127/127; `cargo fmt --all -- --check` passed. Full workspace is blocked building `fluxer-media-proxy` because Windows lacks `pkg-config` and libvips.
- Fixed a Windows build regression in `fluxer_common::now_ms`: Unix retains `clock_gettime`; non-Unix uses `Instant`. The monotonic-clock regression test passes. Corrected the SPA test's self-hosted title expectation to Delight; `fluxer_app_proxy` passed 142/142.
- Helm chart parity passed 2/2, desktop TypeScript passed, and `git diff --check` passed. The real Git index remains empty, with zero unresolved paths; `HEAD` and `origin/delight` remain `9fc3400073bfffdcf75a5b19b5a6c6dd92782737`.

## Final publication checkpoint — 2026-10-20

- The requested 561 upstream commits are integrated in the Delight checkout. The user explicitly requested publication; commit 1352b5aa9c977e5f9e3a14d546e4e18ad286dc27 (feat: integrate Fluxer upstream updates) was pushed to origin/delight.
- The commit contains 5,366 changed paths. Post-push verification showed HEAD and origin/delight at the same SHA, with zero staged or working-tree paths. No further commit or push is pending.
- Runtime verification after startup returned HTTP 200 from localhost:8088, localhost:3000, and localhost:8080/_health. Frontend HMR and API/worker source polling were verified in the preceding development checkpoint.
- The recorded Batch 3 tests passed for the API (5,234 tests), supported Rust workspace, package suites (678 tests), and changed desktop/app paths. Remaining environment limits: two voice suites need regenerated ignored WASM output; media-proxy needs Windows pkg-config/libvips; Gateway EUnit needs Erlang/rebar3; the broader desktop suite needs a native Passkeys backend. Cross-theme and RTL visual review remains for the user review pass.
