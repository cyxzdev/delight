// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/app/components/dialogs/shared/SettingsPillTabs.module.css';
import {useScrollSpyContext} from '@app/features/user/state/ScrollSpyContext';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useEffect, useRef} from 'react';

export interface SettingsPillTabItem {
	id: string;
	label: React.ReactNode;
}

interface SettingsPillTabsProps {
	items: ReadonlyArray<SettingsPillTabItem>;
	activeId: string | null;
	onSelect: (id: string) => void;
	ariaLabel?: string;
	className?: string;
}

/** Delight segmented pill tabs (page header style): 28px pills, selected one filled. */
export const SettingsPillTabs: React.FC<SettingsPillTabsProps> = ({items, activeId, onSelect, ariaLabel, className}) => {
	const listRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		const list = listRef.current;
		if (!list || !activeId) return;
		const active = list.querySelector<HTMLElement>(`[data-pill-id="${CSS.escape(activeId)}"]`);
		if (!active) return;
		const left = active.offsetLeft;
		const right = left + active.offsetWidth;
		if (left < list.scrollLeft || right > list.scrollLeft + list.clientWidth) {
			list.scrollTo({left: Math.max(0, left - 24), behavior: 'smooth'});
		}
	}, [activeId]);
	if (items.length === 0) return null;
	return (
		<div
			ref={listRef}
			className={clsx(styles.pills, className)}
			role="tablist"
			aria-label={ariaLabel}
			data-flx="app.settings-pill-tabs.pills"
		>
			{items.map((item) => {
				const selected = item.id === activeId;
				return (
					<button
						key={item.id}
						type="button"
						role="tab"
						aria-selected={selected}
						data-pill-id={item.id}
						className={clsx(styles.pill, selected && styles.pillSelected)}
						onClick={() => onSelect(item.id)}
						data-flx="app.settings-pill-tabs.pill"
					>
						{item.label}
					</button>
				);
			})}
		</div>
	);
};

interface SettingsSectionPillsProps {
	items: ReadonlyArray<SettingsPillTabItem>;
	ariaLabel?: string;
}

/** Pill tabs bound to the settings scroll spy: shows the section in view and scrolls to the one clicked. */
export const SettingsSectionPills: React.FC<SettingsSectionPillsProps> = observer(({items, ariaLabel}) => {
	const scrollSpy = useScrollSpyContext();
	const activeId = scrollSpy?.activeSectionId ?? items[0]?.id ?? null;
	return (
		<SettingsPillTabs
			items={items}
			activeId={activeId}
			onSelect={(id) => scrollSpy?.scrollToSection(id)}
			ariaLabel={ariaLabel}
			data-flx="app.settings-section-pills.pill-tabs"
		/>
	);
});
