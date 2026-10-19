# Fluxer upstream sync progress

## Current state

- Active repository: `D:\Haze\delight` (the user's actual project folder), branch `delight`.
- The user confirmed: preserve Delight branding and design. The WARIF product-name instruction in the supplied task file does not override this.
- Pinned source range: `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits).
- The local branch already shares 251 commits in the target history through the common base; 310 later upstream commits remain to integrate.
- Checkpoint 1 is the first 50 of those 310 commits, ending at `6de6be23581c96b33c40584948c92788f4323d12`.
- Checkpoint 2 integrates commits 51–54 through `0ef1cd14c3`; the user committed and pushed it as `9c149eefc`.
- Checkpoint 3 (upstream commit 55, `7a4aa42d4b`) and the profile-effect/HMR fix were committed and pushed by the user as `be99c9db8`.
- Checkpoint 4 applies commits 56–70 through `4da8dec4ac251ddb0b92f213158995d93591e5df`: 241 upstream paths and 4 additional local test paths, plus 5 updated progress files (250 staged paths total). Five Windows portability edits cover the 4 additional paths and the upstream-changed `BootstrapEntry` test. There are zero unresolved conflicts.
- `HEAD` and `origin/delight` remain `be99c9db8`; checkpoint 4 is staged, not committed. The agent has not committed or pushed.
- 70 of 310 post-base commits are now staged or user-committed; 240 remain. Continue at commit 71 (`0906a85d6`) after the user commits and pushes this checkpoint.
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

## Checkpoint 4 — commits 56–70 (staged, uncommitted)

- Source range: `1515a8487f987fd8ebf9621b31e422339c2e8b4d..4da8dec4ac251ddb0b92f213158995d93591e5df` along upstream first-parent history (15 commits).
- Scope includes threads and the Plutonium page, desktop browser sign-in handoff, trusted system certificates and streamed request framing, user-initiated desktop updates, self-hosted media recovery, macOS window behavior, context menus, instance branding, and unseen-mention handling.
- Applied 241 upstream paths. Resolved the OAuth conflict by keeping Delight's `displayApplicationName()` for app labels and integrating upstream's active-instance product name for session-expired copy. Used upstream's revised `Updater.test.mjs`, which replaces the older AppImage-specific cases affected by the update-gate rewrite.
- Added four extra Windows test paths and five portability edits: normalized CRLF in `BootstrapEntry`, `MainAppEntry`, and `WindowChrome`; normalized path separators in `ChannelIsolation` and `SplashBundleOwnership`. `BootstrapEntry` is already one of the 241 upstream paths; the other four tests are additional paths.
- Current staged checkpoint total is 250 paths: 241 upstream, 4 additional desktop test paths, and 5 progress records. There are zero unresolved paths. `HEAD` and `origin/delight` remain `be99c9db8`; the agent has not committed or pushed.

### Checkpoint 4 verification

- Changed API tests: 18 files, 209 passed.
- Changed app tests: 4 files, 62 passed.
- Full schema package suite: 34 files, 1,021 passed.
- Affected desktop tests: 22 files, 382 passed.
- API, app, desktop, and schema TypeScript checks passed. App CSS module declarations were regenerated with the project's local `GenerateCssTypes.ts` script before the app typecheck.
- Broader desktop suite: 1,350 passed, 12 failed, 8 skipped. Remaining failures are in unchanged Windows-host-sensitive tests covering Linux desktop-entry behavior, filesystem/symlink behavior, and unavailable native passkey initialization; the affected 22-file set passes.
- `git diff --cached --check` passed. `pnpm` could not reconcile its workspace install because npm registry requests intermittently failed with DNS errors, so tests and typechecks were run with the already-installed local executables.

## Next

Next: the user reviews and commits/pushes checkpoint 4; then continue at upstream commit 71 (`0906a85d6`). There are 240 post-base commits remaining. Restore the original 11 staged paths after the upstream checkpoints, then complete channel chooser visual checks and the final audit/verification. Do not report the full task complete before those steps are finished.
