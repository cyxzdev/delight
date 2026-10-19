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
4. **Incremental integration — in progress (55 of 310 post-base commits integrated in the working tree)**
   - Integrate the verified final upstream behavior by dependency-ordered subsystem batches.
   - Run targeted checks after each batch and record evidence before proceeding.
   - Resolve every conflict based on local behavior and upstream intent.
   - Checkpoint 1 covers commits 1–50 after the common base (`5d13a9c03`).
   - Checkpoint 2 covers commits 51–54, ending at `0ef1cd14c3`; the user committed and pushed the integration as `9c149eefc`.
   - Checkpoint 3 applies commit 55 (`7a4aa42d4b`, 84 upstream paths) with 12 scoped local files for the profile-effect/HMR fix, Windows test portability, and progress records: 96 staged paths total, zero merge conflicts. It is staged but uncommitted; the user owns its commit and push.
   - 255 post-base commits remain. The next first-parent commit is 56 (`1515a8487f`), which changes two desktop outbound-HTTP paths. Continue after the user completes the current merge commit.
5. **Channel chooser icons — implemented; visual coverage pending**
   - Render a channel-type icon, label, and description for each existing radio option in the channel creation modal.
   - Still verify the rendered chooser across supported themes, responsive layout, and RTL where available.
6. **Final verification and audit package — pending**
   - Run the relevant project checks and available security, migration, visual, and performance verification.
   - Complete traceability reports and clearly list anything blocked or not verified.
7. **Local development path and hot reload — verified in an isolated browser**
   - Fix the 405 on profile-effect saves by routing `/delight/*` to the Delight sidecar in local development.
   - Enable Rspack HMR, proxy `/ws` to the app dev server, allow the local WebSocket through CSP, and poll the Windows-mounted source tree in development.
   - Runtime on both `localhost:8088` and `127.0.0.1:8088`: `/delight/health` returns 200; unauthenticated `PUT /delight/effects/@me` returns the sidecar's expected 401 instead of 405. The authenticated profile save was not exercised.
   - The isolated browser exposed two HMR client blockers: the dev bundle was slowly gzip-compressed, and the client targeted `localhost:3000/ws` while the app is served through `localhost:8088`. Development compression is now disabled and the client WebSocket URL targets `/ws` on the proxy port.
   - Isolated Chrome now loads the sign-in page, connects to `ws://localhost:8088/ws`, receives `hot`/`liveReload`, and completes HMR `hash`/`ok` cycles without CSP or page errors. A temporary CSS edit was observed through the browser client; the exact original source bytes were restored and the rebuilt app and sidecar health returned 200.

## Decisions

| Decision | Rationale |
|---|---|
| Pin the requested target SHA rather than silently following `upstream/main` | The requested comparison is immutable and bounded to a specific date. |
| Preserve the staged user diff in the original checkout | Existing staged edits predate this task and must not be overwritten. |
| Inspect the fork graph before choosing merge versus adaptation | The local parent diverges from the requested target. |
| Preserve Delight branding | User clarified that the actual local product identity is Delight. |
| Verify and integrate in upstream first-parent checkpoints | This provides testable intermediate states instead of one unverified final merge. |
| Add the Delight sidecar to the devcontainer stack | The app already calls `/delight/effects/@me`; the dev proxy previously fell through to the app proxy, which only accepts GET/HEAD. |
| Poll the Rspack source watcher at 1 second in development | Docker Desktop's Windows bind mount did not produce a complete source-change cycle with the default watcher; production config is unchanged. |

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

## Next Step

Checkpoint 3 and the local profile-effect/HMR fix are ready for the user's review: 96 staged paths (84 from upstream commit 55 plus 12 scoped local paths), zero conflicts, and no agent commit or push. The user must complete the merge commit before commit 56 can be merged. The overall sync is not complete: 255 post-base commits, original-stash restoration, channel chooser visual checks, and final audit/verification remain.
