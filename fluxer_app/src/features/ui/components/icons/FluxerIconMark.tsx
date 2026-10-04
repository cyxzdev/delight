// SPDX-License-Identifier: AGPL-3.0-or-later

import {msg} from '@lingui/core/macro';
import type React from 'react';

export const APPLICATION_ICON_DESCRIPTOR = msg({
	message: '{productName} application icon',
	comment: 'Accessible label for the Fluxer application icon.',
});

export const DELIGHT_SPARK_PATH = 'M32 4L39.6 24.4L60 32L39.6 39.6L32 60L24.4 39.6L4 32L24.4 24.4Z';

/** Delight app icon: a rounded square in the brand colour with the white spark. */
export const FluxerIconMark = (props: React.SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" data-flx="ui.icons.fluxer-icon.img" {...props}>
		<rect fill="var(--brand-primary, #7F49B4)" height={64} rx={14} width={64} data-flx="ui.icons.fluxer-icon.rect" />
		<path
			fill="#fff"
			transform="translate(14 14) scale(0.5625)"
			d={DELIGHT_SPARK_PATH}
			data-flx="ui.icons.fluxer-icon.path"
		/>
	</svg>
);

/** The bare Delight spark in currentColor. */
export const DelightSparkMark = (props: React.SVGProps<SVGSVGElement>) => (
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" {...props}>
		<path fill="currentColor" d={DELIGHT_SPARK_PATH} />
	</svg>
);
