// SPDX-License-Identifier: AGPL-3.0-or-later

function getBootstrapProductName(): string {
	if (typeof window === 'undefined') {
		return 'Delight';
	}
	const productName = window.__FLUXER_BOOTSTRAP__?.instance.app_public?.branding?.product_name?.trim();
	return productName || 'Delight';
}

function getBootstrapPremiumProductName(): string {
	if (typeof window === 'undefined') {
		return 'Premium';
	}
	const premiumProductName = window.__FLUXER_BOOTSTRAP__?.instance.app_public?.branding?.premium_product_name?.trim();
	return premiumProductName || 'Premium';
}

export const PRODUCT_NAME = getBootstrapProductName();
export const PREMIUM_PRODUCT_NAME = getBootstrapPremiumProductName();
export const PREMIUM_PRODUCT_FULL_NAME = `${PRODUCT_NAME} ${PREMIUM_PRODUCT_NAME}`;

// The API hard-codes the instance admin panel's built-in OAuth app as 'Fluxer Admin'; show it under the product name.
export function displayApplicationName(name: string): string {
	return name.trim() === 'Fluxer Admin' ? `${PRODUCT_NAME} Admin` : name;
}
