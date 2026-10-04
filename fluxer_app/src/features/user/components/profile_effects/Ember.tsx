// SPDX-License-Identifier: AGPL-3.0-or-later

import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import {
	Burst,
	between,
	Drifter,
	EffectSvg,
	FadeIn,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	bannerBottomOf,
	polar,
	scaleFor,
	seeded,
	vars,
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
	poly,
	Rim,
	roundRectPath,
	smoothOpen,
	TextureDefs,
	TexturePatch,
	tv,
} from '@app/features/user/components/profile_effects/frameKit';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Ember" — a burning frame: layered flames lick up both sides and along the bottom over a bed of glowing coals, the
 * top corners char and smoulder like burning paper, a fuse burns along the banner's edge, flames curl round the
 * avatar's ring, and sparks spiral up past the edges. Heat shimmer wavers near the bottom.
 */

const INK = '#2a0600';
const RED = '#d9261c';
const ORANGE = '#ff7417';
const AMBER = '#ffad1f';
const YELLOW = '#ffe36b';
const HOT = '#fff7cf';
const CHAR = '#1f0b07';
const COAL = '#3d140a';

type IdProps = {geometry: ProfileEffectGeometry; radius: number; idPrefix: string};

/** A flame tongue rooted at (0,0), W wide, H tall, its tip leaning by `lean` (−1 … 1). */
function tongue(W: number, H: number, lean: number): string {
	const tip = lean * H * 0.32;
	return (
		`M${f1(-W / 2)},0 ` +
		`C${f1(-W * 0.62)},${f1(-H * 0.32)} ${f1(-W * 0.12 + tip * 0.2)},${f1(-H * 0.5)} ${f1(-W * 0.16 + tip * 0.55)},${f1(-H * 0.72)} ` +
		`C${f1(-W * 0.18 + tip * 0.8)},${f1(-H * 0.84)} ${f1(tip * 0.9)},${f1(-H * 0.9)} ${f1(tip)},${f1(-H)} ` +
		`C${f1(tip * 0.7 + W * 0.3)},${f1(-H * 0.8)} ${f1(W * 0.36 + tip * 0.2)},${f1(-H * 0.6)} ${f1(W * 0.3 + tip * 0.15)},${f1(-H * 0.4)} ` +
		`C${f1(W * 0.62)},${f1(-H * 0.5)} ${f1(W * 0.6)},${f1(-H * 0.18)} ${f1(W / 2)},0 Z`
	);
}

/** A layered illustrated flame: red outline tongue, orange, amber, white-hot core. */
const Flame: React.FC<{W: number; H: number; lean?: number; dur: number; delay: number}> = ({
	W,
	H,
	lean = 0,
	dur,
	delay,
}) => (
	<g className={motion.flicker} style={vars({dur, delay})}>
		<path d={tongue(W, H, lean)} fill={RED} stroke={INK} strokeWidth={1.1} strokeLinejoin="round" />
		<path d={tongue(W * 0.74, H * 0.76, lean * 0.8)} fill={ORANGE} />
		<path d={tongue(W * 0.5, H * 0.52, lean * 0.6)} fill={AMBER} />
		<path d={tongue(W * 0.26, H * 0.28, lean * 0.4)} fill={HOT} />
	</g>
);

