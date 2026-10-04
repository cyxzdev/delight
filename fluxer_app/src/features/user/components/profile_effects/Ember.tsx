// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	between,
	Drifter,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectLayer,
	scaleFor,
	seeded,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import type React from 'react';
import {useMemo} from 'react';

/** "Ember" — low flames lick up from the bottom corners while embers float up the sides; a warm glow sits behind. */

const RED = '#ff4d1f';
const ORANGE = '#ff8a2a';
const GOLD = '#ffd166';
const HOT = '#fff1c2';

/** A flame tongue standing on (0,0), `height` tall, `width` wide. */
function tongue(width: number, height: number, lean: number): string {
	const hw = width / 2;
	return `M${-hw},0 C${-hw},${-height * 0.35} ${-hw * 0.2 + lean * 0.4},${-height * 0.55} ${lean},${-height} C${hw * 0.25 + lean * 0.3},${-height * 0.6} ${hw},${-height * 0.4} ${hw},0 Z`;
}

const Flame: React.FC<{x: number; y: number; width: number; height: number; lean: number; dur: number; delay: number; opacity?: number}> = ({
	x,
	y,
	width,
	height,
	lean,
	dur,
	delay,
	opacity = 1,
}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`} opacity={opacity}>
		<PopIn delay={delay % 400} dur={480} origin="50% 100%">
			<g className={motion.flicker} style={vars({dur, delay})}>
				<path d={tongue(width, height, lean)} fill={RED} />
				<path d={tongue(width * 0.68, height * 0.72, lean * 0.7)} fill={ORANGE} />
				<path d={tongue(width * 0.36, height * 0.42, lean * 0.4)} fill={GOLD} />
			</g>
		</PopIn>
	</g>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0xe11b);
		// Front: clusters in the bottom corners, tallest at the very corner.
		const front: Array<{x: number; width: number; height: number; lean: number; dur: number; delay: number}> = [];
		for (const side of [0, 1]) {
			for (let i = 0; i < 4; i++) {
				const t = i / 4;
				const x = side === 0 ? 4 * s + i * 12 * s : w - 4 * s - i * 12 * s;
				front.push({
					x,
					width: between(rand, 13, 17) * s,
					height: (28 - t * 18 + between(rand, -3, 3)) * s,
					lean: between(rand, -4, 4) * s,
					dur: between(rand, 650, 1100),
					delay: between(rand, 0, 700),
				});
			}
		}
		// Back: a full-width row of taller, softer flames behind the content.
		const backCount = Math.max(8, Math.round(w / 20));
		const back = Array.from({length: backCount}, (_, i) => ({
			x: (i + 0.5) * (w / backCount) + between(rand, -4, 4),
			width: between(rand, 20, 28) * s,
			height: between(rand, 0.55, 1) * Math.min(36 * s, h * 0.13),
			lean: between(rand, -6, 6) * s,
			dur: between(rand, 800, 1300),
			delay: between(rand, 0, 900),
		}));
		const embers = Array.from({length: 13}, (_, i) => {
			const left = i % 2 === 0;
			return {
				x: left ? between(rand, 4, w * 0.22) : between(rand, w * 0.78, w - 4),
				r: between(rand, 0.9, 2) * s,
				color: [GOLD, ORANGE, HOT][i % 3],
				dur: between(rand, 3600, 6200),
				delay: 300 + i * 420,
				dx: between(rand, -24, 24),
				dy: -between(rand, h * 0.45, h * 0.85),
				sway: between(rand, 4, 9),
				sy: -between(rand, h * 0.05, h * 0.6),
			};
		});
		return {s, front, back, embers};
	}, [w, h]);
}

export const Ember: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h} = geometry;
	const {s, front, back, embers} = useLayout(w, h);
	if (layer === 'back') {
		const glowId = `${idPrefix}-ember-glow`;
		const glowHeight = Math.min(110 * s, h * 0.35);
		return (
			<EffectSvg
				geometry={geometry}
				radius={radius}
				idPrefix={idPrefix}
				layer="back"
				defs={
					<linearGradient id={glowId} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={ORANGE} stopOpacity={0} />
						<stop offset="1" stopColor={RED} stopOpacity={0.32} />
					</linearGradient>
				}
			>
				<FadeIn dur={900}>
					<rect x={0} y={h - glowHeight} width={w} height={glowHeight} fill={`url(#${glowId})`} />
				</FadeIn>
				{back.map((f, i) => (
					<Flame key={i} {...f} y={h + 2} opacity={0.3} />
				))}
			</EffectSvg>
		);
	}
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			{embers.map((e, i) => (
				<Drifter
					key={i}
					x={e.x}
					y={h - 8}
					dx={e.dx}
					dy={e.dy}
					dur={e.dur}
					delay={e.delay}
					sway={e.sway}
					sy={e.sy}
					fade="out"
				>
					<circle r={e.r} fill={e.color} />
				</Drifter>
			))}
			{front.map((f, i) => (
				<Flame key={i} {...f} y={h + 2} />
			))}
		</EffectSvg>
	);
};
