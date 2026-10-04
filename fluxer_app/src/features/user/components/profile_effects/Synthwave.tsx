// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	arcPath,
	bannerBottomOf,
	between,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
	Twinkle,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import frame from '@app/features/user/components/profile_effects/ProfileEffect.module.css';
import styles from '@app/features/user/components/profile_effects/Synthwave.module.css';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Synthwave" — an 80s neon frame. A glowing double neon border with chrome corner caps, the banner turned into a
 * sunset sky (striped sun sinking behind wireframe mountains, stars, a shooting star, a neon horizon on the banner's
 * edge), palm silhouettes rising from the bottom corners, a perspective grid rolling along the bottom strip behind the
 * content, and a neon ring around the avatar.
 */

const MAGENTA = '#ff3fc8';
const CYAN = '#3df5e0';
const SUN_TOP = '#ffe14a';
const SUN_MID = '#ff8a3d';
const SUN_BOTTOM = '#ff2f8e';
const NIGHT = '#1a0c33';
const VIOLET = '#8a4dff';
const INK = '#0d0620';
const STAR = 'M0,-4 C0.4,-1 1,-0.4 4,0 C1,0.4 0.4,1 0,4 C-0.4,1 -1,0.4 -4,0 C-1,-0.4 -0.4,-1 0,-4 Z';

/** A palm with its foot at (0,0); `lean` tilts the trunk sideways (px at the top). */
const Palm: React.FC<{H: number; lean: number; s: number; fronds: number}> = ({H, lean, s, fronds}) => {
	const top: [number, number] = [lean, -H];
	const trunk = `M${-3.2 * s},0 Q${lean * 0.2 - 2 * s},${-H * 0.55} ${lean - 1.6 * s},${-H} L${lean + 1.6 * s},${-H} Q${lean * 0.2 + 2 * s},${-H * 0.55} ${3.2 * s},0 Z`;
	const leaves = Array.from({length: fronds}, (_, i) => {
		const angle = -170 + (i * 160) / (fronds - 1) + (i % 2 ? 6 : -4);
		const len = (i === 0 || i === fronds - 1 ? 26 : 32) * s;
		const [tx, ty0] = polar(top[0], top[1], len, angle);
		const droop = (Math.abs(Math.cos((angle * Math.PI) / 180)) * 14 + 4) * s;
		const ty = ty0 + droop;
		const mx = (top[0] + tx) / 2;
		const my = (top[1] + ty) / 2 - droop * 0.55;
		const nx = -(ty - top[1]);
		const ny = tx - top[0];
		const n = Math.hypot(nx, ny) || 1;
		const wdt = 5.5 * s;
		const c1x = mx + (nx / n) * wdt;
		const c1y = my + (ny / n) * wdt;
		const c2x = mx - (nx / n) * wdt * 0.35;
		const c2y = my - (ny / n) * wdt * 0.35;
		return {
			d: `M${top[0]},${top[1]} Q${c1x.toFixed(1)},${c1y.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} Q${c2x.toFixed(1)},${c2y.toFixed(1)} ${top[0]},${top[1]} Z`,
			rib: `M${top[0]},${top[1]} Q${mx.toFixed(1)},${my.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)}`,
		};
	});
	return (
		<g strokeLinejoin="round">
			<path d={trunk} fill={NIGHT} stroke={MAGENTA} strokeWidth={1.1} />
			{Array.from({length: 6}, (_, i) => {
				const t = (i + 1) / 7;
				const x = lean * t * t * 0.9;
				return <path key={i} d={`M${x - 2.6 * s},${-H * t} l${5.2 * s},${-1.6 * s}`} stroke={VIOLET} strokeWidth={0.9} />;
			})}
			<g className={styles.frond} style={{...vars({dur: 3200 + fronds * 200}), transformOrigin: '50% 50%'}}>
				{leaves.map((leaf, i) => (
					<g key={i}>
						<path d={leaf.d} fill={NIGHT} stroke={MAGENTA} strokeWidth={1.1} />
						<path d={leaf.rib} fill="none" stroke={VIOLET} strokeWidth={0.8} />
					</g>
				))}
				<circle cx={top[0] - 1.5 * s} cy={top[1] + 2 * s} r={2.2 * s} fill={NIGHT} stroke={CYAN} strokeWidth={0.9} />
				<circle cx={top[0] + 2 * s} cy={top[1] + 2.6 * s} r={2 * s} fill={NIGHT} stroke={CYAN} strokeWidth={0.9} />
			</g>
		</g>
	);
};

