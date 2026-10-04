// SPDX-License-Identifier: AGPL-3.0-or-later

import {useAnimatedImageUrl} from '@app/features/app/hooks/useAnimatedImageUrl';
import {GifIndicator} from '@app/features/channel/components/embeds/media/GifIndicator';
import {
	getUserMenuAvatarUrl,
	getUserMenuBannerUrl,
	UserImageMenuItems,
} from '@app/features/ui/action_menu/items/UserImageMenuItems';
import * as ContextMenuCommands from '@app/features/ui/commands/ContextMenuCommands';
import {StatusAwareAvatar} from '@app/features/ui/components/StatusAwareAvatar';
import FocusRing from '@app/features/ui/focus_ring/FocusRing';
import userProfileModalStyles from '@app/features/user/components/modals/UserProfileModal.module.css';
import {
	isKeyboardContextMenuTrigger,
	type ProfileMediaHeaderProps,
} from '@app/features/user/components/modals/user_profile_modal/UserProfileModalShared';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useCallback, useMemo} from 'react';

const OPEN_BANNER_OPTIONS_DESCRIPTOR = msg({
	message: 'Open banner options',
	comment: 'Button or menu action label in the user profile modal. Keep it concise. Keep the tone plain and specific.',
});
const OPEN_AVATAR_OPTIONS_DESCRIPTOR = msg({
	message: 'Open avatar options',
	comment: 'Button or menu action label in the user profile modal. Keep it concise.',
});

// Delight: flat banner (no avatar cut-out), avatar overlapping its bottom edge with a ring in the card colour.
const DELIGHT_MODAL_AVATAR_SIZE_PX = 80;
const DELIGHT_MODAL_AVATAR_RING_PX = 4;
const DELIGHT_MODAL_AVATAR_LEFT_PX = 16;

