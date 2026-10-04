// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/profile/profile_card/ProfileCardLayout.module.css';
import {
	ProfileEffect,
	profileEffectHostClassName,
} from '@app/features/user/components/profile_effects/ProfileEffect';
import {getProfileFrameSpill, ProfileFrame, profileFramePadClassName} from '@app/features/user/components/profile_frames/ProfileFrame';
import type {ProfileEffectId} from '@app/features/user/utils/ProfileEffects';
import type {ProfileFrameId} from '@app/features/user/utils/ProfileFrameIds';
import {Trans} from '@lingui/react/macro';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useMemo} from 'react';

interface ProfileCardLayoutProps {
	borderColor: string;
	showPreviewLabel?: boolean;
	hoverRef?: (instance: HTMLDivElement | null) => void;
	className?: string;
	style?: React.CSSProperties;
	/** Animated profile effect drawn in front of / behind the card. */
	effect?: ProfileEffectId | null;
	/** Profile frame drawn around the card; the wrapper is padded so the frame's spill counts toward its size. */
	frame?: ProfileFrameId | null;
	children: React.ReactNode;
}

export const ProfileCardLayout: React.FC<ProfileCardLayoutProps> = observer(
	({borderColor, showPreviewLabel = false, hoverRef, className, style, effect, frame, children}) => {
		// Delight: the card keeps a neutral hairline border; the accent colour lives on the banner (exposed as a variable).
		const cardStyle = useMemo<React.CSSProperties>(
			() => ({...style, '--profile-accent-color': borderColor}) as React.CSSProperties,
			[borderColor, style],
		);
		// Delight: room for the profile frame's art above/below the card (cards are 300px wide).
		const frameSpill = getProfileFrameSpill(frame, 300);
		const wrapperStyle =
			frameSpill.top || frameSpill.bottom ? {paddingTop: frameSpill.top, paddingBottom: frameSpill.bottom} : undefined;
		return (
			<div
				className={wrapperStyle ? profileFramePadClassName : undefined}
				style={wrapperStyle}
				data-flx="user.profile.profile-card.profile-card-layout.div"
			>
				{showPreviewLabel && (
					<div className={styles.previewLabel} data-flx="user.profile.profile-card.profile-card-layout.preview-label">
						<Trans>Profile preview</Trans>
					</div>
				)}
				<div
					ref={hoverRef}
					className={clsx(styles.profileCard, profileEffectHostClassName, className)}
					style={cardStyle}
					data-flx="user.profile.profile-card.profile-card-layout.profile-card"
				>
					{effect && <ProfileEffect effect={effect} radius={6} data-flx="user.profile.profile-card.profile-card-layout.profile-effect" />}
					{children}
					{frame && <ProfileFrame frame={frame} />}
				</div>
			</div>
		);
	},
);
