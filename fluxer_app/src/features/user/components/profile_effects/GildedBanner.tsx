// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	between,
	Drifter,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
} from '@app/features/user/components/profile_effects/effectKit';
import {
	At,
	DrawPath,
	f1,
	fm,
	Grow,
	type Pt,
	poly,
	sparklePath,
	taper,
	tv,
} from '@app/features/user/components/profile_effects/frameKit';
import gb from '@app/features/user/components/profile_effects/GildedBanner.module.css';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Gilded Banner" — the card becomes a regal hanging banner: an ornate gold crest with swept wings and a glowing amber
 * gem hangs at the top centre, gold-leaf trim with folded edges runs down both sides, the body is a dark plum-to-bronze
 * cloth with thin gold rays fanning up to an embossed diamond emblem, and the bottom edge folds into a pennant point with
 * small hanging tabs. The crest drops in, the trim unrolls, light sweeps along the gold, the gem glints and gold motes
 * float. A thin gold ring with a little crest and scrolls decorates the avatar.
 */

const INK = '#3d1e06';
const GOLD_HI = '#fff4cf';
const GOLD_LIGHT = '#ffe08a';
const GOLD = '#e9b04a';
const GOLD_MID = '#c8892c';
const GOLD_DARK = '#7a4a12';
const AMBER = '#ff8a1c';
const AMBER_LIGHT = '#ffc061';
const AMBER_DEEP = '#a8400a';
const PLUM = '#170c1c';

type IdProps = {geometry: ProfileEffectGeometry; radius: number; idPrefix: string};

// ---------- the crest (local space: top centre at 0,0, ~170 wide × 52 tall at scale 1) ----------

/** Upper wing blade (left side; mirrored for the right), sweeping out to a point. */
const BLADE_UPPER = 'M-3,3 C-24,1 -54,-3 -86,2 C-68,6 -52,10 -38,17 C-26,22 -15,28 -6,36 Z';
/** Lower blade, shorter, curling down. */
/** Middle feather between the two blades. */
const BLADE_MID = 'M-5,9 C-24,8 -46,9 -72,15 C-56,17 -40,21 -24,29 C-16,33 -10,37 -6,42 Z';
const BLADE_MID_LIT = 'M-7,10.5 C-26,10 -46,11 -64,14.6';
const BLADE_LOWER = 'M-6,14 C-20,14 -40,18 -56,31 C-43,27 -29,29 -18,35 C-12,39 -8,44 -4,50 Z';
/** Lit edge along the top of each blade. */
const BLADE_UPPER_LIT = 'M-5,4.5 C-26,2.5 -52,-0.5 -78,2.6';
const BLADE_LOWER_LIT = 'M-8,16 C-22,16.5 -38,20.5 -50,28.5';
/** Little curl at the upper blade's root. */
const BLADE_CURL = 'M-30,12 c-4,-3 -10,-2 -10,3 c0,4 5,5 7,2';
/** The central keel under the gem. */
const KEEL = 'M0,-5 L15,8 C15,22 9,35 0,54 C-9,35 -15,22 -15,8 Z';
const KEEL_LEFT = 'M0,-5 L-15,8 C-15,22 -9,35 0,54 Z';
const KEEL_RIDGE = 'M0,26 L0,50';
/** The gem's gold setting and the gem itself. */
const SETTING = poly([
	[0, -5],
	[10.5, 13],
	[0, 31],
	[-10.5, 13],
]);
const GEM = poly([
	[0, -1.5],
	[7.5, 13],
	[0, 27.5],
	[-7.5, 13],
]);
const GEM_FACET_TL = poly([
	[0, -1.5],
	[-7.5, 13],
	[0, 10],
]);
const GEM_FACET_TR = poly([
	[0, -1.5],
	[7.5, 13],
	[0, 10],
]);
const GEM_FACET_BR = poly([
	[0, 10],
	[7.5, 13],
	[0, 27.5],
]);
const GEM_TABLE = poly([
	[0, 2],
	[-3.6, 9.5],
	[0, 8.4],
]);

