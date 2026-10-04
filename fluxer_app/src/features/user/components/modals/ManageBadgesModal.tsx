// SPDX-License-Identifier: AGPL-3.0-or-later

import * as Modal from '@app/features/app/components/dialogs/Modal';
import {Button} from '@app/features/ui/button/Button';
import {Checkbox} from '@app/features/ui/checkbox/Checkbox';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';
import * as ToastCommands from '@app/features/ui/commands/ToastCommands';
import styles from '@app/features/user/components/modals/ManageBadgesModal.module.css';
import type {User} from '@app/features/user/models/User';
import DelightBadgeStore from '@app/features/user/state/DelightBadgeStore';
import {DELIGHT_BADGES, delightBadgeImageUrl} from '@app/features/user/utils/DelightBadges';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useState} from 'react';

const MANAGE_BADGES_TITLE_DESCRIPTOR = msg({
	message: 'Manage badges',
	comment: 'Title of the staff-only modal for granting profile badges to a user.',
});
const BADGES_SAVED_DESCRIPTOR = msg({
	message: 'Badges updated',
	comment: 'Success toast after staff change a user’s profile badges.',
});
const BADGES_SAVE_FAILED_DESCRIPTOR = msg({
	message: "Couldn't update badges. Try again.",
	comment: 'Error toast when saving profile badges fails.',
});

interface ManageBadgesModalProps {
	user: User;
}

/** Staff only: tick the Delight badges a user should have. */
export const ManageBadgesModal: React.FC<ManageBadgesModalProps> = observer(({user}) => {
	const {i18n} = useLingui();
	const current = DelightBadgeStore.getBadges(user.id);
	const [selected, setSelected] = useState<Set<string>>(() => new Set(current));
	const [saving, setSaving] = useState(false);

	const toggle = (id: string, checked: boolean) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (checked) next.add(id);
			else next.delete(id);
			return next;
		});
	};

	const save = async () => {
		setSaving(true);
		try {
			await DelightBadgeStore.setBadges(user.id, [...selected]);
			ToastCommands.createToast({type: 'success', children: i18n._(BADGES_SAVED_DESCRIPTOR)});
			ModalCommands.pop();
		} catch {
			ToastCommands.createToast({type: 'error', children: i18n._(BADGES_SAVE_FAILED_DESCRIPTOR)});
		} finally {
			setSaving(false);
		}
	};

	return (
		<Modal.Root onClose={() => ModalCommands.pop()} size="small" data-flx="user.manage-badges.modal-root">
			<Modal.Header title={i18n._(MANAGE_BADGES_TITLE_DESCRIPTOR)} data-flx="user.manage-badges.header" />
			<Modal.Content data-flx="user.manage-badges.content">
				<div className={styles.subtitle}>
					<span className={styles.username}>{user.tag}</span>
					<span>
						<Trans>Ticked badges show on this profile.</Trans>
					</span>
				</div>
				<div className={styles.list} role="group" data-flx="user.manage-badges.list">
					{DELIGHT_BADGES.map((badge) => (
						<div key={badge.id} className={styles.row} data-flx={`user.manage-badges.row.${badge.id}`}>
							<Checkbox
								checked={selected.has(badge.id)}
								onChange={(checked) => toggle(badge.id, checked)}
								size="small"
								data-flx="user.manage-badges.checkbox"
							>
								<span className={styles.label}>
									<img src={delightBadgeImageUrl(badge.id, 64)} alt="" className={styles.icon} draggable={false} />
									<span className={styles.text}>
										<span className={styles.name}>{i18n._(badge.name)}</span>
										<span className={styles.description}>{i18n._(badge.description)}</span>
									</span>
								</span>
							</Checkbox>
						</div>
					))}
				</div>
			</Modal.Content>
			<Modal.Footer data-flx="user.manage-badges.footer">
				<Button variant="secondary" small onClick={() => ModalCommands.pop()} data-flx="user.manage-badges.cancel">
					<Trans>Cancel</Trans>
				</Button>
				<Button variant="primary" small onClick={save} submitting={saving} data-flx="user.manage-badges.save">
					<Trans>Save</Trans>
				</Button>
			</Modal.Footer>
		</Modal.Root>
	);
});

ManageBadgesModal.displayName = 'ManageBadgesModal';
