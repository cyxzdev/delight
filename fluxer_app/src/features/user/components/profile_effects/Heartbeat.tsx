// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	Burst,
	between,
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
	dotsPath,
	f1,
	fm,
	Grow,
	heartPath,
	Loop,
	type Pt,
	Rim,
	roundRectPath,
	sparklePath,
	TextureDefs,
	TexturePatch,
	taper,
	tv,
} from '@app/features/user/components/profile_effects/frameKit';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Heartbeat" — a romantic frame: lace trims the top and bottom edges, a satin bow ties up the top-right corner with
 * ribbons running along the edges, glossy hearts cluster in the corners and beat, an ECG line draws itself along the
 * banner's edge and pulses, hearts float up the sides and a ring of hearts circles the avatar.
 */

const INK = '#4d0b25';
const RED = '#ff2f62';
const ROSE = '#ff6f93';
const PINK = '#ffa6bf';
const BLUSH = '#ffd9e3';
const LACE = '#fff2f6';
const RIBBON = '#ef4a78';
const RIBBON_DARK = '#a8204a';
const GOLD = '#ffd27a';

const BEAT = 1400;

type IdProps = {geometry: ProfileEffectGeometry; radius: number; idPrefix: string};

/** A glossy illustrated heart: gradient body, ink outline, highlight sweep and glint. */
const GlossyHeart: React.FC<{r: number; gid: string; tone?: 0 | 1 | 2}> = ({r, gid, tone = 0}) => (
	<g>
		<path d={heartPath(r)} fill={`url(#${gid}-heart${tone})`} stroke={INK} strokeWidth={Math.max(0.8, r * 0.09)} strokeLinejoin="round" />
		<path
			d={`M${f1(-r * 0.72)},${f1(-r * 0.2)} C${f1(-r * 0.78)},${f1(-r * 0.62)} ${f1(-r * 0.5)},${f1(-r * 0.82)} ${f1(-r * 0.22)},${f1(-r * 0.74)}`}
			stroke="#ffffff"
			strokeWidth={Math.max(0.8, r * 0.13)}
			fill="none"
			strokeLinecap="round"
			opacity={0.9}
		/>
		<circle cx={-r * 0.62} cy={r * 0.02} r={Math.max(0.5, r * 0.07)} fill="#ffffff" opacity={0.9} />
		<path d={`M${f1(r * 0.1)},${f1(r * 0.72)} C${f1(r * 0.5)},${f1(r * 0.42)} ${f1(r * 0.8)},${f1(r * 0.12)} ${f1(r * 0.86)},${f1(-r * 0.2)}`} stroke={INK} strokeWidth={r * 0.06} fill="none" opacity={0.25} strokeLinecap="round" />
	</g>
);