/** Outline of the whole crest (for the shimmer's clip). */
function crestClipPaths(): Array<string> {
	return [BLADE_UPPER, BLADE_MID, BLADE_LOWER, KEEL];
}

const Crest: React.FC<{gid: string; glow?: boolean; glintDelay?: number}> = ({gid, glow = true, glintDelay = 1600}) => (
	<g strokeLinejoin="round">
		{glow && (
			<g className={fm.breathe} style={tv({dur: 2400, delay: 900})}>
				<circle cx={0} cy={13} r={22} fill={`url(#${gid}-gemglow)`} />
			</g>
		)}
		{[1, -1].map((side) => (
			<g key={side} transform={side === 1 ? undefined : 'scale(-1 1)'}>
				<path d={BLADE_LOWER} fill={`url(#${gid}-golddeep)`} stroke={INK} strokeWidth={1} />
				<path d={BLADE_LOWER_LIT} fill="none" stroke={GOLD_LIGHT} strokeWidth={0.9} strokeLinecap="round" opacity={0.8} />
				<path d={BLADE_MID} fill={`url(#${gid}-golddeep)`} stroke={INK} strokeWidth={1} />
				<path d={BLADE_MID_LIT} fill="none" stroke={GOLD_LIGHT} strokeWidth={0.8} strokeLinecap="round" opacity={0.7} />
				<path d={BLADE_UPPER} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={1} />
				<path d={BLADE_UPPER_LIT} fill="none" stroke={GOLD_HI} strokeWidth={1} strokeLinecap="round" opacity={0.9} />
				<path d={BLADE_CURL} fill="none" stroke={INK} strokeWidth={1.1} strokeLinecap="round" opacity={0.75} />
				<circle cx={-33} cy={17} r={1.6} fill={GOLD_HI} stroke={INK} strokeWidth={0.6} />
			</g>
		))}
		<path d={KEEL} fill={`url(#${gid}-golddeep)`} stroke={INK} strokeWidth={1} />
		<path d={KEEL_LEFT} fill={`url(#${gid}-gold)`} />
		<path d={KEEL_RIDGE} stroke={GOLD_HI} strokeWidth={0.8} opacity={0.7} />
		<path d={KEEL} fill="none" stroke={INK} strokeWidth={1} />
		<path d={SETTING} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={1} />
		<path d={GEM} fill={`url(#${gid}-gem)`} stroke={AMBER_DEEP} strokeWidth={0.8} />
		<path d={GEM_FACET_TL} fill={AMBER_LIGHT} opacity={0.85} />
		<path d={GEM_FACET_TR} fill={AMBER} opacity={0.6} />
		<path d={GEM_FACET_BR} fill={AMBER_DEEP} opacity={0.55} />
		<path d={GEM_TABLE} fill={GOLD_HI} opacity={0.9} />
		{/* The gem catches the light now and then. */}
		<path className={gb.flash} style={tv({dur: 4200, delay: glintDelay})} d={GEM} fill={GOLD_HI} />
		<g className={gb.glintWrap}>
			<At x={-3} y={6}>
				<g className={fm.glint} style={tv({dur: 4200, delay: glintDelay})}>
					<path d={sparklePath(7.5, 0.14)} fill={GOLD_HI} />
				</g>
			</At>
		</g>
	</g>
);

// ---------- layout ----------

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x9a1d);
		const trim = 6 * s;
		const hem = 16 * s;
		const motes = Array.from({length: 9}, (_, i) => {
			const lane = i % 3;
			const x =
				lane === 0 ? between(rand, 14 * s, w * 0.22) : lane === 1 ? w - between(rand, 14 * s, w * 0.22) : between(rand, w * 0.3, w * 0.7);
			return {
				x,
				y: h - between(rand, 18, 40) * s,
				r: between(rand, 0.9, 1.6) * s,
				star: i % 4 === 1,
				dur: between(rand, 6500, 9500),
				delay: 900 + i * 700,
				dx: between(rand, -16, 16),
				dy: -between(rand, h * 0.35, h * 0.6),
				sway: between(rand, 4, 9),
				sy: -between(rand, 20, h * 0.5),
			};
		});
		return {s, trim, hem, motes};
	}, [w, h]);
}

