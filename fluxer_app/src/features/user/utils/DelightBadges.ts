// SPDX-License-Identifier: AGPL-3.0-or-later

import {delightServiceBaseUrl} from '@app/features/user/utils/DelightService';
import type {MessageDescriptor} from '@lingui/core';
import {msg} from '@lingui/core/macro';

/** Bump when badge artwork changes, so browsers drop their cached copies. */
const BADGE_ART_VERSION = '1';

export interface DelightBadge {
	id: string;
	name: MessageDescriptor;
	description: MessageDescriptor;
}

/**
 * Delight profile badges, in display order. Keep ids/order in sync with BADGE_ORDER in delight/service/badges-db.ts;
 * the artwork is delight/badges/<id>.png (128px) and <id>@64.png, served by the sidecar at /delight/badge-assets/.
 */
export const DELIGHT_BADGES: ReadonlyArray<DelightBadge> = [
	{
		id: 'staff',
		name: msg({message: 'Delight Staff', comment: 'Profile badge name.'}),
		description: msg({message: 'Part of the team that builds Delight.', comment: 'Profile badge description.'}),
	},
	{
		id: 'og',
		name: msg({message: 'OG', comment: 'Profile badge name: one of the very first people on Delight.'}),
		description: msg({message: 'Here since the very beginning.', comment: 'Profile badge description.'}),
	},
	{
		id: 'developer',
		name: msg({message: 'Developer', comment: 'Profile badge name.'}),
		description: msg({message: 'Builds bots, apps or code for Delight.', comment: 'Profile badge description.'}),
	},
	{
		id: 'moderator',
		name: msg({message: 'Moderator', comment: 'Profile badge name.'}),
		description: msg({message: 'Helps keep Delight communities safe.', comment: 'Profile badge description.'}),
	},
	{
		id: 'partner',
		name: msg({message: 'Partner', comment: 'Profile badge name.'}),
		description: msg({message: 'Runs a partnered community.', comment: 'Profile badge description.'}),
	},
	{
		id: 'verified',
		name: msg({message: 'Verified', comment: 'Profile badge name.'}),
		description: msg({message: 'Identity confirmed by the Delight team.', comment: 'Profile badge description.'}),
	},
	{
		id: 'subscriber',
		name: msg({message: 'Subscriber', comment: 'Profile badge name: has a paid Delight subscription.'}),
		description: msg({message: 'Supports Delight with a subscription.', comment: 'Profile badge description.'}),
	},
	{
		id: 'booster',
		name: msg({message: 'Booster', comment: 'Profile badge name.'}),
		description: msg({message: 'Boosts a community they love.', comment: 'Profile badge description.'}),
	},
	{
		id: 'early_supporter',
		name: msg({message: 'Early Supporter', comment: 'Profile badge name.'}),
		description: msg({message: 'Backed Delight early on.', comment: 'Profile badge description.'}),
	},
	{
		id: 'bug_hunter',
		name: msg({message: 'Bug Hunter', comment: 'Profile badge name.'}),
		description: msg({message: 'Found and reported bugs in Delight.', comment: 'Profile badge description.'}),
	},
];

const BY_ID = new Map(DELIGHT_BADGES.map((badge) => [badge.id, badge]));

export function getDelightBadge(id: string): DelightBadge | undefined {
	return BY_ID.get(id);
}

/** Known ids only, deduplicated, in catalog order. */
export function sortDelightBadgeIds(ids: Iterable<string>): Array<string> {
	const wanted = new Set(ids);
	return DELIGHT_BADGES.filter((badge) => wanted.has(badge.id)).map((badge) => badge.id);
}

export function delightBadgeImageUrl(id: string, size: 64 | 128 = 64): string {
	return `${delightServiceBaseUrl()}/badge-assets/${id}${size === 64 ? '@64' : ''}.png?v=${BADGE_ART_VERSION}`;
}
