// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	between,
	EffectSvg,
	FadeIn,
	PopIn,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	bannerBottomOf,
	polar,
	scaleFor,
	seeded,
	Twinkle,
} from '@app/features/user/components/profile_effects/effectKit';
import {
	At,
	DrawPath,
	dotsPath,
	f1,
	fm,
	Loop,
	type Pt,
	Rim,
	roundRectPath,
	smoothClosed,
	sparklePath,
	TextureDefs,
	TexturePatch,
	tv,
} from '@app/features/user/components/profile_effects/frameKit';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Starlight" — a cosmic frame: nebula clouds bloom in the corners, a crescent moon hangs in the top-right, a ringed
 * planet peeks from the top-left, constellations draw themselves along the edges, detailed four-point stars twinkle,
 * shooting stars streak across the banner and little stars orbit the avatar.
 */

const INK = '#0c0a2c';
const INDIGO = '#2a2180';
const VIOLET = '#7a5cff';
const LILAC = '#b9a8ff';
const PINK = '#ff7ad9';
const CYAN = '#62d8ff';
const GOLD = '#ffd66b';
const STAR = '#fff7dc';
const MOON = '#fff0b8';
const MOON_SHADE = '#f2c25e';

type IdProps = {geometry: ProfileEffectGeometry; radius: number; idPrefix: string};

/** A detailed four-point star: gold body with ink outline and a white-hot inner star. */
const Star4: React.FC<{r: number; color?: string}> = ({r, color = GOLD}) => (
	<g>
		<path d={sparklePath(r, 0.2)} fill={color} stroke={INK} strokeWidth={Math.max(0.5, r * 0.08)} strokeLinejoin="round" />
		<path d={sparklePath(r * 0.55, 0.22)} fill={STAR} />
		<circle r={r * 0.12} fill="#ffffff" />
	</g>
);

/** A puffy nebula cloud around (0,0): jittered blob, `size` across. */
function cloud(rand: () => number, size: number, lumps = 9): string {
	const pts: Array<Pt> = [];
	for (let i = 0; i < lumps; i++) {
		const a = (i / lumps) * Math.PI * 2;
		const r = (size / 2) * between(rand, 0.62, 1);
		pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.78]);
	}
	return smoothClosed(pts);
}

function crescent(R: number): string {
	// Moon disc minus an offset disc.
	const r2 = R * 0.86;
	const dx = -R * 0.5;
	const dy = -R * 0.22;
	const d = Math.hypot(dx, dy);
	const a = (R * R - r2 * r2 + d * d) / (2 * d);
	const hh = Math.sqrt(Math.max(0, R * R - a * a));
	const px = (a * dx) / d;
	const py = (a * dy) / d;
	const i1: Pt = [px + (hh * -dy) / d, py + (hh * dx) / d];
	const i2: Pt = [px - (hh * -dy) / d, py - (hh * dx) / d];
	return `M${f1(i1[0])},${f1(i1[1])} A${f1(R)},${f1(R)} 0 1 0 ${f1(i2[0])},${f1(i2[1])} A${f1(r2)},${f1(r2)} 0 0 1 ${f1(i1[0])},${f1(i1[1])} Z`;
}

const Moon: React.FC<{R: number; gid: string}> = ({R, gid}) => (
	<g>
		{[2.1, 1.7, 1.38].map((k, i) => (
			<circle key={k} r={R * k} fill={MOON} opacity={[0.05, 0.08, 0.12][i]} />
		))}
		<path d={crescent(R)} fill={`url(#${gid}-moon)`} stroke={INK} strokeWidth={1.2} strokeLinejoin="round" />
		<path d={dotsPath([[R * 0.55, R * 0.25, R * 0.12], [R * 0.3, R * 0.62, R * 0.08], [R * 0.7, -R * 0.2, R * 0.07]])} fill={MOON_SHADE} />
		<path
			d={`M${f1(R * 0.82)},${f1(-R * 0.35)} A${f1(R * 0.9)},${f1(R * 0.9)} 0 0 1 ${f1(R * 0.2)},${f1(R * 0.84)}`}
			stroke="#ffffff"
			strokeWidth={Math.max(0.8, R * 0.07)}
			fill="none"
			strokeLinecap="round"
			opacity={0.8}
		/>
	</g>
);

