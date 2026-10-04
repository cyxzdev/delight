// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	Burst,
	between,
	Drifter,
	EffectSvg,
	edgeX,
	FadeIn,
	type ProfileEffectLayer,
	scaleFor,
	seeded,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import styles from '@app/features/user/components/profile_effects/Confetti.module.css';
import type React from 'react';
import {useMemo} from 'react';

/** "Confetti" — two poppers fire from the top corners, then paper keeps tumbling down the sides under hanging streamers. */

const COLORS = ['#ff5c7c', '#ffd23f', '#3fe0c8', '#7f9cff', '#c38bff', '#ff9f43'];

type PieceKind = 'strip' | 'dot' | 'curl';

const Piece: React.FC<{kind: PieceKind; color: string; size: number; flutter: number; delay: number}> = ({
	kind,
	color,
	size,
	flutter,
	delay,
}) => (
	<g className={styles.flutter} style={vars({dur: flutter, delay})}>
		{kind === 'strip' && <rect x={-1.6 * size} y={-3.4 * size} width={3.2 * size} height={6.8 * size} rx={0.6} fill={color} />}
		{kind === 'dot' && <circle r={2 * size} fill={color} />}
		{kind === 'curl' && (
			<path
				d={`M${-4 * size},0 q${2 * size},${-3 * size} ${4 * size},0 t${4 * size},0`}
				stroke={color}
				strokeWidth={1.6 * size}
				fill="none"
				strokeLinecap="round"
			/>
		)}
	</g>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0xc0f3);
		const kinds: Array<PieceKind> = ['strip', 'strip', 'dot', 'curl'];
		const pick = <T,>(list: ReadonlyArray<T>) => list[Math.floor(rand() * list.length)];
		const burst = Array.from({length: 22}, (_, i) => {
			const left = i % 2 === 0;
			const angle = between(rand, 15, 75);
			const dist = between(rand, 70, 190) * s;
			const radians = (angle * Math.PI) / 180;
			return {
				x: left ? 6 : w - 6,
				y: 6,
				dx: (left ? 1 : -1) * Math.cos(radians) * dist,
				dy: Math.sin(radians) * dist + between(rand, 20, 70) * s,
				rot: between(rand, -540, 540),
				dur: between(rand, 1300, 2000),
				delay: between(rand, 60, 260),
				kind: pick(kinds),
				color: pick(COLORS),
				flutter: between(rand, 300, 600),
			};
		});
		const falling = Array.from({length: 12}, (_, i) => ({
			x: edgeX(rand, w, 0.22),
			kind: pick(kinds),
			color: COLORS[i % COLORS.length],
			size: between(rand, 0.8, 1.15) * s,
			dur: between(rand, 6500, 9500),
			delay: 1400 + i * 620,
			rot: between(rand, 180, 540) * (rand() < 0.5 ? -1 : 1),
			dx: between(rand, -18, 18),
			sway: between(rand, 6, 12),
			flutter: between(rand, 500, 1000),
			sy: between(rand, h * 0.1, h * 0.92),
			sr: between(rand, 0, 360),
		}));
		const back = Array.from({length: 6}, (_, i) => ({
			x: between(rand, w * 0.1, w * 0.9),
			kind: pick(kinds),
			color: COLORS[(i + 2) % COLORS.length],
			size: between(rand, 1.6, 2.2) * s,
			dur: between(rand, 11000, 15000),
			delay: 1600 + i * 1900,
			rot: between(rand, 120, 300),
			sway: between(rand, 10, 16),
			flutter: between(rand, 900, 1500),
			sy: between(rand, h * 0.25, h * 0.85),
			sr: between(rand, 0, 360),
		}));
		return {s, burst, falling, back};
	}, [w, h]);
}

/** A wavy streamer hanging from (x, 0). */
function streamerPath(x: number, length: number, amplitude: number, flip: boolean): string {
	const dir = flip ? -1 : 1;
	let d = `M${x},-2`;
	const steps = 4;
	for (let i = 1; i <= steps; i++) {
		const y = (length / steps) * i;
		const cx = x + dir * amplitude * (i % 2 === 0 ? -1 : 1);
		d += ` Q${cx.toFixed(1)},${(y - length / steps / 2).toFixed(1)} ${(x + dir * i * 2).toFixed(1)},${y.toFixed(1)}`;
	}
	return d;
}

export const Confetti: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h} = geometry;
	const {s, burst, falling, back} = useLayout(w, h);
	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				{back.map((p, i) => (
					<Drifter
						key={i}
						x={p.x}
						y={-12}
						dx={0}
						dy={h + 24}
						dur={p.dur}
						delay={p.delay}
						rot={p.rot}
						sway={p.sway}
						sy={p.sy}
						sr={p.sr}
					>
						<g opacity={0.28}>
							<Piece kind={p.kind} color={p.color} size={p.size} flutter={p.flutter} delay={p.delay} />
						</g>
					</Drifter>
				))}
			</EffectSvg>
		);
	}
	const streamers: Array<[number, number, string, boolean]> = [
		[16 * s, 46 * s, COLORS[0], false],
		[30 * s, 30 * s, COLORS[1], false],
		[w - 18 * s, 50 * s, COLORS[2], true],
		[w - 34 * s, 32 * s, COLORS[4], true],
	];
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			<FadeIn delay={250} dur={500}>
				{streamers.map(([x, length, color, flip], i) => (
					<g key={i} className={styles.streamer} style={vars({delay: i * 500})}>
						<path
							d={streamerPath(x, length, 5 * s, flip)}
							stroke={color}
							strokeWidth={2.4 * s}
							fill="none"
							strokeLinecap="round"
						/>
					</g>
				))}
			</FadeIn>
			{burst.map((p, i) => (
				<Burst key={i} x={p.x} y={p.y} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay} rot={p.rot}>
					<Piece kind={p.kind} color={p.color} size={s} flutter={p.flutter} delay={0} />
				</Burst>
			))}
			{falling.map((p, i) => (
				<Drifter
					key={i}
					x={p.x}
					y={-10}
					dx={p.dx}
					dy={h + 20}
					dur={p.dur}
					delay={p.delay}
					rot={p.rot}
					sway={p.sway}
					sy={p.sy}
					sr={p.sr}
				>
					<Piece kind={p.kind} color={p.color} size={p.size} flutter={p.flutter} delay={p.delay} />
				</Drifter>
			))}
		</EffectSvg>
	);
};
