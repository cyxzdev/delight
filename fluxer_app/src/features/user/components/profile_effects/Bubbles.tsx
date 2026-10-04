// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/profile_effects/Bubbles.module.css';
import {
	arcPath,
	bannerBottomOf,
	between,
	countFor,
	Drifter,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import frame from '@app/features/user/components/profile_effects/ProfileEffect.module.css';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Bubbles" — an iridescent soap-film frame. Clusters of illustrated bubbles (ink outline, pink/cyan film on the rim,
 * a specular crescent) mass in the corners and wobble, one swells and pops now and then, bubbles stream up the sides,
 * a scalloped foam edge lines the bottom, light shafts fall through behind the card, and the avatar sits inside its
 * own soap bubble with a few bubbles circling it.
 */

const INK = '#0c2848';
const AQUA = '#5ee7f2';
const TEAL = '#1aa9c4';
const PINK = '#ff8ad0';
const LILAC = '#b79bff';
const YELLOW = '#fff0a0';
const FOAM = '#effcff';
const FOAM_SHADE = '#9fd9ee';
const FOAM_DEEP = '#4fb0d4';

type Dot = readonly [number, number, number];

/** An illustrated soap bubble of radius r centred on (0,0). */
const Bubble: React.FC<{r: number; fillId: string; hue?: 0 | 1 | 2}> = ({r, fillId, hue = 0}) => {
	if (r < 3.2) {
		return (
			<g>
				<circle r={r} fill={`url(#${fillId})`} stroke={INK} strokeWidth={0.7} strokeOpacity={0.85} />
				<circle cx={-r * 0.35} cy={-r * 0.35} r={Math.max(0.55, r * 0.3)} fill="#fff" />
			</g>
		);
	}
	const film = [
		[PINK, AQUA, LILAC],
		[AQUA, LILAC, YELLOW],
		[LILAC, PINK, AQUA],
	][hue];
	const band = Math.max(1, r * 0.15);
	return (
		<g>
			<circle r={r} fill={`url(#${fillId})`} />
			<path d={arcPath(0, 0, r * 0.8, 15, 105)} stroke={film[0]} strokeWidth={band} strokeLinecap="round" fill="none" />
			<path d={arcPath(0, 0, r * 0.8, 112, 150)} stroke={film[1]} strokeWidth={band * 0.8} strokeLinecap="round" fill="none" />
			<path d={arcPath(0, 0, r * 0.8, 290, 340)} stroke={film[2]} strokeWidth={band * 0.7} strokeLinecap="round" fill="none" opacity={0.85} />
			<circle r={r} fill="none" stroke={INK} strokeWidth={r > 9 ? 1.2 : 0.9} />
			<path d={arcPath(0, 0, r * 0.62, 198, 252)} stroke="#ffffff" strokeWidth={Math.max(1, r * 0.17)} strokeLinecap="round" fill="none" />
			<circle cx={r * 0.38} cy={-r * 0.5} r={Math.max(0.6, r * 0.09)} fill="#ffffff" />
		</g>
	);
};

const At: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>{children}</g>
);

// Corner clusters, in local px at scale 1 measured from the corner inward (x right, y down).
const TOP_LEFT: ReadonlyArray<Dot> = [
	[17, 16, 18],
	[42, 8, 10],
	[30, 24, 6],
	[8, 36, 9],
	[48, 14, 5],
	[52, 3, 3.5],
	[20, 50, 4.5],
	[40, 34, 3],
	[6, 58, 3],
	[64, 8, 2.5],
];
const TOP_RIGHT: ReadonlyArray<Dot> = [
	[16, 12, 14],
	[38, 20, 8],
	[10, 30, 6],
	[44, 5, 4],
	[24, 34, 3.5],
	[6, 46, 3],
];
const BOTTOM_RIGHT: ReadonlyArray<Dot> = [
	[16, 30, 18],
	[42, 22, 10],
	[10, 56, 9],
	[36, 44, 6],
	[60, 14, 5],
	[26, 70, 4],
	[56, 36, 3.5],
	[8, 82, 3],
	[74, 10, 2.5],
];
const BOTTOM_LEFT: ReadonlyArray<Dot> = [
	[12, 22, 10],
	[30, 30, 6],
	[8, 42, 5],
	[28, 12, 3.5],
	[42, 22, 3],
];

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h, avatar} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	const avatarBottom = avatar ? avatar.cy + avatar.r + 12 : 0;
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0xb0bb1e);
		const riserCount = countFor(w, h, 13);
		const risers = Array.from({length: riserCount}, (_, i) => {
			const left = i % 2 === 0;
			const x = left ? between(rand, 6, w * 0.17) : between(rand, w * 0.83, w - 6);
			const r = (i % 4 === 0 ? between(rand, 5, 7.5) : between(rand, 1.8, 4.2)) * s;
			const y = h - between(rand, 6, 30) * s;
			// Bubbles on the avatar's side stop short of it.
			const ceiling = left && avatarBottom ? y - avatarBottom : h;
			const rise = Math.min(between(rand, 0.55, 0.95) * h, Math.max(40, ceiling));
			return {
				x,
				y,
				r,
				rise,
				dur: between(rand, 4200, 7200) * (r > 4 ? 1.15 : 1),
				delay: 200 + i * (4680 / riserCount) + between(rand, 0, 500),
				sway: between(rand, 3, 7),
				sy: -between(rand, 0.15, 0.8) * rise,
				hue: (i % 3) as 0 | 1 | 2,
			};
		});
		// Foam: a row of puffs, big in the corners and low in the middle.
		const foam: Array<Dot> = [];
		let x = -6;
		while (x < w + 8) {
			const edge = Math.max(0, 1 - Math.min(x, w - x) / (w * 0.28));
			const r = (4.2 + 9 * edge * edge + between(rand, -0.8, 0.8)) * s;
			foam.push([x, h + r * 0.35 - 1, r]);
			x += r * between(rand, 1.05, 1.35);
		}
		const holes = foam
			.filter(([, , r]) => r > 7 * s)
			.map(([fx, fy, r]) => [fx + between(rand, -0.3, 0.3) * r, fy - r * 0.45, between(rand, 1, 1.8) * s] as const);
		return {s, risers, foam, holes, bannerBottom};
	}, [w, h, bannerBottom, avatarBottom]);
}

