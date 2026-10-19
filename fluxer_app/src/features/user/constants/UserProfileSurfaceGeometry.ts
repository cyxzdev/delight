// SPDX-License-Identifier: AGPL-3.0-or-later

import {remFromPx} from '@app/features/theme/layout/RemFromPx';

type CssLengthVariables = Record<`--${string}`, string>;

const PROFILE_POPOUT_AVATAR_SIZE_PX = 80;
const PROFILE_MODAL_AVATAR_SIZE_PX = 96;
// Delight: no ring/notch around profile avatars — the avatar sits straight on the banner edge.
const PROFILE_POPOUT_AVATAR_BORDER_PX = 0;
const PROFILE_MODAL_AVATAR_BORDER_PX = 0;
const PROFILE_POPOUT_AVATAR_LEFT_PX = 10;
// Delight: compact banners with the avatar centred on the banner's bottom edge.
const PROFILE_POPOUT_BANNER_HEIGHT_PX = 90;
const PROFILE_MODAL_AVATAR_LEFT_PX = 16;
const PROFILE_POPOUT_AVATAR_OUTER_RADIUS_PX = PROFILE_POPOUT_AVATAR_SIZE_PX / 2 + PROFILE_POPOUT_AVATAR_BORDER_PX;
const PROFILE_POPOUT_AVATAR_TOP_PX = PROFILE_POPOUT_BANNER_HEIGHT_PX - PROFILE_POPOUT_AVATAR_OUTER_RADIUS_PX;
const PROFILE_MODAL_AVATAR_OUTER_RADIUS_PX = PROFILE_MODAL_AVATAR_SIZE_PX / 2 + PROFILE_MODAL_AVATAR_BORDER_PX;

export const PROFILE_POPOUT_GEOMETRY = {
	contentWidthPx: 300,
	contentHeightPx: 520,
	borderWidthPx: 1,
	avatarSizePx: PROFILE_POPOUT_AVATAR_SIZE_PX,
	avatarBorderPx: PROFILE_POPOUT_AVATAR_BORDER_PX,
	avatarLeftPx: PROFILE_POPOUT_AVATAR_LEFT_PX,
	avatarTopPx: PROFILE_POPOUT_AVATAR_TOP_PX,
	bannerHeightPx: PROFILE_POPOUT_BANNER_HEIGHT_PX,
	headerHeightPx: Math.ceil(PROFILE_POPOUT_BANNER_HEIGHT_PX + PROFILE_POPOUT_AVATAR_OUTER_RADIUS_PX) + 2,
} as const;

export const PROFILE_POPOUT_BANNER_AVATAR_CUTOUT = {
	viewBoxWidthPx: PROFILE_POPOUT_GEOMETRY.contentWidthPx,
	viewBoxHeightPx: PROFILE_POPOUT_GEOMETRY.bannerHeightPx,
	cx: PROFILE_POPOUT_AVATAR_LEFT_PX + PROFILE_POPOUT_AVATAR_OUTER_RADIUS_PX,
	cy: PROFILE_POPOUT_AVATAR_TOP_PX + PROFILE_POPOUT_AVATAR_OUTER_RADIUS_PX,
	r: 0,
} as const;

// Delight: the full profile modal shows a Discord-style profile card column (~370px wide) next to its tabs; the
// banner/avatar geometry is laid out at that width (the header scales with the measured banner width).
export const PROFILE_MODAL_CARD_WIDTH_PX = 370;

export const PROFILE_MODAL_GEOMETRY = {
	bannerViewBoxWidthPx: PROFILE_MODAL_CARD_WIDTH_PX,
	bannerViewBoxHeightPx: 120,
	avatarSizePx: PROFILE_MODAL_AVATAR_SIZE_PX,
	avatarBorderPx: PROFILE_MODAL_AVATAR_BORDER_PX,
	avatarLeftPx: PROFILE_MODAL_AVATAR_LEFT_PX,
	avatarTopPx: -PROFILE_MODAL_AVATAR_OUTER_RADIUS_PX,
} as const;

export const PROFILE_MODAL_BANNER_AVATAR_CUTOUT = {
	viewBoxWidthPx: PROFILE_MODAL_GEOMETRY.bannerViewBoxWidthPx,
	viewBoxHeightPx: PROFILE_MODAL_GEOMETRY.bannerViewBoxHeightPx,
	cx: PROFILE_MODAL_GEOMETRY.avatarLeftPx + PROFILE_MODAL_AVATAR_OUTER_RADIUS_PX,
	cy: PROFILE_MODAL_GEOMETRY.bannerViewBoxHeightPx,
	r: 0,
} as const;
export const PROFILE_POPOUT_GEOMETRY_STYLE: CssLengthVariables = {
	'--profile-popout-content-width': remFromPx(PROFILE_POPOUT_GEOMETRY.contentWidthPx),
	'--profile-popout-content-height': remFromPx(PROFILE_POPOUT_GEOMETRY.contentHeightPx),
	'--profile-popout-border-width': remFromPx(PROFILE_POPOUT_GEOMETRY.borderWidthPx),
	'--profile-popout-avatar-size': remFromPx(PROFILE_POPOUT_GEOMETRY.avatarSizePx),
	'--profile-popout-avatar-border': remFromPx(PROFILE_POPOUT_GEOMETRY.avatarBorderPx),
	'--profile-popout-avatar-left': remFromPx(PROFILE_POPOUT_GEOMETRY.avatarLeftPx),
	'--profile-popout-avatar-top': remFromPx(PROFILE_POPOUT_GEOMETRY.avatarTopPx),
	'--profile-popout-banner-height': remFromPx(PROFILE_POPOUT_GEOMETRY.bannerHeightPx),
	'--profile-popout-header-height': remFromPx(PROFILE_POPOUT_GEOMETRY.headerHeightPx),
};

export const PROFILE_MODAL_GEOMETRY_STYLE: CssLengthVariables = {
	'--profile-modal-avatar-size': remFromPx(PROFILE_MODAL_GEOMETRY.avatarSizePx),
	'--profile-modal-avatar-border': remFromPx(PROFILE_MODAL_GEOMETRY.avatarBorderPx),
	'--profile-modal-avatar-left': remFromPx(PROFILE_MODAL_GEOMETRY.avatarLeftPx),
	'--profile-modal-avatar-top': remFromPx(PROFILE_MODAL_GEOMETRY.avatarTopPx),
};
