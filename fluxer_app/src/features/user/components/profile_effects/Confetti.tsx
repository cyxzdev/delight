// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/profile_effects/Confetti.module.css';
import {
	arcPath,
	Burst,
	bannerBottomOf,
	between,
	Drifter,
	EffectSvg,
	edgeX,
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
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Confetti" — a party frame. Two party poppers fire from the top corners, a bunting garland with a bow swags across
 * the top, curly streamers hang down the sides, two-tone paper (strips, dots, squiggles, stars) tumbles down the edges
 * and piles up along the bottom, and the avatar gets a party hat and a ring of coloured segments.
 */

const INK = '#24113d';
// [face, shade] pairs.
const PALETTE: ReadonlyArray<readonly [string, string]> = [
	['#ff4f8b', '#c2265f'],
	['#ffd23f', '#e0920f'],
	['#2fe0cf', '#13999a'],
	['#5b7cff', '#3046c2'],
	['#b276ff', '#7a3fd0'],
	['#ff8a3d', '#cf5215'],
	['#6fe07a', '#2c9b47'],
];
const [PINK, YELLOW, CYAN, , PURPLE] = PALETTE;

type PieceKind = 'strip' | 'dot' | 'squiggle' | 'star';

function starPath(R: number, inner = 0.45): string {
	let d = '';
	for (let i = 0; i < 10; i++) {
		const radius = i % 2 === 0 ? R : R * inner;
		const [x, y] = polar(0, 0, radius, -90 + i * 36);
		d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)} `;
	}
	return `${d}Z`;
}

/** A two-tone piece of confetti centred on (0,0). */
const Piece: React.FC<{kind: PieceKind; colors: readonly [string, string]; size: number}> = ({kind, colors, size: k}) => {
	const [face, shade] = colors;
	if (kind === 'strip') {
		return (
			<g>
				<rect x={-2 * k} y={-4 * k} width={4 * k} height={8 * k} rx={0.6 * k} fill={face} stroke={INK} strokeWidth={0.7} />
				<rect x={0} y={-4 * k + 0.35} width={2 * k - 0.35} height={8 * k - 0.7} fill={shade} />
			</g>
		);
	}
	if (kind === 'dot') {
		return (
			<g>
				<circle r={2.6 * k} fill={face} stroke={INK} strokeWidth={0.7} />
				<path d={arcPath(0, 0, 1.6 * k, 10, 120)} stroke={shade} strokeWidth={1.4 * k} fill="none" />
			</g>
		);
	}
	if (kind === 'squiggle') {
		const d = `M${-5 * k},0 q${1.25 * k},${-3 * k} ${2.5 * k},0 t${2.5 * k},0 t${2.5 * k},0 t${2.5 * k},0`;
		return (
			<g>
				<path d={d} stroke={INK} strokeWidth={2.6 * k + 1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d={d} stroke={face} strokeWidth={2.6 * k} fill="none" strokeLinecap="round" strokeLinejoin="round" />
				<path d={d} stroke={shade} strokeWidth={0.9 * k} fill="none" strokeLinecap="round" transform={`translate(0 ${0.7 * k})`} />
			</g>
		);
	}
	const star = starPath(4.2 * k);
	return (
		<g>
			<path d={star} fill={face} stroke={INK} strokeWidth={0.7} strokeLinejoin="round" />
			<path d={`M0,0 L${polar(0, 0, 4.2 * k, -90).join(',')} L${polar(0, 0, 4.2 * k * 0.45, -54).join(',')} L${polar(0, 0, 4.2 * k, -18).join(',')} L${polar(0, 0, 4.2 * k * 0.45, 18).join(',')} L${polar(0, 0, 4.2 * k, 54).join(',')} Z`} fill={shade} />
		</g>
	);
};

/** A party popper with its tip at (0,0), pointing along +x. */
const Popper: React.FC<{L: number; m: number; clipId: string}> = ({L, m, clipId}) => {
	const cone = `M0,-1.8 L${L},${-m} L${L},${m} L0,1.8 Z`;
	return (
		<g>
			<defs>
				<clipPath id={clipId}>
					<path d={cone} />
				</clipPath>
			</defs>
			<path d={cone} fill={PINK[0]} />
			<g clipPath={`url(#${clipId})`}>
				{[0.18, 0.46, 0.74].map((t) => (
					<path key={t} d={`M${L * t},${-m} l${L * 0.14},0 l${-m * 0.7},${m * 2} l${-L * 0.14},0 Z`} fill={YELLOW[0]} />
				))}
				<path d={`M0,0 L${L},0 L${L},${m} L0,2 Z`} fill={INK} opacity={0.22} />
			</g>
			<path d={cone} fill="none" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
			<ellipse cx={L} cy={0} rx={m * 0.32} ry={m} fill={PURPLE[1]} stroke={INK} strokeWidth={1.4} />
			<ellipse cx={L + 0.4} cy={0} rx={m * 0.18} ry={m * 0.7} fill={INK} />
			<path d={`M${L * 0.3},${-m * 0.42} L${L * 0.85},${-m * 0.8}`} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.75} />
		</g>
	);
};

