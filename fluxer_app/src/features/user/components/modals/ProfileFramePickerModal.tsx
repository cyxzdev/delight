// SPDX-License-Identifier: AGPL-3.0-or-later

import * as Modal from '@app/features/app/components/dialogs/Modal';
import {Button} from '@app/features/ui/button/Button';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';
import * as ToastCommands from '@app/features/ui/commands/ToastCommands';
import FocusRing from '@app/features/ui/focus_ring/FocusRing';
import {ProfilePreview} from '@app/features/user/components/profile/ProfilePreview';
import styles from '@app/features/user/components/profile_frames/ProfileFramePicker.module.css';
import {ProfileFrameThumbnail} from '@app/features/user/components/profile_frames/ProfileFrameThumbnail';
import {getProfileFrameDefinition, PROFILE_FRAMES} from '@app/features/user/components/profile_frames/registry';
import type {User} from '@app/features/user/models/User';
import ProfileFrameStore from '@app/features/user/state/ProfileFrameStore';
import * as AvatarUtils from '@app/features/user/utils/AvatarUtils';
import {getOwnProfileFrameChoice, type ProfileFrameChoice} from '@app/features/user/utils/ProfileFrames';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {ProhibitIcon} from '@phosphor-icons/react';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useState} from 'react';

const CHANGE_PROFILE_FRAME_DESCRIPTOR = msg({
	message: 'Change profile frame',
	comment: 'Title of the modal where the user picks a decorative frame for their profile card.',
});
const NONE_DESCRIPTOR = msg({
	message: 'None',
	comment: 'Profile frame picker tile meaning "no profile frame".',
});
const NO_FRAME_DESCRIPTION_DESCRIPTOR = msg({
	message: 'Your profile card without a frame.',
	comment: 'Shown under the preview in the profile frame picker when "None" is selected.',
});
const COULDNT_SAVE_DESCRIPTOR = msg({
	message: "Couldn't save your profile frame. Try again.",
	comment: 'Error toast when saving the profile frame fails.',
});
const PROFILE_FRAME_UPDATED_DESCRIPTOR = msg({
	message: 'Profile frame updated',
	comment: 'Success toast after saving the profile frame.',
});

const TILE_CARD_WIDTH = 112;

interface ProfileFramePickerModalProps {
	user: User;
}

export const ProfileFramePickerModal: React.FC<ProfileFramePickerModalProps> = observer(({user}) => {
	const {i18n} = useLingui();
	const current = getOwnProfileFrameChoice(user) ?? 'none';
	const [selected, setSelected] = useState<ProfileFrameChoice>(current);
	const [hovered, setHovered] = useState<ProfileFrameChoice | null>(null);
	const saving = ProfileFrameStore.saving;
	const avatarUrl = AvatarUtils.getUserAvatarURL({id: user.id, avatar: user.avatar}, false, 80);
	const selectedDefinition = selected === 'none' ? null : getProfileFrameDefinition(selected);

	const handleApply = async () => {
		if (selected === current) {
			ModalCommands.pop();
			return;
		}
		try {
			await ProfileFrameStore.saveOwnChoice(selected);
			ToastCommands.createToast({type: 'success', children: i18n._(PROFILE_FRAME_UPDATED_DESCRIPTOR)});
			ModalCommands.pop();
		} catch {
			ToastCommands.createToast({type: 'error', children: i18n._(COULDNT_SAVE_DESCRIPTOR)});
		}
	};

	const renderTile = (choice: ProfileFrameChoice, name: string) => {
		const isSelected = selected === choice;
		return (
			<FocusRing key={choice} offset={-2} data-flx="user.profile-frame-picker.tile.focus-ring">
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
					data-flx={`user.profile-frame-picker.tile.${choice}`}
				>
					<div className={styles.tileStage}>
						<div className={styles.tileCardSlot}>
							{choice === 'none' ? (
								<ProfileFrameThumbnail frame={null} width={TILE_CARD_WIDTH} avatarUrl={avatarUrl}>
									<div className={styles.noneIcon}>
										<ProhibitIcon size={28} weight="bold" />
									</div>
								</ProfileFrameThumbnail>
							) : (
								<ProfileFrameThumbnail
									frame={choice}
									width={TILE_CARD_WIDTH}
									animate={hovered === choice || isSelected}
									avatarUrl={avatarUrl}
								/>
							)}
						</div>
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
			data-flx="user.profile-frame-picker.modal-root"
		>
			<Modal.Header title={i18n._(CHANGE_PROFILE_FRAME_DESCRIPTOR)} data-flx="user.profile-frame-picker.header" />
			<Modal.Content data-flx="user.profile-frame-picker.content">
				<div className={styles.body}>
					<div className={styles.gridColumn}>
						<div className={styles.columnLabel}>
							<Trans>Frames</Trans>
						</div>
						<div className={styles.grid} role="group" data-flx="user.profile-frame-picker.grid">
							{renderTile('none', i18n._(NONE_DESCRIPTOR))}
							{PROFILE_FRAMES.map((definition) => renderTile(definition.id, i18n._(definition.name)))}
						</div>
					</div>
					<div className={styles.previewColumn} data-flx="user.profile-frame-picker.preview">
						<div className={styles.columnLabel} style={{alignSelf: 'stretch'}}>
							<Trans>Preview</Trans>
						</div>
						<div className={styles.previewStage}>
							<ProfilePreview
								user={user}
								previewFrame={selectedDefinition?.id ?? null}
								showMembershipInfo={false}
								showMessageButton={false}
								showPreviewLabel={false}
								data-flx="user.profile-frame-picker.profile-preview"
							/>
						</div>
						<div className={styles.previewMeta}>
							<span className={styles.previewName}>
								{selectedDefinition ? i18n._(selectedDefinition.name) : i18n._(NONE_DESCRIPTOR)}
							</span>
							<span className={styles.previewDescription}>
								{selectedDefinition
									? i18n._(selectedDefinition.description)
									: i18n._(NO_FRAME_DESCRIPTION_DESCRIPTOR)}
							</span>
						</div>
					</div>
				</div>
			</Modal.Content>
			<Modal.Footer data-flx="user.profile-frame-picker.footer">
				<Button
					variant="secondary"
					small
					onClick={() => ModalCommands.pop()}
					data-flx="user.profile-frame-picker.button.cancel"
				>
					<Trans>Cancel</Trans>
				</Button>
				<Button
					variant="primary"
					small
					onClick={handleApply}
					submitting={saving}
					data-flx="user.profile-frame-picker.button.apply"
				>
					<Trans>Apply</Trans>
				</Button>
			</Modal.Footer>
		</Modal.Root>
	);
});

ProfileFramePickerModal.displayName = 'ProfileFramePickerModal';
