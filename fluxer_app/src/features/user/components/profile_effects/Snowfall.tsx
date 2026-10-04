// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	Burst,
	between,
	countFor,
	Drifter,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	bannerBottomOf,
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
	Loop,
	type Pt,
	poly,
	Rim,
	roundRectPath,
	sparklePath,
	smoothOpen,
	TextureDefs,
	TexturePatch,
	tv,
} from '@app/features/user/components/profile_effects/frameKit';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Snowfall" — a frosted ice frame: a snow-capped top edge hung with icicles, crystal clusters in the corners, frost
 * ferns creeping up the sides, icicles along the banner's edge, a snow drift piled along the bottom and on top of the
 * avatar ring, frost glints, and detailed snowflakes falling in three parallax layers.
 */

const INK = '#123257';
const SNOW = '#ffffff';
const FROST = '#e6f6ff';
const ICE = '#a8dcff';
const BLUE = '#5bb2ee';
const DEEP = '#2f7fc8';
const SHADOW = '#b9d6f0';

type IdProps = {geometry: ProfileEffectGeometry; radius: number; idPrefix: string};

/** A six-armed snowflake (stroke paths) of radius r, centred on (0,0). */
function flakePath(r: number, detail: 1 | 2 = 2): string {
	let d = '';
	for (let i = 0; i < 6; i++) {
		const a = i * 60 - 90;
		const [x, y] = polar(0, 0, r, a);
		d += `M0,0 L${f1(x)},${f1(y)} `;
		const branches = detail === 2 ? [0.42, 0.7] : [0.55];
		for (const t of branches) {
			const [bx, by] = polar(0, 0, r * t, a);
			const len = r * (t < 0.5 ? 0.34 : 0.24);
			const [l1x, l1y] = polar(bx, by, len, a - 50);
			const [l2x, l2y] = polar(bx, by, len, a + 50);
			d += `M${f1(l1x)},${f1(l1y)} L${f1(bx)},${f1(by)} L${f1(l2x)},${f1(l2y)} `;
		}
	}
	return d.trim();
}

function hexPath(r: number): string {
	return poly([0, 1, 2, 3, 4, 5].map((i) => polar(0, 0, r, i * 60 - 90)));
}

const Snowflake: React.FC<{r: number; detail?: 1 | 2; ink?: boolean; color?: string}> = ({r, detail = 2, ink = true, color = SNOW}) => {
	const d = flakePath(r, detail);
	return (
		<g strokeLinecap="round" strokeLinejoin="round" fill="none">
			{ink && <path d={d} stroke={INK} strokeWidth={Math.max(1.6, r * 0.2)} opacity={0.85} />}
			<path d={d} stroke={color} strokeWidth={Math.max(0.8, r * 0.1)} />
			<path d={hexPath(r * 0.2)} fill={FROST} stroke={ink ? INK : 'none'} strokeWidth={0.6} />
		</g>
	);
};

/** One icicle hanging from (0,0): width wd, length len. */
const Icicle: React.FC<{wd: number; len: number; gid: string}> = ({wd, len, gid}) => {
	const d = `M${f1(-wd / 2)},0 C${f1(-wd * 0.42)},${f1(len * 0.45)} ${f1(-wd * 0.12)},${f1(len * 0.8)} 0,${f1(len)} C${f1(wd * 0.1)},${f1(len * 0.78)} ${f1(wd * 0.4)},${f1(len * 0.42)} ${f1(wd / 2)},0 Z`;
	return (
		<g>
			<path d={d} fill={`url(#${gid}-icicle)`} stroke={INK} strokeWidth={0.8} strokeLinejoin="round" />
			<path
				d={`M${f1(-wd * 0.22)},1.5 C${f1(-wd * 0.18)},${f1(len * 0.3)} ${f1(-wd * 0.08)},${f1(len * 0.55)} ${f1(-wd * 0.03)},${f1(len * 0.68)}`}
				stroke={SNOW}
				strokeWidth={Math.max(0.7, wd * 0.14)}
				fill="none"
				strokeLinecap="round"
			/>
		</g>
	);
};

