// SPDX-License-Identifier: AGPL-3.0-or-later

import {CustomStatusDisplay} from '@app/features/app/components/shared/custom_status_display/CustomStatusDisplay';
import {getStatusTypeLabel} from '@app/features/app/constants/AppConstants';
import styles from '@app/features/channel/components/direct_message/DMHeaderPresenceLine.module.css';
import {usePresenceCustomStatus} from '@app/features/presence/hooks/usePresenceCustomStatus';
import Presence from '@app/features/presence/state/Presence';
import {isOfflineStatus} from '@fluxer/constants/src/StatusConstants';
import {useLingui} from '@lingui/react/macro';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';

/** Second line of the DM header: the recipient's custom status, or their presence (Online, Idle, …). */
export const DMHeaderPresenceLine = observer(function DMHeaderPresenceLine({userId}: {userId: string}) {
	const {i18n} = useLingui();
	const status = Presence.getStatus(userId);
	const customStatus = usePresenceCustomStatus({userId});
	if (customStatus) {
		return (
			<CustomStatusDisplay
				customStatus={customStatus}
				className={styles.line}
				showTooltip
				constrained
				animateOnParentHover
				data-flx="channel.direct-message.dm-header-presence-line.custom-status"
			/>
		);
	}
	return (
		<span
			className={clsx(styles.line, !isOfflineStatus(status) && styles.online)}
			data-flx="channel.direct-message.dm-header-presence-line.status"
		>
			{getStatusTypeLabel(i18n, status)}
		</span>
	);
});
