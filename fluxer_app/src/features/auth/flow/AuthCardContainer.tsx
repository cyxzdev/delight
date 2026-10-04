// SPDX-License-Identifier: AGPL-3.0-or-later

import authLayoutStyles from '@app/features/app/components/layout/AuthLayout.module.css';
import styles from '@app/features/auth/flow/AuthCardContainer.module.css';
import type {AuthCardVariant} from '@app/features/auth/state/AuthLayoutContext';
import RuntimeConfig from '@app/features/app/state/RuntimeConfig';
import {DELIGHT_SPARK_PATH} from '@app/features/ui/components/icons/FluxerIconMark';
import clsx from 'clsx';
import type {ReactNode} from 'react';

interface AuthCardContainerProps {
	showLogoSide?: boolean;
	variant?: AuthCardVariant;
	children: ReactNode;
	isInert?: boolean;
	className?: string;
	splashUrl?: string | null;
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

export function AuthCardContainer({
	showLogoSide = true,
	variant = 'default',
	children,
	isInert = false,
	className,
	splashUrl = null,
}: AuthCardContainerProps) {
	return (
		<div className={clsx(authLayoutStyles.cardContainer, className)} data-flx="auth.flow.auth-card-container.div">
			<div
				className={clsx(
					authLayoutStyles.card,
					!showLogoSide && authLayoutStyles.cardSingle,
					cardVariantClassNames[variant],
				)}
				data-flx="auth.flow.auth-card-container.div--2"
			>
				{showLogoSide && (
					<div className={authLayoutStyles.logoSide} data-flx="auth.flow.auth-card-container.div--3">
						{splashUrl && (
							<div className={authLayoutStyles.brandSplash} aria-hidden="true">
								<img src={splashUrl} alt="" className={authLayoutStyles.brandSplashImage} />
							</div>
						)}
						<div className={authLayoutStyles.brandInner}>
							<svg
								className={authLayoutStyles.wordmark}
								viewBox="0 0 232 64"
								role="img"
								aria-label={RuntimeConfig.productName}
								data-flx="auth.flow.auth-card-container.fluxer-wordmark"
							>
								<path
									fill="var(--brand-primary)"
									transform="translate(4 4) scale(0.875)"
									d={DELIGHT_SPARK_PATH}
								/>
								<text
									x={70}
									y={45}
									fill="currentColor"
									fontFamily="Inter, var(--font-sans), sans-serif"
									fontSize={40}
									fontWeight={600}
									letterSpacing={-1}
								>
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
				<div
					className={clsx(
						authLayoutStyles.formSide,
						!showLogoSide && authLayoutStyles.formSideSingle,
						formSideVariantClassNames[variant],
					)}
					data-flx="auth.flow.auth-card-container.div--4"
				>
					<div className={authLayoutStyles.formInner}>
						{isInert ? (
							<div className={styles.inertOverlay} data-flx="auth.flow.auth-card-container.inert-overlay">
								{children}
							</div>
						) : (
							children
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