/** An ice crystal shard from (0,0) pointing at `angle`. */
const Shard: React.FC<{len: number; wd: number; angle: number; gid: string; tone?: 0 | 1}> = ({len, wd, angle, gid, tone = 0}) => {
	const pts: Array<Pt> = [
		[0, -wd / 2],
		[len * 0.72, -wd / 2],
		[len, 0],
		[len * 0.72, wd / 2],
		[0, wd / 2],
	];
	return (
		<g transform={`rotate(${f1(angle)})`}>
			<path d={poly(pts)} fill={`url(#${gid}-shard${tone})`} stroke={INK} strokeWidth={0.9} strokeLinejoin="miter" />
			<path d={`M0,0 L${f1(len * 0.72)},0 L${f1(len)},0`} stroke={SNOW} strokeWidth={0.8} opacity={0.9} />
			<path d={`M${f1(len * 0.72)},${f1(-wd / 2)} L${f1(len * 0.72)},${f1(wd / 2)}`} stroke={SNOW} strokeWidth={0.6} opacity={0.7} />
		</g>
	);
};

const Glint: React.FC<{x: number; y: number; r: number; delay: number; dur?: number}> = ({x, y, r, delay, dur = 3400}) => (
	<At x={x} y={y}>
		<Loop kind="glint" t={{dur, delay}}>
			<path d={sparklePath(r, 0.16)} fill={SNOW} stroke={INK} strokeWidth={0.5} />
		</Loop>
	</At>
);

function Defs({gid}: {gid: string}) {
	return (
		<>
			<linearGradient id={`${gid}-icicle`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={SNOW} />
				<stop offset="0.45" stopColor={FROST} />
				<stop offset="1" stopColor={BLUE} />
			</linearGradient>
			<linearGradient id={`${gid}-shard0`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor={BLUE} />
				<stop offset="0.6" stopColor={ICE} />
				<stop offset="1" stopColor={FROST} />
			</linearGradient>
			<linearGradient id={`${gid}-shard1`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor={DEEP} />
				<stop offset="0.7" stopColor={BLUE} />
				<stop offset="1" stopColor={ICE} />
			</linearGradient>
			<linearGradient id={`${gid}-snow`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={SNOW} />
				<stop offset="0.7" stopColor={FROST} />
				<stop offset="1" stopColor={SHADOW} />
			</linearGradient>
		</>
	);
}

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h, avatar} = geometry;
	const bb = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x51a0);
		// Icicles along the top edge: long in the corners, short in the middle.
		const topIcicles: Array<{x: number; wd: number; len: number}> = [];
		for (let x = 10 * s; x < w - 6 * s; x += between(rand, 7, 11) * s) {
			const edge = 1 - Math.min(1, Math.min(x, w - x) / (w * 0.3));
			topIcicles.push({x, wd: between(rand, 4.5, 7) * s, len: (between(rand, 4, 9) + edge * between(rand, 8, 22)) * s});
		}
		// Small icicles hanging from the banner's bottom edge (right of the avatar).
		const startX = avatar ? avatar.cx + avatar.r + 14 : 16;
		const bannerIcicles: Array<{x: number; wd: number; len: number}> = [];
		for (let x = startX; x < w - 14 * s; x += between(rand, 9, 16) * s) {
			bannerIcicles.push({x, wd: between(rand, 3.2, 5) * s, len: between(rand, 4, 11) * s});
		}
		const nearCount = countFor(w, h, 7);
		const fallNear = Array.from({length: nearCount}, (_, i) => {
			const side = i % 2;
			return {
				x: side ? w - between(rand, 8, Math.min(w * 0.2, 44 * s)) : between(rand, 8, Math.min(w * 0.2, 44 * s)),
				r: between(rand, 4.5, 6.5) * s,
				dur: between(rand, 7000, 10000),
				delay: 700 + i * (7700 / nearCount),
				dx: between(rand, -14, 14),
				sway: between(rand, 6, 12),
				rot: between(rand, 90, 200) * (rand() < 0.5 ? -1 : 1),
				sy: between(rand, bb + 20, h * 0.8),
			};
		});
		const fallBig = Array.from({length: 3}, (_, i) => ({
			x: [w * 0.9, w * 0.08, w * 0.62][i],
			r: between(rand, 8.5, 10.5) * s,
			dur: between(rand, 5200, 6800),
			delay: 1800 + i * 2300,
			dx: between(rand, -20, 10),
			sway: between(rand, 10, 16),
			rot: between(rand, 120, 220),
			sy: [h * 0.55, h * 0.68, h * 0.2][i],
		}));
		const farCount = countFor(w, h, 9);
		const fallFar = Array.from({length: farCount}, (_, i) => ({
			x: between(rand, 0, w),
			r: between(rand, 1.2, 2.2) * s,
			dur: between(rand, 9000, 14000),
			delay: i * (10800 / farCount),
			dx: between(rand, -12, 12),
			sway: between(rand, 4, 8),
			sy: between(rand, h * 0.25, h * 0.9),
		}));
		const burst = Array.from({length: 9}, () => ({
			dx: between(rand, -140, -20) * s,
			dy: between(rand, 30, 160) * s,
			rot: between(rand, -200, 200),
			delay: between(rand, 300, 700),
			dur: between(rand, 1300, 1900),
			r: between(rand, 3, 5) * s,
		}));
		return {s, bb, topIcicles, bannerIcicles, fallNear, fallBig, fallFar, burst};
	}, [w, h, bb, avatar]);
}