/** Left side trim (card space); the right one is mirrored. Widens and folds near the bottom. */
function trimPaths(h: number, s: number, trim: number, hem: number) {
	const foot = h - hem - 2 * s;
	const flareTop = foot - 46 * s;
	const outer = `M-1,-1 H${f1(trim)} V${f1(flareTop)} C${f1(trim)},${f1(flareTop + 22 * s)} ${f1(trim + 5 * s)},${f1(foot - 10 * s)} ${f1(trim + 6 * s)},${f1(foot)} L-1,${f1(foot + 4 * s)} Z`;
	// The darker fold where the cloth turns under the trim near the bottom.
	const fold = `M${f1(trim)},${f1(flareTop)} C${f1(trim)},${f1(flareTop + 22 * s)} ${f1(trim + 5 * s)},${f1(foot - 10 * s)} ${f1(trim + 6 * s)},${f1(foot)} L${f1(trim * 0.45)},${f1(foot - 6 * s)} C${f1(trim * 0.6)},${f1(foot - 22 * s)} ${f1(trim * 0.9)},${f1(flareTop + 18 * s)} ${f1(trim)},${f1(flareTop)} Z`;
	const inner = `M${f1(trim + 0.6)},${f1(10 * s)} V${f1(flareTop)} C${f1(trim + 0.6)},${f1(flareTop + 22 * s)} ${f1(trim + 5.6 * s)},${f1(foot - 10 * s)} ${f1(trim + 6.6 * s)},${f1(foot)}`;
	const lit = `M${f1(trim * 0.42)},${f1(6 * s)} V${f1(flareTop + 6 * s)}`;
	const bevel = `M${f1(trim + 3 * s)},${f1(14 * s)} V${f1(flareTop - 6 * s)}`;
	return {outer, fold, inner, lit, bevel, foot};
}

/** Bottom hem: a shallow pennant point folded into the card's bottom edge. */
function hemPaths(w: number, h: number, s: number, hem: number) {
	const band = 3.2 * s;
	const top = poly([
		[-2, h - hem - band],
		[w / 2, h - band - 0.5],
		[w + 2, h - hem - band],
	], false);
	const shape = `M-2,${f1(h - hem - band)} L${f1(w / 2)},${f1(h - band - 0.5)} L${f1(w + 2)},${f1(h - hem - band)} L${f1(w + 2)},${f1(h - hem)} L${f1(w / 2)},${f1(h + 2)} L-2,${f1(h - hem)} Z`;
	const below = `M-2,${f1(h - hem)} L${f1(w / 2)},${f1(h + 2)} L${f1(w + 2)},${f1(h - hem)} V${f1(h + 4)} H-2 Z`;
	return {top, shape, below, band};
}

/** The pennant hem with its hanging tabs (back layer, so buttons near the bottom stay on top). */
const Hem: React.FC<{gid: string; w: number; h: number; s: number; hem: number}> = ({gid, w, h, s, hem}) => {
	const hm = hemPaths(w, h, s, hem);
	const tabs = [0.28, 0.72].map((f) => w * f);
	return (
		<g className={gb.riseIn} style={tv({dur: 640, delay: 1000, dy: 14 * s})}>
			<path d={hm.below} fill={PLUM} opacity={0.9} />
			{tabs.map((x, i) => {
				const yTop = h - (hem * Math.abs(x - w / 2)) / (w / 2) - 1;
				const tw = 10 * s;
				return (
					<g key={i}>
						<path
							d={`M${f1(x - tw / 2)},${f1(yTop)} H${f1(x + tw / 2)} V${f1(h - 2.5 * s)} L${f1(x)},${f1(h + 0.5)} L${f1(x - tw / 2)},${f1(h - 2.5 * s)} Z`}
							fill={`url(#${gid}-golddeep)`}
							stroke={INK}
							strokeWidth={0.9}
						/>
						<path d={`M${f1(x - tw / 2 + 1.8)},${f1(yTop + 2)} V${f1(h - 3 * s)}`} stroke={GOLD_LIGHT} strokeWidth={0.7} opacity={0.7} />
					</g>
				);
			})}
			<path d={hm.shape} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={1} strokeLinejoin="round" />
			<path d={hm.top} fill="none" stroke={GOLD_HI} strokeWidth={0.8} opacity={0.8} />
		</g>
	);
};

