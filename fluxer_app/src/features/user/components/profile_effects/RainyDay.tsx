// SPDX-License-Identifier: AGPL-3.0-or-later

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
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import frame from '@app/features/user/components/profile_effects/ProfileEffect.module.css';
import styles from '@app/features/user/components/profile_effects/RainyDay.module.css';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Rainy Day" — the card is a rain-streaked window. Storm clouds bank over the top corners and throw the odd lightning
 * bolt, beads of condensation cling to the frame and run down the glass leaving wet trails, drips hang off the banner,
 * a puddle with splashing ripples gathers along the bottom, and a little umbrella shelters the avatar inside a ring of
 * ripples.
 */

const INK = '#101c38';
const FRAME = '#5f86cf';
const GLASS = '#cfe6ff';
const WATER = '#8cc4ff';
const WATER_DEEP = '#2f5fb3';
const CLOUD = '#c9d3e6';
const CLOUD_SHADE = '#8391b0';
const CLOUD_DARK = '#57648a';
const CLOUD_DARK_SHADE = '#3c4768';
const CLOUD_LIGHT = '#f2f6fd';
const BOLT_FILL = '#ffe45c';
const FLASH = '#fff6c4';
const UMBRELLA = '#ffcd3c';
const UMBRELLA_SHADE = '#f08a24';

type Puff = readonly [number, number, number];

// Cloud banks for the top-left corner, in local px at scale 1 (x right, y down from the card's corner).
const BACK_BANK: ReadonlyArray<Puff> = [
	[52, -4, 21],
	[78, 0, 16],
	[100, -3, 12],
	[116, 2, 8],
	[128, -2, 6],
];
const FRONT_BANK: ReadonlyArray<Puff> = [
	[-4, 8, 22],
	[20, 2, 18],
	[40, 12, 14],
	[58, 10, 11],
	[72, 16, 8],
	[84, 8, 7],
	[6, 26, 13],
	[26, 26, 11],
	[46, 23, 8],
	[-2, 42, 9],
];
const BOLT = 'M7,0 L-3,15 L3,15 L-4,32 L11,11 L4,11 L10,0 Z';
const TEAR = 'M0,0 C1.6,2.6 2.8,4.6 2.8,6.3 A2.8,2.8 0 0 1 -2.8,6.3 C-2.8,4.6 -1.6,2.6 0,0 Z';
const RUNNER = 'M0,-6 C1.9,-2.2 3.1,-0.2 3.1,1.6 A3.1,3.1 0 0 1 -3.1,1.6 C-3.1,-0.2 -1.9,-2.2 0,-6 Z';

/** A layered illustrated cloud: ink outline, shade underside, body, highlight puffs. */
const Cloud: React.FC<{puffs: ReadonlyArray<Puff>; body: string; shade: string; light?: string}> = ({
	puffs,
	body,
	shade,
	light,
}) => (
	<g>
		{puffs.map(([x, y, r], i) => (
			<circle key={`o${i}`} cx={x} cy={y} r={r + 1.4} fill={INK} />
		))}
		{puffs.map(([x, y, r], i) => (
			<circle key={`s${i}`} cx={x} cy={y} r={r} fill={shade} />
		))}
		{puffs.map(([x, y, r], i) => (
			<circle key={`b${i}`} cx={x - r * 0.06} cy={y - r * 0.1} r={r * 0.86} fill={body} />
		))}
		{light &&
			puffs
				.filter(([, , r]) => r >= 11)
				.map(([x, y, r], i) => (
					<path
						key={`l${i}`}
						d={arcPath(x - r * 0.06, y - r * 0.1, r * 0.62, 200, 262)}
						stroke={light}
						strokeWidth={Math.max(1.4, r * 0.16)}
						strokeLinecap="round"
						fill="none"
					/>
				))}
	</g>
);

/** Silhouette of a cloud bank, used for the lightning glow inside it. */
const CloudGlow: React.FC<{puffs: ReadonlyArray<Puff>}> = ({puffs}) => (
	<g fill={FLASH}>
		{puffs.map(([x, y, r], i) => (
			<circle key={i} cx={x - r * 0.06} cy={y - r * 0.1} r={r * 0.86} />
		))}
	</g>
);

