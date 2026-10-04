// SPDX-License-Identifier: AGPL-3.0-or-later

import {Routes} from '@app/app/Routes';
import styles from '@app/features/app/components/layout/GuildSidebarToolbar.module.css';
import {GuildNotificationSettingsModal} from '@app/features/guild/components/modals/GuildNotificationSettingsModal';
import {GuildSettingsModal} from '@app/features/guild/components/modals/GuildSettingsModal';
import type {Guild} from '@app/features/guild/models/Guild';
import {MEMBERS_DESCRIPTOR, NOTIFICATION_SETTINGS_DESCRIPTOR} from '@app/features/i18n/utils/CommonMessageDescriptors';
import {InviteModal} from '@app/features/invite/components/modals/InviteModal';
import * as InviteUtils from '@app/features/invite/utils/InviteUtils';
import * as RouterUtils from '@app/features/navigation/utils/RouterUtils';
import Permission from '@app/features/permissions/state/Permission';
import * as ModalCommands from '@app/features/ui/commands/ModalCommands';
import {modal} from '@app/features/ui/commands/ModalCommands';
import FocusRing from '@app/features/ui/focus_ring/FocusRing';
import {Tooltip} from '@app/features/ui/tooltip/Tooltip';
import {GUILD_SETTINGS_LABEL_DESCRIPTOR} from '@app/features/user/components/settings_utils/GuildSettingsConstants';
import {Permissions} from '@fluxer/constants/src/ChannelConstants';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {BellIcon, GearIcon, type Icon, UserPlusIcon, UsersIcon} from '@phosphor-icons/react';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';

const INVITE_MEMBERS_DESCRIPTOR = msg({
	message: 'Invite members',
	comment: 'Tooltip and accessible label for the invite button in the community sidebar toolbar.',
});

interface ToolbarButtonProps {
	readonly label: string;
	readonly icon: Icon;
	readonly selected?: boolean;
	readonly onClick: () => void;
	readonly flx: string;
}

const ToolbarButton = ({label, icon: IconComponent, selected = false, onClick, flx}: ToolbarButtonProps) => (
	<Tooltip text={label} position="bottom" data-flx="app.guild-sidebar-toolbar.toolbar-button.tooltip">
		<FocusRing offset={-2} data-flx="app.guild-sidebar-toolbar.toolbar-button.focus-ring">
			<button
				type="button"
				className={clsx(styles.button, selected && styles.buttonSelected)}
				aria-label={label}
				aria-current={selected ? 'page' : undefined}
				onClick={onClick}
				data-flx="app.guild-sidebar-toolbar.toolbar-button.button.click"
				data-toolbar-item={flx}
			>
				<IconComponent weight={selected ? 'fill' : 'regular'} className={styles.icon} data-flx="app.guild-sidebar-toolbar.toolbar-button.icon" />
			</button>
		</FocusRing>
	</Tooltip>
);

export const GuildSidebarToolbar = observer(
	({guild, canViewMembers, isMembersSelected}: {guild: Guild; canViewMembers: boolean; isMembersSelected: boolean}) => {
		const {i18n} = useLingui();
		const invitableChannelId = InviteUtils.getInvitableChannelId(guild.id);
		const canInvite = InviteUtils.canInviteToChannel(invitableChannelId, guild.id);
		const canAccessGuildSettings =
			Permission.can(Permissions.MANAGE_GUILD, {guildId: guild.id}) ||
			Permission.can(Permissions.MANAGE_ROLES, {guildId: guild.id}) ||
			Permission.can(Permissions.VIEW_AUDIT_LOG, {guildId: guild.id}) ||
			Permission.can(Permissions.MANAGE_WEBHOOKS, {guildId: guild.id}) ||
			Permission.can(Permissions.MANAGE_EXPRESSIONS, {guildId: guild.id}) ||
			Permission.can(Permissions.CREATE_EXPRESSIONS, {guildId: guild.id}) ||
			Permission.can(Permissions.BAN_MEMBERS, {guildId: guild.id});
		return (
			<div
				className={styles.toolbar}
				role="toolbar"
				aria-label={guild.name}
				data-flx="app.guild-sidebar-toolbar.toolbar"
			>
				{canViewMembers && (
					<ToolbarButton
						label={i18n._(MEMBERS_DESCRIPTOR)}
						icon={UsersIcon}
						selected={isMembersSelected}
						onClick={() => RouterUtils.transitionTo(Routes.guildMembers(guild.id))}
						flx="app.guild-sidebar-toolbar.members"
					/>
				)}
				{canInvite && (
					<ToolbarButton
						label={i18n._(INVITE_MEMBERS_DESCRIPTOR)}
						icon={UserPlusIcon}
						onClick={() =>
							ModalCommands.push(
								modal(() => (
									<InviteModal
										channelId={invitableChannelId ?? ''}
										data-flx="app.guild-sidebar-toolbar.invite-modal"
									/>
								)),
							)
						}
						flx="app.guild-sidebar-toolbar.invite"
					/>
				)}
				<ToolbarButton
					label={i18n._(NOTIFICATION_SETTINGS_DESCRIPTOR)}
					icon={BellIcon}
					onClick={() =>
						ModalCommands.push(
							modal(() => (
								<GuildNotificationSettingsModal
									guildId={guild.id}
									data-flx="app.guild-sidebar-toolbar.guild-notification-settings-modal"
								/>
							)),
						)
					}
					flx="app.guild-sidebar-toolbar.notifications"
				/>
				{canAccessGuildSettings && (
					<ToolbarButton
						label={i18n._(GUILD_SETTINGS_LABEL_DESCRIPTOR)}
						icon={GearIcon}
						onClick={() =>
							ModalCommands.push(
								modal(() => (
									<GuildSettingsModal guildId={guild.id} data-flx="app.guild-sidebar-toolbar.guild-settings-modal" />
								)),
							)
						}
						flx="app.guild-sidebar-toolbar.settings"
					/>
				)}
			</div>
		);
	},
);