const GoldDefs: React.FC<{gid: string}> = ({gid}) => (
	<>
		<linearGradient id={`${gid}-gold`} x1="0" y1="0" x2="0.35" y2="1">
			<stop offset="0" stopColor={GOLD_HI} />
			<stop offset="0.3" stopColor={GOLD} />
			<stop offset="0.65" stopColor={GOLD_MID} />
			<stop offset="1" stopColor={GOLD_DARK} />
		</linearGradient>
		<linearGradient id={`${gid}-golddeep`} x1="0" y1="0" x2="0.2" y2="1">
			<stop offset="0" stopColor={GOLD} />
			<stop offset="0.5" stopColor="#a96b22" />
			<stop offset="1" stopColor="#5a330d" />
		</linearGradient>
		<radialGradient id={`${gid}-gem`} cx="0.4" cy="0.35" r="0.7">
			<stop offset="0" stopColor="#fff1c9" />
			<stop offset="0.3" stopColor={AMBER_LIGHT} />
			<stop offset="0.7" stopColor={AMBER} />
			<stop offset="1" stopColor={AMBER_DEEP} />
		</radialGradient>
	</>
);

// ---------- front layer ----------

function Front({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, trim, hem, motes} = useLayout(geometry);
	const gid = idPrefix;
	const bar = 5 * s;
	const t = trimPaths(h, s, trim, hem);
	const crestScale = s * 1.05;

	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={<Defs gid={gid} w={w} bar={bar} crestScale={crestScale} trimOuter={t.outer} />}
		>
			{/* Side trims unroll from the top. */}
			{[0, 1].map((side) => (
				<g key={side} transform={side ? `translate(${w} 0) scale(-1 1)` : undefined}>
					<g className={gb.trimDown} style={tv({dur: 900, delay: 380 + side * 60})}>
						<path d={t.outer} fill={`url(#${gid}-trim)`} stroke={INK} strokeWidth={1} />
						<path d={t.fold} fill={GOLD_DARK} opacity={0.85} />
						<path d={t.lit} stroke={GOLD_HI} strokeWidth={0.9} opacity={0.75} />
						<path d={t.inner} fill="none" stroke={GOLD} strokeWidth={0.9} opacity={0.75} />
						<path d={t.bevel} stroke={GOLD_LIGHT} strokeWidth={0.6} opacity={0.35} />
					</g>
				</g>
			))}

			{/* Diamond stud at the pennant's point (the hem itself sits behind the content, see Back). */}
			<g className={gb.riseIn} style={tv({dur: 640, delay: 1050, dy: 14 * s})}>
				<At x={w / 2} y={h - 5.5 * s} s={s}>
					<path d={poly([[0, -6], [7, 0], [0, 6], [-7, 0]])} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={0.9} />
					<path d={poly([[0, -3], [3.4, 0], [0, 3], [-3.4, 0]])} fill={`url(#${gid}-gem)`} stroke={AMBER_DEEP} strokeWidth={0.5} />
				</At>
			</g>

			{/* Top bar with knobs at the corners, and the crest dropping in at the centre. */}
			<g className={gb.dropIn} style={tv({dur: 760, delay: 80, dy: -40 * s})}>
				<rect x={-2} y={-2} width={w + 4} height={bar + 2} fill={`url(#${gid}-bar)`} />
				<path d={`M0,${f1(bar)} H${w}`} stroke={INK} strokeWidth={1} />
				<path d={`M0,${f1(bar * 0.35)} H${w}`} stroke={GOLD_HI} strokeWidth={0.7} opacity={0.6} />
				{[0, 1].map((side) => (
					<g key={side} transform={side ? `translate(${w} 0) scale(-1 1)` : undefined}>
						<circle cx={trim + 3 * s} cy={bar + 2.5 * s} r={4.2 * s} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={1} />
						<circle cx={trim + 2 * s} cy={bar + 1.5 * s} r={1.4 * s} fill={GOLD_HI} opacity={0.8} />
					</g>
				))}
				<At x={w / 2} y={1} s={crestScale}>
					<Crest gid={gid} />
				</At>
			</g>

			{/* Light sweeping along the gold. */}
			<g clipPath={`url(#${gid}-goldclip)`}>
				<g className={gb.shine} style={tv({dur: 7600, delay: 2200, dx: w + 120 * s, dy: 0})}>
					<rect x={-70 * s} y={-10} width={46 * s} height={70 * s} fill={`url(#${gid}-shinex)`} transform={`skewX(-24)`} />
				</g>
				<g className={gb.shine} style={tv({dur: 7600, delay: 5000, dx: 0, dy: h + 90 * s})}>
					<rect x={-2} y={-80 * s} width={w + 4} height={60 * s} fill={`url(#${gid}-shiney)`} />
				</g>
			</g>

			{/* Gold motes drifting up. */}
			{motes.map((m, i) => (
				<Drifter key={i} x={m.x} y={m.y} dx={m.dx} dy={m.dy} dur={m.dur} delay={m.delay} sway={m.sway} swayDur={2600} sy={m.sy} rot={m.star ? 90 : 0}>
					{m.star ? (
						<path d={sparklePath(m.r * 3.2, 0.2)} fill={GOLD_LIGHT} />
					) : (
						<>
							<circle r={m.r * 2.6} fill={GOLD} opacity={0.22} />
							<circle r={m.r} fill={GOLD_HI} />
						</>
					)}
				</Drifter>
			))}

			{avatar && <AvatarFront avatar={avatar} gid={gid} />}
		</EffectSvg>
	);
}