const Planet: React.FC<{R: number; gid: string}> = ({R, gid}) => (
	<g>
		<path
			d={`M${f1(-R * 1.9)},${f1(R * 0.1)} A${f1(R * 1.9)},${f1(R * 0.55)} 0 0 0 ${f1(R * 1.9)},${f1(-R * 0.1)}`}
			transform="rotate(-18)"
			stroke={INK}
			strokeWidth={R * 0.34}
			fill="none"
		/>
		<circle r={R} fill={`url(#${gid}-planet)`} stroke={INK} strokeWidth={1.1} />
		<path d={`M${f1(-R * 0.9)},${f1(-R * 0.25)} Q0,${f1(-R * 0.05)} ${f1(R * 0.92)},${f1(-R * 0.4)}`} stroke={PINK} strokeWidth={R * 0.14} fill="none" opacity={0.7} />
		<path d={`M${f1(-R * 0.6)},${f1(-R * 0.62)} A${f1(R * 0.75)},${f1(R * 0.75)} 0 0 1 ${f1(R * 0.3)},${f1(-R * 0.78)}`} stroke="#ffffff" strokeWidth={R * 0.12} fill="none" strokeLinecap="round" opacity={0.85} />
		<path
			d={`M${f1(-R * 1.9)},${f1(R * 0.1)} A${f1(R * 1.9)},${f1(R * 0.55)} 0 0 0 ${f1(R * 1.9)},${f1(-R * 0.1)}`}
			transform="rotate(-18)"
			stroke={GOLD}
			strokeWidth={R * 0.18}
			fill="none"
		/>
	</g>
);

/** A shooting star travelling by (dx, dy), repeating every `dur`. */
const ShootingStar: React.FC<{x: number; y: number; dx: number; dy: number; dur: number; delay: number; len: number; gid: string}> = ({
	x,
	y,
	dx,
	dy,
	dur,
	delay,
	len,
	gid,
}) => {
	const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
	return (
		<At x={x} y={y}>
			<g className={fm.shoot} style={tv({dur, delay, dx, dy})}>
				<g transform={`rotate(${f1(angle)})`}>
					<path d={`M0,-2.2 L${f1(-len)},0 L0,2.2 Z`} fill={`url(#${gid}-tail)`} />
					<At x={0} y={0} r={-angle}>
						<Star4 r={6} color={STAR} />
					</At>
				</g>
			</g>
		</At>
	);
};