function Defs({gid}: {gid: string}) {
	const tones: Array<[string, string, string]> = [
		['#ff9bb5', RED, '#c4103f'],
		[BLUSH, PINK, ROSE],
		['#ffb3c7', ROSE, '#d42b5c'],
	];
	return (
		<>
			{tones.map(([a, b, c], i) => (
				<linearGradient key={i} id={`${gid}-heart${i}`} x1="0.2" y1="0" x2="0.8" y2="1">
					<stop offset="0" stopColor={a} />
					<stop offset="0.5" stopColor={b} />
					<stop offset="1" stopColor={c} />
				</linearGradient>
			))}
			<linearGradient id={`${gid}-ribbon`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#ff8aac" />
				<stop offset="0.55" stopColor={RIBBON} />
				<stop offset="1" stopColor={RIBBON_DARK} />
			</linearGradient>
		</>
	);
}

/** A row of lace scallops along a horizontal edge. dir 1 = hanging down from y, -1 = rising up from y. */
function laceRow(x0: number, x1: number, y: number, size: number, dir: 1 | -1): {band: string; holes: Array<[number, number, number]>} {
	const n = Math.max(2, Math.round((x1 - x0) / size));
	const step = (x1 - x0) / n;
	const depth = size * 0.62;
	let d = `M${f1(x0)},${f1(y - dir * 2)} L${f1(x0)},${f1(y)}`;
	const holes: Array<[number, number, number]> = [];
	for (let i = 0; i < n; i++) {
		const xa = x0 + step * i;
		d += ` C${f1(xa)},${f1(y + dir * depth * 1.3)} ${f1(xa + step)},${f1(y + dir * depth * 1.3)} ${f1(xa + step)},${f1(y)}`;
		holes.push([xa + step / 2, y + dir * depth * 0.5, size * 0.12]);
		holes.push([xa + step, y + dir * depth * 0.05, size * 0.07]);
	}
	d += ` L${f1(x1)},${f1(y - dir * 2)} Z`;
	return {band: d, holes};
}

const Bow: React.FC<{k: number; gid: string}> = ({k, gid}) => {
	const loop = 'M0,0 C-8,-14 -28,-20 -31,-7 C-33,4 -16,8 0,0 Z';
	const fold = 'M-3,-1 C-10,-6 -18,-9 -24,-7';
	const tail = 'M-2,3 C-6,12 -10,20 -16,28 L-10,27 L-8,33 C-3,24 1,14 3,4 Z';
	return (
		<g transform={`scale(${k.toFixed(3)})`} strokeLinejoin="round">
			{[1, -1].map((m) => (
				<g key={m} transform={`scale(${m} 1)`}>
					<path d={tail} fill={`url(#${gid}-ribbon)`} stroke={INK} strokeWidth={1} />
					<path d={loop} fill={`url(#${gid}-ribbon)`} stroke={INK} strokeWidth={1.1} />
					<path d={fold} stroke={RIBBON_DARK} strokeWidth={1.6} fill="none" strokeLinecap="round" />
					<path d="M-8,-11 C-14,-14 -22,-15 -26,-10" stroke="#ffffff" strokeWidth={1.4} fill="none" strokeLinecap="round" opacity={0.75} />
				</g>
			))}
			<rect x={-5} y={-5.5} width={10} height={10} rx={3} fill={RIBBON} stroke={INK} strokeWidth={1.1} />
			<path d="M-2.6,-3 L2,-3" stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
		</g>
	);
};

/** A satin ribbon band along `pts`. */
const Ribbon: React.FC<{pts: ReadonlyArray<Pt>; width: number; gid: string}> = ({pts, width, gid}) => {
	const {outline, lit} = taper(pts, width, width * 0.85, 8);
	return (
		<g>
			<path d={outline} fill={`url(#${gid}-ribbon)`} stroke={INK} strokeWidth={0.9} strokeLinejoin="round" />
			<path d={lit} stroke="#ffffff" strokeWidth={Math.max(0.7, width * 0.16)} fill="none" opacity={0.55} strokeLinecap="round" />
		</g>
	);
};

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	const bb = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x4ea7);
		const floaters = Array.from({length: 9}, (_, i) => {
			const side = i % 2;
			return {
				x: side ? w - between(rand, 10, 26 * s) : between(rand, 10, 26 * s),
				r: between(rand, 4, 7) * s,
				tone: (i % 3) as 0 | 1 | 2,
				dur: between(rand, 5200, 7600),
				delay: 700 + i * 760,
				dx: between(rand, -12, 12),
				dy: -between(rand, h * 0.55, h * 0.85),
				sway: between(rand, 5, 10),
				sy: -between(rand, 40, h * 0.6),
			};
		});
		const burst = Array.from({length: 10}, (_, i) => ({
			dx: (i % 2 ? -1 : 1) * between(rand, 20, 110) * s,
			dy: -between(rand, 40, 170) * s,
			delay: between(rand, 300, 700),
			dur: between(rand, 1300, 1900),
			r: between(rand, 3.5, 6) * s,
			tone: (i % 3) as 0 | 1 | 2,
		}));
		return {s, bb, floaters, burst};
	}, [w, h, bb]);
}

