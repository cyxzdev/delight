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
	Loop,
	type Pt,
	Rim,
	roundRectPath,
	TextureDefs,
	TexturePatch,
	taper,
	tv,
} from '@app/features/user/components/profile_effects/frameKit';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Sakura Drift" — an illustrated cherry-blossom frame: gnarled branches in full bloom reach across the top corners and
 * down the right edge, a sprig curls round the avatar, fallen petals carpet the bottom edge, and petals tumble down
 * past the card's sides and swirl around the avatar. Dense at the edges, clear in the middle.
 */

const INK = '#5b1a33';
const ROSE = '#f06a98';
const PINK = '#ff9cc0';
const BLUSH = '#ffd3e2';
const PALE = '#fff3f7';
const BARK = '#5c3426';
const BARK_LIT = '#9a6650';
const BARK_INK = '#2a1210';
const LEAF = '#7cc46f';
const LEAF_INK = '#2f5b2a';
const POLLEN = '#ffd45c';

// One notched sakura petal, base at (0,0), tip pointing up (-y), ~12 long.
const PETAL =
	'M0,0 C-3.6,-1.8 -5.4,-6.6 -4.4,-10 C-3.6,-12.3 -1.6,-12.6 -0.3,-11 L0,-9.8 L0.3,-11 C1.6,-12.6 3.6,-12.3 4.4,-10 C5.4,-6.6 3.6,-1.8 0,0 Z';
// A loose falling petal centred on (0,0).
const LOOSE = 'M0,6 C-3.6,4.2 -5.2,-0.6 -4.2,-3.8 C-3.4,-6.2 -1.5,-6.6 -0.3,-5 L0,-3.8 L0.3,-5 C1.5,-6.6 3.4,-6.2 4.2,-3.8 C5.2,-0.6 3.6,4.2 0,6 Z';
const LEAF_PATH = 'M0,0 C3,-4 9,-6 15,-4 C11,1 5,3 0,0 Z';

function starPoints(r1: number, r2: number): string {
	const pts: Array<string> = [];
	for (let i = 0; i < 10; i++) {
		const r = i % 2 === 0 ? r1 : r2;
		const a = ((i * 36 - 90) * Math.PI) / 180;
		pts.push(`${f1(Math.cos(a) * r)},${f1(Math.sin(a) * r)}`);
	}
	return `M${pts.join(' L')} Z`;
}

/** A five-petal blossom of radius ~r centred on (0,0). */
const Blossom: React.FC<{r: number; gid: string; tone?: 0 | 1 | 2}> = ({r, gid, tone = 0}) => {
	const k = r / 12;
	const stamens = Array.from({length: 7}, (_, i) => polar(0, 0, r * 0.42, i * 51.4 + 12));
	return (
		<g transform={`scale(${k.toFixed(3)})`}>
			{[0, 72, 144, 216, 288].map((a) => (
				<path
					key={a}
					d={PETAL}
					transform={`rotate(${a}) translate(0 -1)`}
					fill={`url(#${gid}-petal${tone})`}
					stroke={INK}
					strokeWidth={0.7 / k}
					strokeLinejoin="round"
				/>
			))}
			<path d={starPoints(5.2, 2.2)} fill={ROSE} />
			<path
				d={stamens.map(([x, y]) => `M0,0 L${f1(x / k)},${f1(y / k)}`).join(' ')}
				stroke="#c23a68"
				strokeWidth={0.7}
				strokeLinecap="round"
			/>
			<path d={dotsPath(stamens.map(([x, y]) => [x / k, y / k, 0.95] as const))} fill={POLLEN} />
			<circle r={1.3} fill="#d9467a" />
		</g>
	);
};

