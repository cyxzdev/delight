// SPDX-License-Identifier: AGPL-3.0-or-later

import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import {clsx} from 'clsx';
import type React from 'react';

/**
 * Shared pieces for profile effects. An effect is a component that draws ONE layer ('back' = behind the card's
 * content, above its background; 'front' = over everything) as an SVG in the card's own pixel space.
 *
 * Motion is CSS only (transform + opacity) with per-element custom properties, see EffectMotion.module.css. When the
 * layer is static (reduced motion, or a still thumbnail) an ancestor carries `data-pfx-static`, and every motion class
 * shows a composed still frame instead: drifting things sit at `--sx/--sy`, intros are finished, one-shots are hidden.
 */

export interface ProfileEffectGeometry {
	width: number;
	height: number;
	/** Bottom edge of the banner, in card px (null if the card has no banner). */
	bannerBottom: number | null;
	/** Avatar circle in card px. */
	avatar: {cx: number; cy: number; r: number} | null;
}

export interface ProfileEffectLayerProps {
	layer: 'front' | 'back';
	geometry: ProfileEffectGeometry;
	/** Corner radius of the card. */
	radius: number;
	/** Unique prefix for ids (clip paths, gradients) so several cards can be on screen at once. */
	idPrefix: string;
	/** Static (reduced motion or a still thumbnail); SVG effects get this from `[data-pfx-static]` instead. */
	still?: boolean;
}

export type ProfileEffectLayer = React.FC<ProfileEffectLayerProps>;

