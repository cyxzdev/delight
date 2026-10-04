// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/profile_frames/ProfileFrame.module.css';
import type React from 'react';

/**
 * Small animated SVG touches drawn over a frame's artwork (twinkles, flame glow, corona pulse). They work in the card's
 * pixel space: `width`/`height` are the card's size and positions are given in card widths (`u`), so they line up with
 * the raster pieces at any size. Animate with transform/opacity only; `[data-still]` on the frame root stops motion.
 */
export interface FrameOverlayProps {
	width: number;
	height: number;
	idPrefix: string;
}

export type FrameOverlay = React.FC<FrameOverlayProps>;

/** A four-point sparkle with concave sides, radius 1, centred on 0,0. */
const SPARKLE_PATH = 'M0,-1 Q0.13,-0.13 1,0 Q0.13,0.13 0,1 Q-0.13,0.13 -1,0 Q-0.13,-0.13 0,-1 Z';

function timing(dur: number, delay: number): React.CSSProperties {
	return {'--dur': `${Math.round(dur)}ms`, '--delay': `${Math.round(delay)}ms`} as React.CSSProperties;
}

/** Deterministic pseudo-random numbers so a frame looks the same on every render. */
function seeded(seed: number): () => number {
	let s = seed >>> 0;
	return () => {
		s = (s * 1664525 + 1013904223) >>> 0;
		return s / 4294967296;
	};
}

interface SparkleSpec {
	x: number;
	y: number;
	r: number;
	color: number;
	opacity?: number;
	dur: number;
	delay: number;
}

const SPARKLE_COLORS = ['#7ef0ff', '#ff6fd8', '#b58cff', '#ffffff', '#ffe27a', '#ffb3d9'];

function SparkleDefs({idPrefix, colors}: {idPrefix: string; colors: ReadonlyArray<number>}) {
	return (
		<defs>
			{colors.map((c) => (
				<radialGradient key={`core${c}`} id={`${idPrefix}-core${c}`}>
					<stop offset="0" stopColor="#ffffff" />
					<stop offset="0.35" stopColor="#ffffff" />
					<stop offset="1" stopColor={SPARKLE_COLORS[c]} />
				</radialGradient>
			))}
			{colors.map((c) => (
				<radialGradient key={`glow${c}`} id={`${idPrefix}-glow${c}`}>
					<stop offset="0" stopColor={SPARKLE_COLORS[c]} stopOpacity="0.75" />
					<stop offset="0.4" stopColor={SPARKLE_COLORS[c]} stopOpacity="0.28" />
					<stop offset="1" stopColor={SPARKLE_COLORS[c]} stopOpacity="0" />
				</radialGradient>
			))}
		</defs>
	);
}

function Sparkle({spec, px, idPrefix}: {spec: SparkleSpec; px: number; idPrefix: string}) {
	const r = Math.max(1.2, spec.r * px);
	return (
		<g transform={`translate(${(spec.x * px).toFixed(1)} ${(spec.y * px).toFixed(1)})`} opacity={spec.opacity ?? 1}>
			<g className={styles.twinkle} style={timing(spec.dur, spec.delay)}>
				<circle r={r * 1.9} fill={`url(#${idPrefix}-glow${spec.color})`} />
				<path d={SPARKLE_PATH} transform={`scale(${r.toFixed(2)})`} fill={`url(#${idPrefix}-core${spec.color})`} />
				<circle r={Math.max(0.6, r * 0.14)} fill="#ffffff" />
			</g>
		</g>
	);
}

// ---------- Starlit Sparkles: twinkles across the crown, a trail fading down both sides, a few at the bottom ----------

const STARLIT_CROWN: ReadonlyArray<[number, number, number, number]> = [
	[0.04, -0.075, 0.03, 0],
	[0.14, -0.12, 0.022, 1],
	[0.27, -0.06, 0.026, 2],
	[0.4, -0.135, 0.018, 0],
	[0.5, -0.105, 0.036, 3],
	[0.61, -0.05, 0.024, 1],
	[0.72, -0.125, 0.026, 0],
	[0.85, -0.07, 0.03, 2],
	[0.95, -0.115, 0.02, 1],
	[0.33, -0.16, 0.014, 3],
	[0.79, -0.165, 0.014, 2],
];

