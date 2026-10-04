// SPDX-License-Identifier: AGPL-3.0-or-later

import {getUserAccentColor} from '@app/features/theme/utils/AccentColorUtils';
import {Scroller} from '@app/features/ui/components/Scroller';
import userProfileModalStyles from '@app/features/user/components/modals/UserProfileModal.module.css';
import {ProfileBody} from '@app/features/user/components/modals/user_profile_modal/ProfileBody';
import {ProfileContent} from '@app/features/user/components/modals/user_profile_modal/ProfileContent';
import {ProfileMediaHeader} from '@app/features/user/components/modals/user_profile_modal/ProfileMediaHeader';
import type {ProfileModalContentProps} from '@app/features/user/components/modals/user_profile_modal/UserProfileModalShared';
import {UserInfo} from '@app/features/user/components/modals/user_profile_modal/UserProfileModalUserInfo';
import {ProfileEffect, profileEffectHostClassName} from '@app/features/user/components/profile_effects/ProfileEffect';
import {ProfileFrame} from '@app/features/user/components/profile_frames/ProfileFrame';
import * as ProfileDisplayUtils from '@app/features/user/utils/ProfileDisplayUtils';
import {resolveProfileGuildMembership, toProfileDisplayContext} from '@app/features/user/utils/ProfileGuildMembership';
import {
	MEDIA_PROXY_AVATAR_SIZE_PROFILE,
	MEDIA_PROXY_PROFILE_BANNER_SIZE_MODAL,
} from '@fluxer/constants/src/MediaProxyAssetSizes';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useMemo} from 'react';

export const ProfileModalContent: React.FC<ProfileModalContentProps> = observer(
	({
		profile,
		user,
		userNote,
		autoFocusNote,
		noteRef,
		renderActionButtons,
		previewOverrides,
		showProfileDataWarning,
		effect,
		frame,
	}) => {
		const effectiveProfile = profile?.getEffectiveProfile() ?? null;
		const bannerColor = getUserAccentColor(user, effectiveProfile?.accent_color);
		const membership = resolveProfileGuildMembership(profile);
		const profileContext = useMemo<ProfileDisplayUtils.ProfileDisplayContext>(
			() =>
				toProfileDisplayContext({
					user,
					profile,
					membership,
					guildMemberProfile: profile?.guildMemberProfile,
				}),
			[user, profile, membership],
		);
		const {avatarUrl, hoverAvatarUrl} = useMemo(
			() => ProfileDisplayUtils.getProfileAvatarUrls(profileContext, previewOverrides, MEDIA_PROXY_AVATAR_SIZE_PROFILE),
			[profileContext, previewOverrides],
		);
		const {bannerUrl, hoverBannerUrl} = useMemo(
			() =>
				ProfileDisplayUtils.getProfileBannerUrls(
					profileContext,
					previewOverrides,
					MEDIA_PROXY_PROFILE_BANNER_SIZE_MODAL,
				),
			[profileContext, previewOverrides],
		);
		// Delight: Discord-style two columns. Left: the profile card (banner, avatar, name, actions, sections) at about
		// popout size; it hosts the profile effect so effects never stretch. Right: tabs on the modal's own surface.
		return (
			<>
				<div
					className={userProfileModalStyles.profileCardColumn}
					data-profile-card-column=""
					data-flx="user.user-profile-modal.profile-modal-content.profile-card-column"
				>
					<div
						className={clsx(userProfileModalStyles.profileCard, profileEffectHostClassName)}
						data-flx="user.user-profile-modal.profile-modal-content.profile-card"
					>
						{effect && (
							<ProfileEffect
								effect={effect}
								radius={8}
								data-flx="user.user-profile-modal.profile-modal-content.profile-effect"
							/>
						)}
						{frame && (
							<ProfileFrame
								frame={frame}
								reserveSpaceOn={{selector: '[data-flx="user.user-profile-modal.modal-root"]', inset: 20}}
							/>
						)}
						<ProfileMediaHeader
							user={user}
							profile={profile}
							profileContext={profileContext}
							previewOverrides={previewOverrides}
							bannerColor={bannerColor}
							bannerUrl={bannerUrl}
							hoverBannerUrl={hoverBannerUrl}
							avatarUrl={avatarUrl}
							hoverAvatarUrl={hoverAvatarUrl}
							renderActionButtons={renderActionButtons}
							data-flx="user.user-profile-modal.profile-modal-content.profile-media-header"
						/>
						<div
							className={userProfileModalStyles.profileCardInfo}
							data-flx="user.user-profile-modal.profile-modal-content.profile-card-info"
						>
							<UserInfo
								user={user}
								profile={profile}
								guildId={profile.guildId ?? undefined}
								showProfileDataWarning={showProfileDataWarning}
								data-flx="user.user-profile-modal.profile-modal-content.user-info"
							/>
						</div>
						<Scroller
							className={userProfileModalStyles.profileCardScroller}
							key="user-profile-modal-card-scroller"
							data-flx="user.user-profile-modal.profile-modal-content.profile-card-scroller"
						>
							<ProfileContent
								profile={profile}
								user={user}
								userNote={userNote}
								autoFocusNote={autoFocusNote}
								noteRef={noteRef}
								data-flx="user.user-profile-modal.profile-modal-content.profile-content"
							/>
						</Scroller>
					</div>
				</div>
				<ProfileBody
					profile={profile}
					user={user}
					data-flx="user.user-profile-modal.profile-modal-content.profile-body"
				/>
			</>
		);
	},
);