const Pennant: React.FC<{k: number; colors: readonly [string, string]}> = ({k, colors}) => (
	<g>
		<path d={`M${-7 * k},0 L${7 * k},0 L0,${17 * k} Z`} fill={colors[0]} />
		<path d={`M0,0 L${7 * k},0 L0,${17 * k} Z`} fill={colors[1]} />
		<path d={`M${-7 * k},0 L${7 * k},0 L0,${17 * k} Z`} fill="none" stroke={INK} strokeWidth={1} strokeLinejoin="round" />
		<path d={`M${-4.2 * k},${2 * k} L${-1.6 * k},${8.5 * k}`} stroke="#fff" strokeWidth={1} strokeLinecap="round" opacity={0.7} />
	</g>
);

const Bow: React.FC<{k: number}> = ({k}) => (
	<g transform={`scale(${k.toFixed(2)})`} stroke={INK} strokeWidth={1.2} strokeLinejoin="round">
		<path d="M-1,1 L-8,15 L-4.5,13 L-3,16.5 Z" fill={PINK[1]} />
		<path d="M1,1 L7,14 L3.5,12.5 L2.4,16 Z" fill={PINK[1]} />
		<path d="M0,0 C-5,-9 -16,-8 -14,1 C-12,8 -4,4 0,0 Z" fill={PINK[0]} />
		<path d="M0,0 C5,-9 16,-8 14,1 C12,8 4,4 0,0 Z" fill={PINK[0]} />
		<path d="M-3,-1 C-6,-5 -10,-4 -11,-1" fill="none" stroke={PINK[1]} strokeWidth={1.4} />
		<path d="M3,-1 C6,-5 10,-4 11,-1" fill="none" stroke={PINK[1]} strokeWidth={1.4} />
		<circle r={3.4} fill={YELLOW[0]} />
		<circle cx={-1} cy={-1.2} r={1} fill="#fff" stroke="none" />
	</g>
);

const PartyHat: React.FC<{r: number; clipId: string}> = ({r, clipId}) => {
	const b = r * 0.32;
	const H = r * 0.82;
	const cone = `M${-b},0 L${b},0 L${b * 0.25},${-H} Z`;
	return (
		<g>
			<defs>
				<clipPath id={clipId}>
					<path d={cone} />
				</clipPath>
			</defs>
			<path d={cone} fill={CYAN[0]} />
			<g clipPath={`url(#${clipId})`}>
				{[0.22, 0.5, 0.78].map((t) => (
					<path key={t} d={`M${-b * 1.4},${-H * t} L${b * 1.4},${-H * t - b * 0.7} L${b * 1.4},${-H * t - b * 0.7 + H * 0.13} L${-b * 1.4},${-H * t + H * 0.13} Z`} fill={PINK[0]} />
				))}
				<path d={`M${b * 0.25},${-H} L${b * 1.2},${-H} L${b * 1.2},2 L${b * 0.1},2 Z`} fill={INK} opacity={0.2} />
			</g>
			<path d={cone} fill="none" stroke={INK} strokeWidth={1.4} strokeLinejoin="round" />
			<path d={`M${-b * 0.55},${-H * 0.2} L${-b * 0.05},${-H * 0.75}`} stroke="#fff" strokeWidth={1.2} strokeLinecap="round" opacity={0.8} />
			{/* Fluffy trim and pom-pom. */}
			{[-0.8, -0.27, 0.27, 0.8].map((t) => (
				<circle key={t} cx={b * t} cy={0} r={b * 0.32} fill="#fff7e0" stroke={INK} strokeWidth={1} />
			))}
			<circle cx={b * 0.25} cy={-H - b * 0.22} r={b * 0.42} fill={YELLOW[0]} stroke={INK} strokeWidth={1.2} />
			<circle cx={b * 0.12} cy={-H - b * 0.34} r={b * 0.13} fill="#fff" />
		</g>
	);
};

