// SPDX-License-Identifier: AGPL-3.0-or-later

import {ProfileFrame} from '@app/features/user/components/profile_frames/ProfileFrame';
import styles from '@app/features/user/components/profile_frames/ProfileFramePicker.module.css';
import type {ProfileFrameId} from '@app/features/user/utils/ProfileFrameIds';
import type React from 'react';

interface ProfileFrameThumbnailProps {
	frame: ProfileFrameId | null;
	/** Width of the mock card in px (height follows a 3:4 profile card). */
	width: number;
	/** Twinkle/flicker (hovered or selected tiles); otherwise a still frame. */
	animate?: boolean;
	avatarUrl?: string | null;
	children?: React.ReactNode;
}

/** A miniature profile card wearing a frame — the picker's tiles and the settings row. Uses the real ProfileFrame. */
export const ProfileFrameThumbnail: React.FC<ProfileFrameThumbnailProps> = ({
	frame,
	width,
	animate = false,
	avatarUrl,
	children,
}) => (
	<div className={styles.mockCard} style={{width, height: Math.round(width * 1.36)}} data-flx="user.profile-frame-thumbnail">
		<div className={styles.mockBanner} />
		<div className={styles.mockAvatar}>{avatarUrl && <img src={avatarUrl} alt="" draggable={false} />}</div>
		<div className={styles.mockLines}>
			<div className={styles.mockLine} style={{width: '62%', height: '12%'}} />
			<div className={styles.mockLine} style={{width: '40%'}} />
			<div className={styles.mockLine} style={{width: '88%', marginTop: '6%'}} />
			<div className={styles.mockLine} style={{width: '70%'}} />
		</div>
		{children}
		{frame && <ProfileFrame key={`${frame}-${animate}`} frame={frame} still={!animate} />}
	</div>
);
