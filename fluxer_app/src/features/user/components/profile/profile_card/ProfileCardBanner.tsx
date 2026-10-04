// SPDX-License-Identifier: AGPL-3.0-or-later

import {useAnimatedImageUrl} from '@app/features/app/hooks/useAnimatedImageUrl';
import {GifIndicator} from '@app/features/channel/components/embeds/media/GifIndicator';
import {remFromPx} from '@app/features/theme/layout/RemFromPx';
import {StatusAwareAvatar} from '@app/features/ui/components/StatusAwareAvatar';
import FocusRing from '@app/features/ui/focus_ring/FocusRing';
import styles from '@app/features/user/components/profile/profile_card/ProfileCardBanner.module.css';
import type {User} from '@app/features/user/models/User';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useMemo} from 'react';

// Delight: a short flat banner with the avatar overlapping its bottom edge, ringed in the card colour.
const DELIGHT_BANNER_HEIGHT_PX = 60;
const DELIGHT_AVATAR_SIZE_PX = 56;
const DELIGHT_AVATAR_RING_PX = 4;
const DELIGHT_HEADER_HEIGHT_PX = DELIGHT_BANNER_HEIGHT_PX + DELIGHT_AVATAR_SIZE_PX / 2 + DELIGHT_AVATAR_RING_PX;

interface ProfileCardBannerProps {
	bannerUrl: string | null;
	hoverBannerUrl?: string | null;
	bannerColor: string;
	user: User;
	avatarUrl: string | null;
	hoverAvatarUrl: string | null;
	disablePresence?: boolean;
	isClickable?: boolean;
	onAvatarClick?: () => void;
	onAvatarContextMenu?: (event: React.MouseEvent) => void;
	onBannerContextMenu?: (event: React.MouseEvent) => void;
	headerHeight?: number;
}

export const ProfileCardBanner: React.FC<ProfileCardBannerProps> = observer(
	({
		bannerUrl,
		hoverBannerUrl,
		bannerColor,
		user,
		avatarUrl,
		hoverAvatarUrl,
		disablePresence = false,
		isClickable = true,
		onAvatarClick,
		onAvatarContextMenu,
		onBannerContextMenu,
		headerHeight = DELIGHT_HEADER_HEIGHT_PX,
	}) => {
		const bannerHeight = DELIGHT_BANNER_HEIGHT_PX;
		const headerStyle = useMemo<React.CSSProperties>(() => ({height: remFromPx(headerHeight)}), [headerHeight]);
		const bannerWrapperStyle = useMemo<React.CSSProperties>(
			() => ({height: remFromPx(bannerHeight), minHeight: remFromPx(bannerHeight)}),
			[bannerHeight],
		);
		const {
			hoverRef: bannerHoverRef,
			imageUrl: activeBannerUrl,
			showGifIndicator,
		} = useAnimatedImageUrl({
			staticUrl: bannerUrl,
			animatedUrl: hoverBannerUrl,
			kind: 'gif',
		});
		const bannerStyle = useMemo<React.CSSProperties>(
			() => ({
				height: '100%',
				// Delight: a plain colour banner is toned down into the card surface; images stay as-is.
				backgroundColor: activeBannerUrl
					? bannerColor
					: `color-mix(in srgb, ${bannerColor} 55%, var(--profile-card-surface, var(--background-tertiary)))`,
				...(activeBannerUrl ? {backgroundImage: `url(${activeBannerUrl})`} : {}),
			}),
			[activeBannerUrl, bannerColor],
		);
		return (
			<header
				className={styles.headerSection}
				style={headerStyle}
				data-flx="user.profile.profile-card.profile-card-banner.header-section"
			>
				<div
					ref={bannerHoverRef}
					role="group"
					className={styles.bannerWrapper}
					style={bannerWrapperStyle}
					onContextMenu={onBannerContextMenu}
					data-flx="user.profile.profile-card.profile-card-banner.banner-wrapper.banner-context-menu"
				>
					<div
						className={styles.banner}
						style={bannerStyle}
						data-flx="user.profile.profile-card.profile-card-banner.banner"
					/>
					{showGifIndicator && <GifIndicator data-flx="user.profile.profile-card.profile-card-banner.gif-indicator" />}
				</div>
				<FocusRing offset={-2} data-flx="user.profile.profile-card.profile-card-banner.focus-ring">
					<button
						type="button"
						onClick={onAvatarClick}
						onContextMenu={onAvatarContextMenu}
						className={styles.avatarButton}
						data-flx="user.profile.profile-card.profile-card-banner.avatar-button.avatar-click"
					>
						<StatusAwareAvatar
							size={DELIGHT_AVATAR_SIZE_PX}
							user={user}
							avatarUrl={avatarUrl}
							hoverAvatarUrl={hoverAvatarUrl}
							disablePresence={disablePresence}
							isClickable={isClickable}
							forceAnimate
							forceAnimateIgnoringSettings
							data-flx="user.profile.profile-card.profile-card-banner.status-aware-avatar"
						/>
					</button>
				</FocusRing>
			</header>
		);
	},
);