function Defs({gid}: {gid: string}) {
	return (
		<>
			<linearGradient id={`${gid}-nightTop`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={INK} stopOpacity={0.75} />
				<stop offset="1" stopColor={INK} stopOpacity={0} />
			</linearGradient>
			<linearGradient id={`${gid}-nightLeft`} x1="0" y1="0" x2="1" y2="0">
				<stop offset="0" stopColor={INK} stopOpacity={0.6} />
				<stop offset="1" stopColor={INK} stopOpacity={0} />
			</linearGradient>
			<linearGradient id={`${gid}-nightRight`} x1="1" y1="0" x2="0" y2="0">
				<stop offset="0" stopColor={INK} stopOpacity={0.6} />
				<stop offset="1" stopColor={INK} stopOpacity={0} />
			</linearGradient>
			<linearGradient id={`${gid}-moon`} x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#fffbe6" />
				<stop offset="0.55" stopColor={MOON} />
				<stop offset="1" stopColor={MOON_SHADE} />
			</linearGradient>
			<linearGradient id={`${gid}-planet`} x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor={CYAN} />
				<stop offset="1" stopColor={VIOLET} />
			</linearGradient>
			<linearGradient id={`${gid}-tail`} x1="1" y1="0" x2="0" y2="0">
				<stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
				<stop offset="0.3" stopColor={CYAN} stopOpacity={0.6} />
				<stop offset="1" stopColor={VIOLET} stopOpacity={0} />
			</linearGradient>
		</>
	);
}

/** A nebula: three overlapping illustrated clouds with fine outlines. */
const Nebula: React.FC<{x: number; y: number; size: number; seed: number; delay: number; flip?: boolean}> = ({
	x,
	y,
	size,
	seed,
	delay,
	flip,
}) => {
	const rand = seeded(seed);
	const layers = [
		{d: cloud(rand, size), color: INDIGO, o: 0.95, dx: 0, dy: 0},
		{d: cloud(rand, size * 0.78), color: VIOLET, o: 0.85, dx: -size * 0.08, dy: size * 0.08},
		{d: cloud(rand, size * 0.5), color: PINK, o: 0.7, dx: -size * 0.16, dy: size * 0.16},
		{d: cloud(rand, size * 0.34), color: CYAN, o: 0.65, dx: size * 0.06, dy: size * 0.02},
	];
	const sprinkle = Array.from({length: 12}, () => [between(rand, -size * 0.4, size * 0.3), between(rand, -size * 0.3, size * 0.3), between(rand, 0.5, 1.2)] as const);
	const swirl = `M${f1(-size * 0.36)},${f1(size * 0.1)} C${f1(-size * 0.2)},${f1(-size * 0.12)} ${f1(size * 0.1)},${f1(-size * 0.1)} ${f1(size * 0.18)},${f1(size * 0.08)}`;
	return (
		<At x={x} y={y} sx={flip ? -1 : 1} s={1}>
			<FadeIn delay={delay} dur={800}>
				{layers.map((l, i) => (
					<path
						key={i}
						d={l.d}
						transform={`translate(${f1(l.dx)} ${f1(l.dy)})`}
						fill={l.color}
						opacity={l.o}
						stroke={i === 0 ? INK : i === 1 ? LILAC : '#ffffff'}
						strokeWidth={i === 0 ? 1.2 : 0.7}
						strokeOpacity={i === 0 ? 1 : 0.6}
					/>
				))}
				<path d={swirl} stroke="#ffffff" strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.55} />
				<path d={dotsPath(sprinkle)} fill={STAR} />
			</FadeIn>
		</At>
	);
};

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	const bb = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x57a2);
		const twinklers = [
			[w * 0.52, 14 * s, 5],
			[w * 0.7, 30 * s, 4],
			[w - 74 * s, 70 * s, 6.5],
			[w - 12 * s, 112 * s, 4.5],
			[12 * s, bb + 64 * s, 4.5],
			[w - 16 * s, h * 0.55, 5.5],
			[14 * s, h * 0.7, 6],
			[w * 0.42, h - 12 * s, 4.5],
			[w - 52 * s, h - 20 * s, 6.5],
			[86 * s, 10 * s, 4],
		].map(([x, y, r]) => ({x, y, r: r * s, dur: between(rand, 2000, 3600), delay: between(rand, 0, 2200)}));
		const dust = Array.from({length: 60}, () => {
			const edge = rand();
			const x = edge < 0.5 ? (rand() < 0.5 ? between(rand, 0, w * 0.14) : w - between(rand, 0, w * 0.14)) : between(rand, 0, w);
			const y = edge < 0.5 ? between(rand, 0, h) : rand() < 0.6 ? between(rand, 0, bb) : between(rand, h - 40 * s, h);
			return [x, y, between(rand, 0.4, 1.1) * s] as const;
		});
		return {s, bb, twinklers, dust};
	}, [w, h, bb]);
}

