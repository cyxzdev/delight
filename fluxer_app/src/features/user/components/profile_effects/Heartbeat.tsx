// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	bannerBottomOf,
	Burst,
	between,
	Drifter,
	EffectSvg,
	edgeX,
	FadeIn,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import styles from '@app/features/user/components/profile_effects/Heartbeat.module.css';
import type React from 'react';
import {useMemo} from 'react';

/** "Heartbeat" — hearts float up the card's sides, the avatar beats with a ring, a pulse line runs along the banner. */

export const HEART =
	'M0,5 C-2,3.5 -7,0.5 -7,-2.5 C-7,-5.2 -4.8,-6.8 -2.8,-6.3 C-1.5,-6 -0.6,-5 0,-4 C0.6,-5 1.5,-6 2.8,-6.3 C4.8,-6.8 7,-5.2 7,-2.5 C7,0.5 2,3.5 0,5 Z';
const ROSE = '#ff5c7c';
const PINK = '#ff97ad';
const BLUSH = '#ffc9d4';

const Heart: React.FC<{size: number; color: string; outline?: boolean; opacity?: number}> = ({
	size,
	color,
	outline,
	opacity = 1,
}) => (
	<path
		d={HEART}
		transform={`scale(${size.toFixed(2)})`}
		fill={outline ? 'none' : color}
		stroke={outline ? color : 'none'}
		strokeWidth={outline ? 1.4 / size : 0}
		opacity={opacity}
	/>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x4ea7);
		const colors = [ROSE, PINK, BLUSH];
		const floaters = Array.from({length: 10}, (_, i) => ({
			x: edgeX(rand, w, 0.2),
			size: between(rand, 0.6, 1.1) * s,
			color: colors[i % 3],
			outline: i % 4 === 3,
			dur: between(rand, 5200, 8200),
			delay: 600 + i * 640,
			dx: between(rand, -14, 14),
			dy: -between(rand, h * 0.45, h * 0.8),
			sway: between(rand, 5, 10),
			sy: -between(rand, h * 0.05, h * 0.55),
			sr: between(rand, -20, 20),
		}));
		const burst = Array.from({length: 7}, (_, i) => ({
			angle: -150 + i * 30 + between(rand, -8, 8),
			dist: between(rand, 26, 44) * s,
			size: between(rand, 0.55, 0.85) * s,
			color: colors[i % 3],
			delay: 150 + i * 40,
		}));
		return {s, floaters, burst};
	}, [w, h]);
}

export const Heartbeat: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const {s, floaters, burst} = useLayout(w, h);
	const bannerBottom = bannerBottomOf(geometry);
	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				<g transform={`translate(${w - 44 * s} ${h - 48 * s})`}>
					<FadeIn dur={1000}>
						<g className={motion.pulse} style={vars({dur: 1600, delay: 600})}>
							<g transform="rotate(14)">
								<Heart size={6 * s} color={ROSE} outline opacity={0.22} />
							</g>
						</g>
					</FadeIn>
				</g>
				<g transform={`translate(${30 * s} ${h * 0.62})`}>
					<FadeIn delay={300} dur={1000}>
						<g transform="rotate(-12)">
							<Heart size={3 * s} color={PINK} opacity={0.12} />
						</g>
					</FadeIn>
				</g>
			</EffectSvg>
		);
	}
	// A pulse line along the banner's bottom edge, right of the avatar.
	const start = avatar ? avatar.cx + avatar.r + 12 : 16;
	const end = w - 14;
	const mid = start + (end - start) * 0.62;
	const y = bannerBottom - 7 * s;
	const ecg = `M${start},${y} L${mid - 22 * s},${y} L${mid - 16 * s},${y - 4 * s} L${mid - 11 * s},${y} L${mid - 7 * s},${y} L${mid - 3 * s},${y + 6 * s} L${mid + 2 * s},${y - 15 * s} L${mid + 7 * s},${y + 9 * s} L${mid + 11 * s},${y} L${mid + 18 * s},${y} L${mid + 23 * s},${y - 5 * s} L${mid + 28 * s},${y} L${end},${y}`;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			<FadeIn delay={200} dur={600}>
				<path d={ecg} fill="none" stroke={ROSE} strokeWidth={1.2} strokeLinejoin="round" opacity={0.35} />
			</FadeIn>
			<path
				className={styles.ecg}
				d={ecg}
				fill="none"
				stroke={BLUSH}
				strokeWidth={2}
				strokeLinecap="round"
				strokeLinejoin="round"
				pathLength={1}
			/>
			{floaters.map((f, i) => (
				<Drifter
					key={i}
					x={f.x}
					y={h - 6}
					dx={f.dx}
					dy={f.dy}
					dur={f.dur}
					delay={f.delay}
					rot={f.sr}
					sway={f.sway}
					sy={f.sy}
					sr={f.sr}
					fade="ends"
				>
					<Heart size={f.size} color={f.color} outline={f.outline} />
				</Drifter>
			))}
			{avatar && (
				<>
					<circle
						className={styles.beatRing}
						cx={avatar.cx}
						cy={avatar.cy}
						r={avatar.r + 3}
						fill="none"
						stroke={ROSE}
						strokeWidth={2}
					/>
					{burst.map((b, i) => {
						const [dx, dy] = polar(0, 0, avatar.r + b.dist, b.angle);
						return (
							<Burst key={i} x={avatar.cx} y={avatar.cy} dx={dx} dy={dy} dur={1300} delay={b.delay}>
								<Heart size={b.size} color={b.color} />
							</Burst>
						);
					})}
					{/* A small heart pinned to the avatar ring. */}
					<g
						transform={`translate(${polar(avatar.cx, avatar.cy, avatar.r + 1, -40)
							.map((n) => n.toFixed(1))
							.join(' ')})`}
					>
						<FadeIn delay={700}>
							<g className={motion.pulse} style={vars({dur: 1600, delay: 600})}>
								<Heart size={1.05 * s * (avatar.r / 40)} color={ROSE} />
							</g>
						</FadeIn>
					</g>
				</>
			)}
		</EffectSvg>
	);
};