const Defs: React.FC<{
	gid: string;
	w: number;
	bar: number;
	crestScale: number;
	trimOuter: string;
}> = ({gid, w, bar, crestScale, trimOuter}) => (
	<>
		<GoldDefs gid={gid} />
		<linearGradient id={`${gid}-trim`} x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#5a330d" />
			<stop offset="0.22" stopColor={GOLD_MID} />
			<stop offset="0.45" stopColor={GOLD_LIGHT} />
			<stop offset="0.7" stopColor={GOLD} />
			<stop offset="1" stopColor="#8a5416" />
		</linearGradient>
		<linearGradient id={`${gid}-bar`} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#8a5416" />
			<stop offset="0.35" stopColor={GOLD_LIGHT} />
			<stop offset="0.7" stopColor={GOLD} />
			<stop offset="1" stopColor={GOLD_DARK} />
		</linearGradient>
		<radialGradient id={`${gid}-gemglow`}>
			<stop offset="0" stopColor={AMBER_LIGHT} stopOpacity={0.55} />
			<stop offset="0.5" stopColor={AMBER} stopOpacity={0.18} />
			<stop offset="1" stopColor={AMBER} stopOpacity={0} />
		</radialGradient>
		<linearGradient id={`${gid}-shinex`} x1="0" y1="0" x2="1" y2="0">
			<stop offset="0" stopColor="#fff" stopOpacity={0} />
			<stop offset="0.5" stopColor="#fff" stopOpacity={0.75} />
			<stop offset="1" stopColor="#fff" stopOpacity={0} />
		</linearGradient>
		<linearGradient id={`${gid}-shiney`} x1="0" y1="0" x2="0" y2="1">
			<stop offset="0" stopColor="#fff" stopOpacity={0} />
			<stop offset="0.5" stopColor="#fff" stopOpacity={0.7} />
			<stop offset="1" stopColor="#fff" stopOpacity={0} />
		</linearGradient>
		<clipPath id={`${gid}-goldclip`}>
			<rect x={-2} y={-2} width={w + 4} height={bar + 2} />
			{crestClipPaths().flatMap((d) => [
				<path key={`l${d}`} d={d} transform={`translate(${f1(w / 2)} 1) scale(${crestScale.toFixed(3)})`} />,
				<path key={`r${d}`} d={d} transform={`translate(${f1(w / 2)} 1) scale(${(-crestScale).toFixed(3)} ${crestScale.toFixed(3)})`} />,
			])}
			<path d={trimOuter} />
			<path d={trimOuter} transform={`translate(${w} 0) scale(-1 1)`} />
		</clipPath>
	</>
);