export const StarlitOverlay: FrameOverlay = ({width, height, idPrefix}) => {
	const u = width;
	const rand = seeded(7);
	const specs: Array<SparkleSpec> = STARLIT_CROWN.map(([x, y, r, color], i) => ({
		x,
		y,
		r,
		color,
		dur: 2200 + rand() * 1800,
		delay: -i * 530,
	}));
	// Side trails: denser near the top, thinning and dimming as they go down.
	const step = 0.055;
	for (const side of [0, 1]) {
		for (let y = 0.05; y < height / u - 0.08; y += step * (0.7 + rand() * 0.6)) {
			const t = (y * u) / height;
			if (rand() > Math.pow(1 - t, 1.6) * 1.05) continue;
			const inset = (rand() - 0.45) * 0.05;
			specs.push({
				x: side === 0 ? inset : 1 - inset,
				y,
				r: (0.008 + rand() * 0.016) * (1 - t * 0.5),
				color: Math.floor(rand() * 3),
				opacity: 1 - t * 0.7,
				dur: 1800 + rand() * 2200,
				delay: -rand() * 4000,
			});
		}
	}
	// Bottom corners.
	for (const [x, y, r, color] of [
		[0.03, -0.03, 0.018, 0],
		[0.11, 0.015, 0.012, 1],
		[0.93, -0.025, 0.02, 1],
		[0.86, 0.02, 0.011, 2],
	] as const) {
		specs.push({x, y: height / u + y, r, color, dur: 2600 + rand() * 1200, delay: -rand() * 3000});
	}
	return (
		<g className={styles.screen}>
			<SparkleDefs idPrefix={idPrefix} colors={[0, 1, 2, 3]} />
			{specs.map((spec, i) => (
				<Sparkle key={i} spec={spec} px={u} idPrefix={idPrefix} />
			))}
		</g>
	);
};

// ---------- Candle Drip: each flame breathes a soft magenta glow ----------

/** Flame centres in card widths (detected from the artwork); [x, y, fromBottom]. */
const CANDLE_FLAMES: ReadonlyArray<[number, number, boolean]> = [
	[0.0476, -0.2774, false],
	[0.1313, -0.1587, false],
	[0.2219, -0.2191, false],
	[0.3187, -0.1507, false],
	[0.4104, -0.2604, false],
	[0.5021, -0.1816, false],
	[0.5938, -0.1333, false],
	[0.6872, -0.233, false],
	[0.7795, -0.1788, false],
	[0.874, -0.1281, false],
	[0.9608, -0.2431, false],
	[0.056, -0.1771, true],
	[0.9447, -0.1648, true],
];

export const CandleOverlay: FrameOverlay = ({width, height, idPrefix}) => {
	const u = width;
	const rand = seeded(11);
	return (
		<g className={styles.screen}>
			<defs>
				<radialGradient id={`${idPrefix}-flame`}>
					<stop offset="0" stopColor="#ffd6f4" stopOpacity="0.9" />
					<stop offset="0.25" stopColor="#ff4fd0" stopOpacity="0.55" />
					<stop offset="0.6" stopColor="#d22fb4" stopOpacity="0.18" />
					<stop offset="1" stopColor="#d22fb4" stopOpacity="0" />
				</radialGradient>
			</defs>
			{CANDLE_FLAMES.map(([x, y, fromBottom], i) => {
				const cy = fromBottom ? height + y * u : y * u;
				return (
					<g key={i} transform={`translate(${(x * u).toFixed(1)} ${cy.toFixed(1)})`}>
						<ellipse
							className={styles.flicker}
							style={timing(900 + rand() * 900, -rand() * 1500)}
							rx={u * 0.034}
							ry={u * 0.05}
							fill={`url(#${idPrefix}-flame)`}
						/>
					</g>
				);
			})}
		</g>
	);
};

// ---------- Eclipse ("Blazing Sun"): a bright sun breaking through the smoke, covering the artwork's black disc ----------

const SUN = {x: 0.4965, y: -0.1697, r: 0.0335};

