// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	between,
	EffectSvg,
	edgeX,
	FadeIn,
	PopIn,
	type ProfileEffectLayer,
	scaleFor,
	seeded,
	Twinkle,
	vars,
	bannerBottomOf,
} from '@app/features/user/components/profile_effects/effectKit';
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import styles from '@app/features/user/components/profile_effects/Starlight.module.css';
import type React from 'react';
import {useMemo} from 'react';

/** "Starlight" — a night sky: twinkling stars over the banner and edges, a crescent moon, a shooting star now and then. */

const STAR = 'M0,-6 C0.6,-1.6 1.6,-0.6 6,0 C1.6,0.6 0.6,1.6 0,6 C-0.6,1.6 -1.6,0.6 -6,0 C-1.6,-0.6 -0.6,-1.6 0,-6 Z';
const WARM = '#fff3d1';
const COOL = '#c8d3ff';
const LILAC = '#a99bff';

const Star: React.FC<{size: number; color: string}> = ({size, color}) => (
	<path d={STAR} transform={`scale(${size.toFixed(2)})`} fill={color} />
);

function useLayout(w: number, h: number, bannerBottom: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x57a2);
		const twinklers = Array.from({length: 11}, (_, i) => {
			const inBanner = i < 6;
			return {
				x: inBanner ? between(rand, w * 0.3, w * 0.85) : edgeX(rand, w, 0.12),
				y: inBanner ? between(rand, 8, bannerBottom - 12) : between(rand, bannerBottom + 20, h - 12),
				size: between(rand, 0.45, 0.95) * s,
				color: i % 3 === 0 ? COOL : WARM,
				dur: between(rand, 1800, 3400),
				delay: between(rand, 0, 2400),
			};
		});
		const field = Array.from({length: 34}, () => ({
			x: between(rand, 0, w),
			y: between(rand, 0, h),
			r: between(rand, 0.4, 1.1) * s,
			o: between(rand, 0.25, 0.7),
		}));
		return {s, twinklers, field};
	}, [w, h, bannerBottom]);
}

export const Starlight: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	const {s, twinklers, field} = useLayout(w, h, bannerBottom);
	if (layer === 'back') {
		// Constellation in the bottom-right corner.
		const pts: Array<[number, number]> = [
			[w - 70 * s, h - 22 * s],
			[w - 52 * s, h - 40 * s],
			[w - 30 * s, h - 34 * s],
			[w - 18 * s, h - 58 * s],
			[w - 40 * s, h - 72 * s],
		];
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back">
				<FadeIn dur={1200}>
					{field.map((f, i) => (
						<circle key={i} cx={f.x} cy={f.y} r={f.r} fill={WARM} opacity={f.o} />
					))}
					<polyline
						points={pts.map((p) => p.join(',')).join(' ')}
						fill="none"
						stroke={LILAC}
						strokeWidth={0.8}
						opacity={0.4}
					/>
					{pts.map(([x, y], i) => (
						<circle key={i} cx={x} cy={y} r={1.6 * s} fill={COOL} opacity={0.7} />
					))}
				</FadeIn>
			</EffectSvg>
		);
	}
	const gradId = `${idPrefix}-star-trail`;
	const moonX = w - 26 * s;
	const moonY = 24 * s;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={
				<linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor={WARM} stopOpacity={0} />
					<stop offset="1" stopColor={WARM} stopOpacity={0.95} />
				</linearGradient>
			}
		>
			{/* Crescent moon. */}
			<g transform={`translate(${moonX} ${moonY})`}>
				<PopIn delay={120} dur={600}>
					<path
						d={`M${3 * s},${-11 * s} A${11 * s},${11 * s} 0 1 0 ${10 * s},${6 * s} A${8.5 * s},${8.5 * s} 0 1 1 ${3 * s},${-11 * s} Z`}
						fill={WARM}
					/>
				</PopIn>
			</g>
			{twinklers.map((t, i) => (
				<Twinkle key={i} x={t.x} y={t.y} dur={t.dur} delay={t.delay}>
					<Star size={t.size} color={t.color} />
				</Twinkle>
			))}
			<ShootingStar x={w * 0.12} y={10 * s} dx={w * 0.55} dy={bannerBottom * 0.55} dur={6200} delay={700} gradId={gradId} s={s} />
			<ShootingStar
				x={w * 0.95}
				y={bannerBottom + 40 * s}
				dx={-w * 0.45}
				dy={h * 0.3}
				dur={9400}
				delay={4200}
				gradId={gradId}
				s={s}
			/>
			{avatar && (
				<g transform={`translate(${avatar.cx} ${avatar.cy})`}>
					<FadeIn delay={500}>
						<g className={motion.spin} style={vars({dur: 16000})}>
							<circle r={avatar.r + 12} fill="none" stroke="none" />
							<g transform={`translate(0 ${-(avatar.r + 7)})`}>
								<Star size={0.7 * s} color={WARM} />
							</g>
							<circle cx={avatar.r + 7} cy={0} r={1.2 * s} fill={COOL} />
						</g>
					</FadeIn>
				</g>
			)}
		</EffectSvg>
	);
};

const ShootingStar: React.FC<{
	x: number;
	y: number;
	dx: number;
	dy: number;
	dur: number;
	delay: number;
	gradId: string;
	s: number;
}> = ({x, y, dx, dy, dur, delay, gradId, s}) => {
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	const trail = 46 * s;
	return (
		<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
			<g className={styles.shoot} style={vars({dur, delay, dx, dy})}>
				<g transform={`rotate(${angle.toFixed(1)})`}>
					<rect x={-trail} y={-0.75} width={trail} height={1.5} rx={0.75} fill={`url(#${gradId})`} />
					<circle r={1.8 * s} fill={WARM} />
				</g>
			</g>
		</g>
	);
};