const Spark: React.FC<{r: number}> = ({r}) => (
	<g>
		<circle r={r * 2.4} fill={ORANGE} opacity={0.22} />
		<path d={poly([[0, -r * 1.8], [r * 0.8, 0], [0, r * 1.8], [-r * 0.8, 0]])} fill={YELLOW} stroke={RED} strokeWidth={0.5} />
	</g>
);

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	const bb = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0xe3b0);
		// Flames along the bottom: tall in the corners, low in the middle.
		const bottom: Array<{x: number; W: number; H: number; lean: number; dur: number; delay: number}> = [];
		const count = Math.round(11 * Math.min(1.4, w / 300));
		for (let i = 0; i < count; i++) {
			const t = i / (count - 1);
			const x = t * w;
			const edge = 1 - Math.min(1, Math.min(x, w - x) / (w * 0.34));
			bottom.push({
				x: x + between(rand, -4, 4),
				W: (between(rand, 18, 24) + edge * 10) * s,
				H: (between(rand, 14, 22) + edge * between(rand, 26, 36)) * s,
				lean: (t < 0.5 ? 1 : -1) * edge * 0.5 + between(rand, -0.25, 0.25),
				dur: between(rand, 600, 1000),
				delay: between(rand, 0, 600),
			});
		}
		// Flames licking up the sides, shrinking as they climb.
		const sides: Array<{x: number; y: number; W: number; H: number; rot: number; dur: number; delay: number}> = [];
		for (const side of [0, 1]) {
			for (let j = 0; j < 4; j++) {
				const y = h - (54 + j * 34) * s;
				const size = 1 - j * 0.2;
				sides.push({
					x: side ? w + 3 : -3,
					y,
					W: 16 * size * s,
					H: 34 * size * s,
					rot: side ? -28 : 28,
					dur: between(rand, 650, 1000),
					delay: between(rand, 0, 600),
				});
			}
		}
		const sparks = Array.from({length: 10}, (_, i) => {
			const side = i % 3;
			const x = side === 0 ? between(rand, 6, 40 * s) : side === 1 ? w - between(rand, 6, 40 * s) : between(rand, w * 0.3, w * 0.7);
			return {
				x,
				r: between(rand, 0.9, 1.6) * s,
				dur: between(rand, 3600, 5600),
				delay: 600 + i * 520,
				dx: between(rand, -30, 30),
				dy: -between(rand, h * 0.55, h * 0.95),
				sway: between(rand, 6, 14),
				sy: side === 2 ? -between(rand, 6, 24) : -between(rand, 30, h * 0.6),
			};
		});
		const burst = Array.from({length: 12}, (_, i) => ({
			x: i % 2 ? w - 20 * s : 20 * s,
			dx: (i % 2 ? -1 : 1) * between(rand, 10, 90) * s,
			dy: -between(rand, 80, 220) * s,
			delay: between(rand, 250, 650),
			dur: between(rand, 1200, 1800),
			r: between(rand, 1, 1.8) * s,
		}));
		const coalCount = Math.round(16 * Math.min(1.4, w / 300));
		const coals = Array.from({length: coalCount}, (_, i) => ({
			x: (i / (coalCount - 1)) * w + between(rand, -5, 5),
			rx: between(rand, 8, 13) * s,
			ry: between(rand, 5, 7) * s,
		}));
		return {s, bb, bottom, sides, sparks, burst, coals};
	}, [w, h, bb]);
}

/** Charred, smouldering paper edge over a top corner (local space: corner at 0,0, card to +x/+y). */
function charPath(s: number, big: boolean): {outer: string; glow: string} {
	const k = big ? 1 : 0.72;
	const pts: Array<Pt> = [
		[-4, 96 * k * s],
		[6 * s, 80 * k * s],
		[4 * s, 62 * k * s],
		[16 * s, 50 * k * s],
		[14 * s, 34 * k * s],
		[30 * s, 26 * k * s],
		[34 * s, 12 * k * s],
		[52 * s, 14 * k * s],
		[62 * s, 4 * k * s],
		[80 * s, 8 * k * s],
		[96 * k * s, 2 * s],
		[118 * k * s, -4],
	];
	const edge = poly(pts, false);
	return {outer: `${edge} L-4,-4 Z`, glow: edge};
}

