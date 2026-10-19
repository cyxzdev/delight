// SPDX-License-Identifier: AGPL-3.0-or-later

import {resolveAppShellBranding} from '@app/features/app/state/AppShellBranding';
import RuntimeConfig from '@app/features/app/state/RuntimeConfig';
import {type BrandSvgProps, getDataFlx, getImageSizingProps} from '@app/features/ui/components/icons/BrandImageUtils';
import {DELIGHT_SPARK_PATH} from '@app/features/ui/components/icons/FluxerIconMark';
import {msg} from '@lingui/core/macro';
import {useLingui} from '@lingui/react/macro';
import {observer} from 'mobx-react-lite';

const APPLICATION_WORDMARK_DESCRIPTOR = msg({
	message: '{productName} wordmark',
	comment: 'Accessible label for the application wordmark.',
});

interface FluxerWordmarkProps extends BrandSvgProps {
	variant?: 'default' | 'monochrome';
}

export const FluxerWordmark = observer(({variant = 'default', ...props}: FluxerWordmarkProps) => {
	const {i18n} = useLingui();
	const branding = resolveAppShellBranding(RuntimeConfig.getSnapshotOrNull());
	const productName = branding.productName;
	const ariaLabel = i18n._(APPLICATION_WORDMARK_DESCRIPTOR, {productName});
	if (branding.wordmarkUrl !== null) {
		return (
			<img
				{...getImageSizingProps(props)}
				src={branding.wordmarkUrl}
				alt={ariaLabel}
				data-flx={getDataFlx(props, 'ui.icons.fluxer-wordmark.img')}
			/>
		);
	}
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 232 64"
			role="img"
			aria-label={ariaLabel}
			data-flx={getDataFlx(props, 'ui.icons.fluxer-wordmark.img')}
			{...props}
		>
			<path
				fill={variant === 'monochrome' ? 'currentColor' : 'var(--brand-primary, #7F49B4)'}
				transform="translate(4 4) scale(0.875)"
				d={DELIGHT_SPARK_PATH}
			/>
			<text
				x="70"
				y="45"
				fill="currentColor"
				fontFamily="Inter, var(--font-sans), Helvetica, Arial, sans-serif"
				fontSize="40"
				fontWeight="600"
				letterSpacing="-1"
			>
				{productName}
			</text>
		</svg>
	);
});