/** The ECG trace between x0 and x1 at baseline y. */
function ecg(x0: number, x1: number, y: number, s: number): string {
	const mid = x0 + (x1 - x0) * 0.55;
	const k = s;
	return (
		`M${f1(x0)},${f1(y)} H${f1(mid - 34 * k)} ` +
		`q${f1(4 * k)},${f1(-5 * k)} ${f1(8 * k)},0 ` +
		`H${f1(mid - 14 * k)} L${f1(mid - 10 * k)},${f1(y + 4 * k)} L${f1(mid - 4 * k)},${f1(y - 18 * k)} ` +
		`L${f1(mid + 2 * k)},${f1(y + 10 * k)} L${f1(mid + 6 * k)},${f1(y)} H${f1(mid + 16 * k)} ` +
		`q${f1(6 * k)},${f1(-7 * k)} ${f1(12 * k)},0 H${f1(x1)}`
	);
}

function Front({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, bb, floaters, burst} = useLayout(geometry);
	const gid = idPrefix;
	const top = laceRow(0, w, 0, 11 * s, 1);
	const bottom = laceRow(0, w, h, 11 * s, -1);
	const ecgStart = avatar ? avatar.cx + avatar.r + 12 : 14;
	const ecgEnd = w - 12;
	const trace = ecg(ecgStart, ecgEnd, bb, s);
	const bowX = w - 40 * s;
	const bowY = 24 * s;
	const ribbonTop: Array<Pt> = [
		[bowX, bowY - 2 * s],
		[bowX - 40 * s, 14 * s],
		[bowX - 80 * s, 22 * s],
		[bowX - 116 * s, 12 * s],
	];
	const ribbonSide: Array<Pt> = [
		[bowX + 2 * s, bowY + 2 * s],
		[w - 12 * s, 70 * s],
		[w - 6 * s, 120 * s],
		[w - 13 * s, 160 * s],
	];
	const clusters: Array<{x: number; y: number; r: number; rot: number; tone: 0 | 1 | 2; beat?: boolean}> = [
		{x: 18 * s, y: 22 * s, r: 13 * s, rot: -14, tone: 0, beat: true},
		{x: 40 * s, y: 12 * s, r: 8 * s, rot: 16, tone: 1},
		{x: 8 * s, y: 46 * s, r: 7 * s, rot: -26, tone: 2},
		{x: w - 22 * s, y: h - 30 * s, r: 15 * s, rot: 12, tone: 0, beat: true},
		{x: w - 48 * s, y: h - 18 * s, r: 9 * s, rot: -10, tone: 2},
		{x: w - 12 * s, y: h - 58 * s, r: 7.5 * s, rot: 22, tone: 1},
		{x: w - 66 * s, y: h - 36 * s, r: 5.5 * s, rot: -20, tone: 1},
		{x: 14 * s, y: h - 16 * s, r: 10 * s, rot: -12, tone: 2, beat: true},
		{x: 34 * s, y: h - 9 * s, r: 6.5 * s, rot: 18, tone: 1},
		{x: 7 * s, y: h - 36 * s, r: 5.5 * s, rot: -24, tone: 0},
	];
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={
				<>
					<Defs gid={gid} />
					<TextureDefs id={`${gid}-f`} color={BLUSH} />
				</>
			}
		>
			<FadeIn dur={700}>
				<TexturePatch id={`${gid}-f`} x={w - 160 * s} y={-50 * s} w={200 * s} h={150 * s} opacity={0.32} />
				<TexturePatch id={`${gid}-f`} x={-50 * s} y={-40 * s} w={130 * s} h={110 * s} opacity={0.3} fine />
			</FadeIn>

			{/* Border: rose line with a broken blush inner line. */}
			<DrawPath d={roundRectPath(1.5, 1.5, w - 3, h - 3, Math.max(0, radius - 1.5))} stroke={ROSE} strokeWidth={2} fill="none" dur={700} />
			<g fill="none" stroke={BLUSH} strokeWidth={1} opacity={0.8}>
				<DrawPath d={`M5.5,${f1(bb + 52 * s)} V${f1(h - 70 * s)}`} delay={160} />
				<DrawPath d={`M${f1(w - 5.5)},${f1(170 * s)} V${f1(h - 76 * s)}`} delay={200} />
			</g>
			{(
				[
					[5.5, bb + 46 * s],
					[5.5, h - 64 * s],
					[w - 5.5, 176 * s],
					[w - 5.5, h - 82 * s],
				] as const
			).map(([x, y], i) => (
				<At key={i} x={x} y={y}>
					<PopIn delay={700 + i * 70}>
						<path d={heartPath(3.6 * s)} fill={ROSE} stroke={INK} strokeWidth={0.6} />
					</PopIn>
				</At>
			))}

			{/* Lace along the top and bottom edges. */}
			<FadeIn dur={500} delay={80}>
				<path d={top.band} fill={LACE} stroke={INK} strokeWidth={0.7} opacity={0.95} />
				<path d={dotsPath(top.holes)} fill={PINK} />
				<path d={bottom.band} fill={LACE} stroke={INK} strokeWidth={0.7} opacity={0.95} />
				<path d={dotsPath(bottom.holes)} fill={PINK} />
			</FadeIn>

			{/* ECG along the banner's edge: draws in, then a bright blip runs with each beat. */}
			<DrawPath d={trace} stroke={INK} strokeWidth={3.6 * s} fill="none" strokeLinejoin="round" strokeLinecap="round" delay={300} dur={900} opacity={0.7} />
			<DrawPath d={trace} stroke={RED} strokeWidth={1.8 * s} fill="none" strokeLinejoin="round" strokeLinecap="round" delay={300} dur={900} />
			<path className={fm.runDash} style={tv({dur: BEAT * 2, delay: 1300})} d={trace} stroke="#ffffff" strokeWidth={2.2 * s} fill="none" strokeLinejoin="round" strokeLinecap="round" pathLength={1} />

			{/* Ribbons from the bow along the top and right edges, then the bow itself. */}
			<Grow origin="100% 50%" delay={160} dur={560}>
				<Ribbon pts={ribbonTop} width={7 * s} gid={gid} />
			</Grow>
			<Grow origin="50% 0%" delay={220} dur={560}>
				<Ribbon pts={ribbonSide} width={7 * s} gid={gid} />
			</Grow>
			{/* Ribbon ends: little hearts. */}
			<At x={ribbonTop[3][0] - 4 * s} y={ribbonTop[3][1]} r={-20}>
				<PopIn delay={620}>
					<GlossyHeart r={6 * s} gid={gid} tone={1} />
				</PopIn>
			</At>
			<At x={ribbonSide[3][0]} y={ribbonSide[3][1] + 6 * s} r={10}>
				<PopIn delay={680}>
					<GlossyHeart r={6 * s} gid={gid} tone={1} />
				</PopIn>
			</At>
			<At x={bowX} y={bowY}>
				<PopIn delay={260} dur={560}>
					<Loop kind="swing" t={{dur: 2600, rot: 3, origin: '50% 30%'}}>
						<Bow k={1.05 * s} gid={gid} />
					</Loop>
				</PopIn>
			</At>

			{/* Glossy heart clusters in the corners. */}
			{clusters.map((c, i) => (
				<At key={i} x={c.x} y={c.y} r={c.rot}>
					<PopIn delay={400 + i * 60}>
						{c.beat ? (
							<Loop kind="beat" t={{dur: BEAT, delay: 1300}}>
								<GlossyHeart r={c.r} gid={gid} tone={c.tone} />
							</Loop>
						) : (
							<GlossyHeart r={c.r} gid={gid} tone={c.tone} />
						)}
					</PopIn>
				</At>
			))}
			{/* Gold sparkles around the clusters. */}
			{(
				[
					[52 * s, 26 * s, 900],
					[w - 72 * s, h - 54 * s, 1700],
					[w - 90 * s, 44 * s, 2300],
					[34 * s, h - 46 * s, 2900],
				] as const
			).map(([x, y, delay], i) => (
				<At key={i} x={x} y={y}>
					<Loop kind="glint" t={{dur: 3200, delay}}>
						<path d={sparklePath(5 * s, 0.18)} fill={GOLD} stroke={INK} strokeWidth={0.5} />
					</Loop>
				</At>
			))}

			{/* Intro: a puff of hearts from the bottom corners. */}
			{burst.map((p, i) => (
				<Burst key={i} x={i % 2 ? w - 24 * s : 24 * s} y={h - 24 * s} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay}>
					<GlossyHeart r={p.r} gid={gid} tone={p.tone} />
				</Burst>
			))}

			{/* Hearts floating up the sides. */}
			{floaters.map((p, i) => (
				<Drifter key={i} x={p.x} y={h - 20 * s} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay} sway={p.sway} sy={p.sy}>
					<GlossyHeart r={p.r} gid={gid} tone={p.tone} />
				</Drifter>
			))}

			{avatar && <AvatarFront avatar={avatar} gid={gid} />}
		</EffectSvg>
	);
}

