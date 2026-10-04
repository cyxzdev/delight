// SPDX-License-Identifier: AGPL-3.0-or-later

import fm from '@app/features/user/components/profile_effects/FrameMotion.module.css';
import {clsx} from 'clsx';
import type React from 'react';

/**
 * Helpers for "frame" profile effects — illustrated borders that hug the card (in the spirit of Spark Surge): an inset
 * border that draws in, corner set-pieces, texture patches and a decorated avatar ring. Motion classes live in
 * FrameMotion.module.css and read --dur/--delay/--dy/--rot/--origin custom properties.
 */

export {fm};

export type Pt = readonly [number, number];

export interface Timing {
	dur?: number;
	delay?: number;
	dx?: number;
	dy?: number;
	rot?: number;
	origin?: string;
}

/** Inline custom properties for FrameMotion classes. */
export function tv(t: Timing): React.CSSProperties {
	const style: Record<string, string> = {};
	if (t.dur != null) style['--dur'] = `${Math.round(t.dur)}ms`;
	if (t.delay != null) style['--delay'] = `${Math.round(t.delay)}ms`;
	if (t.dx != null) style['--dx'] = `${t.dx.toFixed(1)}px`;
	if (t.dy != null) style['--dy'] = `${t.dy.toFixed(1)}px`;
	if (t.rot != null) style['--rot'] = `${t.rot.toFixed(1)}deg`;
	if (t.origin != null) style['--origin'] = t.origin;
	return style as React.CSSProperties;
}

export const f1 = (n: number) => n.toFixed(1);

/** A rounded rectangle as a path (so it can carry pathLength for draw-ins). */
export function roundRectPath(x: number, y: number, w: number, h: number, r: number): string {
	const rr = Math.max(0, Math.min(r, w / 2, h / 2));
	return (
		`M${f1(x + rr)},${f1(y)} H${f1(x + w - rr)} A${rr},${rr} 0 0 1 ${f1(x + w)},${f1(y + rr)} ` +
		`V${f1(y + h - rr)} A${rr},${rr} 0 0 1 ${f1(x + w - rr)},${f1(y + h)} H${f1(x + rr)} ` +
		`A${rr},${rr} 0 0 1 ${f1(x)},${f1(y + h - rr)} V${f1(y + rr)} A${rr},${rr} 0 0 1 ${f1(x + rr)},${f1(y)} Z`
	);
}

/** Smooth closed path through points (Catmull-Rom → cubic Béziers). */
export function smoothClosed(points: ReadonlyArray<Pt>, tension = 1): string {
	const n = points.length;
	if (n < 3) return '';
	let d = `M${f1(points[0][0])},${f1(points[0][1])}`;
	for (let i = 0; i < n; i++) {
		const p0 = points[(i - 1 + n) % n];
		const p1 = points[i];
		const p2 = points[(i + 1) % n];
		const p3 = points[(i + 2) % n];
		const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
		const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
		const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
		const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
		d += ` C${f1(c1x)},${f1(c1y)} ${f1(c2x)},${f1(c2y)} ${f1(p2[0])},${f1(p2[1])}`;
	}
	return `${d} Z`;
}

/** Smooth open path through points. */
export function smoothOpen(points: ReadonlyArray<Pt>, tension = 1): string {
	const n = points.length;
	if (n < 2) return '';
	let d = `M${f1(points[0][0])},${f1(points[0][1])}`;
	for (let i = 0; i < n - 1; i++) {
		const p0 = points[Math.max(0, i - 1)];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[Math.min(n - 1, i + 2)];
		const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
		const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
		const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
		const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
		d += ` C${f1(c1x)},${f1(c1y)} ${f1(c2x)},${f1(c2y)} ${f1(p2[0])},${f1(p2[1])}`;
	}
	return d;
}

/** Polygon path through points. */
export function poly(points: ReadonlyArray<Pt>, close = true): string {
	return `M${points.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L')}${close ? ' Z' : ''}`;
}

