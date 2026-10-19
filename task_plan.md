# Fluxer upstream synchronization plan for Delight

## Goal

Audit the verified Fluxer range `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits), integrate applicable final behavior into the local product without losing project-specific work, add channel-type icons to the create-channel chooser, and record reproducible verification evidence.

## Constraints

- Preserve the user's 11 original staged paths; they are saved in `stash@{0}` with their staged state and will be restored after integration.
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
2. **Complete source inventory — complete (source registry; impact review remains pending)**
   - Enumerate all 561 commits and all endpoint and historical changed paths.
   - Produce commit, file, and category registries without guessing per-commit disposition.
3. **Delight customization and first conflict review — checkpoint 1 complete; full range review ongoing**
   - Resolve the ten first-checkpoint conflicts against the existing Delight implementation.
   - Preserve Delight/Premium branding, the auth split-panel layout, and the Delight spark in the reviewed auth files.
   - User confirmed: preserve the local Delight brand and design.
4. **Incremental integration — paused at the user's requested checkpoint 117 (source commit 117 is integrated; 193 first-parent commits remain)**
   - Integrate the verified final upstream behavior by dependency-ordered subsystem batches.
   - Run targeted checks after each batch and record evidence before proceeding.
   - Resolve every conflict based on local behavior and upstream intent.
   - Checkpoint 1 covers commits 1–50 after the common base (`5d13a9c03`).
   - Checkpoint 2 covers commits 51–54, ending at `0ef1cd14c3`; the user committed and pushed the integration as `9c149eefc`.
   - Checkpoint 3 (commit 55, `7a4aa42d4b`) and the profile-effect/HMR fix were committed and pushed by the user as `be99c9db8`.
   - Checkpoint 4 covers commits 56–70 through `4da8dec4ac251ddb0b92f213158995d93591e5df`; the user committed and pushed it as `081140f4b`.
   - Verification for checkpoint 4: 209 API tests, 62 app tests, 1,021 schema tests, and 382 tests across 22 affected desktop test files passed; API, app, desktop, and schema TypeScript checks passed. A broader desktop suite had 1,350 passing, 12 host-sensitive failures, and 8 skipped tests; details are recorded in `progress.md`.
   - Checkpoint 5 covers commits 71–100 through `94f123905`: 212 upstream paths were staged in the user's project checkout, with zero unresolved conflicts. The user has since committed and pushed later checkpoints; the latest remote is now `79b499382`.
   - Checkpoint 5 verification: 302 API, 114 focused app, 16 desktop, 313 Rust admin, 11 targeted Gateway EUnit, 184 errors-package, and 1,021 schema tests passed. The full app run had 1,419 assertions pass plus 2 unhandled Idle timer exceptions in unchanged tests; both tests pass isolated. Full Gateway EUnit cancels 5 tests on a reproducible `meck` startup timeout in unchanged `call_ringing` tests.
   - API, app, desktop, errors, and schema TypeScript checks passed. The user owns all commits and pushes; preserve the project's current index/worktree state and do not commit or push.
5. **Channel chooser icons — implemented; visual coverage pending**
   - Render a channel-type icon, label, and description for each existing radio option in the channel creation modal.
   - Still verify the rendered chooser across supported themes, responsive layout, and RTL where available.
6. **Final verification and audit package — pending for the full 561-commit range**
   - Run the relevant project checks and available security, migration, visual, and performance verification.
   - Complete traceability reports and clearly list anything blocked or not verified.
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

## Current continuation state — 2026-10-20

- The user's latest push is `79b499382` on `origin/delight`; it contains upstream commits 111 and 112. The original 11 staged user paths remain safely preserved in `stash@{0}`.
- Upstream commits 113–117 are integrated in `D:\Haze\delight`; Delight identity, runtime defaults, support-email policy, and existing translations were preserved. The current index already contains staged project changes; Codex did not stage, commit, or push them during this continuation.
- Commits 113–114 added runtime product/guidelines behavior, report/kick/locale improvements, and new messages in 34 locale catalogs. Strict Lingui compilation passed for both. Commit 113 also added optional Delight sidecar variables to `deploy/self-hosting/.env.example` and test-only Postgres host/bind overrides after existing coverage/integration tests exposed those needs.
- Commit 113 verification: API affected suite 355 passed plus 16 optional Postgres cases skipped in the combined run; Postgres-enabled repository test 75/75; app 71/71; errors 76/76; email 407/407; schema 1,075/1,075; config 309/309; desktop 5/5; Rust admin crate passed. API/app/desktop typechecks passed. Docs sidebar, schema checks (4,131 field comparisons), style, and 33 docs tests passed.
- Commit 114 verification: API 101/101; email 479/479; LocaleService 101/101; i18n CompileMessage 7/7; OpenAPI generator 24/24 (185 seconds with extended timeout). API/app typechecks and strict Lingui compilation passed.
- Commit 115 adapts upstream admin moderation/report behavior, including requiring a resolution choice, separating the optional public comment, and adjusting report/admin layouts. The source-range merge was checked against all 57 touched paths: 56 existing files merged and one new file added, with zero unresolved overlaps. `cargo fmt --check` and the full `cargo test -p fluxer_admin` passed; API AdminGuildRoutes and ModerationEvents tests passed 23/23; API TypeScript check passed.
- `VerifyDocsCoverage.ts` remains red with 221 reported issues: its audit-action parser reads two admin tables as empty, and the self-hosting installer/config docs have env-coverage mismatches. Other route/spec, Gateway event/opcode, security-field, and rate-limit checks passed. Resolve or clearly classify remaining documentation findings before final audit.
- Latest runtime checks: app proxy `8088` and API `8080/_health` return 200 after the work. Delight sidecar/effect route and HMR behavior were verified in earlier checkpoints. Recheck Gateway readiness if needed; an earlier host probe returned 403.
- Commit 117 (`93d1f8af4`, “refactor: remove dead code (#3337)”) is integrated. The complete app suite passed 1,421/1,421; app TypeScript and strict Lingui compilation passed. `cargo test --workspace` and `cargo fmt --all -- --check` passed after the test-harness fixes documented in `findings.md`.
- The commit-117 deletion audit retained two Delight-only active files (`FluxerLogo.tsx` and `ClientDeveloperSettingsTab.tsx`), reconciled all 34 locale catalogs, and resolved 11 CSS overlaps and 2 additional source overlaps. Details and the Windows CRLF test-helper correction are in `findings.md`.
- Current local state: `HEAD` and `origin/delight` remain `79b499382`; at the final check the index had 1,721 staged paths and the worktree had 53 modified tracked paths plus one Delight-only untracked tab. There are no unmerged paths. Codex did not stage, commit, or push. Preserve the existing index and stash.
- Stop here as the user requested. The next upstream first-parent commit is 118 (`82abd03a371c85a5194deadcf0c1bdc0564dad0b`, delete reports and configure retention); **193 first-parent commits remain after 117**.
- Channel chooser icons, forum/media attachments, threads, and the `/delight/effects/@me` proxy fix are already present in earlier user-pushed checkpoints. Theme/RTL/responsive visual checks and the final full-range audit remain pending.
- Rollback reference: `backup/delight-before-fluxer-sync-2026-10`. Do not commit, push, deploy, or drop the preserved stash.

## Next Step

Checkpoint 117 is complete. Stop and report that 193 upstream first-parent commits remain; do not start commit 118 until the user asks to continue.