export const EclipseOverlay: FrameOverlay = ({width, idPrefix}) => {
	const u = width;
	const cx = SUN.x * u;
	const cy = SUN.y * u;
	const r = SUN.r * u;
	const rays = Array.from({length: 12}, (_, i) => {
		const a = (i / 12) * Math.PI * 2;
		const long = i % 2 === 0;
		const r0 = r * 1.5;
		const r1 = r * (long ? 2.7 : 2.1);
		return {
			x0: cx + Math.cos(a) * r0,
			y0: cy + Math.sin(a) * r0,
			x1: cx + Math.cos(a) * r1,
			y1: cy + Math.sin(a) * r1,
			long,
		};
	});
	return (
		<>
			<defs>
				<radialGradient id={`${idPrefix}-sun`}>
					<stop offset="0" stopColor="#fffef6" />
					<stop offset="0.45" stopColor="#fff2c2" />
					<stop offset="0.8" stopColor="#ffd36a" />
					<stop offset="1" stopColor="#ffb340" />
				</radialGradient>
				<radialGradient id={`${idPrefix}-rim`}>
					<stop offset="0" stopColor="#ffb340" />
					<stop offset="0.78" stopColor="#ff9a2e" />
					<stop offset="0.9" stopColor="#ff7d1f" stopOpacity="0.85" />
					<stop offset="1" stopColor="#ff6a14" stopOpacity="0" />
				</radialGradient>
				<radialGradient id={`${idPrefix}-glow`}>
					<stop offset="0" stopColor="#ffd36b" stopOpacity="0.75" />
					<stop offset="0.45" stopColor="#ffab3a" stopOpacity="0.35" />
					<stop offset="1" stopColor="#ff8a1f" stopOpacity="0" />
				</radialGradient>
				<radialGradient id={`${idPrefix}-haze`}>
					<stop offset="0" stopColor="#ff9d2e" stopOpacity="0.32" />
					<stop offset="1" stopColor="#ff9d2e" stopOpacity="0" />
				</radialGradient>
			</defs>
			<g className={styles.screen}>
				<ellipse cx={cx} cy={cy + r * 1.4} rx={r * 6} ry={r * 2.6} fill={`url(#${idPrefix}-haze)`} className={styles.pulse} style={timing(5200, -1200)} />
				<circle cx={cx} cy={cy} r={r * 3.2} fill={`url(#${idPrefix}-glow)`} className={styles.pulse} style={timing(3600, 0)} />
				<g stroke="#ffe3a0" strokeLinecap="round" className={styles.pulse} style={timing(4200, -600)}>
					{rays.map((ray, i) => (
						<line key={i} x1={ray.x0} y1={ray.y0} x2={ray.x1} y2={ray.y1} strokeWidth={ray.long ? r * 0.22 : r * 0.14} opacity={ray.long ? 0.75 : 0.5} />
					))}
				</g>
			</g>
			{/* Solid sun over the artwork's dark centre and ring: hot core, soft fiery rim. */}
			<circle cx={cx} cy={cy} r={r * 1.62} fill={`url(#${idPrefix}-rim)`} />
			<circle cx={cx} cy={cy} r={r * 1.3} fill={`url(#${idPrefix}-sun)`} />
		</>
	);
};

// ---------- Rose Filigree: slow glints on the silverwork ----------

const ROSE_GLINTS: ReadonlyArray<[number, number, number, boolean]> = [
	[0.5, -0.165, 0.022, false],
	[0.16, -0.1, 0.016, false],
	[0.85, -0.1, 0.016, false],
	[-0.03, 0.12, 0.014, false],
	[1.03, 0.2, 0.014, false],
	[0.5, 0.06, 0.016, true],
	[0.13, -0.02, 0.012, true],
];

export const RoseOverlay: FrameOverlay = ({width, height, idPrefix}) => {
	const u = width;
	return (
		<g className={styles.screen}>
			<SparkleDefs idPrefix={idPrefix} colors={[3, 2]} />
			{ROSE_GLINTS.map(([x, y, r, fromBottom], i) => (
				<Sparkle
					key={i}
					spec={{x, y: fromBottom ? height / u + y : y, r, color: i % 3 === 2 ? 2 : 3, dur: 3400, delay: -i * 1100}}
					px={u}
					idPrefix={idPrefix}
				/>
			))}
		</g>
	);
};

// ---------- Kitty Ears: tiny twinkles around the ears ----------

const KITTY_SPARKLES: ReadonlyArray<[number, number, number, number]> = [
	[0.02, -0.31, 0.022, 5],
	[0.1, -0.35, 0.013, 4],
	[0.36, -0.27, 0.011, 5],
	[0.7, -0.29, 0.012, 4],
	[0.99, -0.33, 0.018, 5],
	[1.03, -0.07, 0.012, 4],
	[-0.03, -0.04, 0.012, 4],
];

export const KittyOverlay: FrameOverlay = ({width, idPrefix}) => {
	const u = width;
	return (
		<g>
			<SparkleDefs idPrefix={idPrefix} colors={[4, 5]} />
			{KITTY_SPARKLES.map(([x, y, r, color], i) => (
				<Sparkle key={i} spec={{x, y, r, color, dur: 2400 + i * 260, delay: -i * 700}} px={u} idPrefix={idPrefix} />
			))}
		</g>
	);
};