/**
 * Pattern + radial-fade mask defs for halftone-style texture patches. Use with <TexturePatch>.
 * Ids: `${id}-dots`, `${id}-dots-fine`, `${id}-fade-mask`.
 */
export const TextureDefs: React.FC<{id: string; color: string; fine?: string}> = ({id, color, fine = color}) => (
	<>
		<pattern id={`${id}-dots`} width={5} height={5} patternUnits="userSpaceOnUse">
			<circle cx={2.5} cy={2.5} r={1.1} fill={color} />
		</pattern>
		<pattern id={`${id}-dots-fine`} width={4} height={4} patternUnits="userSpaceOnUse">
			<circle cx={2} cy={2} r={0.75} fill={fine} />
		</pattern>
		<radialGradient id={`${id}-fade`}>
			<stop offset="0" stopColor="#fff" stopOpacity={1} />
			<stop offset="0.55" stopColor="#fff" stopOpacity={0.55} />
			<stop offset="1" stopColor="#fff" stopOpacity={0} />
		</radialGradient>
		<mask id={`${id}-fade-mask`} maskContentUnits="objectBoundingBox">
			<rect width={1} height={1} fill={`url(#${id}-fade)`} />
		</mask>
	</>
);

export const TexturePatch: React.FC<{
	id: string;
	x: number;
	y: number;
	w: number;
	h: number;
	opacity: number;
	fine?: boolean;
}> = ({id, x, y, w, h, opacity, fine}) => (
	<g opacity={opacity} mask={`url(#${id}-fade-mask)`}>
		<rect x={x} y={y} width={w} height={h} fill={`url(#${id}-${fine ? 'dots-fine' : 'dots'})`} />
	</g>
);

/**
 * A soft coloured rim along the card's inside edge: stacked strokes of falling opacity (no blur filters).
 */
export const Rim: React.FC<{w: number; h: number; radius: number; color: string; strength?: number}> = ({
	w,
	h,
	radius,
	color,
	strength = 1,
}) => (
	<g fill="none" stroke={color}>
		{[
			[22, 0.05],
			[14, 0.07],
			[8, 0.1],
			[3.5, 0.16],
		].map(([width, opacity]) => (
			<rect key={width} x={0} y={0} width={w} height={h} rx={radius} strokeWidth={width} opacity={opacity * strength} />
		))}
	</g>
);

/** A path that draws itself in once. */
export const DrawPath: React.FC<
	React.SVGProps<SVGPathElement> & {d: string; delay?: number; dur?: number}
> = ({delay = 0, dur = 600, className, style, ...rest}) => (
	<path
		{...rest}
		className={clsx(fm.drawIn, className)}
		style={{...tv({delay, dur}), ...style}}
		pathLength={1}
	/>
);

/** Wraps children in a once-only grow from `origin` (e.g. "50% 100%"). */
export const Grow: React.FC<{delay?: number; dur?: number; origin?: string; children: React.ReactNode}> = ({
	delay = 0,
	dur = 520,
	origin = '50% 50%',
	children,
}) => (
	<g className={fm.growIn} style={tv({delay, dur, origin})}>
		{children}
	</g>
);

/** Places children at (x, y) with optional rotation/scale. */
export const At: React.FC<{x: number; y: number; r?: number; s?: number; sx?: number; children: React.ReactNode}> = ({
	x,
	y,
	r = 0,
	s = 1,
	sx,
	children,
}) => (
	<g transform={`translate(${f1(x)} ${f1(y)})${r ? ` rotate(${f1(r)})` : ''}${s !== 1 || sx != null ? ` scale(${(sx ?? s).toFixed(3)} ${s.toFixed(3)})` : ''}`}>
		{children}
	</g>
);

/** A looping motion class wrapper. */
export const Loop: React.FC<{kind: keyof typeof fm; t?: Timing; children: React.ReactNode}> = ({kind, t = {}, children}) => (
	<g className={fm[kind]} style={tv(t)}>
		{children}
	</g>
);

