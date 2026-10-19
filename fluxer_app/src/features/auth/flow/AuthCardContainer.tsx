// SPDX-License-Identifier: AGPL-3.0-or-later

import authLayoutStyles from '@app/features/app/components/layout/AuthLayout.module.css';
import RuntimeConfig from '@app/features/app/state/RuntimeConfig';
import styles from '@app/features/auth/flow/AuthCardContainer.module.css';
import {type AuthCardVariant, AuthLayoutContentMode} from '@app/features/auth/state/AuthLayoutContext';
import {DELIGHT_SPARK_PATH} from '@app/features/ui/components/icons/FluxerIconMark';
import {flxElementClassName} from '@app/lib/react';
import clsx from 'clsx';
import type {ReactNode} from 'react';

interface AuthCardContainerProps {
	variant?: AuthCardVariant;
	presentation?: AuthLayoutContentMode;
	children: ReactNode;
	isInert?: boolean;
	className?: string;
	cardClassName?: string;
	contentClassName?: string;
}

const cardVariantClassNames: Record<AuthCardVariant, string | undefined> = {
	default: undefined,
	standard: authLayoutStyles.cardStandard,
	compact: authLayoutStyles.cardCompact,
	wide: authLayoutStyles.cardWide,
};
const formSideVariantClassNames: Record<AuthCardVariant, string | undefined> = {
	default: undefined,
	standard: authLayoutStyles.formSideStandard,
	compact: authLayoutStyles.formSideCompact,
	wide: authLayoutStyles.formSideWide,
};

function renderCardContents(children: ReactNode, isInert: boolean): ReactNode {
	if (!isInert) return children;
	return (
		<flx-auth-card-inert-overlay
			className={flxElementClassName(styles.inertOverlay)}
			data-flx="auth.flow.auth-card-container.inert-overlay"
		>
			{children}
		</flx-auth-card-inert-overlay>
	);
}

export function AuthCardContainer({
	variant = 'default',
	presentation = AuthLayoutContentMode.CARD,
	children,
	isInert = false,
	className,
	cardClassName,
	contentClassName,
}: AuthCardContainerProps) {
	const isFullscreen = presentation === AuthLayoutContentMode.FULL;
	const passthrough = authLayoutStyles.fullscreenPassthrough;
	return (
		<flx-auth-card
			className={flxElementClassName(isFullscreen ? passthrough : clsx(authLayoutStyles.cardContainer, className))}
			data-flx="auth.flow.auth-card-container.div"
		>
			<flx-auth-card-surface
				className={flxElementClassName(
					isFullscreen ? passthrough : clsx(authLayoutStyles.card, cardVariantClassNames[variant], cardClassName),
				)}
				data-flx="auth.flow.auth-card-container.div--2"
			>
				{!isFullscreen && (
					<div className={authLayoutStyles.logoSide} data-flx="auth.flow.auth-card-container.brand-side">
						<div className={authLayoutStyles.brandInner}>
							<svg
								className={authLayoutStyles.wordmark}
								viewBox="0 0 232 64"
								role="img"
								aria-label={RuntimeConfig.productName}
								data-flx="auth.flow.auth-card-container.delight-wordmark"
							>
								<path
									fill="var(--brand-primary)"
									transform="translate(4 4) scale(0.875)"
									d={DELIGHT_SPARK_PATH}
								/>
								<text x={70} y={45} fill="currentColor" fontFamily="Inter, var(--font-sans), sans-serif" fontSize={40} fontWeight={600} letterSpacing={-1}>
									{RuntimeConfig.productName}
								</text>
							</svg>
							<p className={authLayoutStyles.tagline}>Calm, fast chat for the people you actually talk to.</p>
						</div>
						<div className={authLayoutStyles.brandFooter} aria-hidden="true">
							<span>© {new Date().getFullYear()} Delight</span>
						</div>
					</div>
				)}
				<flx-auth-card-form-side
					className={flxElementClassName(
						isFullscreen
						? passthrough
						: clsx(authLayoutStyles.formSide, formSideVariantClassNames[variant], contentClassName),
					)}
					data-flx="auth.flow.auth-card-container.div--4"
				>
					<div className={authLayoutStyles.formInner}>{renderCardContents(children, isInert)}</div>
				</flx-auth-card-form-side>
			</flx-auth-card-surface>
		</flx-auth-card>
	);
}
