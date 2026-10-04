// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/app/components/layout/WindowTitleStrip.module.css';
import {PRODUCT_NAME} from '@app/features/app/config/I18nDisplayConstants';
import {useEffect, useState} from 'react';

// Delight: the empty strip above the app (like Discord's title bar), labelled with the current server or page.
function labelFromDocumentTitle(title: string): string {
	const parts = title
		.replace(/^\(\d+\)\s*/, '')
		.split(' | ')
		.map((part) => part.trim())
		.filter(Boolean);
	if (parts[0] === PRODUCT_NAME) parts.shift();
	if (parts.length >= 2) return parts[parts.length - 1];
	return parts[0] ?? PRODUCT_NAME;
}

export function WindowTitleStrip() {
	const [label, setLabel] = useState(() => labelFromDocumentTitle(document.title));
	useEffect(() => {
		const update = () => setLabel(labelFromDocumentTitle(document.title));
		update();
		const titleElement = document.querySelector('title');
		if (!titleElement) return;
		const observer = new MutationObserver(update);
		observer.observe(titleElement, {childList: true, characterData: true, subtree: true});
		return () => observer.disconnect();
	}, []);
	return (
		<div className={styles.strip} data-flx="app.window-title-strip">
			<span className={styles.label} data-flx="app.window-title-strip.label">
				{label}
			</span>
		</div>
	);
}