/** Four-point sparkle star path, radius r, waist w (0..1). */
export function sparklePath(r: number, waist = 0.18): string {
	const q = r * waist;
	return (
		`M0,${f1(-r)} C${f1(q * 0.4)},${f1(-q)} ${f1(q)},${f1(-q * 0.4)} ${f1(r)},0 ` +
		`C${f1(q)},${f1(q * 0.4)} ${f1(q * 0.4)},${f1(q)} 0,${f1(r)} ` +
		`C${f1(-q * 0.4)},${f1(q)} ${f1(-q)},${f1(q * 0.4)} ${f1(-r)},0 ` +
		`C${f1(-q)},${f1(-q * 0.4)} ${f1(-q * 0.4)},${f1(-q)} 0,${f1(-r)} Z`
	);
}

/** Classic heart centred on (0,0), about 2r wide. */
export function heartPath(r: number): string {
	const k = r / 10;
	const p = (x: number, y: number) => `${f1(x * k)},${f1(y * k)}`;
	return (
		`M${p(0, 9)} C${p(-3, 6)} ${p(-10, 2)} ${p(-10, -3.5)} C${p(-10, -8)} ${p(-6.5, -10)} ${p(-4.5, -10)} ` +
		`C${p(-2, -10)} ${p(-0.6, -8.4)} ${p(0, -6.6)} C${p(0.6, -8.4)} ${p(2, -10)} ${p(4.5, -10)} ` +
		`C${p(6.5, -10)} ${p(10, -8)} ${p(10, -3.5)} C${p(10, 2)} ${p(3, 6)} ${p(0, 9)} Z`
	);
}

/** Samples a Catmull-Rom spline through `points` (open), `per` samples per segment. */
export function sampleSpline(points: ReadonlyArray<Pt>, per = 6): Array<Pt> {
	const n = points.length;
	const out: Array<Pt> = [];
	for (let i = 0; i < n - 1; i++) {
		const p0 = points[Math.max(0, i - 1)];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[Math.min(n - 1, i + 2)];
		for (let j = 0; j < per; j++) {
			const t = j / per;
			const t2 = t * t;
			const t3 = t2 * t;
			const c = (a: number, b: number, cc: number, d: number) =>
				0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
			out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
		}
	}
	out.push(points[n - 1]);
	return out;
}

/**
 * A tapered stroke (branch, flame tongue, ribbon) as a filled outline: width w0 at the start → w1 at the end.
 * Returns the outline and the "lit" side line (for a highlight stroke).
 */
export function taper(points: ReadonlyArray<Pt>, w0: number, w1: number, per = 6): {outline: string; lit: string} {
	const pts = sampleSpline(points, per);
	const left: Array<Pt> = [];
	const right: Array<Pt> = [];
	const lit: Array<Pt> = [];
	const n = pts.length;
	for (let i = 0; i < n; i++) {
		const a = pts[Math.max(0, i - 1)];
		const b = pts[Math.min(n - 1, i + 1)];
		const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const nx = -(b[1] - a[1]) / len;
		const ny = (b[0] - a[0]) / len;
		const half = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
		left.push([pts[i][0] + nx * half, pts[i][1] + ny * half]);
		right.push([pts[i][0] - nx * half, pts[i][1] - ny * half]);
		lit.push([pts[i][0] + nx * half * 0.45, pts[i][1] + ny * half * 0.45]);
	}
	const outline = `${poly([...left, ...right.reverse()], false)} Z`;
	return {outline, lit: poly(lit, false)};
}

/** Circles as a single path (cheap clusters of dots). */
export function dotsPath(dots: ReadonlyArray<readonly [number, number, number]>): string {
	return dots
		.map(([x, y, r]) => `M${f1(x - r)},${f1(y)} a${f1(r)},${f1(r)} 0 1,0 ${f1(r * 2)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-r * 2)},0`)
		.join(' ');
}
