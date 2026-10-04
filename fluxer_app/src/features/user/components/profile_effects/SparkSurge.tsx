// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/profile_effects/ProfileEffect.module.css';
import {clsx} from 'clsx';
import type React from 'react';

/**
 * "Spark Surge" — Delight's first profile effect. A comic-style neon frame: jagged pink/cyan/yellow flares on the top
 * corners, halftone dots, flickering lightning bolts and popping diamond sparks, a lightning streak along the
 * banner's bottom edge and a spark ring around the avatar. Drawn in the card's own pixel space so nothing stretches.
 */

const PINK = '#ff2bd6';
const CYAN = '#3df5e0';
const YELLOW = '#ffd23f';
const VIOLET = '#7b2ff2';
const INK = '#1a0b33';

export interface SparkSurgeGeometry {
	width: number;
	height: number;
	bannerBottom: number | null;
	avatar: {cx: number; cy: number; r: number} | null;
}

interface SparkSurgeLayerProps {
	layer: 'front' | 'back';
	geometry: SparkSurgeGeometry;
	radius: number;
	idPrefix: string;
}

// A corner flare in local space: a comic starburst exploding out of the corner at (0,0), spikes fanning from the top
// edge (0°) to the side edge (90°). [angle, radius] pairs alternate long spike tips and short valleys.
const FLARE_RAYS: ReadonlyArray<readonly [number, number]> = [
	[0, 86],
	[7, 30],
	[15, 66],
	[24, 27],
	[34, 52],
	[44, 24],
	[54, 47],
	[64, 25],
	[74, 60],
	[82, 24],
	[90, 58],
];

function burstPath(scale: number): string {
	const points = FLARE_RAYS.map(([angle, radius]) => {
		const radians = (angle * Math.PI) / 180;
		return `${(Math.cos(radians) * radius * scale).toFixed(1)},${(Math.sin(radians) * radius * scale).toFixed(1)}`;
	});
	return `M0,0 L${points.join(' L')} Z`;
}

const FLARE_OUTER = burstPath(1);
const FLARE_MID = burstPath(0.74);
const FLARE_INNER = burstPath(0.44);
// A lightning bolt, ~18×34, pointing down.
const BOLT = 'M11,0 L1,18 L8,18 L3,34 L17,13 L10,13 L15,0 Z';
const SMALL_BOLT = 'M6,0 L0,10 L4,10 L1,19 L9,7 L5,7 L8,0 Z';
const STAR = 'M0,-6 C0.5,-1.4 1.4,-0.5 6,0 C1.4,0.5 0.5,1.4 0,6 C-0.5,1.4 -1.4,0.5 -6,0 C-1.4,-0.5 -0.5,-1.4 0,-6 Z';
const DIAMOND = 'M0,-5 L3,0 L0,5 L-3,0 Z';

function polar(cx: number, cy: number, r: number, degrees: number): [number, number] {
	const radians = (degrees * Math.PI) / 180;
	return [cx + r * Math.cos(radians), cy + r * Math.sin(radians)];
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
	const [x1, y1] = polar(cx, cy, r, from);
	const [x2, y2] = polar(cx, cy, r, to);
	const large = to - from > 180 ? 1 : 0;
	return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
}

/** Zig-zag "electric" run along a straight segment. */
function zigzag(x1: number, y1: number, x2: number, y2: number, amplitude: number, teeth: number): string {
	const dx = (x2 - x1) / teeth;
	const dy = (y2 - y1) / teeth;
	const length = Math.hypot(x2 - x1, y2 - y1) || 1;
	const nx = (-(y2 - y1) / length) * amplitude;
	const ny = ((x2 - x1) / length) * amplitude;
	let d = `M${x1},${y1}`;
	for (let i = 1; i <= teeth; i++) {
		const side = i % 2 === 0 ? -1 : 1;
		const px = x1 + dx * (i - 0.5) + nx * side;
		const py = y1 + dy * (i - 0.5) + ny * side;
		d += ` L${px.toFixed(1)},${py.toFixed(1)} L${(x1 + dx * i).toFixed(1)},${(y1 + dy * i).toFixed(1)}`;
	}
	return d;
}