/** A bead of water sitting on the glass. */
const Bead: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
		<circle r={r} fill={WATER} fillOpacity={0.28} stroke={INK} strokeOpacity={0.7} strokeWidth={0.7} />
		{r > 1.8 && (
			<path
				d={arcPath(0, 0, r * 0.66, 20, 150)}
				stroke={WATER_DEEP}
				strokeWidth={r * 0.34}
				strokeLinecap="round"
				fill="none"
				opacity={0.85}
			/>
		)}
		<circle cx={-r * 0.36} cy={-r * 0.38} r={Math.max(0.5, r * 0.3)} fill="#ffffff" />
	</g>
);

const Umbrella: React.FC<{R: number; clipId: string}> = ({R, clipId}) => {
	const dome = `M${-R},0 C${-R},${-R * 0.9} ${R},${-R * 0.9} ${R},0`;
	let scallops = '';
	for (let i = 0; i < 4; i++) {
		const x0 = R - (i * R) / 2;
		const x1 = x0 - R / 2;
		scallops += ` Q${((x0 + x1) / 2).toFixed(2)},${(-R * 0.2).toFixed(2)} ${x1.toFixed(2)},0`;
	}
	const canopy = `${dome}${scallops} Z`;
	const apexY = -R * 0.675;
	return (
		<g>
			<defs>
				<clipPath id={clipId}>
					<path d={canopy} />
				</clipPath>
			</defs>
			{/* Handle. */}
			<path
				d={`M0,0 V${R * 0.95} a${R * 0.17},${R * 0.17} 0 0 1 ${-R * 0.34},0`}
				stroke={INK}
				strokeWidth={2.4}
				fill="none"
				strokeLinecap="round"
			/>
			<path d={`M0,0 V${R * 0.95} a${R * 0.17},${R * 0.17} 0 0 1 ${-R * 0.34},0`} stroke="#a86b3c" strokeWidth={0.9} fill="none" strokeLinecap="round" />
			<path d={`M0,${apexY} V${apexY - R * 0.24}`} stroke={INK} strokeWidth={2} strokeLinecap="round" />
			<path d={canopy} fill={UMBRELLA} />
			<g clipPath={`url(#${clipId})`}>
				<path d={`M0,${apexY} L${R / 2},2 L${R * 1.6},2 L${R * 1.6},${-R} Z`} fill={UMBRELLA_SHADE} />
				<path d={`M0,${apexY} L${-R / 2},2 L0,2 Z`} fill={UMBRELLA_SHADE} />
			</g>
			{[R / 2, 0, -R / 2].map((x) => (
				<path key={x} d={`M0,${apexY} L${x},0`} stroke={INK} strokeWidth={0.8} />
			))}
			<path d={canopy} fill="none" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
			<path
				d={`M${-R * 0.72},${-R * 0.3} Q${-R * 0.5},${-R * 0.62} ${-R * 0.12},${-R * 0.66}`}
				stroke="#fff8d8"
				strokeWidth={1.3}
				strokeLinecap="round"
				fill="none"
			/>
		</g>
	);
};

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h, avatar} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x7a1d);
		const fall = h + 30;
		const SLANT = 0.18;
		const rain = Array.from({length: countFor(w, h, 10)}, (_, i) => {
			const left = i % 2 === 0;
			const x = left ? between(rand, 4, w * 0.2) : between(rand, w * 0.8, w - 2);
			return {
				x,
				y: between(rand, 20, 60) * s,
				len: between(rand, 9, 15) * s,
				dur: between(rand, 750, 1050),
				delay: 300 + i * 140 + between(rand, 0, 300),
				sy: between(rand, 0.15, 0.85) * h,
				slant: SLANT,
				fall,
			};
		});
		const backRain = Array.from({length: countFor(w, h, 9)}, (_, i) => ({
			x: between(rand, 0, w),
			y: -20,
			len: between(rand, 14, 22) * s,
			dur: between(rand, 900, 1300),
			delay: 200 + i * 160 + between(rand, 0, 400),
			sy: between(rand, 0.1, 0.9) * h,
			slant: SLANT,
			fall: fall + 20,
		}));
		// Condensation beads, massed along the side edges and the lower half; the middle stays clear.
		const beads: Array<{x: number; y: number; r: number}> = [];
		const top = bannerBottom + 6;
		const beadCount = countFor(w, h, 34);
		for (let i = 0; i < beadCount; i++) {
			const side = i % 2 === 0;
			const depth = Math.pow(rand(), 1.8) * 22 * s;
			const y = top + Math.pow(rand(), 0.7) * (h - top - 14 * s);
			beads.push({x: side ? 5 + depth : w - 5 - depth, y, r: between(rand, 1, 3.4) * s * (depth < 8 * s ? 1 : 0.75)});
		}
		const runners = [
			{x: 9 * s, y: top + 20 * s, len: 60 * s, dur: 4600, delay: 900},
			{x: w - 11 * s, y: top + 6 * s, len: 74 * s, dur: 5400, delay: 2200},
			{x: 17 * s, y: h * 0.62, len: 44 * s, dur: 4100, delay: 3300},
			{x: w - 19 * s, y: h * 0.58, len: 48 * s, dur: 4900, delay: 400},
		];
		const dripStart = avatar ? avatar.cx + avatar.r + 14 * s : 24 * s;
		const dripEnd = w - 12 * s;
		const dripCount = countFor(w, h, 7);
		const drips = Array.from({length: dripCount}, (_, i) => ({
			x: dripStart + ((i + between(rand, 0.1, 0.9)) / dripCount) * (dripEnd - dripStart),
			k: between(rand, 0.55, 1.05) * s,
		}));
		// Puddle surface: low in the middle, heaped into the bottom corners.
		const surface = (x: number) => {
			const l = Math.max(0, 1 - x / (w * 0.3));
			const r = Math.max(0, 1 - (w - x) / (w * 0.3));
			return h - (4.5 + 13 * (l * l) + 11 * (r * r) + Math.sin(x / (9 * s)) * 1.1) * s;
		};
		let wave = `M-2,${surface(0).toFixed(1)}`;
		for (let x = 4; x <= w + 4; x += 4) wave += ` L${x},${surface(x).toFixed(1)}`;
		const puddle = `${wave} L${w + 4},${h + 4} L-2,${h + 4} Z`;
		const ripples = [
			{x: 16 * s, dur: 2300, delay: 600},
			{x: 40 * s, dur: 2700, delay: 1700},
			{x: w - 22 * s, dur: 2500, delay: 1100},
			{x: w - 48 * s, dur: 2900, delay: 2300},
		].map((r) => ({...r, y: surface(r.x) + 3 * s}));
		return {s, rain, backRain, beads, runners, drips, puddle, wave, surface, ripples, bannerBottom, dripStart, dripEnd};
	}, [w, h, bannerBottom, avatar?.cx, avatar?.r]);
}