function AvatarFront({avatar, gid}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; gid: string}) {
	const {cx, cy, r} = avatar;
	const k = r / 43;
	const R = r + 3;
	const ring = `M${f1(cx)},${f1(cy - R)} A${R},${R} 0 1 1 ${f1(cx)},${f1(cy + R)} A${R},${R} 0 1 1 ${f1(cx)},${f1(cy - R)}`;
	const lit = (() => {
		const [x1, y1] = polar(cx, cy, R, 190);
		const [x2, y2] = polar(cx, cy, R, 250);
		return `M${f1(x1)},${f1(y1)} A${R},${R} 0 0 1 ${f1(x2)},${f1(y2)}`;
	})();
	// Small scrolls hugging the ring on both upper sides, curling outwards.
	const scroll = (from: number, dir: 1 | -1) => {
		const pts: Array<Pt> = [];
		for (let i = 0; i <= 4; i++) {
			const a = from + dir * i * 9;
			pts.push(polar(cx, cy, R + 3.5 * k + i * 1.3 * k, a));
		}
		return {...taper(pts, 5 * k, 0.8, 5), end: pts[pts.length - 1]};
	};
	const scrolls = [scroll(222, -1), scroll(318, 1)];
	const studs = [160, 20].map((a) => polar(cx, cy, R, a));
	const crestK = 0.34 * k;
	return (
		<g>
			<DrawPath d={ring} stroke={INK} strokeWidth={4} fill="none" delay={700} dur={900} />
			<DrawPath d={ring} stroke={`url(#${gid}-gold)`} strokeWidth={2.4} fill="none" delay={700} dur={900} />
			<DrawPath d={lit} stroke={GOLD_HI} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.85} delay={1300} dur={400} />
			{scrolls.map((sc, i) => (
				<Grow key={i} delay={1250 + i * 100} dur={480} origin={i ? '0% 100%' : '100% 100%'}>
					<path d={sc.outline} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
					<path d={sc.lit} fill="none" stroke={GOLD_HI} strokeWidth={0.6} opacity={0.8} />
					<circle cx={sc.end[0]} cy={sc.end[1]} r={1.8 * k} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={0.7} />
				</Grow>
			))}
			{studs.map(([x, y], i) => (
				<At key={i} x={x} y={y} s={k}>
					<PopIn delay={1450 + i * 80} dur={360}>
						<path d={poly([[0, -3.6], [3, 0], [0, 3.6], [-3, 0]])} fill={`url(#${gid}-gold)`} stroke={INK} strokeWidth={0.8} />
					</PopIn>
				</At>
			))}
			{/* A little crest on top of the ring. */}
			<At x={cx} y={cy - R - 45 * crestK} s={crestK}>
				<PopIn delay={1150} dur={460}>
					<Crest gid={gid} glow={false} glintDelay={3400} />
				</PopIn>
			</At>
		</g>
	);
}

// ---------- back layer ----------