function BubbleDefs({idPrefix}: {idPrefix: string}) {
	return (
		<>
			<radialGradient id={`${idPrefix}-bub`} cx="0.42" cy="0.4" r="0.62">
				<stop offset="0" stopColor={AQUA} stopOpacity={0.04} />
				<stop offset="0.7" stopColor={AQUA} stopOpacity={0.16} />
				<stop offset="1" stopColor={LILAC} stopOpacity={0.5} />
			</radialGradient>
			<linearGradient id={`${idPrefix}-iris`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor={PINK} />
				<stop offset="0.35" stopColor={AQUA} />
				<stop offset="0.7" stopColor={LILAC} />
				<stop offset="1" stopColor={PINK} />
			</linearGradient>
			<linearGradient id={`${idPrefix}-ring`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor={AQUA} />
				<stop offset="0.5" stopColor={PINK} />
				<stop offset="1" stopColor={YELLOW} />
			</linearGradient>
			<linearGradient id={`${idPrefix}-beam`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={AQUA} stopOpacity={0.2} />
				<stop offset="1" stopColor={AQUA} stopOpacity={0} />
			</linearGradient>
			<pattern id={`${idPrefix}-dots`} width={5} height={5} patternUnits="userSpaceOnUse">
				<circle cx={2.5} cy={2.5} r={1.05} fill={AQUA} />
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

/** A corner cluster. `corner` picks which way local x/y point. The biggest bubbles wobble; `popIndex` pops. */
const Cluster: React.FC<{
	dots: ReadonlyArray<Dot>;
	ox: number;
	oy: number;
	fx: 1 | -1;
	fy: 1 | -1;
	s: number;
	fillId: string;
	delay: number;
	popIndex?: number;
	popPeriod?: number;
	popDelay?: number;
}> = ({dots, ox, oy, fx, fy, s, fillId, delay, popIndex, popPeriod = 5200, popDelay = 1600}) => (
	<g>
		{dots.map(([x, y, r], i) => {
			const px = ox + fx * x * s;
			const py = oy + fy * y * s;
			const rr = r * s;
			const bubble = <Bubble r={rr} fillId={fillId} hue={(i % 3) as 0 | 1 | 2} />;
			let body: React.ReactNode = bubble;
			if (i === popIndex) {
				body = (
					<>
						<g className={styles.pop} style={vars({dur: popPeriod, delay: popDelay})}>
							{bubble}
						</g>
						<g className={styles.popRing} style={vars({dur: popPeriod, delay: popDelay})}>
							<circle r={rr * 1.1} fill="none" stroke={FOAM} strokeWidth={1.2} strokeDasharray={`${rr * 0.5} ${rr * 0.45}`} />
							{[0, 60, 120, 180, 240, 300].map((deg) => {
								const [x1, y1] = polar(0, 0, rr * 1.35, deg + 15);
								const [x2, y2] = polar(0, 0, rr * 1.75, deg + 15);
								return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AQUA} strokeWidth={1.3} strokeLinecap="round" />;
							})}
						</g>
					</>
				);
			} else if (r >= 9) {
				body = (
					<g className={styles.wobble} style={vars({dur: 1800 + i * 260, delay: -i * 400})}>
						{bubble}
					</g>
				);
			}
			return (
				<At key={i} x={px} y={py}>
					<PopIn delay={delay + i * 45} dur={420}>
						{body}
					</PopIn>
				</At>
			);
		})}
	</g>
);

export const Bubbles: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const L = useLayout(geometry);
	const {s, bannerBottom: bb} = L;
	const fillId = `${idPrefix}-bub`;
	const defs = <BubbleDefs idPrefix={idPrefix} />;

	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back" defs={defs}>
				{/* Light shafts falling through the water from the top right. */}
				<FadeIn delay={200} dur={900}>
					{[
						[w * 0.62, 34 * s, 0, 5200],
						[w * 0.8, 22 * s, 1400, 6400],
						[w * 0.94, 16 * s, 2600, 4800],
					].map(([x, bw, delay, dur], i) => (
						<path
							key={i}
							className={styles.beam}
							d={`M${x},0 L${x + bw},0 L${x + bw - w * 0.42},${h} L${x - w * 0.42 - bw * 0.4},${h} Z`}
							fill={`url(#${idPrefix}-beam)`}
							style={vars({dur, delay})}
						/>
					))}
					<g opacity={0.3} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={-60 * s} y={h - 90 * s} width={150 * s} height={170 * s} fill={`url(#${idPrefix}-dots)`} />
					</g>
					<g opacity={0.25} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={w - 90 * s} y={bb - 20 * s} width={170 * s} height={150 * s} fill={`url(#${idPrefix}-dots)`} />
					</g>
				</FadeIn>
				{/* Big faint bubbles drifting up behind the content. */}
				{[0.3, 0.55, 0.78].map((t, i) => (
					<Drifter
						key={i}
						x={w * t}
						y={h + 20}
						dx={0}
						dy={-(h + 60)}
						dur={9000 + i * 2200}
						delay={i * 2800}
						sway={8}
						swayDur={2600}
						sy={-(h * (0.35 + i * 0.2))}
					>
						<g opacity={0.35}>
							<Bubble r={(12 + i * 4) * s} fillId={fillId} hue={(i % 3) as 0 | 1 | 2} />
						</g>
					</Drifter>
				))}
				{avatar && (
					<g>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 9 * s} fill="none" stroke={TEAL} strokeWidth={1} strokeDasharray="1.5 4.5" opacity={0.9} />
						<g
							className={styles.orbit}
							style={{...vars({dur: 18000}), transformBox: 'view-box', transformOrigin: `${avatar.cx}px ${avatar.cy}px`}}
						>
							{[20, 150, 250].map((deg, i) => {
								const [x, y] = polar(avatar.cx, avatar.cy, avatar.r + 9 * s, deg);
								return (
									<At key={deg} x={x} y={y}>
										<Bubble r={[4.5, 3.2, 5.5][i] * s} fillId={fillId} hue={(i % 3) as 0 | 1 | 2} />
									</At>
								);
							})}
						</g>
					</g>
				)}
			</EffectSvg>
		);
	}

	const inset = 1.75;
	const rr = Math.max(0, radius - inset);
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front" defs={defs}>
			{/* Halftone sparkle under the top clusters. */}
			<g className={frame.fadeIntro}>
				<g opacity={0.45} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={-60 * s} y={-50 * s} width={150 * s} height={130 * s} fill={`url(#${idPrefix}-dots)`} />
				</g>
				<g opacity={0.35} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={w - 80 * s} y={-50 * s} width={140 * s} height={120 * s} fill={`url(#${idPrefix}-dots)`} />
				</g>
			</g>

			{/* Iridescent soap-film frame. */}
			<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={rr} fill="none" stroke={INK} strokeWidth={4} className={frame.drawIn} pathLength={1} />
			<rect
				x={inset}
				y={inset}
				width={w - inset * 2}
				height={h - inset * 2}
				rx={rr}
				fill="none"
				stroke={`url(#${idPrefix}-iris)`}
				strokeWidth={2.2}
				className={frame.drawIn}
				style={{animationDelay: '60ms'}}
				pathLength={1}
			/>
			<g className={frame.drawIn} style={{animationDelay: '200ms'}}>
				<path d={`M5.5,${bb + 30 * s} V${h * 0.62}`} stroke={AQUA} strokeWidth={1.1} fill="none" pathLength={1} />
				<path d={`M${w - 5.5},${70 * s} V${h * 0.42}`} stroke={PINK} strokeWidth={1.1} fill="none" pathLength={1} />
				<path d={`M${w * 0.3},5.5 H${w * 0.62}`} stroke={AQUA} strokeWidth={1.1} fill="none" pathLength={1} />
			</g>
			{/* A string of tiny bubbles along the banner's bottom edge. */}
			<FadeIn delay={500} dur={600}>
				{Array.from({length: 9}, (_, i) => {
					const start = avatar ? avatar.cx + avatar.r + 14 * s : 20;
					const x = start + ((w - 14 - start) * (i + 0.5)) / 9;
					const r = [2.2, 1.4, 3, 1.6, 2.4, 1.2, 2.8, 1.5, 2][i] * s;
					return (
						<At key={i} x={x} y={bb + (i % 2 ? 2 : -1) * s}>
							<Bubble r={r} fillId={fillId} />
						</At>
					);
				})}
			</FadeIn>

			{/* Bubbles streaming up the sides. */}
			{L.risers.map((b, i) => (
				<Drifter key={i} x={b.x} y={b.y} dx={0} dy={-b.rise} dur={b.dur} delay={b.delay} sway={b.sway} swayDur={1300 + (i % 4) * 300} sy={b.sy}>
					<Bubble r={b.r} fillId={fillId} hue={b.hue} />
				</Drifter>
			))}

			{/* Corner clusters. */}
			<Cluster dots={TOP_LEFT} ox={0} oy={0} fx={1} fy={1} s={s * 1.25} fillId={fillId} delay={60} popIndex={1} popPeriod={5600} popDelay={1800} />
			<Cluster dots={TOP_RIGHT} ox={w} oy={0} fx={-1} fy={1} s={s * 1.15} fillId={fillId} delay={160} />
			<Cluster dots={BOTTOM_RIGHT} ox={w} oy={h - 8 * s} fx={-1} fy={-1} s={s * 1.2} fillId={fillId} delay={240} popIndex={2} popPeriod={6400} popDelay={4200} />
			<Cluster dots={BOTTOM_LEFT} ox={0} oy={h - 8 * s} fx={1} fy={-1} s={s * 1.1} fillId={fillId} delay={300} />

			{/* Foam along the bottom edge. */}
			<g className={styles.foamIn} style={vars({delay: 180})}>
				{L.foam.map(([x, y, r], i) => (
					<circle key={`o${i}`} cx={x} cy={y} r={r + 1.4} fill={INK} />
				))}
				{L.foam.map(([x, y, r], i) => (
					<circle key={`s${i}`} cx={x} cy={y} r={r} fill={FOAM_SHADE} />
				))}
				{L.foam.map(([x, y, r], i) => (
					<circle key={`f${i}`} cx={x - r * 0.08} cy={y - r * 0.12} r={r * 0.82} fill={FOAM} />
				))}
				{L.holes.map(([x, y, r], i) => (
					<circle key={`h${i}`} cx={x} cy={y} r={r} fill="none" stroke={FOAM_DEEP} strokeWidth={0.8} />
				))}
			</g>

			{avatar && <AvatarFront avatar={avatar} s={s} fillId={fillId} ringId={`${idPrefix}-ring`} />}
		</EffectSvg>
	);
};

