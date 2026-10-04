// SPDX-License-Identifier: AGPL-3.0-or-later

import {remFromPx} from '@app/features/theme/layout/RemFromPx';
import FocusRing from '@app/features/ui/focus_ring/FocusRing';
import styles from '@app/features/user/components/modals/tabs/appearance_tab/ThemeTab.module.css';
import type {ThemeType} from '@fluxer/constants/src/UserConstants';
import {CheckIcon} from '@phosphor-icons/react';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import React from 'react';

export interface ThemeButtonProps {
	themeType: ThemeType;
	currentTheme: ThemeType;
	label: string;
	backgroundColor: string;
	isLight: boolean;
	disabled?: boolean;
	onKeyDown: (event: React.KeyboardEvent, themeType: ThemeType) => void;
	onClick: (themeType: ThemeType) => void;
	icon?: React.ReactElement<Record<string, unknown>>;
}

export const ThemeButton = observer(
	React.forwardRef<HTMLButtonElement, ThemeButtonProps>(
		({themeType, currentTheme, label, backgroundColor, isLight, disabled = false, onKeyDown, onClick, icon}, ref) => {
			const isSelected = currentTheme === themeType;
			return (
				<FocusRing offset={-2} data-flx="user.appearance-tab.theme.theme-button.focus-ring">
					<button
						ref={ref}
						type="button"
						onClick={() => onClick(themeType)}
						onKeyDown={(e) => onKeyDown(e, themeType)}
						className={clsx(styles.themeButton, isSelected && styles.themeButtonSelected)}
						disabled={disabled}
						role="radio"
						aria-checked={isSelected}
						aria-disabled={disabled}
						aria-label={label}
						tabIndex={disabled ? -1 : isSelected ? 0 : -1}
						data-flx="user.appearance-tab.theme.theme-button.radio.click.button"
					>
						<span
							className={clsx(styles.themeSwatch, isLight ? styles.themeSwatchLight : styles.themeSwatchDark)}
							style={{backgroundColor}}
							aria-hidden="true"
							data-flx="user.appearance-tab.theme.theme-button.swatch"
						>
							<span className={styles.swatchNav} data-flx="user.appearance-tab.theme.theme-button.swatch-nav" />
							<span className={styles.swatchBody} data-flx="user.appearance-tab.theme.theme-button.swatch-body">
								<span className={styles.swatchLine} data-flx="user.appearance-tab.theme.theme-button.swatch-line" />
								<span
									className={clsx(styles.swatchLine, styles.swatchLineShort)}
									data-flx="user.appearance-tab.theme.theme-button.swatch-line--2"
								/>
								<span className={styles.swatchComposer} data-flx="user.appearance-tab.theme.theme-button.swatch-composer" />
							</span>
							{icon && (
								<span className={styles.themeButtonIcon} data-flx="user.appearance-tab.theme.theme-button.theme-button-icon">
									{React.cloneElement(icon, {
										size: 16,
										weight: 'bold',
										style: {color: isLight ? '#000000' : '#ffffff'},
									})}
								</span>
							)}
							{isSelected && (
								<span
									className={styles.themeButtonCheckmark}
									data-flx="user.appearance-tab.theme.theme-button.theme-button-checkmark"
								>
									<CheckIcon
										weight="bold"
										className={styles.themeButtonCheckmarkIcon}
										size={remFromPx(10)}
										data-flx="user.appearance-tab.theme.theme-button.theme-button-checkmark-icon"
									/>
								</span>
							)}
						</span>
						<span className={styles.themeLabel} data-flx="user.appearance-tab.theme.theme-button.label">
							{label}
						</span>
					</button>
				</FocusRing>
			);
		},
	),
);