function Constellation({pts, delay}: {pts: ReadonlyArray<Pt>; delay: number}) {
	const d = `M${pts.map(([x, y]) => `${f1(x)},${f1(y)}`).join(' L')}`;
	return (
		<g>
			<DrawPath d={d} stroke={LILAC} strokeWidth={0.9} fill="none" strokeDasharray="none" delay={delay} dur={900} opacity={0.8} />
			{pts.map(([x, y], i) => (
				<At key={i} x={x} y={y}>
					<PopIn delay={delay + 120 + i * 120}>
						<circle r={2.4} fill={STAR} stroke={INK} strokeWidth={0.6} />
						<circle r={4.6} fill="none" stroke={LILAC} strokeWidth={0.5} opacity={0.6} />
					</PopIn>
				</At>
			))}
		</g>
	);
}

function Front({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, bb, twinklers, dust} = useLayout(geometry);
	const gid = idPrefix;
	const lineStart = avatar ? avatar.cx + avatar.r + 12 : 14;
	const lineEnd = w - 14;
	const bannerLine = `M${f1(lineStart)},${f1(bb)} H${f1(lineEnd)}`;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={
				<>
					<Defs gid={gid} />
					<TextureDefs id={`${gid}-f`} color={LILAC} fine={STAR} />
				</>
			}
		>
			{/* Night sky darkening toward the card's top and side edges. */}
			<FadeIn dur={700}>
				<rect x={0} y={0} width={w} height={bb * 0.6} fill={`url(#${gid}-nightTop)`} />
				<rect x={0} y={0} width={30 * s} height={bb} fill={`url(#${gid}-nightLeft)`} />
				<rect x={w - 30 * s} y={0} width={30 * s} height={bb} fill={`url(#${gid}-nightRight)`} />
				<path d={dotsPath(dust.filter(([, y]) => y < bb))} fill={STAR} opacity={0.85} />
			</FadeIn>
			{/* Nebulae blooming in the corners. */}
			<Nebula x={w - 8 * s} y={2 * s} size={136 * s} seed={11} delay={0} />
			<Nebula x={-4 * s} y={-6 * s} size={92 * s} seed={23} delay={80} flip />
			<Nebula x={w + 2 * s} y={h + 2 * s} size={110 * s} seed={37} delay={220} />
			<Nebula x={-6 * s} y={h + 6 * s} size={100 * s} seed={41} delay={260} flip />
			<FadeIn dur={800} delay={100}>
				<TexturePatch id={`${gid}-f`} x={w - 130 * s} y={-50 * s} w={170 * s} h={140 * s} opacity={0.45} fine />
				<TexturePatch id={`${gid}-f`} x={-50 * s} y={-40 * s} w={120 * s} h={100 * s} opacity={0.4} fine />
				<TexturePatch id={`${gid}-f`} x={w - 80 * s} y={h - 70 * s} w={120 * s} h={110 * s} opacity={0.35} />
				<TexturePatch id={`${gid}-f`} x={-50 * s} y={h - 70 * s} w={120 * s} h={110 * s} opacity={0.35} />
			</FadeIn>

			{/* Border: lilac outer line, broken gold inner line studded with stars. */}
			<DrawPath d={roundRectPath(1.5, 1.5, w - 3, h - 3, Math.max(0, radius - 1.5))} stroke={LILAC} strokeWidth={1.8} fill="none" dur={800} />
			<g fill="none" stroke={GOLD} strokeWidth={1} opacity={0.85}>
				<DrawPath d={`M5.5,${f1(bb + 46 * s)} V${f1(h * 0.6)}`} delay={160} />
				<DrawPath d={`M${f1(w - 5.5)},${f1(bb + 40 * s)} V${f1(h * 0.46)}`} delay={200} />
				<DrawPath d={`M${f1(80 * s)},${f1(h - 5.5)} H${f1(w * 0.62)}`} delay={240} />
			</g>
			{(
				[
					[5.5, h * 0.6],
					[w - 5.5, h * 0.46],
					[w * 0.62, h - 5.5],
					[5.5, bb + 46 * s],
				] as const
			).map(([x, y], i) => (
				<At key={i} x={x} y={y}>
					<PopIn delay={700 + i * 80}>
						<Star4 r={4.5 * s} />
					</PopIn>
				</At>
			))}

			{/* Banner edge: a fine gold line a comet runs along. */}
			<DrawPath d={bannerLine} stroke={GOLD} strokeWidth={1} fill="none" delay={380} opacity={0.8} />
			<path className={fm.runDash} style={tv({dur: 3400, delay: 1500})} d={bannerLine} stroke={STAR} strokeWidth={2} fill="none" strokeLinecap="round" pathLength={1} />
			{[0.36, 0.72].map((t, i) => (
				<At key={i} x={lineStart + (lineEnd - lineStart) * t} y={bb}>
					<PopIn delay={760 + i * 90}>
						<Star4 r={3.6 * s} color={LILAC} />
					</PopIn>
				</At>
			))}

			{/* Constellations drawing themselves along the right edge and bottom-left. */}
			<Constellation
				delay={500}
				pts={[
					[w - 14 * s, bb + 70 * s],
					[w - 30 * s, bb + 92 * s],
					[w - 18 * s, bb + 116 * s],
					[w - 34 * s, bb + 140 * s],
					[w - 16 * s, bb + 160 * s],
				]}
			/>
			<Constellation
				delay={800}
				pts={[
					[16 * s, h - 72 * s],
					[34 * s, h - 54 * s],
					[22 * s, h - 34 * s],
					[48 * s, h - 22 * s],
					[70 * s, h - 30 * s],
				]}
			/>

			{/* Set-pieces: crescent moon (top-right) and a ringed planet (top-left). */}
			<At x={w - 50 * s} y={40 * s}>
				<PopIn delay={200} dur={560}>
					<Loop kind="bob" t={{dur: 3200, dy: 2}}>
						<Moon R={20 * s} gid={gid} />
					</Loop>
				</PopIn>
			</At>
			<At x={30 * s} y={22 * s}>
				<PopIn delay={320} dur={520}>
					<Loop kind="bob" t={{dur: 3800, delay: 600, dy: 1.6}}>
						<Planet R={8.5 * s} gid={gid} />
					</Loop>
				</PopIn>
			</At>

			{/* Bright compound stars anchoring the corners. */}
			{(
				[
					[w - 96 * s, 18 * s, 11, 300],
					[w - 30 * s, h - 46 * s, 10, 520],
					[64 * s, 34 * s, 7, 420],
					[14 * s, h - 20 * s, 7.5, 640],
				] as const
			).map(([x, y, r, delay], i) => (
				<At key={i} x={x} y={y}>
					<PopIn delay={delay} dur={520}>
						<Loop kind="breathe" t={{dur: 1800 + i * 300, delay: i * 400}}>
							<circle r={r * 1.5 * s} fill={GOLD} opacity={0.12} />
							<At x={0} y={0} r={45}>
								<Star4 r={r * 0.6 * s} color={LILAC} />
							</At>
							<Star4 r={r * s} />
						</Loop>
					</PopIn>
				</At>
			))}

			{/* Twinkling stars. */}
			{twinklers.map((t, i) => (
				<Twinkle key={i} x={t.x} y={t.y} dur={t.dur} delay={t.delay}>
					<Star4 r={t.r} color={i % 3 === 1 ? LILAC : GOLD} />
				</Twinkle>
			))}

			{/* Shooting stars across the banner. */}
			<ShootingStar x={w * 0.3} y={6 * s} dx={w * 0.5} dy={50 * s} dur={6400} delay={1600} len={60 * s} gid={gid} />
			<ShootingStar x={w * 0.95} y={bb + 30 * s} dx={-w * 0.4} dy={60 * s} dur={9000} delay={4800} len={50 * s} gid={gid} />

			{avatar && <AvatarFront avatar={avatar} />}
		</EffectSvg>
	);
}

