// SPDX-License-Identifier: AGPL-3.0-or-later

/** Routes for the Delight developer portal (full page, outside the settings modal). */
export const DeveloperPortalPaths = {
	ROOT: '/developers',
	APPLICATIONS: '/developers/applications',
	APPLICATION: '/developers/applications/:appId',
	OPTIONS: '/developers/options',
	EMBED_DEBUGGER: '/developers/embed-debugger',
	COMPONENT_GALLERY: '/developers/component-gallery',
	application: (appId: string) => `/developers/applications/${appId}`,
} as const;

export type DeveloperPortalSection = 'applications' | 'options' | 'embed_debugger' | 'component_gallery';
