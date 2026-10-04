// SPDX-License-Identifier: AGPL-3.0-or-later

import type {MediaProxyImageSize} from '@fluxer/constants/src/MediaProxyImageSizes';

const DEFAULT_AVATAR_PRIMARY_COLORS = [0x7f49b4, 0x3a3a3a, 0x4a5d73, 0x5e6b4a, 0x7a4a4a, 0x4a6b66];
export const DEFAULT_AVATAR_COUNT = BigInt(DEFAULT_AVATAR_PRIMARY_COLORS.length);
export const normalizeEndpoint = (endpoint: string): string => endpoint.replace(/\/$/, '');
export const parseAvatarHash = (value: string) => {
	const animated = value.startsWith('a_');
	const hash = animated ? value.slice(2) : value;
	return {animated, hash};
};
export const buildMediaUrl = ({
	endpoint,
	path,
	id,
	hash,
	size,
	animated,
}: {
	endpoint: string;
	path: string;
	id: string;
	hash: string;
	size: MediaProxyImageSize;
	animated?: boolean;
}) => {
	const normalizedEndpoint = normalizeEndpoint(endpoint);
	const query = animated ? `size=${size}&animated=true` : `size=${size}`;
	return `${normalizedEndpoint}/${path}/${id}/${hash}.webp?${query}`;
};
export const getDefaultAvatarIndex = (id: string): number => Number(BigInt(id) % DEFAULT_AVATAR_COUNT);
export const getDefaultAvatarPrimaryColor = (id: string): number =>
	DEFAULT_AVATAR_PRIMARY_COLORS[getDefaultAvatarIndex(id)];
