// SPDX-License-Identifier: AGPL-3.0-or-later

import {Button} from '@app/features/ui/button/Button';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';
import {modal} from '@app/features/ui/commands/ModalCommands';
import * as ToastCommands from '@app/features/ui/commands/ToastCommands';
import {ProfileFramePickerModal} from '@app/features/user/components/modals/ProfileFramePickerModal';
import styles from '@app/features/user/components/profile_frames/ProfileFramePicker.module.css';
import {ProfileFrameThumbnail} from '@app/features/user/components/profile_frames/ProfileFrameThumbnail';
import {getProfileFrameDefinition} from '@app/features/user/components/profile_frames/registry';
import type {User} from '@app/features/user/models/User';
import ProfileFrameStore from '@app/features/user/state/ProfileFrameStore';
import * as AvatarUtils from '@app/features/user/utils/AvatarUtils';
import {getOwnProfileFrameChoice} from '@app/features/user/utils/ProfileFrames';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';
import type React from 'react';

const NO_FRAME_DESCRIPTOR = msg({
	message: 'No frame',
	comment: 'Shown in profile settings when the user has no profile frame.',
});
const NO_FRAME_HINT_DESCRIPTOR = msg({
	message: 'Wrap your profile card in illustrated art. Everyone sees it.',
	comment: 'Hint under "No frame" in profile settings.',
});
const LOADING_DESCRIPTOR = msg({
	message: 'Loading…',
	comment: 'Shown in profile settings while the current profile frame is loading.',
});
const COULDNT_REMOVE_DESCRIPTOR = msg({
	message: "Couldn't remove your profile frame. Try again.",
	comment: 'Error toast when removing the profile frame fails.',
});

interface ProfileFrameSettingProps {
	user: User;
	disabled?: boolean;
}

/** Settings → Profile: the current profile frame, with "Change frame" (opens the picker) and "Remove". */
export const ProfileFrameSetting: React.FC<ProfileFrameSettingProps> = observer(({user, disabled}) => {
	const {i18n} = useLingui();
	const choice = getOwnProfileFrameChoice(user);
	const loading = choice === undefined;
	const definition = choice && choice !== 'none' ? getProfileFrameDefinition(choice) : null;
	const avatarUrl = AvatarUtils.getUserAvatarURL({id: user.id, avatar: user.avatar}, false, 80);

	const openPicker = () => {
		ModalCommands.push(
			modal(() => <ProfileFramePickerModal user={user} data-flx="user.my-profile-tab.profile-frame-picker-modal" />),
		);
	};
	const remove = async () => {
		try {
			await ProfileFrameStore.saveOwnChoice('none');
		} catch {
			ToastCommands.createToast({type: 'error', children: i18n._(COULDNT_REMOVE_DESCRIPTOR)});
		}
	};

	return (
		<div data-flx="user.my-profile-tab.profile-frame-setting">
			<div className={styles.settingLabel}>
				<Trans>Profile frame</Trans>
			</div>
			<div className={styles.settingRow}>
				<div className={styles.settingThumbBox} aria-hidden="true">
					<div className={styles.settingThumbSlot}>
						<ProfileFrameThumbnail frame={definition?.id ?? null} width={40} animate={definition != null} avatarUrl={avatarUrl} />
					</div>
				</div>
				<div className={styles.settingText}>
					<span className={styles.settingName} data-flx="user.my-profile-tab.profile-frame-setting.name">
						{loading ? i18n._(LOADING_DESCRIPTOR) : definition ? i18n._(definition.name) : i18n._(NO_FRAME_DESCRIPTOR)}
					</span>
					{!loading && (
						<span className={styles.settingDescription}>
							{definition ? i18n._(definition.description) : i18n._(NO_FRAME_HINT_DESCRIPTOR)}
						</span>
					)}
					<div className={styles.settingButtons}>
						<Button
							variant="primary"
							small
							onClick={openPicker}
							disabled={disabled || loading}
							data-flx="user.my-profile-tab.profile-frame-setting.button.change"
						>
							<Trans>Change frame</Trans>
						</Button>
						<Button
							variant="secondary"
							small
							onClick={remove}
							disabled={disabled || loading || definition == null || ProfileFrameStore.saving}
							data-flx="user.my-profile-tab.profile-frame-setting.button.remove"
						>
							<Trans>Remove</Trans>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
});
