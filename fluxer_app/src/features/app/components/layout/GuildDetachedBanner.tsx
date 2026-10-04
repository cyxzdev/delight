// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/app/components/layout/GuildDetachedBanner.module.css';
import {useAnimatedImageUrl} from '@app/features/app/hooks/useAnimatedImageUrl';
import type {Guild} from '@app/features/guild/models/Guild';
import * as AvatarUtils from '@app/features/user/utils/AvatarUtils';
import {observer} from 'mobx-react-lite';
import {useMemo} from 'react';

// Delight: every banner shows as a short rounded card under the header.
export const GuildDetachedBanner = observer(function GuildDetachedBanner({guild}: {guild: Guild}) {
	const staticBannerURL = useMemo(
		() => AvatarUtils.getGuildBannerURL({id: guild.id, banner: guild.banner}, false) || null,
		[guild.banner, guild.id],
	);
	const animatedBannerURL = useMemo(
		() => AvatarUtils.getGuildBannerURL({id: guild.id, banner: guild.banner}, true) || null,
		[guild.banner, guild.id],
	);
	const {hoverRef: bannerHoverRef, imageUrl: bannerURL} = useAnimatedImageUrl({
		staticUrl: staticBannerURL,
		animatedUrl: animatedBannerURL,
		kind: 'gif',
	});
	if (!bannerURL) return null;
	return (
		<div ref={bannerHoverRef} className={styles.container} data-flx="app.guild-detached-banner.container">
			<img
				src={bannerURL}
				alt=""
				className={styles.banner}
				draggable={false}
				data-flx="app.guild-detached-banner.banner"
			/>
		</div>
	);
});