function HalftoneDefs({idPrefix}: {idPrefix: string}) {
	return (
		<>
			<pattern id={`${idPrefix}-rain-dots`} width={5} height={5} patternUnits="userSpaceOnUse">
				<circle cx={2.5} cy={2.5} r={1} fill={GLASS} />
			</pattern>
			<radialGradient id={`${idPrefix}-rain-fade`}>
				<stop offset="0" stopColor="#fff" stopOpacity={1} />
				<stop offset="0.55" stopColor="#fff" stopOpacity={0.5} />
				<stop offset="1" stopColor="#fff" stopOpacity={0} />
			</radialGradient>
			<mask id={`${idPrefix}-rain-mask`} maskContentUnits="objectBoundingBox">
				<rect width={1} height={1} fill={`url(#${idPrefix}-rain-fade)`} />
			</mask>
			<linearGradient id={`${idPrefix}-fog-l`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor={WATER} stopOpacity={0.22} />
				<stop offset="1" stopColor={WATER} stopOpacity={0} />
			</linearGradient>
			<linearGradient id={`${idPrefix}-fog-r`} x1="1" y1="0" x2="0" y2="0">
				<stop offset="0" stopColor={WATER} stopOpacity={0.22} />
				<stop offset="1" stopColor={WATER} stopOpacity={0} />
			</linearGradient>
			<linearGradient id={`${idPrefix}-puddle`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={WATER} stopOpacity={0.75} />
				<stop offset="1" stopColor={WATER_DEEP} stopOpacity={0.85} />
			</linearGradient>
		</>
	);
}

const Streak: React.FC<{r: {x: number; y: number; len: number; dur: number; delay: number; sy: number; slant: number; fall: number}; opacity: number; width: number}> = ({
	r,
	opacity,
	width,
}) => (
	<Drifter
		x={r.x}
		y={r.y - 30}
		dx={-r.fall * r.slant}
		dy={r.fall}
		dur={r.dur}
		delay={r.delay}
		sx={-(r.sy - r.y) * r.slant}
		sy={r.sy - r.y}
		fade="out"
	>
		<line x1={0} y1={0} x2={-r.len * r.slant} y2={r.len} stroke={GLASS} strokeWidth={width} strokeLinecap="round" opacity={opacity} />
	</Drifter>
);

export const RainyDay: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const L = useLayout(geometry);
	const {s, bannerBottom: bb} = L;
	const defs = <HalftoneDefs idPrefix={idPrefix} />;

	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back" defs={defs}>
				<FadeIn delay={100} dur={800}>
					{/* Fine condensation in the lower corners. */}
					<g opacity={0.35} mask={`url(#${idPrefix}-rain-mask)`}>
						<rect x={-70 * s} y={h - 80 * s} width={150 * s} height={160 * s} fill={`url(#${idPrefix}-rain-dots)`} />
					</g>
					<g opacity={0.3} mask={`url(#${idPrefix}-rain-mask)`}>
						<rect x={w - 80 * s} y={h - 90 * s} width={160 * s} height={170 * s} fill={`url(#${idPrefix}-rain-dots)`} />
					</g>
				</FadeIn>
				{L.backRain.map((r, i) => (
					<Streak key={i} r={r} opacity={0.22} width={1} />
				))}
				{avatar && (
					<g>
						{[0, 1].map((i) => (
							<circle
								key={i}
								className={motion.ripple}
								cx={avatar.cx}
								cy={avatar.cy}
								r={avatar.r + 22 * s}
								fill="none"
								stroke={WATER}
								strokeWidth={1.4}
								style={vars({dur: 3200, delay: 400 + i * 1600})}
							/>
						))}
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 7 * s} fill="none" stroke={FRAME} strokeWidth={1} strokeDasharray="2 5" opacity={0.7} />
					</g>
				)}
			</EffectSvg>
		);
	}

	const inset = 1.75;
	const r = Math.max(0, radius - inset);
	const umbrellaR = avatar ? Math.max(15, avatar.r * 0.6) : 0;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front" defs={defs}>
			{/* Halftone mist under the clouds. */}
			<g className={frame.fadeIntro}>
				<g opacity={0.5} mask={`url(#${idPrefix}-rain-mask)`}>
					<rect x={-60 * s} y={-50 * s} width={170 * s} height={130 * s} fill={`url(#${idPrefix}-rain-dots)`} />
				</g>
				<g opacity={0.4} mask={`url(#${idPrefix}-rain-mask)`}>
					<rect x={w - 100 * s} y={-50 * s} width={150 * s} height={120 * s} fill={`url(#${idPrefix}-rain-dots)`} />
				</g>
			</g>

			{/* Window frame: ink, painted sash, a thin glass glint on the inside. */}
			<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={r} fill="none" stroke={INK} strokeWidth={4} className={frame.drawIn} pathLength={1} />
			<rect
				x={inset}
				y={inset}
				width={w - inset * 2}
				height={h - inset * 2}
				rx={r}
				fill="none"
				stroke={FRAME}
				strokeWidth={2}
				className={frame.drawIn}
				style={{animationDelay: '60ms'}}
				pathLength={1}
			/>
			<g className={frame.drawIn} style={{animationDelay: '220ms'}}>
				<path d={`M5.5,${bb + 14 * s} V${h - 40 * s}`} stroke={GLASS} strokeWidth={1} opacity={0.7} fill="none" pathLength={1} />
				<path d={`M${w - 5.5},${56 * s} V${h * 0.5}`} stroke={GLASS} strokeWidth={1} opacity={0.7} fill="none" pathLength={1} />
				<path d={`M${w - 5.5},${h * 0.5 + 10} V${h * 0.5 + 22}`} stroke={GLASS} strokeWidth={1} opacity={0.7} fill="none" pathLength={1} />
			</g>

			{/* Banner sill: a wet edge with hanging drips. */}
			<path
				className={frame.drawIn}
				style={{animationDelay: '300ms'}}
				d={`M${L.dripStart - 6 * s},${bb} H${w - 4}`}
				stroke={INK}
				strokeWidth={2.6}
				fill="none"
				pathLength={1}
			/>
			<path
				className={frame.drawIn}
				style={{animationDelay: '320ms'}}
				d={`M${L.dripStart - 6 * s},${bb} H${w - 4}`}
				stroke={WATER}
				strokeWidth={1.2}
				fill="none"
				pathLength={1}
			/>
			<FadeIn delay={600} dur={500}>
				{L.drips.map((d, i) => (
					<g key={i} transform={`translate(${d.x.toFixed(1)} ${bb + 0.5}) scale(${d.k.toFixed(2)})`}>
						<path d={TEAR} fill={WATER} stroke={INK} strokeWidth={0.8} />
						<circle cx={-1} cy={5.4} r={0.8} fill="#fff" />
					</g>
				))}
			</FadeIn>
			{[1, 4].map((i, n) => (
				<Drifter key={i} x={L.drips[i].x} y={bb + 1} dx={0} dy={34 * s} dur={2400 + n * 700} delay={1400 + n * 1300} sy={14 * s} fade="out">
					<g transform={`scale(${(L.drips[i].k * 0.9).toFixed(2)})`}>
						<path d={TEAR} fill={WATER} stroke={INK} strokeWidth={0.8} />
					</g>
				</Drifter>
			))}

			{/* Rain. */}
			{L.rain.map((rd, i) => (
				<Streak key={i} r={rd} opacity={0.85} width={1.3} />
			))}

			{/* Beads of condensation and drops running down the glass. */}
			<FadeIn delay={350} dur={700}>
				{L.beads.map((b, i) => (
					<Bead key={i} x={b.x} y={b.y} r={b.r} />
				))}
			</FadeIn>
			{L.runners.map((d, i) => (
				<g key={i} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`}>
					<path
						className={styles.runTrail}
						d={`M${-0.4 * s},-4 L${0.4 * s},-4 L${1.5 * s},${d.len} L${-1.5 * s},${d.len} Z`}
						fill={GLASS}
						opacity={0.3}
						style={vars({dur: d.dur, delay: d.delay})}
					/>
					<g className={styles.runDrop} style={vars({dur: d.dur, delay: d.delay, dy: d.len})}>
						<g transform={`scale(${s.toFixed(2)})`}>
							<path d={RUNNER} fill={WATER} fillOpacity={0.55} stroke={INK} strokeWidth={0.8} />
							<path d={arcPath(0, 1.6, 2, 25, 150)} stroke={WATER_DEEP} strokeWidth={1.1} fill="none" />
							<circle cx={-1.1} cy={0} r={0.85} fill="#fff" />
						</g>
					</g>
				</g>
			))}

			{/* Puddle along the bottom edge. */}
			<g className={styles.rise} style={vars({delay: 250})}>
				<path d={L.puddle} fill={`url(#${idPrefix}-puddle)`} opacity={0.8} />
				<path d={L.wave} fill="none" stroke={INK} strokeWidth={2.2} strokeLinejoin="round" />
				<path d={L.wave} fill="none" stroke={GLASS} strokeWidth={1} strokeLinejoin="round" />
				<g className={styles.slosh} style={vars({dur: 2600, dx: 4 * s})}>
					<path d={`M${8 * s},${L.surface(8 * s) + 5 * s} h${14 * s}`} stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />
					<path d={`M${w - 30 * s},${L.surface(w - 30 * s) + 5 * s} h${12 * s}`} stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />
				</g>
			</g>
			{L.ripples.map((rp, i) => (
				<g key={i} transform={`translate(${rp.x.toFixed(1)} ${rp.y.toFixed(1)})`}>
					<ellipse className={motion.ripple} rx={12 * s} ry={3 * s} fill="none" stroke={GLASS} strokeWidth={1.1} style={vars({dur: rp.dur, delay: rp.delay})} />
					{[-1, 1].map((dir) => (
						<circle
							key={dir}
							className={styles.splash}
							r={1.3 * s}
							fill={GLASS}
							stroke={INK}
							strokeWidth={0.5}
							style={vars({dur: rp.dur, delay: rp.delay, dx: dir * 7 * s, dy: -9 * s})}
						/>
					))}
				</g>
			))}

			{/* Storm clouds banked over the top corners, with lightning. */}
			<g transform={`translate(0 0) scale(${(s * 1.18).toFixed(3)})`}>
				<PopIn delay={60} dur={560} origin="0 0">
					<g className={motion.sway} style={vars({sway: 2.5, dur: 5200, delay: 900})}>
						<Cloud puffs={BACK_BANK} body={CLOUD_DARK} shade={CLOUD_DARK_SHADE} />
					</g>
					<g transform="translate(28 30) scale(1.35)">
						<g className={styles.flash} style={vars({dur: 6200, delay: -3700})}>
							<path d={BOLT} fill={BOLT_FILL} stroke={INK} strokeWidth={1.2} strokeLinejoin="miter" />
						</g>
					</g>
					<g className={motion.sway} style={vars({sway: 3.5, dur: 4300})}>
						<Cloud puffs={FRONT_BANK} body={CLOUD} shade={CLOUD_SHADE} light={CLOUD_LIGHT} />
						<g className={styles.cloudFlash} style={vars({dur: 6200, delay: -3700})}>
							<CloudGlow puffs={FRONT_BANK} />
						</g>
					</g>
				</PopIn>
			</g>
			<g transform={`translate(${w} 0) scale(${(-s * 1.0).toFixed(3)} ${(s * 1.0).toFixed(3)})`}>
				<PopIn delay={180} dur={560} origin="0 0">
					<g className={motion.sway} style={vars({sway: 2, dur: 6100, delay: 300})}>
						<Cloud puffs={BACK_BANK} body={CLOUD_DARK} shade={CLOUD_DARK_SHADE} />
						<g className={styles.cloudFlash} style={vars({dur: 7400, delay: -1200})}>
							<CloudGlow puffs={BACK_BANK} />
						</g>
					</g>
					<g transform="translate(78 12) scale(-1.1 1.1)">
						<g className={styles.flash} style={vars({dur: 7400, delay: -1200})}>
							<path d={BOLT} fill={BOLT_FILL} stroke={INK} strokeWidth={1.4} strokeLinejoin="miter" />
						</g>
					</g>
					<g className={motion.sway} style={vars({sway: 3, dur: 4800, delay: 1200})}>
						<Cloud puffs={FRONT_BANK} body={CLOUD} shade={CLOUD_SHADE} light={CLOUD_LIGHT} />
					</g>
				</PopIn>
			</g>

			{avatar && <AvatarFront avatar={avatar} s={s} umbrellaR={umbrellaR} idPrefix={idPrefix} />}
		</EffectSvg>
	);
};

function AvatarFront({
	avatar,
	s,
	umbrellaR,
	idPrefix,
}: {
	avatar: NonNullable<ProfileEffectGeometry['avatar']>;
	s: number;
	umbrellaR: number;
	idPrefix: string;
}) {
	const {cx, cy, r} = avatar;
	const [ux, uy] = polar(cx, cy, r + umbrellaR * 0.15, -44);
	const beads = [104, 122, 141, 160].map((deg, i) => ({p: polar(cx, cy, r + 4.5, deg), size: [2.6, 1.8, 3.1, 1.6][i] * s}));
	return (
		<g>
			<path
				className={frame.ringArc}
				d={arcPath(cx, cy, r + 4.5, 92, 176)}
				stroke={WATER}
				strokeWidth={2.2}
				fill="none"
				strokeLinecap="round"
				pathLength={1}
			/>
			<path
				className={frame.ringArc}
				style={{animationDelay: '240ms'}}
				d={arcPath(cx, cy, r + 4.5, 192, 214)}
				stroke={GLASS}
				strokeWidth={1.6}
				fill="none"
				strokeLinecap="round"
				pathLength={1}
			/>
			<FadeIn delay={700} dur={500}>
				{beads.map((b, i) => (
					<Bead key={i} x={b.p[0]} y={b.p[1]} r={b.size} />
				))}
			</FadeIn>
			<g transform={`translate(${ux.toFixed(1)} ${uy.toFixed(1)}) rotate(26)`}>
				<PopIn delay={420} dur={520} origin="50% 100%">
					<g className={styles.rock} style={vars({dur: 3400})}>
						<Umbrella R={umbrellaR} clipId={`${idPrefix}-umbrella`} />
						{[-1, 1].map((dir) => (
							<circle
								key={dir}
								className={styles.splash}
								cx={dir * umbrellaR * 0.3}
								cy={-umbrellaR * 0.62}
								r={1.3 * s}
								fill={GLASS}
								stroke={INK}
								strokeWidth={0.5}
								style={vars({dur: 1900, delay: 900 + (dir > 0 ? 700 : 0), dx: dir * 7 * s, dy: -8 * s})}
							/>
						))}
					</g>
				</PopIn>
			</g>
		</g>
	);
}
