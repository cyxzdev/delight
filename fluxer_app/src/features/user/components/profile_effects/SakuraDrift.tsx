// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	Burst,
	between,
	Drifter,
	EffectSvg,
	edgeX,
	FadeIn,
	PopIn,
	type ProfileEffectLayer,
	scaleFor,
	seeded,
} from '@app/features/user/components/profile_effects/effectKit';
import type React from 'react';
import {useMemo} from 'react';

/** "Sakura Drift" — a blossoming branch over the banner's corner sheds petals that drift down the card's edges. */

const PETAL = 'M0,5 C-3.6,3.4 -4.6,-1.6 -2,-5 L0,-3.4 L2,-5 C4.6,-1.6 3.6,3.4 0,5 Z';
const PETAL_LIGHT = '#ffc7d8';
const PETAL_MID = '#f7a1bd';
const PETAL_DEEP = '#e9799d';
const BARK = '#4a2c2f';
const BLOSSOM_CENTER = '#c94f78';

const Petal: React.FC<{size: number; color: string; opacity?: number}> = ({size, color, opacity = 1}) => (
	<path d={PETAL} transform={`scale(${size})`} fill={color} opacity={opacity} />
);

const Blossom: React.FC<{x: number; y: number; r: number; rotate: number; delay: number}> = ({x, y, r, rotate, delay}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rotate})`}>
		<PopIn delay={delay}>
			{[0, 72, 144, 216, 288].map((angle) => (
				<path
					key={angle}
					d={PETAL}
					transform={`rotate(${angle}) translate(0 ${(-r * 0.55).toFixed(2)}) scale(${(r / 5.5).toFixed(2)})`}
					fill={angle % 144 === 0 ? PETAL_LIGHT : PETAL_MID}
				/>
			))}
			<circle r={r * 0.28} fill={BLOSSOM_CENTER} />
			<circle r={r * 0.12} fill="#ffe58a" />
		</PopIn>
	</g>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x5a4b);
		const colors = [PETAL_LIGHT, PETAL_MID, PETAL_DEEP];
		const front = Array.from({length: 9}, (_, i) => ({
			x: i < 2 ? between(rand, w * 0.45, w * 0.95) : edgeX(rand, w, 0.24),
			size: between(rand, 0.75, 1.15) * s,
			color: colors[i % 3],
			dur: between(rand, 7500, 11000),
			delay: 500 + i * 850,
			rot: between(rand, 300, 600) * (rand() < 0.5 ? -1 : 1),
			dx: between(rand, -30, 10),
			sway: between(rand, 7, 14),
			sy: between(rand, h * 0.12, h * 0.92),
			sr: between(rand, 0, 360),
		}));
		const back = Array.from({length: 5}, (_, i) => ({
			x: between(rand, w * 0.08, w * 0.92),
			size: between(rand, 1.5, 2.1) * s,
			dur: between(rand, 12000, 16000),
			delay: 1200 + i * 2300,
			rot: between(rand, 200, 380),
			dx: between(rand, -40, 0),
			sway: between(rand, 10, 18),
			sy: between(rand, h * 0.3, h * 0.85),
			sr: between(rand, 0, 360),
		}));
		const burst = Array.from({length: 7}, () => ({
			dx: between(rand, -150, -30) * s,
			dy: between(rand, 50, 170) * s,
			rot: between(rand, -400, 400),
			delay: between(rand, 250, 600),
			dur: between(rand, 1300, 1900),
			color: colors[Math.floor(rand() * 3)],
		}));
		const resting = Array.from({length: 6}, () => ({
			x: between(rand, 6, w * 0.35),
			y: h - between(rand, 3, 9),
			rot: between(rand, 0, 360),
			color: colors[Math.floor(rand() * 3)],
		}));
		return {s, front, back, burst, resting};
	}, [w, h]);
}

export const SakuraDrift: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h} = geometry;
	const {s, front, back, burst, resting} = useLayout(w, h);
	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				{back.map((p, i) => (
					<Drifter
						key={i}
						x={p.x}
						y={-16}
						dx={p.dx}
						dy={h + 32}
						dur={p.dur}
						delay={p.delay}
						rot={p.rot}
						sway={p.sway}
						sy={p.sy}
						sr={p.sr}
					>
						<Petal size={p.size} color={PETAL_MID} opacity={0.32} />
					</Drifter>
				))}
				<FadeIn delay={300} dur={900}>
					{resting.map((p, i) => (
						<g key={i} transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(0)})`}>
							<Petal size={0.8 * s} color={p.color} opacity={0.55} />
						</g>
					))}
				</FadeIn>
			</EffectSvg>
		);
	}
	// Branch reaching in from the top-right corner.
	const bx = w + 2;
	const by = 16 * s;
	const branch = `M${bx},${by} C${w - 30 * s},${by + 4 * s} ${w - 58 * s},${by - 2 * s} ${w - 96 * s},${by + 14 * s}`;
	const twig1 = `M${w - 44 * s},${by + 1 * s} C${w - 52 * s},${by + 12 * s} ${w - 58 * s},${by + 18 * s} ${w - 66 * s},${by + 24 * s}`;
	const twig2 = `M${w - 70 * s},${by + 4 * s} C${w - 76 * s},${by - 4 * s} ${w - 80 * s},${by - 8 * s} ${w - 88 * s},${by - 10 * s}`;
	const blossoms: Array<[number, number, number, number]> = [
		[w - 22 * s, by + 4 * s, 7 * s, 10],
		[w - 50 * s, by - 3 * s, 6 * s, 40],
		[w - 66 * s, by + 24 * s, 6.5 * s, -20],
		[w - 88 * s, by - 10 * s, 5 * s, 15],
		[w - 97 * s, by + 15 * s, 5.5 * s, 60],
	];
	const originX = w - 60 * s;
	const originY = by + 8 * s;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			<FadeIn dur={600}>
				<path d={branch} stroke={BARK} strokeWidth={3.2 * s} fill="none" strokeLinecap="round" />
				<path d={twig1} stroke={BARK} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
				<path d={twig2} stroke={BARK} strokeWidth={1.6 * s} fill="none" strokeLinecap="round" />
			</FadeIn>
			{blossoms.map(([x, y, r, rotate], i) => (
				<Blossom key={i} x={x} y={y} r={r} rotate={rotate} delay={120 + i * 90} />
			))}
			{burst.map((p, i) => (
				<Burst key={i} x={originX} y={originY} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay} rot={p.rot}>
					<Petal size={0.9 * s} color={p.color} />
				</Burst>
			))}
			{front.map((p, i) => (
				<Drifter
					key={i}
					x={p.x}
					y={-12}
					dx={p.dx}
					dy={h + 24}
					dur={p.dur}
					delay={p.delay}
					rot={p.rot}
					sway={p.sway}
					sy={p.sy}
					sr={p.sr}
				>
					<Petal size={p.size} color={p.color} opacity={0.95} />
				</Drifter>
			))}
		</EffectSvg>
	);
};
