// SPDX-License-Identifier: AGPL-3.0-or-later

import Accessibility from '@app/features/accessibility/state/Accessibility';
import styles from '@app/features/user/components/profile_frames/ProfileFrame.module.css';
import {
	getProfileFrameDefinition,
	getProfileFrameSpill,
	profileFrameAssetUrl,
} from '@app/features/user/components/profile_frames/registry';
import type {ProfileFrameId} from '@app/features/user/utils/ProfileFrameIds';
import {clsx} from 'clsx';
import {observer} from 'mobx-react-lite';
import type React from 'react';
import {useId, useLayoutEffect, useRef, useState} from 'react';

interface ProfileFrameProps {
	frame: ProfileFrameId | null | undefined;
	/** Draw a still frame (no twinkle/flicker), as under reduced motion. */
	still?: boolean;
	/**
	 * Keep the artwork inside the card (the top band starts at the card's top edge instead of rising above it) — for
	 * hosts that can't let anything spill out, like the mobile sheet.
	 */
	contain?: boolean;
	/**
	 * Give an ancestor (the closest match of `selector`) top/bottom margins for the frame's spill — less `inset`, the
	 * card's distance from that ancestor's edges — and cap its height to match, so a centred dialog stays on screen
	 * with its frame (the profile modal).
	 */
	reserveSpaceOn?: {selector: string; inset?: number};
	className?: string;
}

interface Size {
	width: number;
	height: number;
}

/**
 * A profile frame: absolutely positioned over the card that contains it (the card must be `position: relative`; it
 * should not clip, or the top band can't rise above it). Measures the card and lays the artwork out in card widths, so
 * it fits any card size. Never takes pointer events.
 */
export const ProfileFrame: React.FC<ProfileFrameProps> = observer(({frame, still = false, contain = false, reserveSpaceOn, className}) => {
	const rootRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<Size | null>(null);
	const idPrefix = `pfr${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
	const reducedMotion = Accessibility.useReducedMotion || still;

	useLayoutEffect(() => {
		if (!frame) return;
		const element = rootRef.current;
		if (!element) return;
		const update = () => {
			const next = {width: element.offsetWidth, height: element.offsetHeight};
			setSize((prev) => (prev && prev.width === next.width && prev.height === next.height ? prev : next));
		};
		update();
		const ownerWindow = element.ownerDocument.defaultView;
		if (!ownerWindow || typeof ownerWindow.ResizeObserver === 'undefined') return;
		const observer = new ownerWindow.ResizeObserver(update);
		observer.observe(element);
		return () => observer.disconnect();
	}, [frame]);

	const spillTop = frame && size ? getProfileFrameSpill(frame, size.width).top : 0;
	const spillBottom = frame && size ? getProfileFrameSpill(frame, size.width).bottom : 0;
	const reserveSelector = reserveSpaceOn?.selector;
	const reserveInset = reserveSpaceOn?.inset ?? 0;
	useLayoutEffect(() => {
		const host = reserveSelector ? rootRef.current?.closest<HTMLElement>(reserveSelector) : null;
		const top = Math.max(0, spillTop - reserveInset);
		const bottom = Math.max(0, spillBottom - reserveInset);
		if (!host || (!top && !bottom)) return;
		const previous = {marginTop: host.style.marginTop, marginBottom: host.style.marginBottom, maxHeight: host.style.maxHeight};
		host.style.marginTop = `${top}px`;
		host.style.marginBottom = `${bottom}px`;
		host.style.maxHeight = `calc(100svh - 4rem - ${top + bottom}px)`;
		return () => {
			host.style.marginTop = previous.marginTop;
			host.style.marginBottom = previous.marginBottom;
			host.style.maxHeight = previous.maxHeight;
		};
	}, [reserveSelector, reserveInset, spillTop, spillBottom]);

	if (!frame) return null;
	const definition = getProfileFrameDefinition(frame);
	const ready = size != null && size.width > 0 && size.height > 0;
	const {Overlay} = definition;
	let shiftTop = 0;
	let shiftBottom = 0;
	if (ready && contain) {
		const spill = getProfileFrameSpill(frame, size.width);
		shiftTop = spill.top;
		shiftBottom = -spill.bottom;
	}
	return (
		<div
			ref={rootRef}
			className={clsx(styles.root, className)}
			aria-hidden="true"
			data-profile-frame={frame}
			data-still={reducedMotion ? '' : undefined}
			data-flx="user.profile-frame"
		>
			{ready &&
				definition.pieces.map((piece) => {
					const u = size.width;
					const top =
						piece.anchor === 'top' ? piece.y * u + shiftTop : size.height + piece.y * u + shiftBottom;
					return (
						<img
							key={piece.name}
							className={styles.piece}
							src={profileFrameAssetUrl(frame, piece.name)}
							alt=""
							draggable={false}
							decoding="async"
							style={{left: piece.x * u, top, width: piece.w * u, height: piece.h * u}}
						/>
					);
				})}
			{ready && Overlay && (
				<svg
					className={styles.svg}
					width={size.width}
					height={size.height}
					aria-hidden="true"
				>
					<g transform={shiftTop ? `translate(0 ${shiftTop})` : undefined}>
						<Overlay width={size.width} height={size.height} idPrefix={idPrefix} />
					</g>
				</svg>
			)}
		</div>
	);
});

ProfileFrame.displayName = 'ProfileFrame';

export {getProfileFrameSpill} from '@app/features/user/components/profile_frames/registry';
export const profileFrameModalRootClassName = styles.modalRootFramed;
/** Put on a wrapper padded for a frame's spill (see ProfileCardLayout). */
export const profileFramePadClassName = styles.framePad;