/** Small deterministic PRNG so an effect's layout is stable between renders. */
export function seeded(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function between(rand: () => number, min: number, max: number): number {
	return min + rand() * (max - min);
}

/** Scale factor for decorations: 1 on a 300px-wide card, growing to 1.6 on the ~600px profile modal. */
export function scaleFor(width: number): number {
	return Math.min(1.6, Math.max(0.7, width / 300));
}

/**
 * How many times more edge-hugging particles/ornaments a card wants than the 300×400 popout: by perimeter, so a
 * bigger card isn't sparser. Never below 1 (thumbnails keep the popout's set) and capped for perf.
 */
export function densityFor(geometry: {width: number; height: number}, cap = 2): number {
	return Math.min(cap, Math.max(1, (geometry.width + geometry.height) / 700));
}

/** `base` scaled by the density of a w×h card, rounded. */
export function countFor(w: number, h: number, base: number, cap = 2): number {
	return Math.round(base * densityFor({width: w, height: h}, cap));
}

export function bannerBottomOf(geometry: ProfileEffectGeometry): number {
	return geometry.bannerBottom ?? Math.round(Math.min(geometry.height * 0.25, 105));
}

type MotionVars = {
	dur?: number;
	delay?: number;
	dx?: number;
	dy?: number;
	rot?: number;
	sway?: number;
	/** Still-frame offset (static mode). */
	sx?: number;
	sy?: number;
	sr?: number;
	scale?: number;
};

/** Inline custom properties for the motion classes. Times in ms, distances in px, angles in deg. */
export function vars(v: MotionVars): React.CSSProperties {
	const style: Record<string, string> = {};
	if (v.dur != null) style['--dur'] = `${Math.round(v.dur)}ms`;
	if (v.delay != null) style['--delay'] = `${Math.round(v.delay)}ms`;
	if (v.dx != null) style['--dx'] = `${v.dx.toFixed(1)}px`;
	if (v.dy != null) style['--dy'] = `${v.dy.toFixed(1)}px`;
	if (v.rot != null) style['--rot'] = `${Math.round(v.rot)}deg`;
	if (v.sway != null) style['--sway'] = `${v.sway.toFixed(1)}px`;
	if (v.sx != null) style['--sx'] = `${v.sx.toFixed(1)}px`;
	if (v.sy != null) style['--sy'] = `${v.sy.toFixed(1)}px`;
	if (v.sr != null) style['--sr'] = `${Math.round(v.sr)}deg`;
	if (v.scale != null) style['--scale'] = `${v.scale}`;
	return style as React.CSSProperties;
}

/** The layer's <svg>, optionally clipped to the card's rounded rect. */
export const EffectSvg: React.FC<{
	geometry: ProfileEffectGeometry;
	radius: number;
	idPrefix: string;
	layer: 'front' | 'back';
	clip?: boolean;
	defs?: React.ReactNode;
	children: React.ReactNode;
}> = ({geometry, radius, idPrefix, layer, clip = true, defs, children}) => {
	const {width: w, height: h} = geometry;
	const clipId = `${idPrefix}-${layer}-clip`;
	return (
		<svg className={motion.svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="visible">
			<defs>
				{clip && (
					<clipPath id={clipId}>
						<rect x={0} y={0} width={w} height={h} rx={radius} />
					</clipPath>
				)}
				{defs}
			</defs>
			{clip ? <g clipPath={`url(#${clipId})`}>{children}</g> : children}
		</svg>
	);
};

/**
 * Something that travels from (x, y) by (dx, dy) over `dur`, looping, optionally swaying sideways and spinning. In a
 * still frame it sits at (x + sx, y + sy).
 */
export const Drifter: React.FC<{
	x: number;
	y: number;
	dx: number;
	dy: number;
	dur: number;
	delay: number;
	rot?: number;
	sway?: number;
	swayDur?: number;
	sx?: number;
	sy?: number;
	sr?: number;
	/** Fade in/out at the ends (default) or keep full opacity the whole way. */
	fade?: 'ends' | 'out';
	children: React.ReactNode;
}> = ({x, y, dx, dy, dur, delay, rot = 0, sway, swayDur, sx = 0, sy = 0, sr = 0, fade = 'ends', children}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
		<g
			className={clsx(motion.drift, fade === 'out' && motion.driftFadeOut)}
			style={vars({dur, delay, dx, dy, rot, sx, sy, sr})}
		>
			{sway ? (
				<g className={motion.sway} style={vars({sway, dur: swayDur ?? dur / 2, delay})}>
					{children}
				</g>
			) : (
				children
			)}
		</g>
	</g>
);

/** Plays once: flies from (x, y) by (dx, dy) while fading out. Hidden in still frames. */
export const Burst: React.FC<{
	x: number;
	y: number;
	dx: number;
	dy: number;
	dur: number;
	delay: number;
	rot?: number;
	children: React.ReactNode;
}> = ({x, y, dx, dy, dur, delay, rot = 0, children}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
		<g className={motion.burst} style={vars({dur, delay, dx, dy, rot})}>
			{children}
		</g>
	</g>
);

/** Twinkles (scale + opacity) in place, forever. */
export const Twinkle: React.FC<{
	x: number;
	y: number;
	dur: number;
	delay: number;
	children: React.ReactNode;
}> = ({x, y, dur, delay, children}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
		<g className={motion.twinkle} style={vars({dur, delay})}>
			{children}
		</g>
	</g>
);

/** Fades in once (intro). */
export const FadeIn: React.FC<{delay?: number; dur?: number; children: React.ReactNode}> = ({
	delay = 0,
	dur = 500,
	children,
}) => (
	<g className={motion.introFade} style={vars({delay, dur})}>
		{children}
	</g>
);

/** Pops in from scale 0 around its own centre (intro). */
export const PopIn: React.FC<{delay?: number; dur?: number; origin?: string; children: React.ReactNode}> = ({
	delay = 0,
	dur = 420,
	origin,
	children,
}) => (
	<g className={motion.introPop} style={{...vars({delay, dur}), transformOrigin: origin}}>
		{children}
	</g>
);

export function polar(cx: number, cy: number, r: number, degrees: number): [number, number] {
	const radians = (degrees * Math.PI) / 180;
	return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
}

export function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
	const [x1, y1] = polar(cx, cy, r, from);
	const [x2, y2] = polar(cx, cy, r, to);
	const large = to - from > 180 ? 1 : 0;
	return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

/** Pick x positions hugging the left/right edges (fraction `edge` of the width on each side). */
export function edgeX(rand: () => number, w: number, edge = 0.22): number {
	const side = rand() < 0.5;
	const t = rand() * edge;
	return side ? w * t : w * (1 - t);
}
