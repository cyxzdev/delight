// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	between,
	Drifter,
	EffectSvg,
	edgeX,
	FadeIn,
	PopIn,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
} from '@app/features/user/components/profile_effects/effectKit';
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import type React from 'react';
import {useMemo} from 'react';

/** "Snowfall" — soft flakes and a few crystals drift down the card, snow settles on the avatar and the bottom edge. */

const SNOW = '#f4f9ff';
const ICE = '#a9d8ff';
const SHADE = '#c9dcf0';

/** Six-armed crystal, radius ~6. */
const Crystal: React.FC<{size: number; color?: string; width?: number}> = ({size, color = SNOW, width = 1}) => (
	<g transform={`scale(${size.toFixed(2)})`} stroke={color} strokeWidth={width / size} strokeLinecap="round" fill="none">
		{[0, 60, 120].map((angle) => (
			<path key={angle} d="M0,-6 V6 M-1.8,-4.4 L0,-3 L1.8,-4.4 M-1.8,4.4 L0,3 L1.8,4.4" transform={`rotate(${angle})`} />
		))}
	</g>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x51a0);
		const flakes = Array.from({length: 14}, (_, i) => ({
			x: i < 4 ? between(rand, 0.3 * w, 0.7 * w) : edgeX(rand, w, 0.26),
			r: between(rand, 1, 2.4) * s,
			dur: between(rand, 6500, 10500),
			delay: 200 + i * 520,
			dx: between(rand, -16, 16),
			sway: between(rand, 4, 10),
			sy: between(rand, h * 0.05, h * 0.9),
		}));
		const crystals = Array.from({length: 3}, (_, i) => ({
			x: edgeX(rand, w, 0.2),
			size: between(rand, 0.75, 1.05) * s,
			dur: between(rand, 9000, 12000),
			delay: 900 + i * 2600,
			rot: between(rand, 180, 300),
			sway: between(rand, 8, 14),
			sy: between(rand, h * 0.2, h * 0.8),
		}));
		const back = Array.from({length: 9}, (_, i) => ({
			x: between(rand, 0.04 * w, 0.96 * w),
			r: between(rand, 2.6, 4.6) * s,
			dur: between(rand, 11000, 16000),
			delay: 600 + i * 1300,
			sway: between(rand, 8, 16),
			sy: between(rand, h * 0.1, h * 0.9),
		}));
		// Snowbank along the bottom: low, uneven mounds.
		let bank = `M0,${h} L0,${h - 5 * s}`;
		let x = 0;
		while (x < w) {
			const step = between(rand, 22, 40) * s;
			const peak = between(rand, 4, 9) * s;
			bank += ` Q${(x + step / 2).toFixed(1)},${(h - peak - 3 * s).toFixed(1)} ${(x + step).toFixed(1)},${(h - between(rand, 3, 6) * s).toFixed(1)}`;
			x += step;
		}
		bank += ` L${w},${h} Z`;
		return {s, flakes, crystals, back, bank};
	}, [w, h]);
}

export const Snowfall: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const {s, flakes, crystals, back, bank} = useLayout(w, h);
	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				{back.map((f, i) => (
					<Drifter key={i} x={f.x} y={-10} dx={0} dy={h + 20} dur={f.dur} delay={f.delay} sway={f.sway} sy={f.sy}>
						<circle r={f.r} fill={SNOW} opacity={0.22} />
					</Drifter>
				))}
			</EffectSvg>
		);
	}
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			{/* Corner crystals that slowly turn. */}
			<g transform={`translate(${14 * s} ${14 * s})`}>
				<PopIn delay={100}>
					<g className={motion.spin} style={{['--dur' as string]: '24s'}}>
						<Crystal size={1.5 * s} color={ICE} width={1.2} />
					</g>
				</PopIn>
			</g>
			<g transform={`translate(${w - 18 * s} ${22 * s})`}>
				<PopIn delay={220}>
					<g className={motion.spin} style={{['--dur' as string]: '30s'}}>
						<Crystal size={1.1 * s} color={SNOW} />
					</g>
				</PopIn>
			</g>
			{flakes.map((f, i) => (
				<Drifter key={i} x={f.x} y={-8} dx={f.dx} dy={h + 16} dur={f.dur} delay={f.delay} sway={f.sway} sy={f.sy}>
					<circle r={f.r} fill={SNOW} opacity={0.92} />
				</Drifter>
			))}
			{crystals.map((c, i) => (
				<Drifter
					key={i}
					x={c.x}
					y={-10}
					dx={0}
					dy={h + 20}
					dur={c.dur}
					delay={c.delay}
					rot={c.rot}
					sway={c.sway}
					sy={c.sy}
					sr={20}
				>
					<Crystal size={c.size} />
				</Drifter>
			))}
			<FadeIn delay={700} dur={1200}>
				<path d={bank} fill={SNOW} opacity={0.9} />
				<path d={bank} fill="none" stroke={SHADE} strokeWidth={0.75} opacity={0.8} />
			</FadeIn>
			{avatar && <AvatarSnowCap avatar={avatar} />}
		</EffectSvg>
	);
};

/** A lumpy cap of snow resting on top of the avatar ring. */
const AvatarSnowCap: React.FC<{avatar: {cx: number; cy: number; r: number}}> = ({avatar}) => {
	const {cx, cy, r} = avatar;
	const k = r / 40;
	const from = 208;
	const to = 332;
	const bumps = 7;
	const step = (to - from) / bumps;
	// Outer edge: soft bumps, thickest at the top; inner edge hugs the avatar.
	let d = `M${polar(cx, cy, r - 0.5, from).map((n) => n.toFixed(1)).join(',')}`;
	for (let i = 0; i < bumps; i++) {
		const a0 = from + step * i;
		const mid = a0 + step / 2;
		const t = 1 - Math.abs((mid - 270) / 62);
		const peak = r + (2.5 + 4 * t) * k;
		const valley = r + (1 + 2.6 * t) * k;
		const [qx, qy] = polar(cx, cy, peak + 1.6 * k, mid);
		const [ex, ey] = polar(cx, cy, i === bumps - 1 ? r - 0.5 : valley, a0 + step);
		d += ` Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
	}
	const [sx, sy] = polar(cx, cy, r - 0.5, from);
	d += ` A${r - 0.5},${r - 0.5} 0 0 0 ${sx.toFixed(1)},${sy.toFixed(1)} Z`;
	return (
		<PopIn delay={500} dur={520} origin="50% 100%">
			<path d={d} fill={SNOW} />
			<path
				d={`M${polar(cx, cy, r + 0.5, 222).join(',')} A${r + 0.5},${r + 0.5} 0 0 1 ${polar(cx, cy, r + 0.5, 318).join(',')}`}
				fill="none"
				stroke={SHADE}
				strokeWidth={1}
				opacity={0.7}
			/>
		</PopIn>
	);
};