export const ProfileMediaHeader: React.FC<ProfileMediaHeaderProps> = observer(
	({
		user,
		profile,
		profileContext,
		previewOverrides,
		bannerColor,
		bannerUrl,
		hoverBannerUrl,
		avatarUrl,
		hoverAvatarUrl,
		renderActionButtons,
	}) => {
		const {i18n} = useLingui();
		const {
			hoverRef: bannerHoverRef,
			imageUrl: activeBannerUrl,
			showGifIndicator,
		} = useAnimatedImageUrl({
			staticUrl: bannerUrl,
			animatedUrl: hoverBannerUrl,
			kind: 'gif',
		});
		const avatarSize = DELIGHT_MODAL_AVATAR_SIZE_PX;
		const avatarContainerStyle = useMemo<React.CSSProperties>(
			() => ({
				top: -(DELIGHT_MODAL_AVATAR_SIZE_PX / 2 + DELIGHT_MODAL_AVATAR_RING_PX),
				left: DELIGHT_MODAL_AVATAR_LEFT_PX,
				borderWidth: DELIGHT_MODAL_AVATAR_RING_PX,
			}),
			[],
		);
		const menuUrlOptions = {user, profile, profileContext, previewOverrides};
		const hasAvatarMenu = Boolean(getUserMenuAvatarUrl(menuUrlOptions));
		const hasBannerMenu = Boolean(getUserMenuBannerUrl(menuUrlOptions));
		const renderAvatarMenu = useCallback(
			({onClose}: {onClose: () => void}) => (
				<UserImageMenuItems
					user={user}
					profile={profile}
					profileContext={profileContext}
					previewOverrides={previewOverrides}
					onClose={onClose}
					variant="avatar"
					data-flx="user.user-profile-modal.render-avatar-menu.user-image-menu-items"
				/>
			),
			[user, profile, profileContext, previewOverrides],
		);
		const renderBannerMenu = useCallback(
			({onClose}: {onClose: () => void}) => (
				<UserImageMenuItems
					user={user}
					profile={profile}
					profileContext={profileContext}
					previewOverrides={previewOverrides}
					onClose={onClose}
					variant="banner"
					data-flx="user.user-profile-modal.render-banner-menu.user-image-menu-items"
				/>
			),
			[user, profile, profileContext, previewOverrides],
		);
		const handleImageContextMenu = useCallback(
			(
				event: React.MouseEvent<HTMLElement>,
				hasMenu: boolean,
				renderMenu: (props: {onClose: () => void}) => React.ReactNode,
			) => {
				if (!hasMenu) return;
				ContextMenuCommands.openFromEvent(event, renderMenu);
			},
			[],
		);
		const handleImageKeyDown = useCallback(
			(
				event: React.KeyboardEvent<HTMLElement>,
				hasMenu: boolean,
				renderMenu: (props: {onClose: () => void}) => React.ReactNode,
			) => {
				if (!hasMenu || !isKeyboardContextMenuTrigger(event)) return;
				event.preventDefault();
				event.stopPropagation();
				ContextMenuCommands.openForElement(event.currentTarget, renderMenu);
			},
			[],
		);
		const bannerContent = (
			<div
				className={userProfileModalStyles.bannerImage}
				style={{
					// Delight: a plain colour banner is toned into the card surface; images stay as-is.
					backgroundColor: activeBannerUrl
						? bannerColor
						: `color-mix(in srgb, ${bannerColor} 55%, var(--background-tertiary))`,
					...(activeBannerUrl ? {backgroundImage: `url(${activeBannerUrl})`} : {}),
				}}
				data-flx="user.user-profile-modal.profile-media-header.div"
			/>
		);
		const avatarContent = (
			<StatusAwareAvatar
				size={avatarSize}
				user={user}
				avatarUrl={avatarUrl}
				hoverAvatarUrl={hoverAvatarUrl}
				forceAnimate
				forceAnimateIgnoringSettings
				data-flx="user.user-profile-modal.profile-media-header.status-aware-avatar"
			/>
		);
		return (
			<header data-flx="user.user-profile-modal.profile-media-header.header">
				<FocusRing enabled={hasBannerMenu} data-flx="user.user-profile-modal.profile-media-header.focus-ring">
					{/* biome-ignore lint/a11y/noStaticElementInteractions: the banner only takes role="button"/tabIndex when an image menu exists, and the element stays mounted either way so the banner image is never refetched. */}
					{/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label is set only alongside role="button". */}
					<div
						ref={bannerHoverRef}
						className={userProfileModalStyles.bannerContainer}
						onContextMenu={
							hasBannerMenu ? (event) => handleImageContextMenu(event, hasBannerMenu, renderBannerMenu) : undefined
						}
						onKeyDown={
							hasBannerMenu ? (event) => handleImageKeyDown(event, hasBannerMenu, renderBannerMenu) : undefined
						}
						role={hasBannerMenu ? 'button' : undefined}
						tabIndex={hasBannerMenu ? 0 : undefined}
						aria-label={hasBannerMenu ? i18n._(OPEN_BANNER_OPTIONS_DESCRIPTOR) : undefined}
						data-flx="user.user-profile-modal.profile-media-header.button.image-key-down"
					>
						{bannerContent}
						{showGifIndicator && <GifIndicator data-flx="user.user-profile-modal.profile-media-header.gif-indicator" />}
					</div>
				</FocusRing>
				<div
					className={userProfileModalStyles.headerContainer}
					data-flx="user.user-profile-modal.profile-media-header.div--3"
				>
					<FocusRing
						enabled={hasAvatarMenu}
						ringClassName={userProfileModalStyles.avatarFocusRing}
						data-flx="user.user-profile-modal.profile-media-header.focus-ring--2"
					>
						{/* biome-ignore lint/a11y/noStaticElementInteractions: the avatar frame only takes role="button"/tabIndex when an image menu exists, and the element stays mounted either way so the avatar is never refetched. */}
						{/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-label is set only alongside role="button". */}
						<div
							className={userProfileModalStyles.avatarContainer}
							style={avatarContainerStyle}
							onContextMenu={
								hasAvatarMenu ? (event) => handleImageContextMenu(event, hasAvatarMenu, renderAvatarMenu) : undefined
							}
							onKeyDown={
								hasAvatarMenu ? (event) => handleImageKeyDown(event, hasAvatarMenu, renderAvatarMenu) : undefined
							}
							role={hasAvatarMenu ? 'button' : undefined}
							tabIndex={hasAvatarMenu ? 0 : undefined}
							aria-label={hasAvatarMenu ? i18n._(OPEN_AVATAR_OPTIONS_DESCRIPTOR) : undefined}
							data-flx="user.user-profile-modal.profile-media-header.button.image-key-down--2"
						>
							{avatarContent}
						</div>
					</FocusRing>
					<div
						className={userProfileModalStyles.actionButtonsContainer}
						data-flx="user.user-profile-modal.profile-media-header.div--5"
					>
						{renderActionButtons()}
					</div>
				</div>
			</header>
		);
	},
);