const Bud: React.FC<{r: number; rot: number}> = ({r, rot}) => (
	<g transform={`rotate(${rot}) scale(${(r / 4).toFixed(3)})`}>
		<path d="M0,0 C-3,-2 -3.2,-6 0,-8.5 C3.2,-6 3,-2 0,0 Z" fill={PINK} stroke={INK} strokeWidth={0.6} />
		<path d="M0,0 C-1.6,-1 -1.6,-3.5 -0.4,-5" stroke={PALE} strokeWidth={0.8} fill="none" strokeLinecap="round" />
		<path d="M-2.2,0.6 L0,-1.6 L2.2,0.6 L0,2.6 Z" fill={LEAF} stroke={LEAF_INK} strokeWidth={0.4} />
	</g>
);

const Leaf: React.FC<{size: number; rot: number}> = ({size, rot}) => (
	<g transform={`rotate(${rot}) scale(${size.toFixed(3)})`}>
		<path d={LEAF_PATH} fill={LEAF} stroke={LEAF_INK} strokeWidth={0.6} strokeLinejoin="round" />
		<path d="M1,-0.4 C5,-2.4 9,-3 13,-3.6" stroke="#b6e3a4" strokeWidth={0.6} fill="none" />
	</g>
);

/** A gnarled branch: dark ink outline, bark fill, lit highlight along one side. */
const Branch: React.FC<{pts: ReadonlyArray<Pt>; w0: number; w1: number}> = ({pts, w0, w1}) => {
	const {outline, lit} = taper(pts, w0, w1);
	return (
		<g>
			<path d={outline} fill={BARK} stroke={BARK_INK} strokeWidth={1.1} strokeLinejoin="round" />
			<path d={lit} fill="none" stroke={BARK_LIT} strokeWidth={Math.max(0.8, w0 * 0.18)} strokeLinecap="round" opacity={0.9} />
		</g>
	);
};

type Flower = {x: number; y: number; r: number; rot: number; tone: 0 | 1 | 2};

const Bloom: React.FC<{f: Flower; gid: string; delay: number}> = ({f, gid, delay}) => (
	<At x={f.x} y={f.y} r={f.rot}>
		<PopIn delay={delay} dur={460}>
			<Blossom r={f.r} gid={gid} tone={f.tone} />
		</PopIn>
	</At>
);

function PetalDefs({gid}: {gid: string}) {
	const tones: Array<[string, string, string]> = [
		[PALE, BLUSH, PINK],
		['#ffffff', '#ffe4ee', '#ffb3cd'],
		[BLUSH, PINK, ROSE],
	];
	return (
		<>
			{tones.map(([a, b, c], i) => (
				<radialGradient key={i} id={`${gid}-petal${i}`} cx="0.5" cy="1" r="1.05" fx="0.5" fy="1">
					<stop offset="0" stopColor={c} />
					<stop offset="0.28" stopColor={a} />
					<stop offset="0.7" stopColor={b} />
					<stop offset="1" stopColor={c} />
				</radialGradient>
			))}
		</>
	);
}

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	const bb = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x5a4b);
		const tone = (): 0 | 1 | 2 => (Math.floor(rand() * 3) as 0 | 1 | 2);
		// Fallen petals carpeting the bottom edge, piled deeper in the corners.
		const carpet = Array.from({length: 30}, (_, i) => {
			const t = i / 29;
			const edgeBias = t < 0.5 ? Math.pow(t * 2, 1.6) / 2 : 1 - Math.pow((1 - t) * 2, 1.6) / 2;
			const x = edgeBias * w;
			const depth = 1 - Math.min(1, Math.min(x, w - x) / (w * 0.32));
			return {
				x: x + between(rand, -6, 6),
				y: h - between(rand, 2, 6 + depth * 12) * s,
				rot: between(rand, 0, 360),
				size: between(rand, 0.75, 1.15) * s,
				tone: tone(),
			};
		});
		const fall = Array.from({length: 9}, (_, i) => {
			const side = i % 3 === 2 ? 0.5 : i % 2;
			const x = side === 0.5 ? between(rand, w * 0.4, w * 0.75) : side ? w - between(rand, 6, 36 * s) : between(rand, 6, 36 * s);
			return {
				x,
				size: between(rand, 0.85, 1.25) * s,
				tone: tone(),
				dur: between(rand, 7000, 10500),
				delay: 900 + i * 900,
				rot: between(rand, 180, 420) * (rand() < 0.5 ? -1 : 1),
				dx: between(rand, -34, 8),
				sway: between(rand, 8, 16),
				flip: between(rand, 900, 1700),
				sy: side === 0.5 ? between(rand, bb * 0.2, bb * 0.7) + 14 : between(rand, bb + 20, h * 0.85),
				sr: between(rand, 0, 360),
			};
		});
		const back = Array.from({length: 5}, (_, i) => ({
			x: i % 2 ? between(rand, w * 0.78, w * 0.98) : between(rand, w * 0.02, w * 0.2),
			size: between(rand, 1.7, 2.3) * s,
			dur: between(rand, 11000, 15000),
			delay: 1500 + i * 2400,
			rot: between(rand, 160, 320),
			dx: between(rand, -50, -10),
			sway: between(rand, 10, 20),
			sy: between(rand, h * 0.35, h * 0.8),
			sr: between(rand, 0, 360),
		}));
		const burst = Array.from({length: 10}, () => ({
			dx: between(rand, -170, -30) * s,
			dy: between(rand, 40, 190) * s,
			rot: between(rand, -420, 420),
			delay: between(rand, 450, 900),
			dur: between(rand, 1400, 2100),
			tone: tone(),
		}));
		return {s, bb, carpet, fall, back, burst};
	}, [w, h, bb]);
}