function quad(p0: readonly [number, number], c: readonly [number, number], p2: readonly [number, number], t: number) {
	const u = 1 - t;
	const x = u * u * p0[0] + 2 * u * t * c[0] + t * t * p2[0];
	const y = u * u * p0[1] + 2 * u * t * c[1] + t * t * p2[1];
	const tx = 2 * u * (c[0] - p0[0]) + 2 * t * (p2[0] - c[0]);
	const ty = 2 * u * (c[1] - p0[1]) + 2 * t * (p2[1] - c[1]);
	return {x, y, angle: (Math.atan2(ty, tx) * 180) / Math.PI};
}

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0xc0f3);
		const kinds: ReadonlyArray<PieceKind> = ['strip', 'strip', 'dot', 'squiggle', 'star', 'strip'];
		const pickColor = () => PALETTE[Math.floor(rand() * PALETTE.length)];
		const L = 32 * s;
		const m = 10 * s;
		const mouthL: [number, number] = [2 + L * Math.SQRT1_2, 2 + L * Math.SQRT1_2];
		const mouthR: [number, number] = [w - mouthL[0], mouthL[1]];
		const middle: [number, number] = [w / 2, 9 * s];
		const sag = 30 * s;
		const swags = [
			{p0: mouthL, p2: middle, c: [(mouthL[0] + middle[0]) / 2, mouthL[1] + sag] as [number, number]},
			{p0: middle, p2: mouthR, c: [(mouthR[0] + middle[0]) / 2, mouthR[1] + sag] as [number, number]},
		];
		const pennants = swags.flatMap((swag, si) => {
			const span = Math.hypot(swag.p2[0] - swag.p0[0], swag.p2[1] - swag.p0[1]);
			const n = Math.max(3, Math.round(span / (19 * s)));
			return Array.from({length: n}, (_, i) => {
				const t = (i + 0.5) / n;
				const q = quad(swag.p0, swag.c, swag.p2, t);
				return {...q, colors: PALETTE[(i * 2 + si * 3) % PALETTE.length], delay: 260 + (si * n + i) * 50};
			});
		});
		const burst = Array.from({length: 22}, (_, i) => {
			const left = i % 2 === 0;
			const angle = 45 + between(rand, -38, 38);
			const dist = between(rand, 60, 170) * s;
			const [dx, dy] = polar(0, 0, dist, angle);
			const mouth = left ? mouthL : mouthR;
			return {
				x: mouth[0],
				y: mouth[1],
				dx: left ? dx : -dx,
				dy,
				rot: between(rand, -540, 540),
				kind: kinds[i % kinds.length],
				colors: pickColor(),
				k: between(rand, 0.8, 1.15) * s,
				delay: 120 + between(rand, 0, 160),
				dur: between(rand, 900, 1500),
			};
		});
		const falling = Array.from({length: 14}, (_, i) => {
			const x = edgeX(rand, w, 0.2);
			const y = between(rand, -16, bannerBottom * 0.6);
			const fall = between(rand, 0.55, 1) * (h - y + 10);
			return {
				x,
				y,
				fall,
				dx: between(rand, -14, 14),
				rot: between(rand, -400, 400),
				kind: kinds[i % kinds.length],
				colors: PALETTE[i % PALETTE.length],
				k: between(rand, 0.75, 1.1) * s,
				dur: between(rand, 4200, 7000),
				delay: 900 + i * 380 + between(rand, 0, 400),
				flutter: between(rand, 420, 900),
				sy: between(rand, 0.15, 0.85) * fall,
				sr: between(rand, -180, 180),
			};
		});
		const pile = Array.from({length: 40}, (_, i) => {
			const left = i % 2 === 0;
			const reach = Math.pow(rand(), 1.7) * w * 0.48;
			const x = left ? reach : w - reach;
			const heap = Math.max(0.25, 1 - reach / (w * 0.32));
			return {
				x,
				y: h - 2.5 - Math.pow(rand(), 1.4) * 15 * s * heap,
				rot: between(rand, -90, 90),
				kind: kinds[i % kinds.length],
				colors: pickColor(),
				k: between(rand, 0.65, 0.95) * s,
			};
		});
		// Curly streamers hanging from the poppers down the sides.
		const streamer = (x0: number, y0: number, length: number, amp: number, phase: number, dir: 1 | -1) => {
			let d = `M${x0.toFixed(1)},${y0.toFixed(1)}`;
			for (let y = 4; y <= length; y += 4) {
				const x = x0 + dir * (Math.sin((y / (16 * s)) * Math.PI + phase) * amp + y * 0.02);
				d += ` L${x.toFixed(1)},${(y0 + y).toFixed(1)}`;
			}
			return d;
		};
		const streamers = [
			{d: streamer(9 * s, mouthL[1] + 4, bannerBottom + 40 * s, 4 * s, 0, 1), colors: YELLOW, delay: 0},
			{d: streamer(20 * s, mouthL[1] + 8, bannerBottom * 0.55, 3 * s, 1.4, 1), colors: CYAN, delay: 700},
			{d: streamer(w - 9 * s, mouthR[1] + 4, bannerBottom + 70 * s, 4 * s, 0.6, -1), colors: PURPLE, delay: 300},
			{d: streamer(w - 21 * s, mouthR[1] + 8, bannerBottom * 0.6, 3 * s, 2, -1), colors: PINK, delay: 1100},
		];
		return {s, L, m, middle, swags, pennants, burst, falling, pile, streamers, bannerBottom};
	}, [w, h, bannerBottom]);
}