/** A chrome corner cap with its outer corner at (0,0), arms along +x/+y. */
const ChromeCap: React.FC<{L: number; t: number; fillId: string}> = ({L, t, fillId}) => {
	const d = `M0,0 L${L},0 L${L - t},${t} L${t},${t} L${t},${L - t} L0,${L} Z`;
	return (
		<g>
			<path d={d} fill={`url(#${fillId})`} stroke={INK} strokeWidth={1.3} strokeLinejoin="miter" />
			<path d={`M${t * 0.5},${t * 0.5} L${L - t * 1.2},${t * 0.5}`} stroke="#ffffff" strokeWidth={0.9} opacity={0.9} />
			<path d={`M${t * 0.5},${t * 0.5} L${t * 0.5},${L - t * 1.2}`} stroke="#ffffff" strokeWidth={0.9} opacity={0.6} />
			<circle cx={t * 1.6} cy={t * 1.6} r={t * 0.42} fill={`url(#${fillId})`} stroke={INK} strokeWidth={1} />
		</g>
	);
};

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h, avatar} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x5ab0);
		const sunR = Math.min(36 * s, bannerBottom * 0.48);
		const sunCx = w * 0.74;
		const sunCy = bannerBottom + sunR * 0.18;
		const stars = Array.from({length: 7}, (_, i) => ({
			x: i < 3 ? between(rand, w * 0.3, w * 0.55) : between(rand, w * 0.55, w * 0.95),
			y: between(rand, 14 * s, bannerBottom * 0.55),
			k: between(rand, 0.5, 1) * s,
			dur: between(rand, 1800, 3200),
			delay: between(rand, 0, 2400),
			color: i % 3 === 0 ? CYAN : '#ffffff',
		}));
		// Wireframe mountains along the banner's bottom edge, right of the avatar.
		const start = avatar ? avatar.cx + avatar.r * 0.6 : 0;
		const peaks: Array<[number, number]> = [[start, bannerBottom]];
		const n = 5;
		for (let i = 0; i < n; i++) {
			const x = start + ((w + 6 - start) * (i + 0.5)) / n;
			const near = Math.abs(x - sunCx) < sunR * 1.1;
			peaks.push([x, bannerBottom - between(rand, near ? 6 : 12, near ? 12 : 24) * s]);
			peaks.push([start + ((w + 6 - start) * (i + 1)) / n, bannerBottom - between(rand, 2, 6) * s]);
		}
		peaks.push([w + 6, bannerBottom]);
		const ridge = peaks.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
		const ribs = peaks
			.filter((_, i) => i % 2 === 1)
			.map(([x, y]) => `M${x.toFixed(1)},${y.toFixed(1)} L${(x + between(rand, -10, 10) * s).toFixed(1)},${bannerBottom}`)
			.join(' ');
		const gridH = Math.min(58 * s, h * 0.2);
		const horizon = h - gridH;
		return {s, sunR, sunCx, sunCy, stars, ridge, ribs, horizon, gridH, bannerBottom};
	}, [w, h, bannerBottom, avatar?.cx, avatar?.r]);
}