const LoosePetal: React.FC<{size: number; gid: string; tone: 0 | 1 | 2; opacity?: number}> = ({size, gid, tone, opacity = 1}) => (
	<path
		d={LOOSE}
		transform={`scale(${size.toFixed(3)})`}
		fill={`url(#${gid}-petal${tone})`}
		stroke={INK}
		strokeWidth={0.6 / size}
		opacity={opacity}
	/>
);

function Front({geometry, radius, idPrefix}: {geometry: ProfileEffectGeometry; radius: number; idPrefix: string}) {
	const {width: w, height: h, avatar} = geometry;
	const {s, bb, carpet, fall, burst} = useLayout(geometry);
	const gid = idPrefix;
	const X = (dx: number) => w - dx * s;

	// Top-right: a main limb arching left along the top, a second limb dropping down the right edge.
	const limbTop: Array<Pt> = [
		[w + 8, 4 * s],
		[X(26), 13 * s],
		[X(62), 9 * s],
		[X(100), 22 * s],
		[X(138), 15 * s],
		[X(160), 21 * s],
	];
	const limbSide: Array<Pt> = [
		[w + 8, 26 * s],
		[X(10), 52 * s],
		[X(14), 86 * s],
		[X(8), 118 * s],
		[X(12), 140 * s],
	];
	const twigs: Array<{pts: Array<Pt>; w0: number}> = [
		{pts: [[X(62), 9 * s], [X(74), 1 * s], [X(86), -6 * s]], w0: 3 * s},
		{pts: [[X(100), 22 * s], [X(108), 34 * s], [X(118), 42 * s]], w0: 3 * s},
		{pts: [[X(13), 80 * s], [X(26), 92 * s], [X(36), 96 * s]], w0: 2.6 * s},
		{pts: [[X(138), 15 * s], [X(146), 5 * s]], w0: 2.2 * s},
	];
	const flowersTR: Array<Flower> = [
		[26, 22, 11, 10, 1],
		[48, 7, 10, 40, 0],
		[70, 22, 9.5, -12, 2],
		[86, -4, 8.5, 22, 0],
		[118, 43, 8.5, 50, 1],
		[110, 14, 7.5, -30, 0],
		[146, 6, 7, 18, 2],
		[13, 46, 10, 70, 0],
		[20, 70, 9, -8, 2],
		[36, 96, 8.5, 30, 1],
		[9, 112, 8, 12, 0],
	].map(([dx, y, r, rot, tone]) => ({x: X(dx), y: y * s, r: r * s, rot, tone: tone as 0 | 1 | 2}));
	const budsTR: Array<[number, number, number]> = [
		[160, 21, -100],
		[96, -8, -40],
		[128, 46, 120],
		[12, 140, 170],
		[44, 99, 110],
	];
	const leavesTR: Array<[number, number, number, number]> = [
		[56, 16, 150, 0.9],
		[92, 25, 40, 0.8],
		[18, 60, 200, 0.85],
		[30, 86, 30, 0.75],
		[132, 18, 200, 0.7],
	];

	// Top-left: a small sprig in the corner above the avatar.
	const sprig: Array<Pt> = [
		[-8, 10 * s],
		[16 * s, 13 * s],
		[36 * s, 6 * s],
		[54 * s, 9 * s],
	];
	const flowersTL: Array<Flower> = [
		{x: 14 * s, y: 12 * s, r: 9 * s, rot: 20, tone: 0},
		{x: 37 * s, y: 4 * s, r: 7.5 * s, rot: -10, tone: 2},
	];

	// Bottom-right: a low branch reaching in from the corner.
	const limbBottom: Array<Pt> = [
		[w + 8, h - 30 * s],
		[X(22), h - 22 * s],
		[X(48), h - 26 * s],
		[X(70), h - 16 * s],
	];
	const flowersBR: Array<Flower> = [
		{x: X(18), y: h - 26 * s, r: 9 * s, rot: 8, tone: 1},
		{x: X(44), y: h - 30 * s, r: 7.5 * s, rot: 36, tone: 0},
		{x: X(68), y: h - 15 * s, r: 6.5 * s, rot: -20, tone: 2},
	];
	const flowersBL: Array<Flower> = [
		{x: 12 * s, y: h - 12 * s, r: 8.5 * s, rot: 14, tone: 2},
		{x: 30 * s, y: h - 6 * s, r: 6.5 * s, rot: -24, tone: 0},
	];

	// Banner-edge garland from the avatar to the right edge.
	const gStart = avatar ? avatar.cx + avatar.r + 12 : 16;
	const gEnd = w - 30 * s;
	const garland = `M${f1(gStart)},${f1(bb)} C${f1(gStart + (gEnd - gStart) * 0.3)},${f1(bb + 5 * s)} ${f1(gStart + (gEnd - gStart) * 0.7)},${f1(bb + 5 * s)} ${f1(gEnd)},${f1(bb)}`;
	const garlandBlooms = [0.34, 0.68].map((t) => ({x: gStart + (gEnd - gStart) * t, y: bb + 3.6 * s}));

	const burstOrigin: Pt = [X(70), 22 * s];
	let order = 0;
	const next = () => 260 + order++ * 55;

	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={
				<>
					<PetalDefs gid={gid} />
					<TextureDefs id={`${gid}-f`} color="#ffd1e2" fine="#ffffff" />
				</>
			}
		>
			{/* Pink halftone over the banner's top corners. */}
			<FadeIn dur={700}>
				<TexturePatch id={`${gid}-f`} x={w - 170 * s} y={-60 * s} w={200 * s} h={150 * s} opacity={0.35} />
				<TexturePatch id={`${gid}-f`} x={-60 * s} y={-50 * s} w={140 * s} h={110 * s} opacity={0.3} fine />
			</FadeIn>

			{/* Border: rose outer line, broken blush inner line. */}
			<DrawPath d={roundRectPath(1.5, 1.5, w - 3, h - 3, Math.max(0, radius - 1.5))} stroke={PINK} strokeWidth={2} fill="none" dur={700} />
			<g fill="none" stroke={BLUSH} strokeWidth={1.1} strokeLinecap="round" opacity={0.85}>
				<DrawPath d={`M5.5,${f1(bb + 46 * s)} V${f1(h - 40 * s)}`} delay={160} />
				<DrawPath d={`M${f1(44 * s)},${f1(h - 5.5)} H${f1(w * 0.56)}`} delay={220} />
				<DrawPath d={`M${f1(w - 5.5)},${f1(160 * s)} V${f1(h - 56 * s)}`} delay={260} />
			</g>
			{/* Little five-dot flower studs along the border. */}
			{[
				[5.5, bb + 40 * s],
				[5.5, h - 34 * s],
				[w * 0.56 + 6, h - 5.5],
				[w - 5.5, 154 * s],
			].map(([x, y], i) => (
				<At key={i} x={x} y={y}>
					<PopIn delay={700 + i * 80}>
						<path d={dotsPath([0, 72, 144, 216, 288].map((a) => [...polar(0, 0, 2.2 * s, a - 90), 1.5 * s] as const))} fill={PINK} stroke={INK} strokeWidth={0.4} />
						<circle r={1 * s} fill={POLLEN} />
					</PopIn>
				</At>
			))}

			{/* Banner-edge garland. */}
			<DrawPath d={garland} stroke={ROSE} strokeWidth={1.4} fill="none" delay={380} dur={520} strokeLinecap="round" />
			<path className={fm.runDash} style={tv({dur: 3600, delay: 1400})} d={garland} stroke={PALE} strokeWidth={2} fill="none" strokeLinecap="round" pathLength={1} />
			{garlandBlooms.map((b, i) => (
				<Bloom key={i} f={{x: b.x, y: b.y, r: 5.5 * s, rot: i * 30, tone: 1}} gid={gid} delay={620 + i * 90} />
			))}

			{/* Top-right branches, swaying gently from the corner. */}
			<Loop kind="swing" t={{dur: 4200, delay: 1200, rot: 1.2, origin: '100% 0%'}}>
				<Grow origin="100% 0%" dur={640} delay={60}>
					<Branch pts={limbTop} w0={9 * s} w1={2 * s} />
					<Branch pts={limbSide} w0={8 * s} w1={2 * s} />
					{twigs.map((t, i) => (
						<Branch key={i} pts={t.pts} w0={t.w0} w1={0.8 * s} />
					))}
				</Grow>
				{leavesTR.map(([dx, y, rot, k], i) => (
					<At key={i} x={X(dx)} y={y * s}>
						<PopIn delay={next()}>
							<Leaf size={k * s} rot={rot} />
						</PopIn>
					</At>
				))}
				{budsTR.map(([dx, y, rot], i) => (
					<At key={i} x={X(dx)} y={y * s}>
						<PopIn delay={next()}>
							<Bud r={4 * s} rot={rot} />
						</PopIn>
					</At>
				))}
				{flowersTR.map((f, i) => (
					<Bloom key={i} f={f} gid={gid} delay={next()} />
				))}
			</Loop>

			{/* Top-left sprig. */}
			<Grow origin="0% 50%" dur={520} delay={140}>
				<Branch pts={sprig} w0={6 * s} w1={1.2 * s} />
			</Grow>
			<At x={50 * s} y={9 * s}>
				<PopIn delay={420}>
					<Bud r={3.6 * s} rot={70} />
				</PopIn>
			</At>
			<At x={26 * s} y={16 * s}>
				<PopIn delay={460}>
					<Leaf size={0.7 * s} rot={30} />
				</PopIn>
			</At>
			{flowersTL.map((f, i) => (
				<Bloom key={i} f={f} gid={gid} delay={380 + i * 70} />
			))}

			{/* Fallen petals carpeting the bottom edge. */}
			<FadeIn delay={500} dur={900}>
				{carpet.map((p, i) => (
					<At key={i} x={p.x} y={p.y} r={p.rot}>
						<LoosePetal size={p.size} gid={gid} tone={p.tone} />
					</At>
				))}
			</FadeIn>

			{/* Bottom corners. */}
			<Grow origin="100% 50%" dur={520} delay={420}>
				<Branch pts={limbBottom} w0={7 * s} w1={1.4 * s} />
			</Grow>
			<At x={X(32)} y={h - 22 * s}>
				<PopIn delay={640}>
					<Leaf size={0.8 * s} rot={-150} />
				</PopIn>
			</At>
			{flowersBR.map((f, i) => (
				<Bloom key={i} f={f} gid={gid} delay={600 + i * 80} />
			))}
			{flowersBL.map((f, i) => (
				<Bloom key={i} f={f} gid={gid} delay={680 + i * 80} />
			))}

			{/* Intro: a gust of petals shaken loose from the branch. */}
			{burst.map((p, i) => (
				<Burst key={i} x={burstOrigin[0]} y={burstOrigin[1]} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay} rot={p.rot}>
					<LoosePetal size={1 * s} gid={gid} tone={p.tone} />
				</Burst>
			))}

			{/* Falling petals, tumbling. */}
			{fall.map((p, i) => (
				<Drifter
					key={i}
					x={p.x}
					y={-14}
					dx={p.dx}
					dy={h + 20}
					dur={p.dur}
					delay={p.delay}
					rot={p.rot}
					sway={p.sway}
					sy={p.sy}
					sr={p.sr}
				>
					<Loop kind="flip" t={{dur: p.flip, delay: p.delay}}>
						<LoosePetal size={p.size} gid={gid} tone={p.tone} />
					</Loop>
				</Drifter>
			))}

			{avatar && <AvatarFront avatar={avatar} gid={gid} s={s} />}
		</EffectSvg>
	);
}