function Front({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const {s, bb, bottom, sides, sparks, burst} = useLayout(geometry);
	const gid = idPrefix;
	const tr = charPath(s, true);
	const tl = charPath(s * 0.8, false);
	const fuseStart = avatar ? avatar.cx + avatar.r + 10 : 12;
	const fuseEnd = w - 12;
	const fusePts: Array<Pt> = [];
	for (let i = 0; i <= 8; i++) {
		const x = fuseStart + ((fuseEnd - fuseStart) * i) / 8;
		fusePts.push([x, bb + (i % 2 ? 1.5 : -1.5) * s]);
	}
	const fuse = smoothOpen(fusePts);
	const fuseFlames = [0.3, 0.62, 0.9].map((t) => fuseStart + (fuseEnd - fuseStart) * t);

	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="front"
			defs={
				<>
					<TextureDefs id={`${gid}-f`} color={AMBER} />
					<linearGradient id={`${gid}-char`} x1="0" y1="0" x2="1" y2="1">
						<stop offset="0" stopColor="#000" />
						<stop offset="0.6" stopColor={CHAR} />
						<stop offset="1" stopColor={COAL} />
					</linearGradient>
				</>
			}
		>
			<FadeIn dur={700}>
				<TexturePatch id={`${gid}-f`} x={w - 160 * s} y={-50 * s} w={200 * s} h={160 * s} opacity={0.35} />
				<TexturePatch id={`${gid}-f`} x={-50 * s} y={-40 * s} w={130 * s} h={110 * s} opacity={0.28} fine />
			</FadeIn>

			{/* Glowing border with heat-cracked inner lines. */}
			<DrawPath d={roundRectPath(1.5, 1.5, w - 3, h - 3, Math.max(0, radius - 1.5))} stroke={ORANGE} strokeWidth={2} fill="none" dur={700} />
			<g fill="none" strokeWidth={1.2} strokeLinejoin="miter">
				<DrawPath d={`M5.5,${f1(bb + 40 * s)} V${f1(h * 0.42)}`} stroke={AMBER} delay={160} />
				<DrawPath d={`M${f1(w - 5.5)},${f1(bb + 26 * s)} V${f1(h * 0.4)}`} stroke={AMBER} delay={200} />
				<DrawPath
					d={`M5.5,${f1(h * 0.42)} l2,6 l-3,5 l2.5,6`}
					stroke={YELLOW}
					delay={260}
				/>
				<DrawPath d={`M${f1(w - 5.5)},${f1(h * 0.4)} l-2,6 l3,5 l-2.5,6`} stroke={YELLOW} delay={300} />
			</g>

			{/* Charred, smouldering top corners. */}
			<g transform={`translate(${w} 0) scale(-1 1)`}>
				<Grow origin="0% 0%" dur={560} delay={60}>
					<path d={tr.outer} fill={`url(#${gid}-char)`} stroke={INK} strokeWidth={1} />
					<g className={fm.breathe} style={tv({dur: 1600, delay: 900})}>
						<path d={tr.glow} fill="none" stroke={ORANGE} strokeWidth={3.2} strokeLinejoin="round" />
						<path d={tr.glow} fill="none" stroke={YELLOW} strokeWidth={1.2} strokeLinejoin="round" />
					</g>
					<path d={dotsPath([[20 * s, 14 * s, 1.4 * s], [10 * s, 30 * s, 1 * s], [40 * s, 6 * s, 1.1 * s], [6 * s, 52 * s, 1.2 * s]])} fill={ORANGE} opacity={0.8} />
				</Grow>
			</g>
			<Grow origin="0% 0%" dur={560} delay={120}>
				<path d={tl.outer} fill={`url(#${gid}-char)`} stroke={INK} strokeWidth={1} />
				<g className={fm.breathe} style={tv({dur: 1900, delay: 1100})}>
					<path d={tl.glow} fill="none" stroke={ORANGE} strokeWidth={3} strokeLinejoin="round" />
					<path d={tl.glow} fill="none" stroke={YELLOW} strokeWidth={1.1} strokeLinejoin="round" />
				</g>
			</Grow>
			{/* Small flames burning on the charred edge. */}
			{(
				[
					[w - 52 * s, 14 * s, 13, 26, -0.4],
					[w - 30 * s, 26 * s, 11, 20, -0.2],
					[w - 14 * s, 50 * s, 10, 18, 0.1],
					[34 * s * 0.8, 9 * s * 0.8, 9, 16, 0.3],
				] as const
			).map(([x, y, W, H, lean], i) => (
				<At key={i} x={x} y={y}>
					<Grow origin="50% 100%" delay={380 + i * 70} dur={420}>
						<Flame W={W * s} H={H * s} lean={lean} dur={700 + i * 90} delay={i * 130} />
					</Grow>
				</At>
			))}

			{/* A fuse burning along the banner's edge. */}
			<DrawPath d={fuse} stroke={INK} strokeWidth={3.6 * s} fill="none" strokeLinecap="round" delay={420} dur={500} />
			<DrawPath d={fuse} stroke={ORANGE} strokeWidth={2 * s} fill="none" strokeLinecap="round" delay={420} dur={500} />
			<path className={fm.runDash} style={tv({dur: 2800, delay: 1200})} d={fuse} stroke={HOT} strokeWidth={2.4 * s} fill="none" strokeLinecap="round" pathLength={1} />
			{fuseFlames.map((x, i) => (
				<At key={i} x={x} y={bb}>
					<Grow origin="50% 100%" delay={700 + i * 90} dur={380}>
						<Flame W={8 * s} H={(13 - i * 2) * s} lean={0.2} dur={560 + i * 80} delay={i * 170} />
					</Grow>
				</At>
			))}

			{/* Side flames. */}
			{sides.map((f, i) => (
				<At key={i} x={f.x} y={f.y} r={f.rot}>
					<Grow origin="50% 100%" delay={300 + (i % 4) * 80} dur={460}>
						<Flame W={f.W} H={f.H} lean={0} dur={f.dur} delay={f.delay} />
					</Grow>
				</At>
			))}

			{/* Coal bed and the flames along the bottom. */}
			<CoalBed geometry={geometry} />
			{bottom.map((f, i) => (
				<At key={i} x={f.x} y={h + 2}>
					<Grow origin="50% 100%" delay={140 + Math.abs(i - bottom.length / 2) * -30 + bottom.length * 20} dur={520}>
						<Flame W={f.W} H={f.H} lean={f.lean} dur={f.dur} delay={f.delay} />
					</Grow>
				</At>
			))}

			{/* Intro: sparks thrown up from the corners. */}
			{burst.map((p, i) => (
				<Burst key={i} x={p.x} y={h - 20 * s} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay}>
					<Spark r={p.r} />
				</Burst>
			))}

			{/* Sparks spiralling upwards. */}
			{sparks.map((p, i) => (
				<Drifter key={i} x={p.x} y={h - 14 * s} dx={p.dx} dy={p.dy} dur={p.dur} delay={p.delay} sway={p.sway} swayDur={700} sy={p.sy} rot={180}>
					<Spark r={p.r} />
				</Drifter>
			))}

			{avatar && <AvatarFront avatar={avatar} />}
		</EffectSvg>
	);
}

