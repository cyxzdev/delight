# Conflict resolution log

The active integration is happening in the user's project checkout at `D:\Haze\delight`, on branch `delight`. The requested upstream range remains pinned to `f32356801d569afd570c5a8357d38fa932a44c69..b8d43af1919fa0e96382577899241535c71be694` (561 commits total). The first verified integration checkpoint is `6de6be23581c96b33c40584948c92788f4323d12`, 50 first-parent commits after the common base. User identity decision: preserve Delight branding and design.

The original 11 staged user paths are preserved in `stash@{0}` with their staged state. They have not been included in the upstream integration commit and must be restored after the checkpoint sequence, resolving any overlap without losing either side. The user committed and pushed checkpoints 2 and 3; no deployment has occurred.

## Checkpoint 1 conflict decisions

| Path | Resolution | Evidence |
|---|---|---|
| `fluxer_app/src/app/router/routes/AppRoutes.tsx` | Kept Delight's Developer Portal routes and integrated the upstream Thread Panel route; removed imports made unused by the combined routing. | App typecheck passes. |
| `fluxer_app/src/features/auth/components/AuthLayout.module.css` | Kept Delight's split-panel layout and added the upstream transition classes needed by the new auth flow. | Existing brand panel rules remain in the file; app typecheck passes. |
| `fluxer_app/src/features/auth/components/AuthLayout.tsx` | Integrated the upstream auth transition/runtime behavior into Delight's existing layout. | App typecheck and full app tests pass. |
| `fluxer_app/src/features/app/config/I18nDisplayConstants.ts` | Preserved Delight's display strings and supplied the upstream example username constant required by the updated UI. | App typecheck passes. |
| `fluxer_app/src/features/app/config/ProductConstants.ts` | Kept Delight/Premium defaults, safely typed the optional bootstrap branding data, and retained explicit runtime branding overrides. | Typecheck passes; PremiumUtils tests pass. |
| `fluxer_app/src/features/app/config/RuntimeConfig.ts` | Used the upstream runtime snapshot structure while preserving Delight/Premium defaults. | App typecheck and full app tests pass. |
| `fluxer_app/src/features/auth/pages/LoginPage.module.css` | Preserved Delight-specific auth styling while adding upstream-compatible transition styles. | Existing split layout remains present; app typecheck passes. |
| `fluxer_app/src/features/auth/components/AuthCardContainer.tsx` | Combined upstream fullscreen/transition support with Delight's spark mark and product name. | App typecheck passes; Delight branding remains in the component. |
| `fluxer_app/src/features/inbox/components/InboxPopout.tsx` | Preserved the local `INBOX_DESCRIPTOR` behavior and integrated upstream unread-channel marking. | App typecheck and full app tests pass. |
| `fluxer_app/src/components/common/FluxerWordmark.tsx` | Preserved Delight symbol/brand behavior while retaining upstream snapshot and URL behavior. | App typecheck passes. |

## Checkpoint 1 validation

- Merge target: `6de6be23581c96b33c40584948c92788f4323d12`.
- Unresolved index conflicts: 0.
- `pnpm --filter fluxer_app run typecheck:only`: passed.
- `pnpm --filter fluxer_app run test -- --maxWorkers=4 --testTimeout=60000`: passed, 101 test files and 1,392 tests.
- The channel-type chooser renders an icon, label, and description for each option within the existing radio-group modal.
- Checkpoint commit `5d13a9c03` is local to `D:\Haze\delight`; no push or deployment has occurred.

The full initial same-path overlap inventory is in [the Delight customization map](delight-customization-map.md). Continue adding semantic conflict decisions here for later checkpoints.

## Checkpoint 4 conflict decisions

| Path | Resolution | Evidence |
|---|---|---|
| `fluxer_app/src/features/auth/components/pages/oauth_authorize_page/state/useAuthorizeFlow.ts` | Kept Delight's `displayApplicationName()` for the OAuth client label and incorporated upstream's `getActiveInstanceProductName()` for the session-expired message. | App typecheck and affected app tests pass. |
| `fluxer_desktop/src/main/Updater.test.mjs` | Took the upstream test rewrite. The local Windows permission-mode skip covered an AppImage test removed by the upstream update-gate rewrite; retaining the old file would test a path the new updater no longer uses. | All 22 affected desktop test files pass (382 tests). |

Desktop test portability fixes normalize CRLF before checking source text and normalize `path.relative()` output to `/` before comparing module IDs. These changes are test-only; application source behavior is unchanged by them.