function AvatarFront({avatar, gid, s}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; gid: string; s: number}) {
	const {cx, cy, r} = avatar;
	const k = r / 43;
	// A sprig hugging the lower-left of the avatar.
	const arc: Array<Pt> = [100, 122, 144, 166, 184].map((a, i) => polar(cx, cy, r + 4 + (i === 0 || i === 4 ? 0 : 2), a));
	const blooms: Array<Flower> = [
		{x: polar(cx, cy, r + 5, 128)[0], y: polar(cx, cy, r + 5, 128)[1], r: 8.5 * k, rot: 10, tone: 0},
		{x: polar(cx, cy, r + 4, 160)[0], y: polar(cx, cy, r + 4, 160)[1], r: 7 * k, rot: 40, tone: 2},
		{x: polar(cx, cy, r + 6, -62)[0], y: polar(cx, cy, r + 6, -62)[1], r: 7.5 * k, rot: -20, tone: 1},
	];
	const [l1x, l1y] = polar(cx, cy, r + 4, 104);
	const [l2x, l2y] = polar(cx, cy, r + 5, 182);
	const [b1x, b1y] = polar(cx, cy, r + 6, -40);
	const orbit = [0, 90, 180, 270].map((a) => polar(cx, cy, r + 13 * k, a));
	return (
		<g>
			<DrawPath
				d={`M${arc.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L')}`}
				stroke={BARK}
				strokeWidth={2.6 * k}
				fill="none"
				strokeLinecap="round"
				strokeLinejoin="round"
				delay={420}
			/>
			<At x={l1x} y={l1y}>
				<PopIn delay={560}>
					<Leaf size={0.75 * k} rot={70} />
				</PopIn>
			</At>
			<At x={l2x} y={l2y}>
				<PopIn delay={600}>
					<Leaf size={0.7 * k} rot={-120} />
				</PopIn>
			</At>
			<At x={b1x} y={b1y}>
				<PopIn delay={640}>
					<Bud r={3.6 * k} rot={50} />
				</PopIn>
			</At>
			{blooms.map((f, i) => (
				<Bloom key={i} f={f} gid={gid} delay={520 + i * 90} />
			))}
			{/* Petals swirling around the avatar. */}
			<g className={fm.slowSpin} style={tv({dur: 16000})}>
				<circle cx={cx} cy={cy} r={r + 13 * k} fill="none" />
				{orbit.map(([x, y], i) => (
					<At key={i} x={x} y={y} r={i * 90 + 30}>
						<Loop kind="flip" t={{dur: 1100 + i * 260, delay: i * 200}}>
							<LoosePetal size={(i % 2 ? 0.8 : 1) * s * 0.95} gid={gid} tone={(i % 3) as 0 | 1 | 2} />
						</Loop>
					</At>
				))}
			</g>
		</g>
	);
}