/** The snow drift along the bottom: deeper in the corners, shallow in the middle. */
function driftPath(w: number, h: number, s: number): {fill: string; ridge: string} {
	const pts: Array<Pt> = [
		[-4, h - 26 * s],
		[16 * s, h - 24 * s],
		[36 * s, h - 15 * s],
		[60 * s, h - 9 * s],
		[w * 0.32, h - 6 * s],
		[w * 0.5, h - 8 * s],
		[w * 0.66, h - 5 * s],
		[w - 70 * s, h - 9 * s],
		[w - 44 * s, h - 17 * s],
		[w - 20 * s, h - 28 * s],
		[w + 4, h - 30 * s],
	];
	const ridge = smoothOpen(pts);
	return {fill: `${ridge} L${w + 4},${h + 4} L-4,${h + 4} Z`, ridge};
}

function Front({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, bb, topIcicles, bannerIcicles, fallNear, fallBig, burst} = useLayout(geometry);
	const gid = idPrefix;
	const drift = driftPath(w, h, s);
	// Snow cap along the top edge.
	const capPts: Array<Pt> = [];
	for (let i = 0; i <= 16; i++) {
		const x = (w / 16) * i;
		const edge = 1 - Math.min(1, Math.min(x, w - x) / (w * 0.3));
		capPts.push([x, (3 + edge * 5 + (i % 2 ? 1.6 : 0)) * s]);
	}
	const capRidge = smoothOpen(capPts);
	const cap = `${capRidge} L${w},-2 L0,-2 Z`;
	// Snow along the banner's bottom edge.
	const startX = avatar ? avatar.cx + avatar.r + 10 : 10;
	const ledge = `M${f1(startX)},${f1(bb + 1)} C${f1(startX + 20)},${f1(bb - 4 * s)} ${f1(w - 40)},${f1(bb - 3 * s)} ${f1(w - 6)},${f1(bb - 1)}`;

	const tr: Array<[number, number, number, 0 | 1]> = [
		[96, 76, 10, 0],
		[108, 52, 8, 1],
		[122, 88, 12, 0],
		[140, 46, 8, 1],
		[154, 70, 10, 0],
		[168, 40, 7, 1],
		[178, 30, 6, 0],
		[132, 34, 6, 1],
	];
	const tl: Array<[number, number, number, 0 | 1]> = [
		[8, 44, 8, 0],
		[26, 58, 9, 1],
		[44, 38, 7, 0],
		[62, 26, 6, 1],
		[80, 20, 5, 0],
	];
	const bottomShards = (x: number, y: number, flip: boolean) =>
		(
			[
				[-60, 26, 6, 0],
				[-82, 34, 7, 1],
				[-104, 22, 5.5, 0],
				[-40, 16, 5, 1],
			] as const
		).map(([a, len, wd, tone], i) => (
			<At key={i} x={x} y={y}>
				<Grow origin="0% 50%" delay={420 + i * 60} dur={420}>
					<Shard len={len * s} wd={wd * s} angle={flip ? -180 - a : a} gid={gid} tone={tone} />
				</Grow>
			</At>
		));

	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={
				<>
					<Defs gid={gid} />
					<TextureDefs id={`${gid}-f`} color={FROST} />
				</>
			}
		>
			<FadeIn dur={700}>
				<TexturePatch id={`${gid}-f`} x={w - 150 * s} y={-50 * s} w={190 * s} h={150 * s} opacity={0.4} />
				<TexturePatch id={`${gid}-f`} x={-50 * s} y={-40 * s} w={140 * s} h={110 * s} opacity={0.3} fine />
			</FadeIn>

			{/* Ice frame: bright outer line, frosted inner line, crystalline joints. */}
			<DrawPath d={roundRectPath(1.5, 1.5, w - 3, h - 3, Math.max(0, radius - 1.5))} stroke={ICE} strokeWidth={2} fill="none" dur={700} />
			<g fill="none" stroke={FROST} strokeWidth={1} opacity={0.75}>
				<DrawPath d={`M5.5,${f1(bb + 50 * s)} V${f1(h * 0.55)}`} delay={150} />
				<DrawPath d={`M5.5,${f1(h * 0.62)} V${f1(h - 40 * s)}`} delay={190} />
				<DrawPath d={`M${f1(w - 5.5)},${f1(bb + 30 * s)} V${f1(h - 48 * s)}`} delay={230} />
			</g>
			{(
				[
					[5.5, h * 0.585],
					[5.5, bb + 44 * s],
					[w - 5.5, bb + 24 * s],
					[w - 5.5, h * 0.6],
				] as const
			).map(([x, y], i) => (
				<At key={i} x={x} y={y}>
					<PopIn delay={600 + i * 70}>
						<path d={poly([[0, -6 * s], [3 * s, 0], [0, 6 * s], [-3 * s, 0]])} fill={ICE} stroke={INK} strokeWidth={0.7} />
						<path d={`M0,${f1(-4 * s)} L0,${f1(4 * s)}`} stroke={SNOW} strokeWidth={0.7} />
					</PopIn>
				</At>
			))}

			{/* Frost ferns creeping up the sides. */}
			<g fill="none" stroke={FROST} strokeWidth={0.8} strokeLinecap="round" opacity={0.6}>
				<DrawPath d={fern(6, h - 30 * s, 6, h * 0.6, 1, s)} delay={300} dur={900} />
				<DrawPath d={fern(w - 6, h - 34 * s, w - 6, h * 0.66, -1, s)} delay={340} dur={900} />
				<DrawPath d={fern(w - 6, bb + 4, w - 6, bb + 52 * s, -1, s)} delay={380} dur={700} />
			</g>

			{/* Snow cap and icicles along the top edge. */}
			{topIcicles.map((ic, i) => (
				<At key={i} x={ic.x} y={capY(ic.x, w, s) - 1}>
					<Grow origin="50% 0%" delay={200 + Math.abs(ic.x - w / 2) * -0.8 + w * 0.4 + (i % 3) * 30} dur={460}>
						<Icicle wd={ic.wd} len={ic.len} gid={gid} />
					</Grow>
				</At>
			))}
			<FadeIn dur={400}>
				<path d={cap} fill={`url(#${gid}-snow)`} stroke={INK} strokeWidth={0.9} />
				<path d={capRidge} transform={`translate(0 ${f1(-1.6 * s)})`} stroke={SNOW} strokeWidth={1.2} fill="none" opacity={0.9} />
			</FadeIn>

			{/* Corner ice crystals. */}
			{tr.map(([deg, len, wd, tone], i) => (
				<At key={i} x={w + 2} y={-2}>
					<Grow origin="0% 50%" delay={80 + i * 50} dur={460}>
						<Shard len={len * s} wd={wd * s} angle={deg} gid={gid} tone={tone} />
					</Grow>
				</At>
			))}
			{tl.map(([deg, len, wd, tone], i) => (
				<At key={i} x={-2} y={-2}>
					<Grow origin="0% 50%" delay={120 + i * 50} dur={460}>
						<Shard len={len * s} wd={wd * s} angle={deg} gid={gid} tone={tone} />
					</Grow>
				</At>
			))}
			{/* A big snowflake set into the top-right crystals, slowly turning. */}
			<At x={w - 40 * s} y={40 * s}>
				<PopIn delay={420} dur={520}>
					<g className={fm.slowSpin} style={tv({dur: 26000})}>
						<Snowflake r={17 * s} />
					</g>
				</PopIn>
			</At>

			{/* Snow and icicles along the banner's bottom edge. */}
			{bannerIcicles.map((ic, i) => (
				<At key={i} x={ic.x} y={bb + 0.5}>
					<Grow origin="50% 0%" delay={520 + i * 40} dur={380}>
						<Icicle wd={ic.wd} len={ic.len} gid={gid} />
					</Grow>
				</At>
			))}
			<DrawPath d={ledge} stroke={INK} strokeWidth={4.2 * s} fill="none" strokeLinecap="round" delay={460} dur={500} />
			<DrawPath d={ledge} stroke={SNOW} strokeWidth={2.8 * s} fill="none" strokeLinecap="round" delay={460} dur={500} />
			<path className={fm.runDash} style={tv({dur: 4200, delay: 1500})} d={ledge} stroke={ICE} strokeWidth={1.4} fill="none" strokeLinecap="round" pathLength={1} />

			{/* Snow drift piled along the bottom, crystals poking out of the corners. */}
			{bottomShards(4, h - 14 * s, false)}
			{bottomShards(w - 4, h - 16 * s, true)}
			<Grow origin="50% 100%" delay={260} dur={600}>
				<path d={drift.fill} fill={`url(#${gid}-snow)`} stroke={INK} strokeWidth={1} />
				<path d={drift.ridge} transform={`translate(0 ${f1(2 * s)})`} stroke={SNOW} strokeWidth={1.4} fill="none" />
				<path
					d={`M${f1(18 * s)},${f1(h - 12 * s)} q8,-3 16,1 M${f1(w - 56 * s)},${f1(h - 10 * s)} q10,-4 20,0 M${f1(w * 0.45)},${f1(h - 3 * s)} q6,-2 12,0`}
					stroke={SHADOW}
					strokeWidth={1}
					fill="none"
					strokeLinecap="round"
				/>
			</Grow>

			{/* Intro: a puff of flakes shaken off the corner. */}
			{burst.map((p, i) => (
				<Burst key={i} x={w - 40 * s} y={40 * s} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay} rot={p.rot}>
					<Snowflake r={p.r} detail={1} ink={false} />
				</Burst>
			))}

			{/* Falling snow: near flakes and a few big close ones. */}
			{fallNear.map((p, i) => (
				<Drifter key={i} x={p.x} y={-12} dx={p.dx} dy={h + 24} dur={p.dur} delay={p.delay} rot={p.rot} sway={p.sway} sy={p.sy} sr={30}>
					<Snowflake r={p.r} detail={1} />
				</Drifter>
			))}
			{fallBig.map((p, i) => (
				<Drifter key={i} x={p.x} y={-20} dx={p.dx} dy={h + 40} dur={p.dur} delay={p.delay} rot={p.rot} sway={p.sway} sy={p.sy} sr={15}>
					<Snowflake r={p.r} />
				</Drifter>
			))}

			{/* Frost glints. */}
			<Glint x={w - 70 * s} y={16 * s} r={5 * s} delay={900} />
			<Glint x={w - 14 * s} y={88 * s} r={4 * s} delay={2100} dur={3900} />
			<Glint x={36 * s} y={14 * s} r={4.5 * s} delay={1500} dur={4200} />
			<Glint x={w * 0.5} y={h - 9 * s} r={4 * s} delay={2600} dur={3700} />
			<Glint x={20 * s} y={h - 26 * s} r={4.5 * s} delay={1200} dur={4400} />
			<Glint x={w - 28 * s} y={h - 34 * s} r={4 * s} delay={3000} dur={3600} />

			{avatar && <AvatarFront avatar={avatar} gid={gid} s={s} />}
		</EffectSvg>
	);
}

