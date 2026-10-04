// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	bannerBottomOf,
	between,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectLayer,
	scaleFor,
	seeded,
	Twinkle,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import styles from '@app/features/user/components/profile_effects/Synthwave.module.css';
import type React from 'react';
import {useMemo} from 'react';

/** "Synthwave" — a striped neon sun sets behind mountains on a rolling grid along the bottom of the card. */

const MAGENTA = '#ff3fc8';
const CYAN = '#3df5e0';
const SUN_TOP = '#ffd84a';
const SUN_BOTTOM = '#ff3f9a';
const NIGHT = '#1c0f35';
const VIOLET = '#8a4dff';

/** A palm silhouette standing at (0,0). */
const Palm: React.FC<{scale: number; flip?: boolean}> = ({scale, flip}) => (
	<g transform={`scale(${flip ? -scale : scale} ${scale})`} fill={NIGHT} stroke={MAGENTA} strokeWidth={0.7 / scale} strokeLinejoin="round">
		<path d="M-1.5,0 C-1,-12 1,-24 5,-34 L7,-33.4 C3.6,-24 1.8,-12 1.5,0 Z" />
		<path d="M6,-34 C0,-38 -8,-37 -13,-31 C-7,-34 -1,-34 4,-32 Z" />
		<path d="M6,-34 C2,-42 -4,-45 -9,-44 C-3,-42 1,-38 4,-33 Z" />
		<path d="M6,-34 C10,-42 17,-44 22,-41 C16,-41 11,-38 7,-33 Z" />
		<path d="M6,-34 C13,-36 20,-32 23,-26 C18,-30 12,-32 7,-32 Z" />
		<path d="M6,-34 C8,-38 9,-44 7,-48 C10,-44 9,-38 7,-33 Z" />
	</g>
);

function useLayout(w: number, h: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x5ab0);
		const horizon = h - Math.min(46 * s, h * 0.18);
		const stars = Array.from({length: 5}, () => ({
			x: between(rand, w * 0.35, w * 0.95),
			y: between(rand, 8, 60 * s),
			dur: between(rand, 1800, 3200),
			delay: between(rand, 0, 2000),
		}));
		// Mountain ridges either side of the sun.
		const ridge = (from: number, to: number, peaks: number) => {
			let d = `M${from},${horizon}`;
			const step = (to - from) / peaks;
			for (let i = 0; i < peaks; i++) {
				const x = from + step * (i + 0.5);
				d += ` L${x.toFixed(1)},${(horizon - between(rand, 8, 20) * s).toFixed(1)}`;
			}
			return `${d} L${to},${horizon} Z`;
		};
		const mountains = `${ridge(-4, w * 0.36, 3)} ${ridge(w * 0.64, w + 4, 3)}`;
		return {s, horizon, stars, mountains};
	}, [w, h]);
}