function Defs({idPrefix}: {idPrefix: string}) {
	return (
		<>
			<pattern id={`${idPrefix}-dots`} width={5} height={5} patternUnits="userSpaceOnUse">
				<circle cx={2.5} cy={2.5} r={1.1} fill={YELLOW[0]} />
			</pattern>
			<pattern id={`${idPrefix}-dots-pink`} width={4} height={4} patternUnits="userSpaceOnUse">
				<circle cx={2} cy={2} r={0.8} fill={PINK[0]} />
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

const At: React.FC<{x: number; y: number; r?: number; children: React.ReactNode}> = ({x, y, r = 0, children}) => (
	<g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})${r ? ` rotate(${r.toFixed(0)})` : ''}`}>{children}</g>
);

export const Confetti: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const C = useLayout(geometry);
	const {s} = C;
	const defs = <Defs idPrefix={idPrefix} />;

	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back" defs={defs}>
				<g className={frame.fadeIntro}>
					<g opacity={0.3} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={-60 * s} y={h - 90 * s} width={150 * s} height={170 * s} fill={`url(#${idPrefix}-dots-pink)`} />
					</g>
					<g opacity={0.26} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={w - 90 * s} y={h - 100 * s} width={170 * s} height={180 * s} fill={`url(#${idPrefix}-dots)`} />
					</g>
				</g>
				{/* Faint big paper drifting behind the content. */}
				{[0.32, 0.6, 0.84].map((t, i) => (
					<Drifter key={i} x={w * t} y={-20} dx={-12} dy={h + 40} dur={8000 + i * 1800} delay={600 + i * 2400} rot={300} sy={h * (0.35 + i * 0.18)} sr={40}>
						<g opacity={0.22}>
							<Piece kind={i === 1 ? 'star' : 'strip'} colors={PALETTE[(i * 2) % PALETTE.length]} size={1.8 * s} />
						</g>
					</Drifter>
				))}
				{avatar && (
					<g className={motion.spin} style={vars({dur: 24000})}>
						{PALETTE.slice(0, 4).map(([color], i) => (
							<circle
								key={color}
								cx={avatar.cx}
								cy={avatar.cy}
								r={avatar.r + 8 * s}
								fill="none"
								stroke={color}
								strokeWidth={2.4}
								pathLength={100}
								strokeDasharray="7 21"
								strokeDashoffset={-i * 7}
							/>
						))}
					</g>
				)}
			</EffectSvg>
		);
	}

	const inset = 1.75;
	const rr = Math.max(0, radius - inset);
	const bb = C.bannerBottom;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front" defs={defs}>
			<g className={frame.fadeIntro}>
				<g opacity={0.5} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={-60 * s} y={-50 * s} width={150 * s} height={130 * s} fill={`url(#${idPrefix}-dots)`} />
				</g>
				<g opacity={0.45} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={w - 90 * s} y={-50 * s} width={150 * s} height={130 * s} fill={`url(#${idPrefix}-dots-pink)`} />
				</g>
			</g>

			{/* Candy-stripe frame. */}
			<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={rr} fill="none" stroke={INK} strokeWidth={4.2} className={frame.drawIn} pathLength={1} />
			<rect
				x={inset}
				y={inset}
				width={w - inset * 2}
				height={h - inset * 2}
				rx={rr}
				fill="none"
				stroke={PINK[0]}
				strokeWidth={2.4}
				className={frame.drawIn}
				style={{animationDelay: '60ms'}}
				pathLength={1}
			/>
			<FadeIn delay={420} dur={400}>
				<rect
					x={inset}
					y={inset}
					width={w - inset * 2}
					height={h - inset * 2}
					rx={rr}
					fill="none"
					stroke={YELLOW[0]}
					strokeWidth={2.4}
					pathLength={100}
					strokeDasharray="0.7 0.7"
				/>
			</FadeIn>
			<g className={frame.drawIn} style={{animationDelay: '200ms'}}>
				<path d={`M6,${bb + 50 * s} V${h * 0.72}`} stroke={CYAN[0]} strokeWidth={1.2} fill="none" pathLength={1} />
				<path d={`M${w - 6},${bb + 80 * s} V${h * 0.8}`} stroke={PURPLE[0]} strokeWidth={1.2} fill="none" pathLength={1} />
			</g>

			{/* Confetti piled along the bottom edge. */}
			<FadeIn delay={500} dur={700}>
				{C.pile.map((p, i) => (
					<At key={i} x={p.x} y={p.y} r={p.rot}>
						<Piece kind={p.kind} colors={p.colors} size={p.k} />
					</At>
				))}
			</FadeIn>

			{/* Streamers. */}
			{C.streamers.map((st, i) => (
				<g key={i} className={frame.drawIn} style={{animationDelay: `${250 + i * 80}ms`, animationDuration: '700ms'}}>
					<g className={styles.streamer} style={vars({dur: 3200 + i * 500, delay: st.delay})}>
						<path d={st.d} stroke={INK} strokeWidth={5 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
						<path d={st.d} stroke={st.colors[0]} strokeWidth={3 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" pathLength={1} />
						<path d={st.d} stroke={st.colors[1]} strokeWidth={1 * s} fill="none" transform={`translate(${0.9 * s} 0)`} strokeLinejoin="round" pathLength={1} />
					</g>
				</g>
			))}

			{/* Tumbling paper. */}
			{C.falling.map((p, i) => (
				<Drifter key={i} x={p.x} y={p.y} dx={p.dx} dy={p.fall} dur={p.dur} delay={p.delay} rot={p.rot} sway={6} swayDur={1400 + (i % 3) * 300} sy={p.sy} sr={p.sr}>
					<g className={styles.flutter} style={vars({dur: p.flutter, delay: -i * 120})}>
						<Piece kind={p.kind} colors={p.colors} size={p.k} />
					</g>
				</Drifter>
			))}

			{/* Bunting garland. */}
			{C.swags.map((sw, i) => (
				<g key={i}>
					<path
						className={frame.drawIn}
						style={{animationDelay: `${200 + i * 120}ms`}}
						d={`M${sw.p0[0]},${sw.p0[1]} Q${sw.c[0]},${sw.c[1]} ${sw.p2[0]},${sw.p2[1]}`}
						stroke={INK}
						strokeWidth={2.2}
						fill="none"
						pathLength={1}
					/>
					<path
						className={frame.drawIn}
						style={{animationDelay: `${220 + i * 120}ms`}}
						d={`M${sw.p0[0]},${sw.p0[1]} Q${sw.c[0]},${sw.c[1]} ${sw.p2[0]},${sw.p2[1]}`}
						stroke="#fff3d6"
						strokeWidth={0.9}
						fill="none"
						pathLength={1}
					/>
				</g>
			))}
			{C.pennants.map((p, i) => (
				<At key={i} x={p.x} y={p.y} r={p.angle}>
					<PopIn delay={p.delay} dur={360} origin="50% 0%">
						<g className={styles.pennant} style={vars({dur: 2000 + (i % 4) * 300, delay: -i * 260})}>
							<Pennant k={s} colors={p.colors} />
						</g>
					</PopIn>
				</At>
			))}
			<At x={C.middle[0]} y={C.middle[1]}>
				<PopIn delay={620} dur={420}>
					<Bow k={s * 1.05} />
				</PopIn>
			</At>

			{/* Poppers in the top corners, and their opening blast. */}
			<At x={2} y={2} r={45}>
				<PopIn delay={0} dur={380} origin="0% 50%">
					<Popper L={C.L} m={C.m} clipId={`${idPrefix}-popper-l`} />
				</PopIn>
			</At>
			<At x={w - 2} y={2} r={135}>
				<PopIn delay={80} dur={380} origin="0% 50%">
					<g transform="scale(1 -1)">
						<Popper L={C.L} m={C.m} clipId={`${idPrefix}-popper-r`} />
					</g>
				</PopIn>
			</At>
			{C.burst.map((b, i) => (
				<Burst key={i} x={b.x} y={b.y} dx={b.dx} dy={b.dy} dur={b.dur} delay={b.delay} rot={b.rot}>
					<Piece kind={b.kind} colors={b.colors} size={b.k} />
				</Burst>
			))}

			{avatar && <AvatarFront avatar={avatar} s={s} idPrefix={idPrefix} />}
		</EffectSvg>
	);
};

