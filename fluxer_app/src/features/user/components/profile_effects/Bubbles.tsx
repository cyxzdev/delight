// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	Burst,
	between,
	Drifter,
	EffectSvg,
	edgeX,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
} from '@app/features/user/components/profile_effects/effectKit';
import type React from 'react';
import {useMemo} from 'react';

/** "Bubbles" — soap bubbles wobble up the card's sides; a few big, faint ones rise behind the content. */

const RIM = '#9fe6ff';
const TINT = '#7fd3ff';
const SHINE = '#ffffff';
const IRIS = '#e3a8ff';

const Bubble: React.FC<{r: number; faint?: boolean}> = ({r, faint}) => (
	<g opacity={faint ? 0.3 : 1}>
		<circle r={r} fill={TINT} fillOpacity={0.1} stroke={RIM} strokeWidth={faint ? 1.2 : 1} strokeOpacity={0.85} />
		{/* A hint of iridescence on the lower right of the rim. */}
		<path
			d={`M${(r * 0.97).toFixed(2)},${(r * 0.26).toFixed(2)} A${r},${r} 0 0 1 ${(r * 0.26).toFixed(2)},${(r * 0.97).toFixed(2)}`}
			fill="none"
			stroke={IRIS}
			strokeWidth={1}
			strokeOpacity={0.8}
		/>
		<path
			d={`M${(-r * 0.62).toFixed(2)},${(-r * 0.2).toFixed(2)} A${(r * 0.66).toFixed(2)},${(r * 0.66).toFixed(2)} 0 0 1 ${(-r * 0.2).toFixed(2)},${(-r * 0.62).toFixed(2)}`}
			fill="none"
			stroke={SHINE}
			strokeWidth={Math.max(1, r * 0.16)}
			strokeLinecap="round"
			strokeOpacity={0.85}
		/>
	</g>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0xb0b1);
		const front = Array.from({length: 11}, (_, i) => ({
			x: edgeX(rand, w, 0.2),
			r: between(rand, 2.5, 7.5) * s,
			dur: between(rand, 5500, 9000),
			delay: 300 + i * 560,
			dx: between(rand, -12, 12),
			dy: -between(rand, h * 0.55, h * 0.95),
			sway: between(rand, 4, 9),
			sy: -between(rand, h * 0.08, h * 0.7),
		}));
		const back = Array.from({length: 6}, (_, i) => ({
			x: between(rand, w * 0.1, w * 0.9),
			r: between(rand, 11, 20) * s,
			dur: between(rand, 11000, 15000),
			delay: 800 + i * 2000,
			dy: -(h + 50),
			sway: between(rand, 8, 14),
			sy: -between(rand, h * 0.2, h * 0.8),
		}));
		const burst = Array.from({length: 6}, (_, i) => ({
			angle: -170 + i * 34 + between(rand, -8, 8),
			dist: between(rand, 18, 34) * s,
			r: between(rand, 2.5, 5) * s,
			delay: 100 + i * 60,
		}));
		return {s, front, back, burst};
	}, [w, h]);
}

export const Bubbles: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {height: h, avatar} = geometry;
	const {front, back, burst} = useLayout(geometry.width, h);
	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				{back.map((b, i) => (
					<Drifter key={i} x={b.x} y={h + b.r} dx={0} dy={b.dy} dur={b.dur} delay={b.delay} sway={b.sway} sy={b.sy}>
						<Bubble r={b.r} faint />
					</Drifter>
				))}
			</EffectSvg>
		);
	}
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			{front.map((b, i) => (
				<Drifter key={i} x={b.x} y={h + b.r} dx={b.dx} dy={b.dy} dur={b.dur} delay={b.delay} sway={b.sway} sy={b.sy}>
					<Bubble r={b.r} />
				</Drifter>
			))}
			{avatar &&
				burst.map((b, i) => {
					const [dx, dy] = polar(0, 0, avatar.r + b.dist, b.angle);
					return (
						<Burst key={i} x={avatar.cx} y={avatar.cy} dx={dx} dy={dy} dur={1500} delay={b.delay}>
							<Bubble r={b.r} />
						</Burst>
					);
				})}
		</EffectSvg>
	);
};