function capY(x: number, w: number, s: number): number {
	const edge = 1 - Math.min(1, Math.min(x, w - x) / (w * 0.3));
	return (3 + edge * 5) * s;
}

/** A frost fern: a wavering stem with alternating little branches, from (x1,y1) to (x2,y2); dir = side (+1 right). */
function fern(x1: number, y1: number, x2: number, y2: number, dir: number, s: number): string {
	const steps = Math.max(4, Math.round(Math.abs(y2 - y1) / (12 * s)));
	let d = `M${f1(x1)},${f1(y1)}`;
	const stem: Array<Pt> = [];
	for (let i = 0; i <= steps; i++) {
		const t = i / steps;
		stem.push([x1 + (x2 - x1) * t + dir * Math.sin(t * Math.PI * 3) * 2.5 * s, y1 + (y2 - y1) * t]);
	}
	d = smoothOpen(stem);
	for (let i = 1; i < steps; i++) {
		const [x, y] = stem[i];
		const len = (9 - Math.abs(i - steps / 2) * 0.8) * s;
		const up = y2 < y1 ? -1 : 1;
		d += ` M${f1(x)},${f1(y)} l${f1(dir * len * 0.8)},${f1(up * len * 0.6)}`;
		d += ` M${f1(x + dir * len * 0.4)},${f1(y + up * len * 0.3)} l${f1(dir * len * 0.35)},${f1(-up * len * 0.1)}`;
	}
	return d;
}

