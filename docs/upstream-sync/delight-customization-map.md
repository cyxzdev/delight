# Delight customization and upstream impact map

The user confirmed that Delight is the intended local product identity. Preserve its branding and custom behavior. This map is generated from Git history and path overlap; individual conflict decisions still require review.

## Verified ancestry

- Common base: `f3c777b2446961352b7153a19e347c26ec74ba8e`.
- Upstream target: `b8d43af1919fa0e96382577899241535c71be694`.
- Local HEAD: `7ca7ebee85d16101c6430a25a7083ea4d03bff7f`.
- Upstream commits already in common ancestry from the requested range: 251.
- Upstream first-parent commits after the common base and through target: 310.
- Local-only commits after the common base, including HEAD: 34.
- Distinct incoming endpoint paths from the common base: 7094.
- Distinct local endpoint paths from the common base: 347.
- Same-path overlap between the incoming endpoint diff and local fork diff: 131 paths.

## Local Delight customizations

The 34 local-only commits establish and refine the Delight palette, logos and application branding, English and translated UI strings, default avatars/icons, removal of visible Fluxer names/links, auth and app chrome, custom friends/settings/developer portal/profile surfaces, stored profile effects and badges, and Railway deployment/service configuration. Exact commit and path traceability is in the local-only history below.