function Defs({idPrefix, w, h, S}: {idPrefix: string; w: number; h: number; S: ReturnType<typeof useLayout>}) {
	return (
		<>
			<linearGradient id={`${idPrefix}-sun`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={SUN_TOP} />
				<stop offset="0.5" stopColor={SUN_MID} />
				<stop offset="1" stopColor={SUN_BOTTOM} />
			</linearGradient>
			<mask id={`${idPrefix}-sun-mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={w} height={h}>
				<rect x={0} y={0} width={w} height={h} fill="#fff" />
				{[0.12, 0.3, 0.46, 0.6, 0.72].map((t, i) => (
					<rect key={i} x={0} y={S.sunCy - S.sunR + S.sunR * (0.9 + t)} width={w} height={(1 + i * 0.8) * S.s} fill="#000" />
				))}
			</mask>
			<clipPath id={`${idPrefix}-sky`}>
				<rect x={0} y={0} width={w} height={S.bannerBottom} />
			</clipPath>
			<clipPath id={`${idPrefix}-ground`}>
				<rect x={0} y={S.horizon} width={w} height={h - S.horizon} />
			</clipPath>
			<linearGradient id={`${idPrefix}-horizon`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor={CYAN} />
				<stop offset="0.5" stopColor={MAGENTA} />
				<stop offset="1" stopColor={CYAN} />
			</linearGradient>
			<linearGradient id={`${idPrefix}-floor`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={VIOLET} stopOpacity={0.02} />
				<stop offset="1" stopColor={MAGENTA} stopOpacity={0.24} />
			</linearGradient>
			<linearGradient id={`${idPrefix}-chrome`} x1="0" y1="0" x2="0.35" y2="1">
				<stop offset="0" stopColor="#ffffff" />
				<stop offset="0.42" stopColor="#9fc2ff" />
				<stop offset="0.5" stopColor="#3a2a78" />
				<stop offset="0.62" stopColor="#c45bd8" />
				<stop offset="1" stopColor="#ffd6f2" />
			</linearGradient>
			<pattern id={`${idPrefix}-dots`} width={5} height={5} patternUnits="userSpaceOnUse">
				<circle cx={2.5} cy={2.5} r={1.05} fill={MAGENTA} />
			</pattern>
			<radialGradient id={`${idPrefix}-fade`}>
				<stop offset="0" stopColor="#fff" stopOpacity={1} />
				<stop offset="0.55" stopColor="#fff" stopOpacity={0.5} />
				<stop offset="1" stopColor="#fff" stopOpacity={0} />
			</radialGradient>
			<mask id={`${idPrefix}-fade-mask`} maskContentUnits="objectBoundingBox">
				<rect width={1} height={1} fill={`url(#${idPrefix}-fade)`} />
			</mask>
		</>
	);
}

/** Three stacked strokes fake a neon glow without filters. */
const Neon: React.FC<{d: string; color: string; width?: number; className?: string; style?: React.CSSProperties}> = ({
	d,
	color,
	width = 1.6,
	className,
	style,
}) => (
	<g className={className} style={style}>
		<path d={d} stroke={color} strokeWidth={width * 4} opacity={0.16} fill="none" strokeLinecap="round" pathLength={1} />
		<path d={d} stroke={color} strokeWidth={width * 2} opacity={0.4} fill="none" strokeLinecap="round" pathLength={1} />
		<path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" pathLength={1} />
		<path d={d} stroke="#ffffff" strokeWidth={width * 0.35} opacity={0.7} fill="none" strokeLinecap="round" pathLength={1} />
	</g>
);

function roundRect(x: number, y: number, w: number, h: number, r: number): string {
	return `M${x + r},${y} H${x + w - r} A${r},${r} 0 0 1 ${x + w},${y + r} V${y + h - r} A${r},${r} 0 0 1 ${x + w - r},${y + h} H${x + r} A${r},${r} 0 0 1 ${x},${y + h - r} V${y + r} A${r},${r} 0 0 1 ${x + r},${y} Z`;
}

export const Synthwave: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const S = useLayout(geometry);
	const {s, horizon, bannerBottom: bb} = S;
	const defs = <Defs idPrefix={idPrefix} w={w} h={h} S={S} />;

	if (layer === 'back') {
		const gap = 8 * s;
		const vanishY = horizon - 40 * s;
		const verticals = Array.from({length: 17}, (_, i) => -1.6 + (i / 16) * 3.2);
		const rows = Math.ceil((h - horizon) / gap) + 2;
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back" defs={defs}>
				<FadeIn delay={200} dur={800}>
					<g opacity={0.3} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={-70 * s} y={bb - 10} width={150 * s} height={160 * s} fill={`url(#${idPrefix}-dots)`} />
					</g>
					<g clipPath={`url(#${idPrefix}-ground)`}>
						<rect x={0} y={horizon} width={w} height={h - horizon} fill={`url(#${idPrefix}-floor)`} />
						{verticals.map((t, i) => (
							<line key={i} x1={w / 2 + (t * w) / 7} y1={vanishY} x2={w / 2 + t * w * 0.75} y2={h + 4} stroke={MAGENTA} strokeWidth={0.9} opacity={0.65} />
						))}
						<g className={styles.gridRoll} style={vars({dur: 1100, dy: gap})}>
							{Array.from({length: rows}, (_, i) => (
								<line key={i} x1={0} y1={horizon + (i - 1) * gap} x2={w} y2={horizon + (i - 1) * gap} stroke={MAGENTA} strokeWidth={0.9} opacity={0.65} />
							))}
						</g>
					</g>
					<rect className={styles.glow} x={0} y={horizon - 1} width={w} height={2} fill={`url(#${idPrefix}-horizon)`} />
				</FadeIn>
				{avatar && (
					<g className={motion.spin} style={vars({dur: 20000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 9 * s} fill="none" stroke={CYAN} strokeWidth={1.4} strokeDasharray="10 5 2 5" />
					</g>
				)}
			</EffectSvg>
		);
	}

	const inset = 2;
	const rr = Math.max(0, radius - inset);
	const capL = 36 * s;
	const capT = 7 * s;
	const trim = avatar ? avatar.cx + avatar.r + 6 : 0;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front" defs={defs}>
			{/* Sunset in the banner: the sun sinks behind wireframe mountains. */}
			<g clipPath={`url(#${idPrefix}-sky)`}>
				<g className={frame.fadeIntro}>
					<g opacity={0.5} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={-60 * s} y={-50 * s} width={150 * s} height={130 * s} fill={`url(#${idPrefix}-dots)`} />
					</g>
				</g>
				<g className={styles.sunRise} style={vars({dy: S.sunR})}>
					<circle cx={S.sunCx} cy={S.sunCy} r={S.sunR + 5 * s} fill={SUN_BOTTOM} opacity={0.18} />
					<circle cx={S.sunCx} cy={S.sunCy} r={S.sunR} fill={`url(#${idPrefix}-sun)`} mask={`url(#${idPrefix}-sun-mask)`} />
				</g>
				<FadeIn delay={350} dur={600}>
					<path d={`${S.ridge} Z`} fill={NIGHT} stroke={MAGENTA} strokeWidth={1.2} strokeLinejoin="round" />
					<path d={S.ribs} stroke={VIOLET} strokeWidth={0.9} fill="none" />
				</FadeIn>
				{S.stars.map((st, i) => (
					<Twinkle key={i} x={st.x} y={st.y} dur={st.dur} delay={st.delay}>
						<path d={STAR} fill={st.color} transform={`scale(${st.k.toFixed(2)})`} />
					</Twinkle>
				))}
				<g transform={`translate(${w * 0.92} ${10 * s})`}>
					<g className={styles.shoot} style={vars({dur: 6800, delay: 2200, dx: -w * 0.45, dy: 26 * s})}>
						<path d={`M0,0 L${28 * s},${-1.6 * s} L${28 * s},${1.6 * s} Z`} fill="#ffffff" opacity={0.7} transform={`rotate(${-Math.atan2(26 * s, w * 0.45) * (180 / Math.PI)})`} />
						<circle r={1.6 * s} fill="#ffffff" />
					</g>
				</g>
			</g>

			{/* Neon horizon along the banner's bottom edge. */}
			<Neon d={`M${trim},${bb} H${w - 4}`} color={CYAN} width={1.3} className={frame.drawIn} style={{animationDelay: '250ms'}} />
			<path className={frame.streakShimmer} d={`M${trim},${bb} H${w - 4}`} stroke="#ffffff" strokeWidth={2} fill="none" strokeLinecap="round" pathLength={1} />

			{/* Double neon frame. */}
			<Neon d={roundRect(inset, inset, w - inset * 2, h - inset * 2, rr)} color={MAGENTA} width={1.8} className={frame.drawIn} />
			<g className={frame.drawIn} style={{animationDelay: '200ms'}}>
				<path d={`M6.5,${bb + 26 * s} V${h * 0.58}`} stroke={CYAN} strokeWidth={1.2} fill="none" pathLength={1} />
				<path d={`M${w - 6.5},${bb + 16 * s} V${h * 0.5}`} stroke={CYAN} strokeWidth={1.2} fill="none" pathLength={1} />
				<path d={`M${w * 0.3},6.5 H${w * 0.6}`} stroke={CYAN} strokeWidth={1.2} fill="none" pathLength={1} />
			</g>

			{/* Palms rising from the bottom corners. */}
			{h > 260 && (
				<>
			<g transform={`translate(${10 * s} ${h - 2})`}>
				<PopIn delay={450} dur={520} origin="50% 100%">
					<Palm H={Math.min(72 * s, h * 0.17)} lean={-6 * s} s={s} fronds={7} />
				</PopIn>
			</g>
			<g transform={`translate(${24 * s} ${h - 2})`}>
				<PopIn delay={560} dur={520} origin="50% 100%">
					<Palm H={Math.min(44 * s, h * 0.1)} lean={9 * s} s={s * 0.8} fronds={6} />
				</PopIn>
			</g>
				</>
			)}
			<g transform={`translate(${w - 12 * s} ${h - 2}) scale(-1 1)`}>
				<PopIn delay={520} dur={520} origin="50% 100%">
					<Palm H={Math.min(84 * s, h * 0.3)} lean={-5 * s} s={s * 0.95} fronds={7} />
				</PopIn>
			</g>

			{/* Chrome corner caps. */}
			{(
				[
					[0, 0, 1, 1],
					[w, 0, -1, 1],
					[0, h, 1, -1],
					[w, h, -1, -1],
				] as const
			).map(([x, y, fx, fy], i) => (
				<g key={i} transform={`translate(${x} ${y}) scale(${fx} ${fy})`}>
					<PopIn delay={100 + i * 70} dur={420} origin="0 0">
						<ChromeCap L={capL} t={capT} fillId={`${idPrefix}-chrome`} />
					</PopIn>
				</g>
			))}
			<Twinkle x={capL * 0.8} y={capT * 0.5} dur={2600} delay={900}>
				<path d={STAR} fill="#ffffff" transform={`scale(${(1.4 * s).toFixed(2)})`} />
			</Twinkle>
			<Twinkle x={w - capT * 0.5} y={h - capL * 0.85} dur={3000} delay={2100}>
				<path d={STAR} fill="#ffffff" transform={`scale(${(1.2 * s).toFixed(2)})`} />
			</Twinkle>

			{avatar && <AvatarFront avatar={avatar} s={s} />}
		</EffectSvg>
	);
};

function AvatarFront({avatar, s}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; s: number}) {
	const {cx, cy, r} = avatar;
	const R = r + 4.5;
	const [gx, gy] = polar(cx, cy, R, -40);
	return (
		<g>
			<Neon d={arcPath(cx, cy, R, 100, 250)} color={MAGENTA} width={1.8} className={frame.ringArc} />
			<Neon d={arcPath(cx, cy, R, 272, 312)} color={CYAN} width={1.6} className={frame.ringArc} style={{animationDelay: '200ms'}} />
			<Twinkle x={gx} y={gy} dur={2400} delay={700}>
				<path d={STAR} fill="#ffffff" transform={`scale(${(1.5 * s).toFixed(2)})`} />
			</Twinkle>
		</g>
	);
}