const Flare: React.FC<{x: number; y: number; flip?: boolean; scale: number; delay: number}> = ({
	x,
	y,
	flip,
	scale,
	delay,
}) => (
	<g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
		<g className={styles.flareIntro} style={{animationDelay: `${delay}ms`}}>
			<g className={styles.flareLoop} style={{animationDelay: `${delay + 900}ms`}}>
				<path d={FLARE_OUTER} fill={PINK} stroke={INK} strokeWidth={1.2} strokeLinejoin="miter" />
				<path d={FLARE_MID} fill={VIOLET} stroke={CYAN} strokeWidth={1.4} strokeLinejoin="miter" />
				<path d={FLARE_INNER} fill={YELLOW} stroke={INK} strokeWidth={0.8} strokeLinejoin="miter" />
			</g>
		</g>
	</g>
);

const Spark: React.FC<{
	x: number;
	y: number;
	size?: number;
	color: string;
	shape?: 'star' | 'diamond';
	delay: number;
	period?: number;
}> = ({x, y, size = 1, color, shape = 'star', delay, period = 2600}) => (
	<g transform={`translate(${x} ${y}) scale(${size})`}>
		<path
			className={styles.spark}
			d={shape === 'star' ? STAR : DIAMOND}
			fill={color}
			stroke={INK}
			strokeWidth={shape === 'star' ? 0.6 : 0.8}
			style={{animationDelay: `${delay}ms`, animationDuration: `${period}ms`}}
		/>
	</g>
);

const Bolt: React.FC<{
	x: number;
	y: number;
	rotate?: number;
	scale?: number;
	fill: string;
	stroke?: string;
	small?: boolean;
	delay: number;
	className?: string;
}> = ({x, y, rotate = 0, scale = 1, fill, stroke = INK, small, delay, className}) => (
	<g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
		<g className={clsx(styles.boltIntro)} style={{animationDelay: `${delay}ms`}}>
			<path
				className={clsx(styles.bolt, className)}
				d={small ? SMALL_BOLT : BOLT}
				fill={fill}
				stroke={stroke}
				strokeWidth={1}
				strokeLinejoin="miter"
				style={{animationDelay: `${delay + 700}ms`}}
			/>
		</g>
	</g>
);

function HalftoneDefs({idPrefix}: {idPrefix: string}) {
	return (
		<>
			<pattern id={`${idPrefix}-dots`} width={5} height={5} patternUnits="userSpaceOnUse">
				<circle cx={2.5} cy={2.5} r={1.1} fill="#ffffff" />
			</pattern>
			<pattern id={`${idPrefix}-dots-fine`} width={4} height={4} patternUnits="userSpaceOnUse">
				<circle cx={2} cy={2} r={0.75} fill="#ffffff" />
			</pattern>
			<radialGradient id={`${idPrefix}-fade`}>
				<stop offset="0" stopColor="#fff" stopOpacity={1} />
				<stop offset="0.55" stopColor="#fff" stopOpacity={0.55} />
				<stop offset="1" stopColor="#fff" stopOpacity={0} />
			</radialGradient>
			<mask id={`${idPrefix}-fade-mask`} maskContentUnits="objectBoundingBox">
				<rect width={1} height={1} fill={`url(#${idPrefix}-fade)`} />
			</mask>
		</>
	);
}

