// SPDX-License-Identifier: AGPL-3.0-or-later

import RuntimeConfig from '@app/features/app/state/RuntimeConfig';

/** Base URL of the Delight sidecar: the API endpoint with `/api` swapped for `/delight` (same origin by default). */
export function delightServiceBaseUrl(): string {
	const api = RuntimeConfig.apiEndpoint?.trim();
	if (!api) return '/delight';
	return `${api.replace(/\/+$/, '').replace(/\/api$/, '')}/delight`;
}