export const Synthwave: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h} = geometry;
	const {s, horizon, stars, mountains} = useLayout(w, h);
	const bannerBottom = bannerBottomOf(geometry);
	if (layer === 'back') {
		const sunGrad = `${idPrefix}-sun`;
		const sunMask = `${idPrefix}-sun-mask`;
		const groundClip = `${idPrefix}-ground`;
		const skyClip = `${idPrefix}-sky`;
		const fadeGrad = `${idPrefix}-ground-fade`;
		const lineGrad = `${idPrefix}-horizon`;
		const sunR = 38 * s;
		const sunCx = w / 2;
		const gap = 9 * s;
		const vanishY = horizon - 30 * s;
		const verticals = Array.from({length: 15}, (_, i) => -1.4 + (i / 14) * 2.8);
		const rows = Math.ceil((h - horizon) / gap) + 1;
		return (
			<EffectSvg
				geometry={geometry}
				radius={radius}
				idPrefix={idPrefix}
				layer="back"
				defs={
					<>
						<linearGradient id={sunGrad} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={SUN_TOP} />
							<stop offset="1" stopColor={SUN_BOTTOM} />
						</linearGradient>
						<mask id={sunMask} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
							<rect x={0} y={0} width={w} height={h} fill="#fff" />
							{[0.3, 0.48, 0.64, 0.78, 0.9].map((t, i) => (
								<rect
									key={i}
									x={0}
									y={horizon - sunR + sunR * t}
									width={w}
									height={(1 + i * 0.7) * s}
									fill="#000"
								/>
							))}
						</mask>
						<clipPath id={skyClip}>
							<rect x={0} y={0} width={w} height={horizon} />
						</clipPath>
						<clipPath id={groundClip}>
							<rect x={0} y={horizon} width={w} height={h - horizon} />
						</clipPath>
						<linearGradient id={lineGrad} x1="0" y1="0" x2="1" y2="0">
							<stop offset="0" stopColor={CYAN} />
							<stop offset="0.5" stopColor={MAGENTA} />
							<stop offset="1" stopColor={CYAN} />
						</linearGradient>
						<linearGradient id={fadeGrad} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor={VIOLET} stopOpacity={0.05} />
							<stop offset="1" stopColor={VIOLET} stopOpacity={0.22} />
						</linearGradient>
					</>
				}
			>
				<g opacity={0.8}>
					<g clipPath={`url(#${skyClip})`}>
						<g className={styles.sunRise} style={vars({dy: sunR})}>
							<circle cx={sunCx} cy={horizon} r={sunR} fill={`url(#${sunGrad})`} mask={`url(#${sunMask})`} />
						</g>
					</g>
					<FadeIn delay={300} dur={700}>
						<path d={mountains} fill={NIGHT} stroke={VIOLET} strokeWidth={1} strokeLinejoin="round" />
					</FadeIn>
				</g>
				<FadeIn delay={200} dur={800}>
					<g clipPath={`url(#${groundClip})`} opacity={0.75}>
						<rect x={0} y={horizon} width={w} height={h - horizon} fill={`url(#${fadeGrad})`} />
						{verticals.map((t, i) => (
							<line
								key={i}
								x1={sunCx + (t * w) / 6}
								y1={vanishY}
								x2={sunCx + t * w * 0.9}
								y2={h + 4}
								stroke={MAGENTA}
								strokeWidth={0.8}
								opacity={0.55}
							/>
						))}
						<g className={styles.gridRoll} style={vars({dur: 1400, dy: gap})}>
							{Array.from({length: rows}, (_, i) => (
								<line
									key={i}
									x1={0}
									y1={horizon + (i - 1) * gap}
									x2={w}
									y2={horizon + (i - 1) * gap}
									stroke={MAGENTA}
									strokeWidth={0.8}
									opacity={0.55}
								/>
							))}
						</g>
					</g>
				</FadeIn>
				<FadeIn delay={100} dur={600}>
					<rect className={styles.glow} x={0} y={horizon - 0.75} width={w} height={1.5} fill={`url(#${lineGrad})`} />
				</FadeIn>
				<g transform={`translate(${16 * s} ${h + 1})`}>
					<PopIn delay={450} dur={520} origin="50% 100%">
						<Palm scale={1.05 * s} />
					</PopIn>
				</g>
				<g transform={`translate(${w - 14 * s} ${h + 1})`}>
					<PopIn delay={560} dur={520} origin="50% 100%">
						<Palm scale={0.85 * s} flip />
					</PopIn>
				</g>
			</EffectSvg>
		);
	}
	const trimStart = geometry.avatar ? geometry.avatar.cx + geometry.avatar.r + 8 : 0;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			<FadeIn delay={100} dur={600}>
				{/* Neon trim on the banner's bottom edge. */}
				<rect x={trimStart} y={bannerBottom - 1} width={Math.max(0, w - trimStart)} height={1} fill={MAGENTA} opacity={0.55} />
			</FadeIn>
			{stars.map((t, i) => (
				<Twinkle key={i} x={t.x} y={t.y} dur={t.dur} delay={t.delay}>
					<path d="M0,-3 L0.7,-0.7 L3,0 L0.7,0.7 L0,3 L-0.7,0.7 L-3,0 L-0.7,-0.7 Z" fill={CYAN} transform={`scale(${s})`} />
				</Twinkle>
			))}
		</EffectSvg>
	);
};