function CoalBed({geometry}: {geometry: ProfileEffectGeometry}) {
	const {height: h} = geometry;
	const {s, coals} = useLayout(geometry);
	return (
		<FadeIn dur={500}>
			{coals.map((c, i) => (
				<ellipse key={i} cx={c.x} cy={h - 1} rx={c.rx} ry={c.ry} fill={COAL} stroke={INK} strokeWidth={1} />
			))}
			<g className={fm.breathe} style={tv({dur: 1400})}>
				{coals.map((c, i) => (
					<path
						key={i}
						d={`M${f1(c.x - c.rx * 0.6)},${f1(h - c.ry * 0.3)} l${f1(c.rx * 0.3)},${f1(-c.ry * 0.4)} l${f1(c.rx * 0.3)},${f1(c.ry * 0.3)} l${f1(c.rx * 0.35)},${f1(-c.ry * 0.5)}`}
						stroke={i % 2 ? AMBER : ORANGE}
						strokeWidth={1.3 * s}
						fill="none"
						strokeLinecap="round"
					/>
				))}
			</g>
		</FadeIn>
	);
}

function AvatarFront({avatar}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>}) {
	const {cx, cy, r} = avatar;
	const k = r / 43;
	// Flames curling up the lower-left of the ring, pointing outwards.
	const flames = [
		[132, 12, 22, -30],
		[152, 15, 30, -24],
		[174, 13, 26, -16],
		[196, 10, 18, -8],
		[-48, 9, 15, 24],
		[-30, 7, 11, 34],
	] as const;
	return (
		<g>
			<DrawPath d={`M${polar(cx, cy, r + 3, 122).map(f1).join(',')} A${r + 3},${r + 3} 0 0 1 ${polar(cx, cy, r + 3, 214).map(f1).join(',')}`} stroke={ORANGE} strokeWidth={2.4} fill="none" strokeLinecap="round" delay={400} />
			{flames.map(([a, W, H, tilt], i) => {
				const [x, y] = polar(cx, cy, r + 2, a);
				return (
					<At key={i} x={x} y={y} r={tilt}>
						<Grow origin="50% 100%" delay={520 + i * 70} dur={420}>
							<Flame W={W * k} H={H * k} lean={tilt < 0 ? -0.3 : 0.3} dur={620 + i * 90} delay={i * 120} />
						</Grow>
					</At>
				);
			})}
			<g className={fm.slowSpin} style={tv({dur: 7000})}>
				<circle cx={cx} cy={cy} r={r + 11 * k} fill="none" />
				{[0, 120, 240].map((a) => {
					const [x, y] = polar(cx, cy, r + 11 * k, a);
					return (
						<At key={a} x={x} y={y}>
							<Spark r={1.2 * k} />
						</At>
					);
				})}
			</g>
		</g>
	);
}