function AvatarFront({avatar, gid, s}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; gid: string; s: number}) {
	const {cx, cy, r} = avatar;
	const k = r / 43;
	// Snow resting on top of the avatar ring.
	const outer: Array<Pt> = [];
	const inner: Array<Pt> = [];
	const from = 200;
	const to = 318;
	for (let i = 0; i <= 10; i++) {
		const a = from + ((to - from) * i) / 10;
		const bump = Math.sin((i / 10) * Math.PI);
		outer.push(polar(cx, cy, r + 3 + bump * 8 * k + (i % 2) * 1.4 * k, a));
		inner.push(polar(cx, cy, r + 1.5 - bump * 1.5, a));
	}
	const pile = `${smoothOpen(outer)} L${inner
		.slice()
		.reverse()
		.map(([x, y]) => `${f1(x)},${f1(y)}`)
		.join(' L')} Z`;
	const icicles = [228, 252, 280, 300].map((a, i) => ({p: polar(cx, cy, r + 2, a), len: [9, 6, 11, 7][i] * k, a}));
	const [fx, fy] = polar(cx, cy, r + 12 * k, 132);
	return (
		<g>
			<Grow origin="50% 100%" delay={520} dur={520}>
				<path d={pile} fill={`url(#${gid}-snow)`} stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
				<path d={smoothOpen(outer)} transform={`translate(0 ${f1(1.4 * k)})`} stroke={SNOW} strokeWidth={1.1} fill="none" />
			</Grow>
			{icicles.map((ic, i) => (
				<At key={i} x={ic.p[0]} y={ic.p[1]} r={ic.a - 270}>
					<Grow origin="50% 0%" delay={760 + i * 60} dur={380}>
						<Icicle wd={3.6 * k} len={ic.len} gid={gid} />
					</Grow>
				</At>
			))}
			<At x={fx} y={fy}>
				<PopIn delay={820}>
					<Loop kind="swing" t={{dur: 3800, rot: 14}}>
						<Snowflake r={9 * k} />
					</Loop>
				</PopIn>
			</At>
			<Glint x={polar(cx, cy, r + 10 * k, 250)[0]} y={polar(cx, cy, r + 10 * k, 250)[1] - 6 * s} r={4.5 * k} delay={1700} dur={3300} />
		</g>
	);
}