| Commit | Date | Subject |
|---|---|---|
| `f4384b8495509b9189d575a579234ae78c9506a1` | 2026-10-04T16:18:15+03:00 | Delight foundation: neutral #141414 palette with #7F49B4 accent, Inter, tighter radii; own app build served by app-proxy; branding assets; community setup script |
| `c05d0402673d788aabd252f9146bf13b211dc96a` | 2026-10-04T16:19:22+03:00 | Delight design brief and per-agent screenshot browsers |
| `5eed63f26b32c5196393ef540fca4074c9d1eae6` | 2026-10-04T16:23:32+03:00 | Rebrand to Delight: UI strings in all locales, product name fallbacks, page meta, default avatars and web icons |
| `a782dfd9d249c1731ad5b53e64904ed961963757` | 2026-10-04T16:25:22+03:00 | New accounts auto-join the Delight community (invite: delight) |
| `0fa81afc59fff3eaf9c314450523204ca2f6accc` | 2026-10-04T16:40:33+03:00 | Links and mentions in Delight purple |
| `1c0372cdf6358b4264e52cc83abf4e5353922289` | 2026-10-04T16:49:47+03:00 | Delight redesign across the whole app |
| `cf6bd49545bf86fac185bf15e9c9b75df07727df` | 2026-10-04T17:19:20+03:00 | Rounder corners again (tokens, inset rounded composer and user card); remove remaining visible Fluxer mentions and upstream links (download/help buttons, desktop banner, status/Bluesky, weblate, support emails, Plutonium name) |
| `743f51ee7c0eaaee4476682e7cfaf0f31e08a878` | 2026-10-04T17:28:39+03:00 | Remove the left-edge bars on selected rows (channels, DMs, settings nav, inbox tabs, autocomplete) |
| `1cd9906839b602c378a8fa3acd8c17eb62d6f178` | 2026-10-04T17:35:22+03:00 | Top bars: one 48px header height everywhere, fix channel header content sitting high (padding shorthand), no gap above member list, Active now gets a real header bar; banners become a short rounded card under a plain header; remove the server icon toolbar (actions live in the server dropdown) |
| `80a03c4effbb2828ab09e1dfbb6926385b784174` | 2026-10-04T17:52:15+03:00 | Discord proportions: 72px rail outside a rounded-corner main panel, 260px sidebar with invite button and full-bleed banner, user card spanning rail+sidebar, 16px text, 240px member list, aligned composer |
| `463870fbb6d7e79639a0797cd76bac4652e39891` | 2026-10-04T17:56:12+03:00 | 32px title strip above the app (like Discord's window bar) showing the current server or page |
| `dd58d0a2a405f48265d4c5f1142c37fdc9a0fbd2` | 2026-10-04T18:03:54+03:00 | Back to the base app's compact layout, sizes and corners; higher-contrast palette (wider surface and text ranges, brighter purple); keep Delight branding, removed upstream links, auth page and title strip |
| `0a1d4b09b0b4aac18bf799215025342f2da6ae2a` | 2026-10-04T18:06:03+03:00 | Rounded top-left corner on the main panel on the web too |
| `169c0c8120906d4100c00cb6c2810a9361de2b1b` | 2026-10-04T19:16:38+03:00 | Delight surfaces: friends/DMs, settings (grouped cards, pill tabs), developer portal at /developers, discovery/inbox/search/modals; profiles with left avatar, anchored popout motion, profile effects with picker, server-side effect storage (delight-svc) and 10 first-draft effects |
| `894d3b4557a5c453463f1d646a2ce667c980a9d9` | 2026-10-04T19:48:41+03:00 | Rebuild all ten profile effects as full illustrated frames at Spark Surge quality; updated descriptions |
| `4a0c4bba47bf6208bfe3c6bb16b9efb4d2af50c1` | 2026-10-04T20:43:07+03:00 | Sticker profile badges (OG + 9 generated) with staff-managed storage, CLI and Manage badges menu; Gilded Banner effect; remove remaining visible upstream name (manifest, inflected translations, verification wording, admin app name, admin panel via rebrand proxy); docs link points to the developer portal |
| `1d173ab32418a3d9d5580327905982d2b4f5c417` | 2026-10-04T20:51:23+03:00 | Badges without faces (same sticker style, drips kept); OG unchanged |
| `02c5b5c6d46e19f5b6ebac6816f7ea09af1543e2` | 2026-10-04T20:54:48+03:00 | Gilded Banner: remove the rays and arcs across the middle; keep crest, side trims and hem |
| `c37ee5014da51efc559c3f66dea9315c905cac64` | 2026-10-04T20:57:12+03:00 | Badge chip is frosted glass so it adapts to the profile effect/banner underneath |
| `da33e6900f0b2a63341800b4f8f54103fbcc8996` | 2026-10-04T20:59:44+03:00 | Badges inline after the username in a compact frosted chip (popout, user-area popout, preview); modal chip matches |
| `dc7bf035418c08686099bc52dedba9946334aa3c` | 2026-10-04T21:46:43+03:00 | Profile frames (5, illustrated) with picker and server storage; Discord-style two-column full profile; effects fade on hover and fit the profile card; frame no longer affects shadows |
| `1ce8e78bfe5e05d1ea31308638cd3b987134539a` | 2026-10-04T21:50:33+03:00 | Eclipse frame becomes Blazing Sun: a glowing sun over the smoke instead of the black disc |
| `2a233985804a5db0f54b313b437bd6b6690dedc0` | 2026-10-04T21:52:11+03:00 | Remove the ring/notch around profile avatars everywhere (popouts, modal card, mobile sheet, skeletons) |
| `233e6271c8f7de956770b5f2ab76f4f8703edc66` | 2026-10-04T21:56:24+03:00 | Frames are no longer clipped in the bottom-left user popout (framed popouts allow overflow) |
| `5220da36192cff669b2fe1ee3a6d32f92d0b47e3` | 2026-10-05T15:07:58+03:00 | Angelic premium collection: 5 video profile effects (sunburst art animated with MiniMax-H3), premium-gated for subscribers/staff, picker sections |
| `b39777d43c695dfc0355eb33bc0ede522de7e0f4` | 2026-10-05T15:22:42+03:00 | Video effects no longer stretch the profile: beat the global video height:auto rule and clip effect layers to the card |
| `9ac4db17b2cfd4fab9b1499c3b7ba57356ba2955` | 2026-10-05T15:32:42+03:00 | Disable the Angelic collection (hidden from the picker, refused by the sidecar, never shown); assets and code kept |
| `d2a15c56ecc616b176de5bc34ef794a16883f05c` | 2026-10-09T21:53:35+03:00 | Railway deployment: Dockerfiles for the web app, edge, bundled Rust services, Delight sidecars and SeaweedFS |
| `c269ebe74b7c1b08cec79447095a1451bf778fc6` | 2026-10-09T22:01:15+03:00 | Railway: bare service names (Railway DNS search domain), LiveKit over the TCP proxy |
| `ccb968ba916557d46639777625248932ca03301c` | 2026-10-09T22:24:52+03:00 | Railway: pin upstream image digests, restore-on-start for migrated data |
| `4c065a77d319ab7cb86b2da37365914dbbde86c8` | 2026-10-09T22:48:25+03:00 | Railway app build: skip pnpm's workspace deps check (only fluxer_app's deps are installed) |
| `20e3d0599ef4cb52f21035980d9c18decebd5c8f` | 2026-10-09T22:51:32+03:00 | Railway app build: copy exactly what upstream's app-proxy image copies |
| `50c80dc727dfb83366415c5382bce2ea1900c213` | 2026-10-09T22:53:08+03:00 | Railway app build: turn off pnpm's deps check before scripts |
| `7ca7ebee85d16101c6430a25a7083ea4d03bff7f` | 2026-10-09T23:07:00+03:00 | LiveKit on Railway: bridge ICE-TCP to the container address, not loopback |

## Incoming path counts by broad subsystem (heuristic)

These buckets are discovery aids and can overlap in behavior; they are not commit dispositions.