function Back({geometry, radius, idPrefix}: IdProps) {
	const {width: w, height: h, avatar} = geometry;
	const s = scaleFor(w);
	const gid = idPrefix;
	const shimmer = (y: number, amp: number) => {
		const pts: Array<Pt> = [];
		for (let i = 0; i <= 10; i++) pts.push([(w / 10) * i, y + (i % 2 ? -amp : amp)]);
		return smoothOpen(pts);
	};
	return (
		<EffectSvg
			geometry={geometry}
			radius={radius}
			idPrefix={idPrefix}
			layer="back"
			defs={
				<>
					<TextureDefs id={`${gid}-b`} color={ORANGE} />
					<linearGradient id={`${gid}-heat`} x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor={RED} stopOpacity={0} />
						<stop offset="0.6" stopColor={RED} stopOpacity={0.14} />
						<stop offset="1" stopColor={ORANGE} stopOpacity={0.42} />
					</linearGradient>
					<radialGradient id={`${gid}-ring`}>
						<stop offset="0.62" stopColor={ORANGE} stopOpacity={0} />
						<stop offset="0.8" stopColor={ORANGE} stopOpacity={0.5} />
						<stop offset="1" stopColor={RED} stopOpacity={0} />
					</radialGradient>
				</>
			}
		>
			<FadeIn dur={900}>
				<Rim w={w} h={h} radius={radius} color={ORANGE} strength={1.3} />
				<rect x={0} y={h * 0.55} width={w} height={h * 0.45} fill={`url(#${gid}-heat)`} />
				<TexturePatch id={`${gid}-b`} x={-60 * s} y={h - 120 * s} w={170 * s} h={180 * s} opacity={0.3} />
				<TexturePatch id={`${gid}-b`} x={w - 110 * s} y={h - 130 * s} w={170 * s} h={190 * s} opacity={0.26} fine />
				{/* Big faint flame silhouettes rising behind the content. */}
				<At x={w * 0.12} y={h + 4}>
					<path d={tongue(70 * s, 150 * s, 0.4)} fill={ORANGE} opacity={0.06} />
				</At>
				<At x={w * 0.9} y={h + 4}>
					<path d={tongue(80 * s, 190 * s, -0.4)} fill={RED} opacity={0.07} />
				</At>
			</FadeIn>
			{/* Heat shimmer. */}
			<g fill="none" stroke={AMBER} strokeWidth={1} strokeLinecap="round">
				<Loop kind="bob" t={{dur: 1300, dy: 2.5}}>
					<path d={shimmer(h - 70 * s, 2.5 * s)} opacity={0.14} />
				</Loop>
				<Loop kind="bob" t={{dur: 1700, delay: 400, dy: 3}}>
					<path d={shimmer(h - 92 * s, 3 * s)} opacity={0.1} />
				</Loop>
			</g>
			{avatar && (
				<FadeIn delay={200} dur={700}>
					<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 16} fill={`url(#${gid}-ring)`} />
					<g className={fm.slowSpin} style={tv({dur: 9000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 4} fill="none" stroke={ORANGE} strokeWidth={2.2} strokeDasharray="18 4 4 4" />
					</g>
					<g className={fm.spinRev} style={tv({dur: 13000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 8} fill="none" stroke={AMBER} strokeWidth={1.2} strokeDasharray="3 8 14 8" />
					</g>
				</FadeIn>
			)}
		</EffectSvg>
	);
}

export const Ember: ProfileEffectLayer = ({layer, ...props}) =>
	layer === 'front' ? <Front {...props} /> : <Back {...props} />;