function AvatarFront({avatar}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>}) {
	const {cx, cy, r} = avatar;
	const k = r / 43;
	const orbit = r + 10 * k;
	return (
		<g>
			<DrawPath
				d={`M${polar(cx, cy, r + 4, 150).map(f1).join(',')} A${r + 4},${r + 4} 0 0 1 ${polar(cx, cy, r + 4, 232).map(f1).join(',')}`}
				stroke={GOLD}
				strokeWidth={1.8}
				fill="none"
				strokeLinecap="round"
				delay={420}
			/>
			<DrawPath
				d={`M${polar(cx, cy, r + 4, 268).map(f1).join(',')} A${r + 4},${r + 4} 0 0 1 ${polar(cx, cy, r + 4, 300).map(f1).join(',')}`}
				stroke={LILAC}
				strokeWidth={1.8}
				fill="none"
				strokeLinecap="round"
				delay={520}
			/>
			<g className={fm.slowSpin} style={tv({dur: 12000})}>
				<circle cx={cx} cy={cy} r={orbit} fill="none" />
				{[
					[20, 5, GOLD],
					[150, 3.6, LILAC],
					[262, 4.4, STAR],
				].map(([a, size, color]) => {
					const [x, y] = polar(cx, cy, orbit, a as number);
					return (
						<At key={a as number} x={x} y={y}>
							<Star4 r={(size as number) * k} color={color as string} />
						</At>
					);
				})}
			</g>
		</g>
	);
}

