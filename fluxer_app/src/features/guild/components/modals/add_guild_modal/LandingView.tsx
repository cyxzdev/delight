// SPDX-License-Identifier: AGPL-3.0-or-later

import * as Modal from '@app/features/app/components/dialogs/Modal';
import RuntimeConfig from '@app/features/app/state/RuntimeConfig';
import styles from '@app/features/guild/components/modals/AddGuildModal.module.css';
import {
	type AddGuildModalView,
	IMPORT_THE_OTHER_PLATFORM_TEMPLATE_DESCRIPTOR,
} from '@app/features/guild/components/modals/add_guild_modal/shared';
import {
	CREATE_COMMUNITY_DESCRIPTOR,
	JOIN_COMMUNITY_DESCRIPTOR,
} from '@app/features/i18n/utils/CommonMessageDescriptors';
import {remFromPx} from '@app/features/theme/layout/RemFromPx';
import {THE_OTHER_PLATFORM} from '@fluxer/constants/src/ExternalPlatformConstants';
import {msg} from '@lingui/core/macro';
import {Trans, useLingui} from '@lingui/react/macro';
import {CaretRightIcon, DownloadSimpleIcon, HouseIcon, LinkIcon} from '@phosphor-icons/react';
import {observer} from 'mobx-react-lite';
import type React from 'react';

const CREATE_COMMUNITY_HINT_DESCRIPTOR = msg({
	message: 'Start fresh with your own channels and roles.',
	comment: 'Secondary line under "Create community" in the add community modal.',
});
const JOIN_COMMUNITY_HINT_DESCRIPTOR = msg({
	message: 'Use an invite link or code from a friend.',
	comment: 'Secondary line under "Join community" in the add community modal.',
});
const IMPORT_TEMPLATE_HINT_DESCRIPTOR = msg({
	message: 'Copy the channels and roles from a template link.',
	comment: 'Secondary line under the import template option in the add community modal.',
});

interface ActionButtonProps {
	onClick: () => void;
	icon: React.ReactNode;
	label: string;
	hint: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({onClick, icon, label, hint}) => (
	<button
		type="button"
		onClick={onClick}
		className={styles.actionButton}
		data-flx="guild.add-guild-modal.action-button.action-button.click"
	>
		<span className={styles.actionIcon} data-flx="guild.add-guild-modal.action-button.action-icon">
			{icon}
		</span>
		<span className={styles.actionText} data-flx="guild.add-guild-modal.action-button.action-text">
			<span className={styles.actionLabel} data-flx="guild.add-guild-modal.action-button.action-label">
				{label}
			</span>
			<span className={styles.actionHint} data-flx="guild.add-guild-modal.action-button.action-hint">
				{hint}
			</span>
		</span>
		<CaretRightIcon
			weight="bold"
			className={styles.actionChevron}
			aria-hidden
			data-flx="guild.add-guild-modal.action-button.action-chevron"
		/>
	</button>
);
export const LandingView = observer(({onViewChange}: {onViewChange: (view: AddGuildModalView) => void}) => {
	const {i18n} = useLingui();
	if (RuntimeConfig.singleCommunityEnabled) {
		return null;
	}
	return (
		<div className={styles.landingContainer} data-flx="guild.add-guild-modal.landing-view.landing-container">
			<Modal.Description data-flx="guild.add-guild-modal.landing-view.modal-description">
				<Trans>Create a new community or join an existing one.</Trans>
			</Modal.Description>
			<div className={styles.actionButtonsGroup} data-flx="guild.add-guild-modal.landing-view.action-buttons-group">
				<ActionButton
					onClick={() => onViewChange('create_guild')}
					icon={<HouseIcon size={remFromPx(18)} weight="fill" data-flx="guild.add-guild-modal.landing-view.house-icon" />}
					label={i18n._(CREATE_COMMUNITY_DESCRIPTOR)}
					hint={i18n._(CREATE_COMMUNITY_HINT_DESCRIPTOR)}
					data-flx="guild.add-guild-modal.landing-view.action-button.view-change"
				/>
				<ActionButton
					onClick={() => onViewChange('join_guild')}
					icon={<LinkIcon size={remFromPx(18)} weight="bold" data-flx="guild.add-guild-modal.landing-view.link-icon" />}
					label={i18n._(JOIN_COMMUNITY_DESCRIPTOR)}
					hint={i18n._(JOIN_COMMUNITY_HINT_DESCRIPTOR)}
					data-flx="guild.add-guild-modal.landing-view.action-button.view-change--2"
				/>
				<ActionButton
					onClick={() => onViewChange('import_template')}
					icon={
						<DownloadSimpleIcon
							size={remFromPx(18)}
							weight="bold"
							data-flx="guild.add-guild-modal.landing-view.download-simple-icon"
						/>
					}
					label={i18n._(IMPORT_THE_OTHER_PLATFORM_TEMPLATE_DESCRIPTOR, {theOtherPlatform: THE_OTHER_PLATFORM})}
					hint={i18n._(IMPORT_TEMPLATE_HINT_DESCRIPTOR)}
					data-flx="guild.add-guild-modal.landing-view.action-button.view-change--3"
				/>
			</div>
		</div>
	);
});
