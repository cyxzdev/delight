// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	bannerBottomOf,
	between,
	Drifter,
	EffectSvg,
	edgeX,
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

/** "Rainy Day" — little clouds over the banner, rain slanting down the edges, drips off the banner and ripples below. */

const RAIN = '#a9cdfa';
const CLOUD = '#d7dfeb';
const CLOUD_SHADE = '#a3afc2';
const SLANT = 0.22;

/** A puffy cloud centred on (0,0), about 52×24 at scale 1. */
const Cloud: React.FC<{scale: number}> = ({scale}) => (
	<g transform={`scale(${scale.toFixed(2)})`}>
		<path
			d="M-24,8 C-30,8 -30,-2 -22,-2 C-22,-10 -10,-12 -6,-6 C-3,-15 13,-15 14,-4 C22,-6 28,2 22,8 Z"
			fill={CLOUD_SHADE}
			transform="translate(1.5 2.5)"
		/>
		<path d="M-24,8 C-30,8 -30,-2 -22,-2 C-22,-10 -10,-12 -6,-6 C-3,-15 13,-15 14,-4 C22,-6 28,2 22,8 Z" fill={CLOUD} />
	</g>
);

function useLayout(w: number, h: number, bannerBottom: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x7a1d);
		const fall = h + 40;
		const streak = (x: number, delay: number, len: number, opacity: number, dur: number) => ({
			x,
			delay,
			len,
			opacity,
			dur,
			sy: between(rand, 0.1, 0.9) * h,
		});
		const front = Array.from({length: 14}, (_, i) =>
			streak(edgeX(rand, w, 0.24), 200 + i * 130 + between(rand, 0, 300), between(rand, 9, 15) * s, between(rand, 0.45, 0.7), between(rand, 800, 1150)),
		);
		const back = Array.from({length: 16}, (_, i) =>
			streak(between(rand, 0, w), 300 + i * 110 + between(rand, 0, 400), between(rand, 12, 20) * s, between(rand, 0.16, 0.28), between(rand, 950, 1350)),
		);
		const drips = Array.from({length: 3}, (_, i) => ({
			x: between(rand, w * 0.45, w * 0.92),
			delay: 1200 + i * 1100,
			dur: between(rand, 2600, 3400),
		}));
		const ripples = Array.from({length: 5}, (_, i) => ({
			x: i < 3 ? between(rand, 10, w * 0.3) : between(rand, w * 0.7, w - 10),
			delay: 500 + i * 640,
			dur: between(rand, 1800, 2400),
		}));
		return {s, fall, front, back, drips, ripples, bannerBottom};
	}, [w, h, bannerBottom]);
}

export const RainyDay: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	const {s, fall, front, back, drips, ripples} = useLayout(w, h, bannerBottom);
	const streaks = layer === 'front' ? front : back;
	const rain = streaks.map((r, i) => (
		<Drifter
			key={i}
			x={r.x}
			y={-20}
			dx={-fall * SLANT}
			dy={fall}
			dur={r.dur}
			delay={r.delay}
			sx={-r.sy * SLANT}
			sy={r.sy}
			fade="out"
		>
			<line x1={0} y1={0} x2={-r.len * SLANT} y2={r.len} stroke={RAIN} strokeWidth={1} strokeLinecap="round" opacity={r.opacity} />
		</Drifter>
	));
	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				{rain}
			</EffectSvg>
		);
	}
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			{rain}
			{drips.map((d, i) => (
				<Drifter key={i} x={d.x} y={bannerBottom + 2} dx={0} dy={36 * s} dur={d.dur} delay={d.delay} sy={12 * s} fade="out">
					<path d="M0,-3.2 C1.6,-0.6 2,0.6 2,1.4 A2,2 0 0 1 -2,1.4 C-2,0.6 -1.6,-0.6 0,-3.2 Z" fill={RAIN} transform={`scale(${s})`} />
				</Drifter>
			))}
			{ripples.map((r, i) => (
				<g key={i} transform={`translate(${r.x.toFixed(1)} ${(h - 7 * s).toFixed(1)})`}>
					<ellipse
						className={motion.ripple}
						rx={10 * s}
						ry={2.6 * s}
						fill="none"
						stroke={RAIN}
						strokeWidth={1}
						style={vars({dur: r.dur, delay: r.delay})}
					/>
				</g>
			))}
			<g transform={`translate(${34 * s} ${20 * s})`}>
				<PopIn delay={80} dur={520}>
					<g className={motion.sway} style={vars({sway: 4, dur: 4200})}>
						<Cloud scale={0.95 * s} />
					</g>
				</PopIn>
			</g>
			<g transform={`translate(${w - 42 * s} ${34 * s})`}>
				<PopIn delay={220} dur={520}>
					<g className={motion.sway} style={vars({sway: 3, dur: 5200, delay: 800})}>
						<Cloud scale={0.68 * s} />
					</g>
				</PopIn>
			</g>
			<FadeIn delay={400} dur={900}>
				<line x1={0} y1={h - 1.5} x2={w} y2={h - 1.5} stroke={RAIN} strokeWidth={1} opacity={0.35} />
			</FadeIn>
		</EffectSvg>
	);
};
