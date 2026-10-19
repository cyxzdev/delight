# Fluxer upstream sync progress

## Current state

- Active repository: `D:\Haze\delight` (the user's actual project folder), branch `delight`.
- The user confirmed: preserve Delight branding and design. The WARIF product-name instruction in the supplied task file does not override this.
- Pinned source range: `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits).
- The local branch already shares 251 commits in the target history through the common base; 310 later upstream commits remain to integrate.
- Checkpoint 1 is the first 50 of those 310 commits, ending at `6de6be23581c96b33c40584948c92788f4323d12`.
- Checkpoint 2 integrates commits 51–54 through `0ef1cd14c3`; the user committed and pushed it as `9c149eefc`.
- Checkpoint 3 (upstream commit 55, `7a4aa42d4b`) and the profile-effect/HMR fix were committed and pushed by the user as `be99c9db8`.
- Checkpoint 4 (commits 56–70 through `4da8dec4ac251ddb0b92f213158995d93591e5df`) was committed and pushed by the user as `081140f4b`.
- Checkpoint 5 applies commits 71–100 through `94f123905`: 212 upstream paths are staged, with zero unresolved conflicts; five updated progress files bring the staged total to 217.
- `HEAD` and `origin/delight` are `081140f4b`; checkpoint 5 is staged, not committed. The agent has not committed or pushed.
- 100 of 310 post-base commits are now applied or user-committed; 210 remain. Continue at commit 101 (`ae820ba4e`) after the user commits and pushes this checkpoint.
- The original 11 staged user paths are preserved in `stash@{0}` with their staged state. Restore them after the upstream checkpoints and verify all overlaps; do not drop the stash.
- No deployment has occurred. Local rollback ref: `backup/delight-before-fluxer-sync-2026-10`.

## Checkpoint 1 changes and decisions

- Integrated upstream behavior through the checkpoint SHA while retaining the local auth split-panel styles, Delight spark/wordmark, Delight/Premium defaults, and local Developer Portal routes.
- Resolved all 10 merge conflicts; see [conflict-resolution.md](conflict-resolution.md).
- Added icons alongside labels/descriptions for Text, Announcement, Voice, and Link channel types in the existing channel creation chooser.
- Added the Delight profile-effect preference to legacy storage migration and fixture coverage so existing users keep that setting.
- Fixed a Windows path separator assumption in frozen-storage registry tests and made Premium fallback tests follow the configured Delight product identity.
- Generated CSS module type declarations required by the upstream checkpoint.

## Verification evidence

- `pnpm install --frozen-lockfile`: passed.
- `pnpm --filter fluxer_app run generate:css-types`: passed.
- `pnpm --filter fluxer_app run typecheck:only`: passed after generated declarations and conflict adaptations.
- `pnpm --filter fluxer_app run test -- --maxWorkers=4 --testTimeout=60000`: passed, 101 test files and 1,392 tests.
- `git diff --name-only --diff-filter=U`: empty (0 unresolved paths).
- `git diff --check`: no whitespace errors; Git reported only the existing `.gitignore` LF-to-CRLF conversion notice.

## Checkpoint 2 and current local fixes

- Upstream commits 51–54 are present in the user-created merge commit `9c149eefc`; zero merge conflicts remain.
- Desktop suite for the eight changed test files: 195 passed, 3 skipped, 0 failed. The three skips are POSIX filesystem-mode checks that cannot run meaningfully on Windows; Linux CI retains them.
- Desktop TypeScript check, app typecheck, and the targeted Gateway transport test passed.
- Profile-effect save failed because `/delight/*` was absent from the dev proxy route table and the devcontainer did not run the Delight sidecar. Reproduction against `/delight/effects/@me` returned `405 Allow: GET,HEAD` from the app proxy.
- Added a devcontainer Delight sidecar with persistent development data, mapped the stripped `/delight` prefix to it, added proxy route coverage, and enabled Rspack HMR/live reload.
- Compose configuration validates; the Delight sidecar is healthy. `/delight/health` returns 200, and unauthenticated `PUT /delight/effects/@me` now returns the expected sidecar 401 instead of the former 405.
- Added `/ws` proxy routing and the local WebSocket CSP allowance for Rspack HMR; the HMR WebSocket upgrade returns 101 and sends `hot` and `liveReload` capabilities.
- Rspack polls the Windows-mounted source tree every second in development, serves uncompressed development bundles, and directs the HMR WebSocket through the 8088 proxy. Isolated Chrome loads the sign-in screen, connects to `/ws`, and receives `hot`, `liveReload`, and successful `hash`/`ok` updates without console errors.
- Full startup initially timed out at the Gateway readiness wait. Starting services/API and Gateway separately succeeded; the Gateway now reports ready at `127.0.0.1:8771/_health/ready`. Postgres, object-store, and other development volumes were retained.

## Checkpoint 3 — commit 55 (committed and pushed by the user)

- Upstream SHA: `7a4aa42d4b5fa6b7cd67ed7fa97350117c4e9601`, title “feat(premium): native Nordic prices and subscribing during grace”.
- Applied as a single bounded checkpoint: 84 changed paths, no overlapping local fixes, zero merge conflicts. The app and billing presentation still use the existing Delight product identity.
- API tests covering gift-trial reversal, Nordic currency selection, subscriptions/webhooks, billing config/catalog, donations, and currency utilities: 9 files passed, 288 tests passed.
- `pnpm --filter fluxer_app run typecheck:only`: passed.
- Premium classification and utility tests: 2 files passed, 15 tests passed.
- `pnpm --filter fluxer_api run typecheck`: passed. Targeted dev-proxy route test: 1 passed; `cargo build -p fluxer-dev`: passed after fixing the test's missing constant qualification.
- Rspack dev build compiled successfully (160 CSS-order warnings, no build errors). A temporary CSS change produced the HMR `invalid → new hash → ok` cycle in 4.4 seconds; the probe file was restored byte-for-byte and `/` returned 200 afterward.
- Root cause for the browser stall was gzip compression of the 1.6 MB development entry bundle; the root cause for the CSP error was the HMR client targeting port 3000 instead of the 8088 proxy. Disabling development-only compression and setting the HMR WebSocket URL to `ws://localhost:8088/ws` fixed both. Chrome now loads the sign-in page and connects to the HMR socket.
- A temporary comment in `fluxer_app/src/app/globals.css` triggered a browser-client HMR update; the file was restored byte-for-byte and Rspack completed the restored build. No console or page errors were observed.
- The user committed and pushed the checkpoint as `be99c9db8`. The profile-effect routing and HMR fixes are in that checkpoint.

## Checkpoint 4 — commits 56–70 (committed and pushed by the user)

- Source range: `1515a8487f987fd8ebf9621b31e422339c2e8b4d..4da8dec4ac251ddb0b92f213158995d93591e5df` along upstream first-parent history (15 commits).
- Scope includes threads and the Plutonium page, desktop browser sign-in handoff, trusted system certificates and streamed request framing, user-initiated desktop updates, self-hosted media recovery, macOS window behavior, context menus, instance branding, and unseen-mention handling.
- Applied 241 upstream paths. Resolved the OAuth conflict by keeping Delight's `displayApplicationName()` for app labels and integrating upstream's active-instance product name for session-expired copy. Used upstream's revised `Updater.test.mjs`, which replaces the older AppImage-specific cases affected by the update-gate rewrite.
- Added four extra Windows test paths and five portability edits: normalized CRLF in `BootstrapEntry`, `MainAppEntry`, and `WindowChrome`; normalized path separators in `ChannelIsolation` and `SplashBundleOwnership`. `BootstrapEntry` is already one of the 241 upstream paths; the other four tests are additional paths.
- The user committed and pushed this checkpoint as `081140f4b`; the agent did not commit or push.

### Checkpoint 4 verification

- Changed API tests: 18 files, 209 passed.
- Changed app tests: 4 files, 62 passed.
- Full schema package suite: 34 files, 1,021 passed.
- Affected desktop tests: 22 files, 382 passed.
- API, app, desktop, and schema TypeScript checks passed. App CSS module declarations were regenerated with the project's local `GenerateCssTypes.ts` script before the app typecheck.
- Broader desktop suite: 1,350 passed, 12 failed, 8 skipped. Remaining failures are in unchanged Windows-host-sensitive tests covering Linux desktop-entry behavior, filesystem/symlink behavior, and unavailable native passkey initialization; the affected 22-file set passes.
- `git diff --cached --check` passed. `pnpm` could not reconcile its workspace install because npm registry requests intermittently failed with DNS errors, so tests and typechecks were run with the already-installed local executables.

## Checkpoint 5 — commits 71–100 (staged, uncommitted)

- Source range: `0906a85d6f6fde6d341d143d291a31ad7bbbedb3..94f123905065ee322dcbe67809eedb294c3bad47` along upstream first-parent history (30 commits).
- Applied 212 upstream paths directly in `D:\Haze\delight`; the 3-way patch check passed and application completed with zero unresolved paths. Thirty-eight paths also differ between the local Delight tree and source commit 70; patches applied cleanly across those overlaps.
- Scope includes forum/media posts retaining uploaded attachments, closed forum post visibility, archived post sorting, thread focus/keyboard behavior, scrollable member lists, private-thread leave confirmation, thread context menus/debug actions, stored branding media references, account-switch consent, admin-user controls, localization updates, and related fixes.
- Tests passed: 17 API test files / 302 tests; 8 focused app forum/thread/channel test files / 114 tests; 3 desktop test files / 16 tests; Rust admin / 313 tests; focused `guild_availability_tests` / 11 Gateway EUnit tests; full errors package / 184 tests; full schema package / 1,021 tests.
- Full app suite: 104 test files and 1,419 assertions passed, but Vitest exited nonzero after two unhandled Idle timer exceptions in unchanged tests. The stack points to `Idle.applyIdleState()` calling `LocalPresence.updatePresence()` after the test file's environment began teardown. Both affected test files pass isolated (2 files / 6 tests); neither file nor `Idle.ts` is part of this checkpoint.
- Typechecks passed for API, app, desktop, errors, and schema. App CSS module declarations were regenerated with `scripts/GenerateCssTypes.ts` before the successful app typecheck.
- Full `rebar3 eunit` ran twice: both runs reported 42 passed, 0 failed, 5 cancelled and exited nonzero. The same unchanged `call_ringing:apply_pending_ringing_publishes_one_ring_per_new_user_test/0` repeatedly times out while starting `meck_proc` for `push_job_publisher`; the isolated `call_ringing` module reproduces it (3 cancelled). `call_ringing.erl` is unchanged by this checkpoint. The changed Gateway module's focused test passes.
- `git diff --cached --check` passes; the code batch is 212 paths. The five progress records are updated for the same checkpoint; the user's original 11 staged paths remain preserved in `stash@{0}`.

## Development hot reload continuation — 2026-10-19

- Rebuilt the local dev launcher in the user's `D:\Haze\delight` checkout and restarted the development stack without committing or pushing.
- React/Rspack HMR ran at `http://localhost:8088/`; a WebSocket client received `hot`, `liveReload`, and successful hash/ok rebuild frames after a temporary CSS edit. The app proxy returned 200 after the probe was reverted.
- Reproduced the backend watcher issue on the Windows-mounted checkout: a native `fs.watch` did not observe edits, but `fs.watchFile` polling did. Added `tools/dev/watch_tsx.mjs` and routed development API/Worker tasks through it; it polls 1,829 API/workspace source files at 1-second intervals.
- A temporary comment in `fluxer_api/src/AppEntrypoint.ts` caused the API process PID to change and restarted the Worker as well. The file was restored; API `/_health` and app proxy both returned 200 afterward.
- Verification: `cargo fmt --manifest-path tools/dev/Cargo.toml --check`, `cargo test -p fluxer-dev` (66 passed), and `node --check tools/dev/watch_tsx.mjs` all passed.
- An extra experiment to watch Rust/Gateway processes with ten `cargo watch` tasks stalled on mounted filesystem reads. Those out-of-scope changes were removed; standard Rust/Gateway dev tasks are running. The original checkpoint 5 stage (217 paths) remains intact.
- `git fetch origin delight` confirmed `origin/delight` still points to `081140f4b`; no commit/push was made.

## Upstream checkpoint 6 — commits 101–109 (working tree, uncommitted)

- Applied upstream first-parent commits `ae820ba4e..bc17922b0` (9 commits) on top of the existing local checkpoint. Commits 101–108 changed 72 upstream paths; commit 109 changed 12 Gateway/docs paths. Patches applied to the working tree only; the existing checkpoint 5 stage was not changed and there are no unmerged paths.
- Commits 101–108 verification: API privacy settings/DM tests 21 passed; app settings transition tests 2 passed; media proxy CORS tests 22 passed; API, app, and schema TypeScript checks passed.
- Commit 109 verification: `gateway_cluster_membership_tests` passed 21/21 when isolated; `guild_request_members_filter_tests` passed 29/29; `guild_sessions_connect_tests` passed 15/15. The new `nodedown_grace_expiry_clears_pending_cleanup_test` ran successfully in the presence cache suite.
- Gateway caveat: combined EUnit runs intermittently failed the 300 ms concurrency assertion in `gateway_cluster_membership_tests`, which passed when that module ran alone. `presence_cache_tests` also had a `meck_proc:start/2` timeout in the existing `rebalance_drop_does_not_suppress_repair_test`; the same meck startup timeout pattern was recorded during checkpoint 5. These are recorded as test-run limitations, not silently counted as passes.
- Commit 110 (`ece622e80`) is now applied in three reviewable slices: 157 backend/tooling paths, 78 app source paths, and 236 localization paths. Japanese catalog hunks were reconciled manually to preserve the existing Delight translation while removing an obsolete string for a report screen that upstream removed.
- The report repository integration test now accepts `FLUXER_TEST_POSTGRES_HOST` and `FLUXER_TEST_POSTGRES_BIND_ADDRESS`, defaulting to loopback. This lets its ephemeral Docker PostgreSQL container be reached from the Windows-backed devcontainer without changing production settings. With `host.docker.internal` and `0.0.0.0`, it passed 10/10.
- Report-flow verification: 29 API test files / 524 tests passed; app affected tests 3 files / 25 passed; report schemas 4 files / 54 passed; the complete admin Rust crate passed; error package 12 files / 184 passed; email service and locale tests 218 passed; rate-limit tests 7 passed; self-hosting config tests 3 passed; OpenAPI extractor/generator tests passed (16 + 12 + 19). OpenAPI document generation exceeded its default 60-second hook once; rerunning the generator test alone with a 300-second hook timeout passed 19/19.
- API, app, and schema TypeScript checks passed. App CSS module declarations were regenerated to include the new report page class before its successful typecheck.
- The local dev stack recovered after a long Rspack rebuild; API health and the app proxy both returned HTTP 200. No commit or push was performed.

## Next

Checkpoint 5 is staged for the user's review in D:\Haze\delight; later upstream work remains unstaged. Continue at upstream commit 111 (`f390e610b`), then inspect commits 112–113 and proceed through the remaining 200 post-base commits. Keep the original 11 staged paths preserved, finish the requested channel type icons and final audit/verification, and do not commit or push. Do not report the full task complete before those steps are finished.
