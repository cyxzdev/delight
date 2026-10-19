# Fluxer upstream sync progress

## Current state

- Active repository: `D:\Haze\delight` (the user's actual project folder), branch `delight`.
- The user confirmed: preserve Delight branding and design. The WARIF product-name instruction in the supplied task file does not override this.
- Pinned source range: `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits).
- The local branch already shares 251 commits in the target history through the common base; 310 later upstream commits remain to integrate.
- Checkpoint 1 is the first 50 of those 310 commits, ending at `6de6be23581c96b33c40584948c92788f4323d12`.
- Checkpoint 2 integrates commits 51–54 through `0ef1cd14c3`; the user committed and pushed it as `9c149eefc`.
- Checkpoint 3 currently applies upstream commit 55 (`7a4aa42d4b`) plus 12 scoped local proxy/HMR, Windows test portability, and progress-record paths: 96 staged paths total, with zero conflicts. 55 post-base commits are in the working tree; 255 remain.
- The checkpoint 3 merge is intentionally uncommitted. The user owns all commits and pushes; do not advance to commit 56 until the user has committed/pushed this bounded checkpoint.
- `HEAD` remains `9c149eefc` during the current no-commit merge. The agent has not committed or pushed.
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

## Checkpoint 3 — commit 55 (staged, uncommitted)

- Upstream SHA: `7a4aa42d4b5fa6b7cd67ed7fa97350117c4e9601`, title “feat(premium): native Nordic prices and subscribing during grace”.
- Applied as a single bounded checkpoint: 84 changed paths, no overlapping local fixes, zero merge conflicts. The app and billing presentation still use the existing Delight product identity.
- API tests covering gift-trial reversal, Nordic currency selection, subscriptions/webhooks, billing config/catalog, donations, and currency utilities: 9 files passed, 288 tests passed.
- `pnpm --filter fluxer_app run typecheck:only`: passed.
- Premium classification and utility tests: 2 files passed, 15 tests passed.
- `pnpm --filter fluxer_api run typecheck`: passed. Targeted dev-proxy route test: 1 passed; `cargo build -p fluxer-dev`: passed after fixing the test's missing constant qualification.
- Rspack dev build compiled successfully (160 CSS-order warnings, no build errors). A temporary CSS change produced the HMR `invalid → new hash → ok` cycle in 4.4 seconds; the probe file was restored byte-for-byte and `/` returned 200 afterward.
- Root cause for the browser stall was gzip compression of the 1.6 MB development entry bundle; the root cause for the CSP error was the HMR client targeting port 3000 instead of the 8088 proxy. Disabling development-only compression and setting the HMR WebSocket URL to `ws://localhost:8088/ws` fixed both. Chrome now loads the sign-in page and connects to the HMR socket.
- A temporary comment in `fluxer_app/src/app/globals.css` triggered a browser-client HMR update; the file was restored byte-for-byte and Rspack completed the restored build. No console or page errors were observed.
- No commit or push was made. The index contains 96 staged paths: 84 upstream paths for commit 55 and 12 scoped local code/test/progress paths. The user owns the merge commit and push.

## Next

Next: the user reviews and commits/pushes the current merge checkpoint; then continue at upstream commit 56 (`1515a8487f`, two desktop outbound-HTTP paths). All 255 remaining commits, restoration of the original 11 staged paths, channel chooser visual checks, and final audit/verification are pending. Do not report the full task complete before those steps are finished.