| Area | Distinct endpoint paths |
|---|---:|
| API and backend services | 834 |
| Administration and moderation | 169 |
| Authentication and account recovery | 349 |
| Billing and subscriptions | 128 |
| Desktop | 658 |
| Frontend and client behavior | 1888 |
| Gateway and realtime events | 387 |
| Infrastructure and deployment | 90 |
| Media and storage | 357 |
| Message service | 7 |
| Notifications and push | 75 |
| Other / cross-cutting | 320 |
| Shared contracts and common libraries | 666 |
| Tests and verification | 374 |
| Threads and forums | 208 |
| Voice, video, and screen share | 472 |
| Webhooks and bots | 112 |

## Candidate merge checkpoints

Use only verified first-parent commits. Each completed checkpoint requires targeted tests and a progress record before the next checkpoint.

| Cutoff | Checkpoint SHA | Commit date | Subject | First-parent commits from common base |
|---|---|---|---|---:|
| 2026-10-09T00:00:00Z | `82abd03a371c85a5194deadcf0c1bdc0564dad0b` | 2026-10-09T01:41:47+02:00 | feat(reports): delete reports and configure retention (#3338) | 118 |
| 2026-10-14T00:00:00Z | `f509bef1fb0f481d46f9797e4b8180d0ea7cc3af` | 2026-10-14T00:37:40+02:00 | fix(app): keep push-to-talk release delays above 500 ms (#3453) | 231 |

## Same-path overlaps requiring review

- `deploy/self-hosting/Caddyfile`
- `fluxer_app/index.html`
- `fluxer_app/scripts/GenerateColorSystem.ts`
- `fluxer_app/scripts/build/rspack/static-files.mjs`
- `fluxer_app/src/app/router/routes/AppRoutes.tsx`
- `fluxer_app/src/features/accessibility/state/Accessibility.ts`
- `fluxer_app/src/features/app/components/BootstrapErrorScreen.tsx`
- `fluxer_app/src/features/app/components/dialogs/components/DesktopSettingsView.module.css`
- `fluxer_app/src/features/app/components/dialogs/components/DesktopSettingsView.tsx`
- `fluxer_app/src/features/app/components/dialogs/components/SettingsModalHeader.tsx`
- `fluxer_app/src/features/app/components/dialogs/shared/PermissionComponents.module.css`
- `fluxer_app/src/features/app/components/dialogs/shared/SettingsModalLayout.module.css`
- `fluxer_app/src/features/app/components/dialogs/shared/SettingsModalLayout.tsx`
- `fluxer_app/src/features/app/components/floating/UserAreaPopout.module.css`
- `fluxer_app/src/features/app/components/floating/UserAreaPopout.tsx`
- `fluxer_app/src/features/app/components/layout/AuthLayout.module.css`
- `fluxer_app/src/features/app/components/layout/AuthLayout.tsx`
- `fluxer_app/src/features/app/components/layout/GuildsLayout.module.css`
- `fluxer_app/src/features/app/components/layout/GuildsLayout.tsx`
- `fluxer_app/src/features/app/components/layout/app_layout/AppLayoutHooks.ts`
- `fluxer_app/src/features/app/components/pages/NotFoundPage.module.css`
- `fluxer_app/src/features/app/components/pages/YouPage.module.css`
- `fluxer_app/src/features/app/components/pages/YouPage.tsx`
- `fluxer_app/src/features/app/components/skeleton/SkeletonLayoutMemory.ts`
- `fluxer_app/src/features/app/components/whats_new/WhatsNewModal.tsx`
- `fluxer_app/src/features/app/config/I18nDisplayConstants.ts`
- `fluxer_app/src/features/app/config/ProductConstants.ts`
- `fluxer_app/src/features/app/state/RuntimeConfig.ts`
- `fluxer_app/src/features/auth/commands/OAuth2AuthorizationCommands.ts`
- `fluxer_app/src/features/auth/components/pages/LoginPage.module.css`
- `fluxer_app/src/features/auth/components/pages/oauth_authorize_page/state/useAuthorizeFlow.ts`
- `fluxer_app/src/features/auth/flow/AuthCardContainer.tsx`
- `fluxer_app/src/features/auth/flow/AuthPageStyles.module.css`
- `fluxer_app/src/features/auth/flow/DesktopDeepLinkPrompt.tsx`
- `fluxer_app/src/features/channel/components/ChannelHeader.module.css`
- `fluxer_app/src/features/channel/components/ChannelHeader.tsx`
- `fluxer_app/src/features/channel/components/ChannelSearchResults.module.css`
- `fluxer_app/src/features/channel/components/direct_message/AddFriendView.module.css`
- `fluxer_app/src/features/channel/components/direct_message/DMListItem.tsx`
- `fluxer_app/src/features/channel/components/direct_message/DMWelcomeSection.tsx`
- `fluxer_app/src/features/channel/components/direct_message/DirectMessageList.module.css`
- `fluxer_app/src/features/channel/components/friends/FriendListItem.module.css`
- `fluxer_app/src/features/channel/components/friends/FriendListItem.tsx`
- `fluxer_app/src/features/channel/components/modals/channel_tabs/ChannelInvitesTab.module.css`
- `fluxer_app/src/features/channel/components/modals/channel_tabs/ChannelOverviewTab.module.css`
- `fluxer_app/src/features/channel/components/modals/channel_tabs/ChannelOverviewTab.tsx`
- `fluxer_app/src/features/channel/components/modals/channel_tabs/ChannelPermissionsTab.module.css`
- `fluxer_app/src/features/channel/components/modals/channel_tabs/ChannelWebhooksTab.module.css`
- `fluxer_app/src/features/discovery/discovery/DiscoveryGuildCard.tsx`
- `fluxer_app/src/features/guild/components/modals/AddGuildModal.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildAuditLogTab.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildDiscoveryTab.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildEmojiTab.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildInvitesTab.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildModerationTab.tsx`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildRolesTab.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/GuildStickersTab.module.css`
- `fluxer_app/src/features/guild/components/modals/guild_tabs/MemberListStyles.module.css`
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
- `fluxer_app/src/features/invite/components/modals/InviteAcceptModal.tsx`
- `fluxer_app/src/features/invite/components/modals/InviteModal.module.css`
- `fluxer_app/src/features/invite/components/modals/InviteModal.tsx`
- `fluxer_app/src/features/messaging/components/popouts/InboxPopout.tsx`
- `fluxer_app/src/features/theme/variables/ThemeVariableManifest.ts`
- `fluxer_app/src/features/ui/components/icons/FluxerLogo.tsx`
- `fluxer_app/src/features/ui/components/icons/FluxerWordmark.tsx`
- `fluxer_app/src/features/ui/popover/PopoverPopouts.tsx`
- `fluxer_app/src/features/user/components/modals/UserProfileMobileSheet.module.css`
- `fluxer_app/src/features/user/components/modals/UserProfileMobileSheet.tsx`
- `fluxer_app/src/features/user/components/modals/UserProfileModal.module.css`
- `fluxer_app/src/features/user/components/modals/UserProfileModal.tsx`
- `fluxer_app/src/features/user/components/modals/UserSettingsModal.module.css`
- `fluxer_app/src/features/user/components/modals/UserSettingsModal.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/AdvancedSettingsTab.module.css`
- `fluxer_app/src/features/user/components/modals/tabs/LanguageTab.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/MyProfileTab.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/UserVoiceTab.module.css`
- `fluxer_app/src/features/user/components/modals/tabs/account_security_tab/DangerZoneTab.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/applications_tab/ApplicationsList.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/applications_tab/ApplicationsTab.module.css`
- `fluxer_app/src/features/user/components/modals/tabs/applications_tab/application_detail/ApplicationDetail.module.css`
- `fluxer_app/src/features/user/components/modals/tabs/component_gallery_tab/MarkdownTab.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/components/EntranceSoundSection.module.css`
- `fluxer_app/src/features/user/components/modals/tabs/my_profile_tab/AccentColorPicker.tsx`
- `fluxer_app/src/features/user/components/modals/tabs/notifications_tab/Notifications.tsx`
- `fluxer_app/src/features/user/components/modals/user_profile_modal/ProfileModalContent.tsx`
- `fluxer_app/src/features/user/components/modals/user_profile_modal/UserProfileModalShared.ts`
- `fluxer_app/src/features/user/components/popouts/UserProfileBadges.module.css`
- `fluxer_app/src/features/user/components/popouts/UserProfileBadges.tsx`
- `fluxer_app/src/features/user/components/popouts/UserProfilePopout.module.css`
- `fluxer_app/src/features/user/components/popouts/UserProfilePopout.tsx`
- `fluxer_app/src/features/user/components/profile/ProfilePreview.tsx`
- `fluxer_app/src/features/user/components/profile/UserProfileLoadingSkeleton.module.css`
- `fluxer_app/src/features/user/components/profile/profile_card/ProfileCardBanner.tsx`
- `fluxer_app/src/features/user/constants/UserProfileSurfaceGeometry.ts`
- `fluxer_app/src/features/user/utils/AvatarMediaUtils.ts`
- `fluxer_app/src/index.tsx`

No overlap is automatically treated as a conflict resolution; inspect semantic changes before selecting content.
