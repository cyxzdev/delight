# Merge checkpoint plan

Candidate first-parent checkpoints in the verified 310-commit delta. Conflict counts are dry-run results against the original local HEAD, so they are cumulative previews, not per-stage unresolved counts. Each stage will still be tested and recorded before proceeding.

| Stage | Cumulative upstream commits | Checkpoint SHA | Commit date | Subject | Preview conflicts vs original HEAD |
|---:|---:|---|---|---|---:|
| 1 | 50 | `6de6be23581c96b33c40584948c92788f4323d12` | 2026-10-08T03:04:35+02:00 | fix(threads): open the thread menu on thread chip right-click (#3269) | 10 |
| 2 | 100 | `94f123905065ee322dcbe67809eedb294c3bad47` | 2026-10-08T20:33:20+02:00 | fix(premium): reflect limit config flags in plan comparisons (#3319) | 11 |
| 3 | 150 | `6b6ae13919f6f433b6d6178a058db12d415d208e` | 2026-10-10T20:36:02+02:00 | fix(app): apply instance branding to system DM (#3355) | 0 |
| 4 | 200 | `8bda15159674d2a95560c85408ac3fcbd7fecab3` | 2026-10-12T16:02:52+02:00 | fix(api): resolve s3 copy source under endpoint path (#3422) | 0 |
| 5 | 250 | `7c16d424ce48d34f9550d7cfce360b7b88fa6c32` | 2026-10-14T17:48:41+02:00 | fix(app): show download icon for shell updates (#3471) | 0 |
| 6 | 310 | `b8d43af1919fa0e96382577899241535c71be694` | 2026-10-19T00:25:00+02:00 | fix(app): show mention names in suggested thread titles (#3531) | 71 |

## Checkpoint after 50 commits

- SHA: `6de6be23581c96b33c40584948c92788f4323d12`
- Merge-tree exit code: 1
- Conflict preview paths: 10
- Paths:
  - `fluxer_app/src/app/router/routes/AppRoutes.tsx`
  - `fluxer_app/src/features/app/components/layout/AuthLayout.module.css`
  - `fluxer_app/src/features/app/components/layout/AuthLayout.tsx`
  - `fluxer_app/src/features/app/config/I18nDisplayConstants.ts`
  - `fluxer_app/src/features/app/config/ProductConstants.ts`
  - `fluxer_app/src/features/app/state/RuntimeConfig.ts`
  - `fluxer_app/src/features/auth/components/pages/LoginPage.module.css`
  - `fluxer_app/src/features/auth/flow/AuthCardContainer.tsx`
  - `fluxer_app/src/features/messaging/components/popouts/InboxPopout.tsx`
  - `fluxer_app/src/features/ui/components/icons/FluxerWordmark.tsx`

## Checkpoint after 100 commits

- SHA: `94f123905065ee322dcbe67809eedb294c3bad47`
- Merge-tree exit code: 1
- Conflict preview paths: 11
- Paths:
  - `fluxer_app/src/app/router/routes/AppRoutes.tsx`
  - `fluxer_app/src/features/app/components/layout/AuthLayout.module.css`
  - `fluxer_app/src/features/app/components/layout/AuthLayout.tsx`
  - `fluxer_app/src/features/app/config/I18nDisplayConstants.ts`
  - `fluxer_app/src/features/app/config/ProductConstants.ts`
  - `fluxer_app/src/features/app/state/RuntimeConfig.ts`
  - `fluxer_app/src/features/auth/components/pages/LoginPage.module.css`
  - `fluxer_app/src/features/auth/components/pages/oauth_authorize_page/state/useAuthorizeFlow.ts`
  - `fluxer_app/src/features/auth/flow/AuthCardContainer.tsx`
  - `fluxer_app/src/features/messaging/components/popouts/InboxPopout.tsx`
  - `fluxer_app/src/features/ui/components/icons/FluxerWordmark.tsx`

## Checkpoint after 150 commits

- SHA: `6b6ae13919f6f433b6d6178a058db12d415d208e`
- Merge-tree exit code: 128
- Conflict preview paths: 0
- Paths:

## Checkpoint after 200 commits

- SHA: `8bda15159674d2a95560c85408ac3fcbd7fecab3`
- Merge-tree exit code: 128
- Conflict preview paths: 0
- Paths:

## Checkpoint after 250 commits

- SHA: `7c16d424ce48d34f9550d7cfce360b7b88fa6c32`
- Merge-tree exit code: 128
- Conflict preview paths: 0
- Paths:

## Checkpoint after 310 commits

- SHA: `b8d43af1919fa0e96382577899241535c71be694`
- Merge-tree exit code: 1
- Conflict preview paths: 71
- Paths:
  - `fluxer_app/scripts/GenerateColorSystem.ts`
  - `fluxer_app/src/app/router/routes/AppRoutes.tsx`
  - `fluxer_app/src/features/app/components/BootstrapErrorScreen.tsx`
  - `fluxer_app/src/features/app/components/dialogs/components/DesktopSettingsView.tsx`
  - `fluxer_app/src/features/app/components/dialogs/shared/PermissionComponents.module.css`
  - `fluxer_app/src/features/app/components/layout/AuthLayout.module.css`
  - `fluxer_app/src/features/app/components/layout/AuthLayout.tsx`
  - `fluxer_app/src/features/app/components/pages/NotFoundPage.module.css`
  - `fluxer_app/src/features/app/components/pages/YouPage.module.css`
  - `fluxer_app/src/features/app/components/whats_new/WhatsNewModal.tsx`
  - `fluxer_app/src/features/app/config/I18nDisplayConstants.ts`
  - `fluxer_app/src/features/app/config/ProductConstants.ts`
  - `fluxer_app/src/features/app/state/RuntimeConfig.ts`
  - `fluxer_app/src/features/auth/components/pages/LoginPage.module.css`
  - `fluxer_app/src/features/auth/components/pages/oauth_authorize_page/state/useAuthorizeFlow.ts`
  - `fluxer_app/src/features/auth/flow/AuthCardContainer.tsx`
  - `fluxer_app/src/features/auth/flow/AuthPageStyles.module.css`
  - `fluxer_app/src/features/channel/components/ChannelSearchResults.module.css`
  - `fluxer_app/src/features/channel/components/modals/channel_tabs/ChannelOverviewTab.module.css`
  - `fluxer_app/src/features/guild/components/modals/AddGuildModal.module.css`
  - `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildEmojiTab.module.css`
  - `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildStickersTab.module.css`
  - `fluxer_app/src/features/guild/components/modals/guild_tabs/guild_overview_tab/GuildOverviewTab.module.css`
  - `fluxer_app/src/features/i18n/locales/ar/messages.po`
  - `fluxer_app/src/features/i18n/locales/bg/messages.po`
  - `fluxer_app/src/features/i18n/locales/cs/messages.po`
  - `fluxer_app/src/features/i18n/locales/da/messages.po`
  - `fluxer_app/src/features/i18n/locales/de/messages.po`
  - `fluxer_app/src/features/i18n/locales/el/messages.po`
  - `fluxer_app/src/features/i18n/locales/en-GB/messages.po`
  - `fluxer_app/src/features/i18n/locales/en-US/messages.po`
  - `fluxer_app/src/features/i18n/locales/es-419/messages.po`
  - `fluxer_app/src/features/i18n/locales/es-ES/messages.po`
  - `fluxer_app/src/features/i18n/locales/fi/messages.po`
  - `fluxer_app/src/features/i18n/locales/fr/messages.po`
  - `fluxer_app/src/features/i18n/locales/he/messages.po`
  - `fluxer_app/src/features/i18n/locales/hi/messages.po`
  - `fluxer_app/src/features/i18n/locales/hr/messages.po`
  - `fluxer_app/src/features/i18n/locales/hu/messages.po`
  - `fluxer_app/src/features/i18n/locales/id/messages.po`
  - `fluxer_app/src/features/i18n/locales/it/messages.po`
  - `fluxer_app/src/features/i18n/locales/ja/messages.po`
  - `fluxer_app/src/features/i18n/locales/ko/messages.po`
  - `fluxer_app/src/features/i18n/locales/lt/messages.po`
  - `fluxer_app/src/features/i18n/locales/nl/messages.po`
  - `fluxer_app/src/features/i18n/locales/no/messages.po`
  - `fluxer_app/src/features/i18n/locales/pl/messages.po`
  - `fluxer_app/src/features/i18n/locales/pt-BR/messages.po`
  - `fluxer_app/src/features/i18n/locales/ro/messages.po`
  - `fluxer_app/src/features/i18n/locales/ru/messages.po`
  - `fluxer_app/src/features/i18n/locales/sv-SE/messages.po`
  - `fluxer_app/src/features/i18n/locales/th/messages.po`
  - `fluxer_app/src/features/i18n/locales/tr/messages.po`
  - `fluxer_app/src/features/i18n/locales/uk/messages.po`
  - `fluxer_app/src/features/i18n/locales/vi/messages.po`
  - `fluxer_app/src/features/i18n/locales/zh-CN/messages.po`
  - `fluxer_app/src/features/i18n/locales/zh-TW/messages.po`
  - `fluxer_app/src/features/invite/components/modals/InviteModal.module.css`
  - `fluxer_app/src/features/messaging/components/popouts/InboxPopout.tsx`
  - `fluxer_app/src/features/theme/variables/ThemeVariableManifest.ts`
  - `fluxer_app/src/features/ui/components/icons/FluxerLogo.tsx`
  - `fluxer_app/src/features/ui/components/icons/FluxerWordmark.tsx`
  - `fluxer_app/src/features/user/components/modals/UserProfileModal.tsx`
  - `fluxer_app/src/features/user/components/modals/UserSettingsModal.tsx`
  - `fluxer_app/src/features/user/components/modals/tabs/AdvancedSettingsTab.module.css`
  - `fluxer_app/src/features/user/components/modals/tabs/LanguageTab.tsx`
  - `fluxer_app/src/features/user/components/modals/tabs/account_security_tab/DangerZoneTab.tsx`
  - `fluxer_app/src/features/user/components/modals/user_profile_modal/ProfileModalContent.tsx`
  - `fluxer_app/src/features/user/components/popouts/UserProfileBadges.tsx`
  - `fluxer_app/src/features/user/components/profile/ProfilePreview.tsx`
  - `fluxer_app/src/features/user/utils/AvatarMediaUtils.ts`
