// SPDX-License-Identifier: AGPL-3.0-or-later

import Accessibility from '@app/features/accessibility/state/Accessibility';
import styles from '@app/features/user/components/profile_effects/ProfileEffect.module.css';
import type {ProfileEffectGeometry} from '@app/features/user/components/profile_effects/effectKit';
import {getProfileEffectDefinition} from '@app/features/user/components/profile_effects/registry';
import type {ProfileEffectId} from '@app/features/user/utils/ProfileEffects';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useId, useLayoutEffect, useRef, useState} from 'react';

/** Put on the avatar frame / banner inside a profile card so effects can line up with them. */
export const PROFILE_EFFECT_AVATAR_ATTR = 'data-profile-effect-avatar';
export const PROFILE_EFFECT_BANNER_ATTR = 'data-profile-effect-banner';

interface ProfileEffectProps {
	effect: ProfileEffectId | null | undefined;
	/** Corner radius of the card the effect hugs, in px. */
	radius?: number;
	/** Draw a still frame instead of animating (as under reduced motion). */
	still?: boolean;
}

function sameGeometry(a: ProfileEffectGeometry | null, b: ProfileEffectGeometry): boolean {
	if (a == null) return false;
	return (
		a.width === b.width &&
		a.height === b.height &&
		a.bannerBottom === b.bannerBottom &&
		a.avatar?.cx === b.avatar?.cx &&
		a.avatar?.cy === b.avatar?.cy &&
		a.avatar?.r === b.avatar?.r
	);
}

function measure(card: HTMLElement): ProfileEffectGeometry {
	const cardRect = card.getBoundingClientRect();
	// The card may be mid open-animation (scaled); work in its untransformed CSS pixels.
	const scale = card.offsetWidth > 0 ? cardRect.width / card.offsetWidth : 1;
	const round = (value: number) => Math.round(value * 2) / 2;
	const geometry: ProfileEffectGeometry = {
		width: card.offsetWidth,
		height: card.offsetHeight,
		bannerBottom: null,
		avatar: null,
	};
	const banner = card.querySelector<HTMLElement>(`[${PROFILE_EFFECT_BANNER_ATTR}]`);
	if (banner) {
		const rect = banner.getBoundingClientRect();
		geometry.bannerBottom = round((rect.bottom - cardRect.top) / scale);
	}
	const avatar = card.querySelector<HTMLElement>(`[${PROFILE_EFFECT_AVATAR_ATTR}]`);
	if (avatar) {
		const rect = avatar.getBoundingClientRect();
		geometry.avatar = {
			cx: round((rect.left + rect.width / 2 - cardRect.left) / scale),
			cy: round((rect.top + rect.height / 2 - cardRect.top) / scale),
			r: round(rect.width / 2 / scale),
		};
	}
	return geometry;
}

/**
 * Animated profile effect: two pointer-events:none SVG layers sized to the card that contains this component — one
 * behind the card's content (but above its background) and one in front of it. The containing card must be
 * `position: relative` and `isolation: isolate` (see `.host` in ProfileEffect.module.css, exported as
 * `profileEffectHostClassName`).
 */
export const ProfileEffect: React.FC<ProfileEffectProps> = observer(({effect, radius = 6, still = false}) => {
	const backRef = useRef<HTMLDivElement>(null);
	const [geometry, setGeometry] = useState<ProfileEffectGeometry | null>(null);
	const idPrefix = `pfx${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const reducedMotion = Accessibility.useReducedMotion || still;

	useLayoutEffect(() => {
		if (!effect) return;
		const card = backRef.current?.parentElement;
		if (!card) return;
		const update = () => {
			const next = measure(card);
			setGeometry((prev) => (sameGeometry(prev, next) ? prev : next));
		};
		update();
		const ownerWindow = card.ownerDocument.defaultView;
		if (!ownerWindow || typeof ownerWindow.ResizeObserver === 'undefined') return;
		const observer = new ownerWindow.ResizeObserver(update);
		observer.observe(card);
		const avatar = card.querySelector(`[${PROFILE_EFFECT_AVATAR_ATTR}]`);
		const banner = card.querySelector(`[${PROFILE_EFFECT_BANNER_ATTR}]`);
		if (avatar) observer.observe(avatar);
		if (banner) observer.observe(banner);
		// The open animation of popouts/modals scales the card; re-measure once it has settled.
		const settle = ownerWindow.setTimeout(update, 320);
		return () => {
			observer.disconnect();
			ownerWindow.clearTimeout(settle);
		};
	}, [effect]);

	if (!effect) return null;
	const ready = geometry != null && geometry.width > 0 && geometry.height > 0;
	const layerClass = clsx(styles.layer, reducedMotion && styles.reducedMotion);
	const {Layer} = getProfileEffectDefinition(effect);
	const staticAttr = reducedMotion ? '' : undefined;
	return (
		<>
			<div
				ref={backRef}
				className={clsx(layerClass, styles.back)}
				aria-hidden="true"
				data-profile-effect={effect}
				data-pfx-static={staticAttr}
				data-flx="user.profile-effect.back"
			>
				{ready && <Layer layer="back" geometry={geometry} radius={radius} idPrefix={idPrefix} />}
			</div>
			<div
				className={clsx(layerClass, styles.front)}
				aria-hidden="true"
				data-pfx-static={staticAttr}
				data-flx="user.profile-effect.front"
			>
				{ready && <Layer layer="front" geometry={geometry} radius={radius} idPrefix={idPrefix} />}
			</div>
		</>
	);
});

export const profileEffectHostClassName = styles.host;
