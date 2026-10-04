// SPDX-License-Identifier: AGPL-3.0-or-later

import {Button} from '@app/features/ui/button/Button';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';
import {modal} from '@app/features/ui/commands/ModalCommands';
import * as ToastCommands from '@app/features/ui/commands/ToastCommands';
import type {User} from '@app/features/user/models/User';
import {ProfileEffectPickerModal} from '@app/features/user/components/modals/ProfileEffectPickerModal';
import styles from '@app/features/user/components/profile_effects/ProfileEffectPicker.module.css';
import {ProfileEffectThumbnail} from '@app/features/user/components/profile_effects/ProfileEffectThumbnail';
import {getProfileEffectDefinition} from '@app/features/user/components/profile_effects/registry';
import ProfileEffectStore from '@app/features/user/state/ProfileEffectStore';
import * as AvatarUtils from '@app/features/user/utils/AvatarUtils';
import {getOwnProfileEffectChoice} from '@app/features/user/utils/ProfileEffects';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';
import type React from 'react';

const NO_EFFECT_DESCRIPTOR = msg({
	message: 'No effect',
	comment: 'Shown in profile settings when the user has no profile effect.',
});
const NO_EFFECT_HINT_DESCRIPTOR = msg({
	message: 'Add an animated effect around your profile card. Everyone sees it.',
	comment: 'Hint under "No effect" in profile settings.',
});
const LOADING_DESCRIPTOR = msg({
	message: 'Loading…',
	comment: 'Shown in profile settings while the current profile effect is loading.',
});
const COULDNT_REMOVE_DESCRIPTOR = msg({
	message: "Couldn't remove your profile effect. Try again.",
	comment: 'Error toast when removing the profile effect fails.',
});

interface ProfileEffectSettingProps {
	user: User;
	disabled?: boolean;
}

/** Settings → Profile: the current profile effect, with "Change effect" (opens the picker) and "Remove". */
export const ProfileEffectSetting: React.FC<ProfileEffectSettingProps> = observer(({user, disabled}) => {
	const {i18n} = useLingui();
	const choice = getOwnProfileEffectChoice(user);
	const loading = choice === undefined;
	const definition = choice && choice !== 'none' ? getProfileEffectDefinition(choice) : null;
	const avatarUrl = AvatarUtils.getUserAvatarURL({id: user.id, avatar: user.avatar}, false, 80);

	const openPicker = () => {
		ModalCommands.push(
			modal(() => <ProfileEffectPickerModal user={user} data-flx="user.my-profile-tab.profile-effect-picker-modal" />),
		);
	};
	const remove = async () => {
		try {
			await ProfileEffectStore.saveOwnChoice('none');
		} catch {
			ToastCommands.createToast({type: 'error', children: i18n._(COULDNT_REMOVE_DESCRIPTOR)});
		}
	};

	return (
		<div data-flx="user.my-profile-tab.profile-effect-setting">
			<div className={styles.settingLabel}>
				<Trans>Profile effect</Trans>
			</div>
			<div className={styles.settingRow}>
				<div className={styles.settingThumbBox} aria-hidden="true">
					<div className={styles.settingThumb}>
						<ProfileEffectThumbnail effect={definition?.id ?? null} animate={definition != null} avatarUrl={avatarUrl} />
					</div>
				</div>
				<div className={styles.settingText}>
					<span className={styles.settingName} data-flx="user.my-profile-tab.profile-effect-setting.name">
						{loading ? i18n._(LOADING_DESCRIPTOR) : definition ? i18n._(definition.name) : i18n._(NO_EFFECT_DESCRIPTOR)}
					</span>
					{!loading && (
						<span className={styles.settingDescription}>
							{definition ? i18n._(definition.description) : i18n._(NO_EFFECT_HINT_DESCRIPTOR)}
						</span>
					)}
					<div className={styles.settingButtons}>
						<Button
							variant="primary"
							small
							onClick={openPicker}
							disabled={disabled || loading}
							data-flx="user.my-profile-tab.profile-effect-setting.button.change"
						>
							<Trans>Change effect</Trans>
						</Button>
						<Button
							variant="secondary"
							small
							onClick={remove}
							disabled={disabled || loading || definition == null || ProfileEffectStore.saving}
							data-flx="user.my-profile-tab.profile-effect-setting.button.remove"
						>
							<Trans>Remove</Trans>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
});