function AvatarFront({
	avatar,
	s,
	fillId,
	ringId,
}: {
	avatar: NonNullable<ProfileEffectGeometry['avatar']>;
	s: number;
	fillId: string;
	ringId: string;
}) {
	const {cx, cy, r} = avatar;
	const R = r + 4.5;
	const hugging: ReadonlyArray<readonly [number, number, number]> = [
		[28, 6.5, 0],
		[44, 3.5, 1],
		[136, 4.5, 2],
		[152, 2.6, 0],
		[-62, 3, 1],
	];
	return (
		<g>
			{/* The avatar's own soap bubble: an iridescent film with a glint. */}
			<path className={frame.ringArc} d={arcPath(cx, cy, R, 150, 390)} stroke={INK} strokeWidth={4.4} fill="none" strokeLinecap="round" pathLength={1} />
			<path
				className={frame.ringArc}
				d={arcPath(cx, cy, R, 150, 390)}
				stroke={`url(#${ringId})`}
				strokeWidth={2.4}
				fill="none"
				strokeLinecap="round"
				pathLength={1}
			/>
			<path d={arcPath(cx, cy, R - 0.5, 206, 238)} stroke="#ffffff" strokeWidth={1.6} fill="none" strokeLinecap="round" className={frame.fadeIntro} />
			{hugging.map(([deg, size, hue], i) => {
				const [x, y] = polar(cx, cy, R + size * s * 0.9, deg);
				return (
					<At key={i} x={x} y={y}>
						<PopIn delay={520 + i * 70} dur={380}>
							<g className={styles.wobble} style={vars({dur: 1500 + i * 230, delay: -i * 300})}>
								<Bubble r={size * s} fillId={fillId} hue={hue as 0 | 1 | 2} />
							</g>
						</PopIn>
					</At>
				);
			})}
		</g>
	);
}
