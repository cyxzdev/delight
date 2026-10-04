// SPDX-License-Identifier: AGPL-3.0-or-later

import * as Modal from '@app/features/app/components/dialogs/Modal';
import {Button} from '@app/features/ui/button/Button';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';
import * as ToastCommands from '@app/features/ui/commands/ToastCommands';
import FocusRing from '@app/features/ui/focus_ring/FocusRing';
import type {User} from '@app/features/user/models/User';
import {ProfilePreview} from '@app/features/user/components/profile/ProfilePreview';
import styles from '@app/features/user/components/profile_effects/ProfileEffectPicker.module.css';
import {ProfileEffectThumbnail} from '@app/features/user/components/profile_effects/ProfileEffectThumbnail';
import {getProfileEffectDefinition, PROFILE_EFFECTS} from '@app/features/user/components/profile_effects/registry';
import ProfileEffectStore from '@app/features/user/state/ProfileEffectStore';
import * as AvatarUtils from '@app/features/user/utils/AvatarUtils';
import {getOwnProfileEffectChoice, type ProfileEffectChoice} from '@app/features/user/utils/ProfileEffects';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {ProhibitIcon} from '@phosphor-icons/react';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useState} from 'react';

const CHANGE_PROFILE_EFFECT_DESCRIPTOR = msg({
	message: 'Change profile effect',
	comment: 'Title of the modal where the user picks an animated effect for their profile card.',
});
const NONE_DESCRIPTOR = msg({
	message: 'None',
	comment: 'Profile effect picker tile meaning "no profile effect".',
});
const NO_EFFECT_DESCRIPTION_DESCRIPTOR = msg({
	message: 'Your profile card without an effect.',
	comment: 'Shown under the preview in the profile effect picker when "None" is selected.',
});
const COULDNT_SAVE_DESCRIPTOR = msg({
	message: "Couldn't save your profile effect. Try again.",
	comment: 'Error toast when saving the profile effect fails.',
});
const PROFILE_EFFECT_UPDATED_DESCRIPTOR = msg({
	message: 'Profile effect updated',
	comment: 'Success toast after saving the profile effect.',
});

interface ProfileEffectPickerModalProps {
	user: User;
}

export const ProfileEffectPickerModal: React.FC<ProfileEffectPickerModalProps> = observer(({user}) => {
	const {i18n} = useLingui();
	const current = getOwnProfileEffectChoice(user) ?? 'none';
	const [selected, setSelected] = useState<ProfileEffectChoice>(current);
	const [hovered, setHovered] = useState<ProfileEffectChoice | null>(null);
	const saving = ProfileEffectStore.saving;
	const avatarUrl = AvatarUtils.getUserAvatarURL({id: user.id, avatar: user.avatar}, false, 80);
	const selectedDefinition = selected === 'none' ? null : getProfileEffectDefinition(selected);

	const handleApply = async () => {
		if (selected === current) {
			ModalCommands.pop();
			return;
		}
		try {
			await ProfileEffectStore.saveOwnChoice(selected);
			ToastCommands.createToast({type: 'success', children: i18n._(PROFILE_EFFECT_UPDATED_DESCRIPTOR)});
			ModalCommands.pop();
		} catch {
			ToastCommands.createToast({type: 'error', children: i18n._(COULDNT_SAVE_DESCRIPTOR)});
		}
	};

	const renderTile = (choice: ProfileEffectChoice, name: string) => {
		const isSelected = selected === choice;
		return (
			<FocusRing key={choice} offset={-2} data-flx="user.profile-effect-picker.tile.focus-ring">
				<button
					type="button"
					className={clsx(styles.tile, isSelected && styles.tileSelected)}
					onClick={() => setSelected(choice)}
					onMouseEnter={() => setHovered(choice)}
					onMouseLeave={() => setHovered((value) => (value === choice ? null : value))}
					onFocus={() => setHovered(choice)}
					onBlur={() => setHovered((value) => (value === choice ? null : value))}
					aria-pressed={isSelected}
					aria-label={name}
					data-flx={`user.profile-effect-picker.tile.${choice}`}
				>
					<div className={styles.tileFrame}>
						{choice === 'none' ? (
							<ProfileEffectThumbnail effect={null} avatarUrl={avatarUrl}>
								<div className={styles.noneFrame} style={{position: 'absolute', inset: 0}}>
									<ProhibitIcon size={28} weight="bold" />
								</div>
							</ProfileEffectThumbnail>
						) : (
							<ProfileEffectThumbnail effect={choice} animate={hovered === choice || isSelected} avatarUrl={avatarUrl} />
						)}
					</div>
					<span className={styles.tileName}>{name}</span>
				</button>
			</FocusRing>
		);
	};

	return (
		<Modal.Root
			onClose={() => ModalCommands.pop()}
			size="large"
			className={styles.modalRoot}
			data-flx="user.profile-effect-picker.modal-root"
		>
			<Modal.Header title={i18n._(CHANGE_PROFILE_EFFECT_DESCRIPTOR)} data-flx="user.profile-effect-picker.header" />
			<Modal.Content data-flx="user.profile-effect-picker.content">
				<div className={styles.body}>
					<div className={styles.gridColumn}>
						<div className={styles.columnLabel}>
							<Trans>Effects</Trans>
						</div>
						<div className={styles.grid} role="group" data-flx="user.profile-effect-picker.grid">
							{renderTile('none', i18n._(NONE_DESCRIPTOR))}
							{PROFILE_EFFECTS.map((definition) => renderTile(definition.id, i18n._(definition.name)))}
						</div>
					</div>
					<div className={styles.previewColumn} data-flx="user.profile-effect-picker.preview">
						<div className={styles.columnLabel} style={{alignSelf: 'stretch'}}>
							<Trans>Preview</Trans>
						</div>
						<ProfilePreview
							user={user}
							previewEffect={selectedDefinition?.id ?? null}
							showMembershipInfo={false}
							showMessageButton={false}
							showPreviewLabel={false}
							data-flx="user.profile-effect-picker.profile-preview"
						/>
						<div className={styles.previewMeta}>
							<span className={styles.previewName}>
								{selectedDefinition ? i18n._(selectedDefinition.name) : i18n._(NONE_DESCRIPTOR)}
							</span>
							<span className={styles.previewDescription}>
								{selectedDefinition ? i18n._(selectedDefinition.description) : i18n._(NO_EFFECT_DESCRIPTION_DESCRIPTOR)}
							</span>
						</div>
					</div>
				</div>
			</Modal.Content>
			<Modal.Footer data-flx="user.profile-effect-picker.footer">
				<Button
					variant="secondary"
					small
					onClick={() => ModalCommands.pop()}
					data-flx="user.profile-effect-picker.button.cancel"
				>
					<Trans>Cancel</Trans>
				</Button>
				<Button
					variant="primary"
					small
					onClick={handleApply}
					submitting={saving}
					data-flx="user.profile-effect-picker.button.apply"
				>
					<Trans>Apply</Trans>
				</Button>
			</Modal.Footer>
		</Modal.Root>
	);
});

ProfileEffectPickerModal.displayName = 'ProfileEffectPickerModal';