function Back({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, fallFar} = useLayout(geometry);
	const gid = idPrefix;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="back"
			defs={
				<>
					<TextureDefs id={`${gid}-b`} color={ICE} />
					<linearGradient id={`${gid}-floor`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={BLUE} stopOpacity={0} />
						<stop offset="1" stopColor={BLUE} stopOpacity={0.22} />
					</linearGradient>
				</>
			}
		>
			<FadeIn dur={900}>
				<Rim w={w} h={h} radius={radius} color={ICE} />
				<rect x={0} y={h - 80 * s} width={w} height={80 * s} fill={`url(#${gid}-floor)`} />
				<TexturePatch id={`${gid}-b`} x={-60 * s} y={h - 100 * s} w={160 * s} h={160 * s} opacity={0.3} />
				<TexturePatch id={`${gid}-b`} x={w - 110 * s} y={h * 0.3} w={170 * s} h={180 * s} opacity={0.22} fine />
				{/* Giant line-art snowflakes, like frost etched into glass. */}
				<At x={w - 6 * s} y={h * 0.52}>
					<g opacity={0.22}>
						<Snowflake r={46 * s} ink={false} color={BLUE} />
					</g>
				</At>
				<At x={10 * s} y={h * 0.8}>
					<g opacity={0.18}>
						<Snowflake r={34 * s} detail={1} ink={false} color={BLUE} />
					</g>
				</At>
			</FadeIn>
			{fallFar.map((p, i) => (
				<Drifter key={i} x={p.x} y={-8} dx={p.dx} dy={h + 16} dur={p.dur} delay={p.delay} sway={p.sway} sy={p.sy}>
					<circle r={p.r} fill={SNOW} opacity={0.55} />
				</Drifter>
			))}
			{avatar && (
				<FadeIn delay={200} dur={700}>
					<g className={fm.slowSpin} style={tv({dur: 34000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 4} fill="none" stroke={ICE} strokeWidth={2.2} strokeDasharray="12 4 2 4" />
					</g>
					<g className={fm.spinRev} style={tv({dur: 46000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 8.5} fill="none" stroke={FROST} strokeWidth={1} strokeDasharray="2 5" opacity={0.7} />
					</g>
				</FadeIn>
			)}
		</EffectSvg>
	);
}

export const Snowfall: ProfileEffectLayer = ({layer, ...props}) =>
	layer === 'front' ? <Front {...props} /> : <Back {...props} />;
