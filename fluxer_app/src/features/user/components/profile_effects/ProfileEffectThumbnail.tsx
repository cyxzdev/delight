// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	PROFILE_EFFECT_AVATAR_ATTR,
	PROFILE_EFFECT_BANNER_ATTR,
	ProfileEffect,
	profileEffectHostClassName,
} from '@app/features/user/components/profile_effects/ProfileEffect';
import styles from '@app/features/user/components/profile_effects/ProfileEffectPicker.module.css';
import type {ProfileEffectId} from '@app/features/user/utils/ProfileEffectIds';
import {clsx} from 'clsx';
import type React from 'react';

interface ProfileEffectThumbnailProps {
	effect: ProfileEffectId | null;
	/** Animate (hovered / selected tiles); otherwise a still frame. */
	animate?: boolean;
	avatarUrl?: string | null;
	children?: React.ReactNode;
}

/**
 * A miniature profile card (drawn at 240×300 and scaled down) with an effect on it — the picker's tiles. Any registered
 * effect renders here without extra work because it is the same ProfileEffect used on real cards.
 */
export const ProfileEffectThumbnail: React.FC<ProfileEffectThumbnailProps> = ({effect, animate = false, avatarUrl, children}) => {
	const bannerAttr = {[PROFILE_EFFECT_BANNER_ATTR]: ''};
	const avatarAttr = {[PROFILE_EFFECT_AVATAR_ATTR]: ''};
	return (
		<div className={styles.thumbFrame} data-flx="user.profile-effect-thumbnail">
			<div className={clsx(styles.thumbCard, profileEffectHostClassName)}>
				{effect && <ProfileEffect key={`${effect}-${animate}`} effect={effect} radius={14} still={!animate} fadeOnHover={false} />}
				<div className={styles.thumbBanner} {...bannerAttr} />
				<div className={styles.thumbAvatar} {...avatarAttr}>
					{avatarUrl && <img src={avatarUrl} alt="" draggable={false} />}
				</div>
				<div className={styles.thumbLines}>
					<div className={styles.thumbLine} style={{width: '58%', height: 18}} />
					<div className={styles.thumbLine} style={{width: '38%'}} />
					<div className={styles.thumbLine} style={{width: '86%', marginTop: 14}} />
					<div className={styles.thumbLine} style={{width: '72%'}} />
				</div>
			</div>
			{children}
		</div>
	);
};