function Back({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, hem} = useLayout(geometry);
	const gid = `${idPrefix}b`;
	const focusX = w / 2;
	const focusY = h - hem - 26 * s;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="back"
			defs={
				<>
					<GoldDefs gid={gid} />
					<linearGradient id={`${gid}-cloth`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#2a1733" stopOpacity={0.55} />
						<stop offset="0.45" stopColor="#3a1f35" stopOpacity={0.5} />
						<stop offset="0.78" stopColor="#5e3324" stopOpacity={0.55} />
						<stop offset="1" stopColor="#8a4f2a" stopOpacity={0.7} />
					</linearGradient>
					<linearGradient id={`${gid}-ray`} x1="0" y1="1" x2="0" y2="0">
						<stop offset="0" stopColor={GOLD_LIGHT} stopOpacity={0.55} />
						<stop offset="1" stopColor={GOLD} stopOpacity={0.05} />
					</linearGradient>
					<radialGradient id={`${gid}-halo`}>
						<stop offset="0.6" stopColor={AMBER_LIGHT} stopOpacity={0} />
						<stop offset="0.8" stopColor={AMBER_LIGHT} stopOpacity={0.28} />
						<stop offset="1" stopColor={AMBER} stopOpacity={0} />
					</radialGradient>
					<radialGradient id={`${gid}-emblemglow`}>
						<stop offset="0" stopColor={AMBER_LIGHT} stopOpacity={0.22} />
						<stop offset="1" stopColor={AMBER} stopOpacity={0} />
					</radialGradient>
				</>
			}
		>
			<FadeIn dur={900}>
				<rect x={0} y={0} width={w} height={h} fill={`url(#${gid}-cloth)`} />
				<ellipse cx={focusX} cy={focusY} rx={90 * s} ry={60 * s} fill={`url(#${gid}-emblemglow)`} />
			</FadeIn>
			{/* Embossed diamond emblem. */}
			<At x={focusX} y={focusY} s={s}>
				<FadeIn delay={1000} dur={900}>
					<Emblem />
				</FadeIn>
			</At>
			<Hem gid={gid} w={w} h={h} s={s} hem={hem} />
			{avatar && (
				<FadeIn delay={600} dur={800}>
					<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 14} fill={`url(#${gid}-halo)`} />
				</FadeIn>
			)}
		</EffectSvg>
	);
}

/** Tone-on-tone embossed emblem: a diamond inside a chevron with swept leaves (local space, centred on 0,0). */
function Emblem() {
	const LIGHT = '#f2b56b';
	const SHADE = '#2a120a';
	const FACE = '#b06c3a';
	const leaf = 'M-10,10 C-22,4 -34,-2 -46,-14 C-40,0 -30,10 -16,18 Z';
	const leafLow = 'M-12,18 C-24,18 -36,16 -44,8 C-38,20 -28,26 -14,26 Z';
	const outer = poly([
		[0, -30],
		[18, 0],
		[0, 30],
		[-18, 0],
	]);
	const inner = poly([
		[0, -18],
		[10, 0],
		[0, 18],
		[-10, 0],
	]);
	const core = poly([
		[0, -7],
		[4.5, 2],
		[0, 9],
		[-4.5, 2],
	]);
	const chevron = 'M-14,10 L0,26 L14,10';
	return (
		<g strokeLinejoin="round">
			{[1, -1].map((side) => (
				<g key={side} transform={side === 1 ? undefined : 'scale(-1 1)'}>
					<path d={leaf} fill={FACE} opacity={0.22} stroke={SHADE} strokeOpacity={0.5} strokeWidth={1} />
					<path d={leafLow} fill={FACE} opacity={0.16} stroke={SHADE} strokeOpacity={0.4} strokeWidth={1} />
					<path d="M-12,10 C-24,4 -34,-2 -44,-12" fill="none" stroke={LIGHT} strokeWidth={0.8} opacity={0.35} />
				</g>
			))}
			<path d={outer} fill={FACE} opacity={0.3} />
			<path d={outer} fill="none" stroke={SHADE} strokeWidth={1.4} opacity={0.55} transform="translate(0.8 1)" />
			<path d={outer} fill="none" stroke={LIGHT} strokeWidth={1} opacity={0.5} />
			<path d={inner} fill="none" stroke={LIGHT} strokeWidth={0.9} opacity={0.4} />
			<path d={inner} fill="none" stroke={SHADE} strokeWidth={0.9} opacity={0.4} transform="translate(0.7 0.9)" />
			<path d={chevron} fill="none" stroke={LIGHT} strokeWidth={1} opacity={0.4} />
			<path d={core} fill={LIGHT} opacity={0.45} />
		</g>
	);
}

export const GildedBanner: ProfileEffectLayer = ({layer, ...props}) =>
	layer === 'front' ? <Front {...props} /> : <Back {...props} />;