function FrontLayer({geometry, radius, idPrefix}: Omit<SparkSurgeLayerProps, 'layer'>) {
	const {width: w, height: h, avatar} = geometry;
	const s = Math.min(1.6, Math.max(0.85, w / 300));
	const bannerBottom = geometry.bannerBottom ?? Math.round(h * 0.2);
	// Big cards (the profile modal, the mobile sheet) get extra sparks and accents so the frame isn't sparse.
	const wide = w + h > 900;
	const i = 1.5;
	const r = Math.max(0, radius - i);
	const streakStart = avatar ? avatar.cx + avatar.r + 10 : 14;
	const streakEnd = w - 10;
	const zig = streakStart + (streakEnd - streakStart) * 0.58;
	const streak = `M${streakStart},${bannerBottom} L${zig - 9},${bannerBottom} L${zig - 3},${bannerBottom - 7} L${zig + 1},${bannerBottom + 4} L${zig + 6},${bannerBottom - 4} L${zig + 10},${bannerBottom} L${streakEnd},${bannerBottom}`;
	return (
		<svg className={styles.svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="visible">
			<defs>
				<HalftoneDefs idPrefix={idPrefix} />
				<clipPath id={`${idPrefix}-card`}>
					<rect x={0} y={0} width={w} height={h} rx={radius} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${idPrefix}-card)`}>
				{/* Halftone over the banner's top corners. */}
				<g className={styles.fadeIntro}>
					<g opacity={0.55} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={-70 * s} y={-60 * s} width={150 * s} height={130 * s} fill={`url(#${idPrefix}-dots)`} />
					</g>
					<g opacity={0.45} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect
							x={w - 80 * s}
							y={-60 * s}
							width={150 * s}
							height={130 * s}
							fill={`url(#${idPrefix}-dots-fine)`}
						/>
					</g>
				</g>

				{/* Frame: pink outer line, broken cyan inner line, yellow accents. */}
				<rect
					className={styles.drawIn}
					x={i}
					y={i}
					width={w - i * 2}
					height={h - i * 2}
					rx={r}
					fill="none"
					stroke={PINK}
					strokeWidth={2}
					pathLength={1}
				/>
				<g className={styles.drawIn} style={{animationDelay: '120ms'}}>
					<path
						d={`M5,${bannerBottom + 18} V${h - 34}`}
						stroke={CYAN}
						strokeWidth={1.25}
						fill="none"
						pathLength={1}
					/>
					<path d={`M34,${h - 5} H${w * 0.6}`} stroke={CYAN} strokeWidth={1.25} fill="none" pathLength={1} />
					<path d={`M${w - 5},${70 * s} V${h * 0.46}`} stroke={CYAN} strokeWidth={1.25} fill="none" pathLength={1} />
					<path
						d={`M${w - 5},${h * 0.62} V${h - 48}`}
						stroke={YELLOW}
						strokeWidth={1.5}
						fill="none"
						pathLength={1}
					/>
					<path d={`M${w * 0.68},${h - 5} H${w - 40}`} stroke={YELLOW} strokeWidth={1.5} fill="none" pathLength={1} />
				</g>
				<path
					className={styles.drawIn}
					style={{animationDelay: '200ms'}}
					d={zigzag(i + 0.5, 62 * s, i + 0.5, 62 * s + 34, 3, 5)}
					stroke={YELLOW}
					strokeWidth={1.5}
					fill="none"
					strokeLinejoin="miter"
					pathLength={1}
				/>
				<path
					className={styles.drawIn}
					style={{animationDelay: '260ms'}}
					d={zigzag(w - i - 0.5, h * 0.5, w - i - 0.5, h * 0.5 + 30, 3, 5)}
					stroke={PINK}
					strokeWidth={1.5}
					fill="none"
					strokeLinejoin="miter"
					pathLength={1}
				/>

				{/* Corner flares. */}
				<Flare x={0} y={0} scale={s} delay={60} />
				<Flare x={w} y={0} flip scale={s * 0.9} delay={140} />

				{/* Lightning streak along the banner's bottom edge. */}
				<path
					className={styles.drawIn}
					style={{animationDelay: '300ms', animationDuration: '420ms'}}
					d={streak}
					stroke={PINK}
					strokeWidth={1}
					fill="none"
					transform="translate(0 1.5)"
					pathLength={1}
				/>
				<path
					className={styles.drawIn}
					style={{animationDelay: '260ms', animationDuration: '420ms'}}
					d={streak}
					stroke={CYAN}
					strokeWidth={1.5}
					fill="none"
					strokeLinejoin="miter"
					pathLength={1}
				/>
				<path
					className={styles.streakShimmer}
					d={streak}
					stroke={YELLOW}
					strokeWidth={2}
					fill="none"
					strokeLinecap="round"
					strokeLinejoin="miter"
					pathLength={1}
				/>

				{/* Bottom corner bolts. */}
				<Bolt x={w - 24 * s} y={h - 34 * s} rotate={22} scale={s * 0.8} fill={YELLOW} delay={380} />
				<Bolt x={w - 12 * s} y={h - 22 * s} rotate={-8} scale={s * 0.8} fill={PINK} small delay={460} />
				<Bolt x={6} y={h - 26 * s} rotate={-24} scale={s * 0.9} fill={CYAN} small delay={520} />
				{wide && (
					<>
						{/* A big card gets a bolt pair at the left edge's middle and a zigzag on the bottom edge too. */}
						<Bolt x={4} y={h * 0.5} rotate={-16} scale={s * 0.7} fill={YELLOW} small delay={560} />
						<path
							className={styles.drawIn}
							style={{animationDelay: '320ms'}}
							d={zigzag(w * 0.42, h - i - 0.5, w * 0.42 + 40, h - i - 0.5, 3, 5)}
							stroke={YELLOW}
							strokeWidth={1.5}
							fill="none"
							strokeLinejoin="miter"
							pathLength={1}
						/>
					</>
				)}
			</g>

			{/* Sparks pop around the top corners and edge. */}
			<Spark x={88 * s} y={10 * s} color={YELLOW} delay={500} period={2600} />
			<Spark x={60 * s} y={30 * s} size={0.7} color={CYAN} shape="diamond" delay={1300} period={3100} />
			<Spark x={w - 82 * s} y={12 * s} size={0.85} color={CYAN} delay={900} period={2800} />
			<Spark x={w - 54 * s} y={36 * s} size={0.65} color={PINK} shape="diamond" delay={1900} period={3300} />
			<Spark x={w * 0.5} y={7} size={0.6} color={PINK} delay={2300} period={3600} />
			<Spark x={w - 12} y={h - 56} size={0.65} color={CYAN} shape="diamond" delay={1500} period={2900} />
			<Spark x={16} y={h - 38} size={0.6} color={YELLOW} delay={2700} period={3400} />
			{wide && (
				<>
					<Spark x={w * 0.3} y={9} size={0.7} color={CYAN} shape="diamond" delay={3100} period={3800} />
					<Spark x={w * 0.72} y={8} size={0.75} color={YELLOW} delay={1100} period={3200} />
					<Spark x={12} y={h * 0.62} size={0.7} color={PINK} delay={2000} period={3000} />
					<Spark x={w - 13} y={h * 0.7} size={0.8} color={YELLOW} delay={600} period={3500} />
					<Spark x={w * 0.25} y={h - 11} size={0.65} color={CYAN} delay={3400} period={2900} />
					<Spark x={w * 0.66} y={h - 12} size={0.7} color={PINK} shape="diamond" delay={2400} period={3300} />
				</>
			)}

			{avatar && <AvatarFront avatar={avatar} />}
		</svg>
	);
}

function AvatarFront({avatar}: {avatar: NonNullable<SparkSurgeGeometry['avatar']>}) {
	const {cx, cy, r} = avatar;
	const k = r / 45;
	const [b1x, b1y] = polar(cx, cy, r + 3, -38);
	const [b2x, b2y] = polar(cx, cy, r + 2, 208);
	const [s1x, s1y] = polar(cx, cy, r + 9, -70);
	const [s2x, s2y] = polar(cx, cy, r + 10, 18);
	return (
		<g>
			<path
				className={styles.ringArc}
				d={arcPath(cx, cy, r + 3.5, 196, 268)}
				stroke={PINK}
				strokeWidth={2}
				fill="none"
				strokeLinecap="butt"
				pathLength={1}
			/>
			<path
				className={styles.ringArc}
				style={{animationDelay: '220ms'}}
				d={arcPath(cx, cy, r + 3.5, 290, 330)}
				stroke={YELLOW}
				strokeWidth={2}
				fill="none"
				pathLength={1}
			/>
			<Bolt x={b1x - 4 * k} y={b1y - 14 * k} rotate={28} scale={0.75 * k} fill={YELLOW} delay={540} />
			<Bolt x={b2x - 6 * k} y={b2y - 4 * k} rotate={-30} scale={0.7 * k} fill={CYAN} small delay={620} />
			<Spark x={s1x} y={s1y} size={0.7 * k} color={CYAN} delay={800} period={2400} />
			<Spark x={s2x} y={s2y} size={0.55 * k} color={PINK} shape="diamond" delay={1650} period={2700} />
		</g>
	);
}

/** A filled bolt from points in popout px, placed at (x, y), scaled by s and mirrored when dir is -1. */
function bigBolt(x: number, y: number, s: number, dir: 1 | -1, pts: ReadonlyArray<readonly [number, number]>): string {
	return `M${pts.map(([px, py]) => `${(x + dir * px * s).toFixed(1)},${(y + py * s).toFixed(1)}`).join(' L')} Z`;
}

function BackLayer({geometry, radius, idPrefix}: Omit<SparkSurgeLayerProps, 'layer'>) {
	const {width: w, height: h, avatar} = geometry;
	const s = Math.min(1.6, Math.max(0.85, w / 300));
	return (
		<svg className={styles.svg} width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
			<defs>
				<HalftoneDefs idPrefix={idPrefix} />
				<clipPath id={`${idPrefix}-card-back`}>
					<rect x={0} y={0} width={w} height={h} rx={radius} />
				</clipPath>
			</defs>
			<g clipPath={`url(#${idPrefix}-card-back)`} className={styles.fadeIntro}>
				{/* Halftone patches in the lower corners and along the right edge. */}
				<g opacity={0.3} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={-60 * s} y={h - 70 * s} width={140 * s} height={140 * s} fill={`url(#${idPrefix}-dots)`} />
				</g>
				<g opacity={0.24} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={w - 90 * s} y={h - 80 * s} width={170 * s} height={160 * s} fill={`url(#${idPrefix}-dots-fine)`} />
				</g>
				{/* Big translucent bolts behind the content, like light leaking through the card. */}
				{/* Drawn in popout units and scaled uniformly, so they keep their shape on wide cards. */}
				<path
					d={bigBolt(0, h, s, 1, [[15, -18], [66, -62], [60, -38], [108, -86], [90, -30], [96, -46]])}
					fill={VIOLET}
					opacity={0.16}
				/>
				<path
					d={bigBolt(w, h * 0.32, s, -1, [[4, 0], [60, 47], [39, 47], [78, 94], [4, 31], [24, 31]])}
					fill={PINK}
					opacity={0.08}
				/>
				{w + h > 900 && (
					<path
						d={bigBolt(w * 0.5, h - 6, s, -1, [[0, 0], [-40, -52], [-26, -50], [-66, -104], [-12, -40], [-26, -42]])}
						fill={CYAN}
						opacity={0.05}
					/>
				)}
			</g>
			{avatar && <AvatarBack avatar={avatar} />}
		</svg>
	);
}

function AvatarBack({avatar}: {avatar: NonNullable<SparkSurgeGeometry['avatar']>}) {
	const {cx, cy, r} = avatar;
	const k = r / 45;
	const [b1x, b1y] = polar(cx, cy, r + 2, 28);
	const [b2x, b2y] = polar(cx, cy, r + 1, 128);
	return (
		<g className={styles.fadeIntro}>
			<g className={styles.spin}>
				<circle cx={cx} cy={cy} r={r + 4} fill="none" stroke={PINK} strokeWidth={2} strokeDasharray="14 6 4 6" />
			</g>
			<g className={styles.spinReverse}>
				<circle cx={cx} cy={cy} r={r + 8} fill="none" stroke={CYAN} strokeWidth={1.25} strokeDasharray="3 9 22 9" />
			</g>
			<Bolt x={b1x} y={b1y - 8 * k} rotate={-62} scale={0.95 * k} fill={PINK} delay={420} />
			<Bolt x={b2x - 2 * k} y={b2y} rotate={40} scale={0.8 * k} fill={YELLOW} small delay={500} />
		</g>
	);
}

export const SparkSurgeLayer: React.FC<SparkSurgeLayerProps> = ({layer, ...props}) =>
	layer === 'front' ? <FrontLayer {...props} /> : <BackLayer {...props} />;