function Back({geometry, radius, idPrefix}: {geometry: ProfileEffectGeometry; radius: number; idPrefix: string}) {
	const {width: w, height: h, avatar} = geometry;
	const {s, back} = useLayout(geometry);
	const gid = idPrefix;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="back"
			defs={
				<>
					<PetalDefs gid={gid} />
					<TextureDefs id={`${gid}-b`} color="#ff9cc0" />
					<linearGradient id={`${gid}-floor`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={PINK} stopOpacity={0} />
						<stop offset="1" stopColor={PINK} stopOpacity={0.22} />
					</linearGradient>
				</>
			}
		>
			<FadeIn dur={900}>
				<Rim w={w} h={h} radius={radius} color={PINK} />
				<rect x={0} y={h - 70 * s} width={w} height={70 * s} fill={`url(#${gid}-floor)`} />
				<TexturePatch id={`${gid}-b`} x={-60 * s} y={h - 90 * s} w={150 * s} h={150 * s} opacity={0.28} />
				<TexturePatch id={`${gid}-b`} x={w - 100 * s} y={h * 0.38} w={160 * s} h={170 * s} opacity={0.2} fine />
				{/* Big line-art blossoms behind the content, like a printed pattern on the card. */}
				{(
					[
						[w + 6 * s, h * 0.58, 4.2 * s, 12],
						[-4 * s, h * 0.78, 3.4 * s, -20],
					] as const
				).map(([x, y, k, rot], i) => (
					<At key={i} x={x} y={y} r={rot} s={k}>
						<g fill="none" stroke={PINK} strokeWidth={0.9 / k} opacity={0.22}>
							{[0, 72, 144, 216, 288].map((a) => (
								<path key={a} d={PETAL} transform={`rotate(${a}) translate(0 -1)`} />
							))}
							<circle r={2.4} />
						</g>
					</At>
				))}
			</FadeIn>
			{back.map((p, i) => (
				<Drifter
					key={i}
					x={p.x}
					y={-20}
					dx={p.dx}
					dy={h + 40}
					dur={p.dur}
					delay={p.delay}
					rot={p.rot}
					sway={p.sway}
					sy={p.sy}
					sr={p.sr}
				>
					<path d={LOOSE} transform={`scale(${p.size.toFixed(2)})`} fill={PINK} opacity={0.28} />
				</Drifter>
			))}
			{avatar && (
				<FadeIn delay={200} dur={700}>
					<g className={fm.slowSpin} style={tv({dur: 30000})}>
						<circle
							cx={avatar.cx}
							cy={avatar.cy}
							r={avatar.r + 4}
							fill="none"
							stroke={PINK}
							strokeWidth={2.2}
							strokeDasharray="16 5 3 5"
							strokeLinecap="round"
						/>
					</g>
					<g className={fm.spinRev} style={tv({dur: 40000})}>
						<circle
							cx={avatar.cx}
							cy={avatar.cy}
							r={avatar.r + 8.5}
							fill="none"
							stroke={BLUSH}
							strokeWidth={1.2}
							strokeDasharray="1 6"
							strokeLinecap="round"
						/>
					</g>
				</FadeIn>
			)}
		</EffectSvg>
	);
}

export const SakuraDrift: ProfileEffectLayer = ({layer, ...props}) =>
	layer === 'front' ? <Front {...props} /> : <Back {...props} />;