function AvatarFront({avatar, gid}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; gid: string}) {
	const {cx, cy, r} = avatar;
	const k = r / 43;
	const ring = [118, 140, 162, 184, 206, 290, 312].map((a, i) => ({p: polar(cx, cy, r + 5 * k, a), a, size: (i % 2 ? 4.2 : 5.6) * k, tone: (i % 3) as 0 | 1 | 2}));
	return (
		<g>
			<DrawPath
				d={`M${polar(cx, cy, r + 4, 112).map(f1).join(',')} A${r + 4},${r + 4} 0 0 1 ${polar(cx, cy, r + 4, 214).map(f1).join(',')}`}
				stroke={ROSE}
				strokeWidth={2}
				fill="none"
				strokeLinecap="round"
				delay={420}
			/>
			{ring.map((hrt, i) => (
				<At key={i} x={hrt.p[0]} y={hrt.p[1]} r={i % 2 ? 12 : -12}>
					<PopIn delay={560 + i * 70}>
						<GlossyHeart r={hrt.size} gid={gid} tone={hrt.tone} />
					</PopIn>
				</At>
			))}
		</g>
	);
}

function Back({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const s = scaleFor(w);
	const gid = idPrefix;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="back"
			defs={
				<>
					<TextureDefs id={`${gid}-b`} color={PINK} />
					<linearGradient id={`${gid}-floor`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={ROSE} stopOpacity={0} />
						<stop offset="1" stopColor={ROSE} stopOpacity={0.24} />
					</linearGradient>
				</>
			}
		>
			<FadeIn dur={900}>
				<Rim w={w} h={h} radius={radius} color={ROSE} />
				<rect x={0} y={h - 80 * s} width={w} height={80 * s} fill={`url(#${gid}-floor)`} />
				<TexturePatch id={`${gid}-b`} x={-60 * s} y={h - 110 * s} w={160 * s} h={170 * s} opacity={0.28} />
				<TexturePatch id={`${gid}-b`} x={w - 110 * s} y={h * 0.3} w={170 * s} h={180 * s} opacity={0.2} fine />
				{/* Big line-art hearts behind the content. */}
				<At x={w - 4 * s} y={h * 0.56} r={14}>
					<path d={heartPath(44 * s)} fill="none" stroke={ROSE} strokeWidth={3 * s} opacity={0.16} />
					<path d={heartPath(34 * s)} fill="none" stroke={ROSE} strokeWidth={1.2 * s} opacity={0.14} />
				</At>
				<At x={-2 * s} y={h * 0.8} r={-16}>
					<path d={heartPath(30 * s)} fill="none" stroke={PINK} strokeWidth={2.4 * s} opacity={0.14} />
				</At>
			</FadeIn>
			{avatar && (
				<FadeIn delay={200} dur={700}>
					<g className={fm.slowSpin} style={tv({dur: 30000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 4} fill="none" stroke={ROSE} strokeWidth={2.2} strokeDasharray="14 5 3 5" />
					</g>
					{/* A soft ring that pulses outward with each beat. */}
					<g className={fm.beat} style={tv({dur: BEAT, delay: 1300})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 9} fill="none" stroke={PINK} strokeWidth={1.4} opacity={0.6} />
					</g>
				</FadeIn>
			)}
		</EffectSvg>
	);
}

export const Heartbeat: ProfileEffectLayer = ({layer, ...props}) =>
	layer === 'front' ? <Front {...props} /> : <Back {...props} />;