function Back({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, dust} = useLayout(geometry);
	const gid = idPrefix;
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="back"
			defs={
				<>
					<TextureDefs id={`${gid}-b`} color={VIOLET} />
					<linearGradient id={`${gid}-sky`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={INDIGO} stopOpacity={0} />
						<stop offset="1" stopColor={INDIGO} stopOpacity={0.5} />
					</linearGradient>
				</>
			}
		>
			<FadeIn dur={900}>
				<Rim w={w} h={h} radius={radius} color={VIOLET} strength={1.4} />
				<rect x={0} y={h * 0.6} width={w} height={h * 0.4} fill={`url(#${gid}-sky)`} />
				<TexturePatch id={`${gid}-b`} x={w - 110 * s} y={h * 0.28} w={170 * s} h={190 * s} opacity={0.22} fine />
				<TexturePatch id={`${gid}-b`} x={-60 * s} y={h * 0.45} w={150 * s} h={170 * s} opacity={0.2} />
				<path d={dotsPath(dust)} fill={STAR} opacity={0.55} />
				{/* A faint galaxy swirl behind the content. */}
				<g transform={`translate(${f1(w * 0.92)} ${f1(h * 0.62)}) rotate(-20)`} fill="none" stroke={LILAC} opacity={0.14}>
					<ellipse rx={70 * s} ry={22 * s} strokeWidth={6 * s} />
					<ellipse rx={46 * s} ry={14 * s} strokeWidth={4 * s} />
					<ellipse rx={20 * s} ry={7 * s} fill={LILAC} strokeWidth={0} />
				</g>
			</FadeIn>
			{avatar && (
				<FadeIn delay={200} dur={700}>
					<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 10 * (avatar.r / 43)} fill="none" stroke={LILAC} strokeWidth={0.8} strokeDasharray="2 4" opacity={0.6} />
					<g className={fm.spinRev} style={tv({dur: 40000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 4} fill="none" stroke={VIOLET} strokeWidth={2.2} strokeDasharray="20 5 3 5" />
					</g>
				</FadeIn>
			)}
		</EffectSvg>
	);
}

export const Starlight: ProfileEffectLayer = ({layer, ...props}) =>
	layer === 'front' ? <Front {...props} /> : <Back {...props} />;