function AvatarFront({avatar, s, idPrefix}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; s: number; idPrefix: string}) {
	const {cx, cy, r} = avatar;
	const [hx, hy] = polar(cx, cy, r * 0.86, -58);
	const stars: ReadonlyArray<readonly [number, number, readonly [string, string], number]> = [
		[-128, 9, YELLOW, 0],
		[150, 8, CYAN, 900],
		[24, 10, PINK, 1600],
	];
	return (
		<g>
			<path className={frame.ringArc} d={arcPath(cx, cy, r + 4.5, 100, 170)} stroke={PINK[0]} strokeWidth={2.4} fill="none" pathLength={1} />
			<path
				className={frame.ringArc}
				style={{animationDelay: '200ms'}}
				d={arcPath(cx, cy, r + 4.5, 178, 214)}
				stroke={YELLOW[0]}
				strokeWidth={2.4}
				fill="none"
				pathLength={1}
			/>
			<path
				className={frame.ringArc}
				style={{animationDelay: '320ms'}}
				d={arcPath(cx, cy, r + 4.5, 62, 92)}
				stroke={CYAN[0]}
				strokeWidth={2.4}
				fill="none"
				pathLength={1}
			/>
			{stars.map(([deg, gap, colors, delay], i) => {
				const [x, y] = polar(cx, cy, r + gap * s, deg);
				return (
					<Twinkle key={i} x={x} y={y} dur={2200 + i * 400} delay={delay}>
						<Piece kind="star" colors={colors} size={0.9 * s} />
					</Twinkle>
				);
			})}
			<At x={hx} y={hy} r={30}>
				<PopIn delay={700} dur={460} origin="50% 100%">
					<g className={styles.hat} style={vars({dur: 1700})}>
						<PartyHat r={r} clipId={`${idPrefix}-hat`} />
					</g>
				</PopIn>
			</At>
		</g>
	);
}
