// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	arcPath,
	bannerBottomOf,
	between,
	EffectSvg,
	type ProfileEffectGeometry,
	type ProfileEffectLayer,
	polar,
	scaleFor,
	seeded,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import motion from '@app/features/user/components/profile_effects/EffectMotion.module.css';
import styles from '@app/features/user/components/profile_effects/Glitch.module.css';
import frame from '@app/features/user/components/profile_effects/ProfileEffect.module.css';
import type React from 'react';
import {useMemo} from 'react';

/**
 * "Glitch" — a corrupted cyber HUD. An RGB-split frame that is cut into horizontal slices which slip sideways now and
 * then, chunky HUD brackets with tick marks and readouts in the corners, scanlines, pixel blocks crumbling out of the
 * corners, tear bars flashing on the edges, a datamosh band sweeping down behind the content, and a targeting reticle
 * that locks onto the avatar.
 */

const INK = '#05060f';
const CYAN = '#19f0ff';
const MAGENTA = '#ff2d78';
const BLUE = '#3d63ff';
const LIME = '#c6ff3d';
const WHITE = '#eafcff';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/** An L-shaped HUD bracket with its corner at (0,0), arms along +x and +y. */
function bracketPath(len: number, t: number): string {
	return `M0,0 H${len} V${t} H${t} V${len} H0 Z`;
}

const Bracket: React.FC<{len: number; t: number; color: string; ghost: string}> = ({len, t, color, ghost}) => {
	const d = bracketPath(len, t);
	return (
		<g>
			<path d={d} fill={ghost} transform="translate(1.6 1.1)" opacity={0.85} />
			<path d={d} fill={color} stroke={INK} strokeWidth={1} strokeLinejoin="miter" />
			<path d={`M${t + 1.5},${t * 0.45} H${len - 2}`} stroke={WHITE} strokeWidth={0.9} opacity={0.8} />
			{[5, 9, 13].map((g, i) => (
				<g key={g}>
					<rect x={len + g} y={0} width={1.6} height={i === 1 ? t : t * 0.6} fill={color} />
					<rect x={0} y={len + g} width={i === 1 ? t : t * 0.6} height={1.6} fill={color} />
				</g>
			))}
		</g>
	);
};

const Block: React.FC<{x: number; y: number; c: number; color: string}> = ({x, y, c, color}) => (
	<g>
		<rect x={x} y={y} width={c} height={c} fill={color} stroke={INK} strokeWidth={0.7} />
		<rect x={x + c * 0.18} y={y + c * 0.18} width={c * 0.28} height={c * 0.28} fill={WHITE} opacity={0.75} />
	</g>
);

function useLayout(geometry: ProfileEffectGeometry) {
	const {width: w, height: h} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x611c4);
		const colors = [CYAN, MAGENTA, BLUE, CYAN, MAGENTA, WHITE];
		const pick = () => colors[Math.floor(rand() * colors.length)];
		const cuts = [0, 0.16, 0.31, 0.47, 0.63, 0.8, 1].map((t) => Math.round(t * h));
		const slices = cuts.slice(0, -1).map((y, i) => ({
			y,
			h: cuts[i + 1] - y,
			dx: (i % 2 ? -1 : 1) * between(rand, 4, 9) * s,
			dur: between(rand, 3400, 6800),
			delay: between(rand, 0, 4000),
		}));
		// Pixel crumble out of a corner: a staircase that thins out away from the corner.
		const crumble = (n: number, c: number) => {
			const cells: Array<{i: number; j: number; color: string; anim: 'flick' | 'shift' | null; dur: number; delay: number}> = [];
			for (let j = 0; j < n; j++) {
				for (let i = 0; i < n; i++) {
					const d = i + j;
					if (d >= n) continue;
					if (d > 1 && rand() < d / (n + 1.5)) continue;
					const roll = rand();
					cells.push({
						i,
						j,
						color: pick(),
						anim: d > 1 && roll < 0.22 ? 'flick' : d > 2 && roll < 0.34 ? 'shift' : null,
						dur: between(rand, 1800, 3600),
						delay: between(rand, 0, 3000),
					});
				}
			}
			return {cells, c};
		};
		const bigCrumble = crumble(8, 6.5 * s);
		const smallCrumble = crumble(5, 6 * s);
		// Torn slabs of signal stacked out of the top corners.
		const shards = (rows: number) =>
			Array.from({length: rows}, (_, j) => {
				const width = (78 - j * 9) * s * between(rand, 0.55, 1.1);
				return {
					x: between(rand, -8, 6) * s,
					y: 2 + j * 6 * s,
					width,
					height: between(rand, 3.2, 5.2) * s,
					color: [MAGENTA, CYAN, BLUE, CYAN, MAGENTA, WHITE, BLUE, CYAN][j % 8],
					bit: rand() < 0.6 ? between(rand, 3, 10) * s : 0,
					slip: rand() < 0.45,
					dx: between(rand, -8, 8) * s,
					dur: between(rand, 2200, 4600),
					delay: between(rand, 0, 3000),
				};
			});
		const shardsL = shards(8);
		const shardsR = shards(6);
		const tears = Array.from({length: 8}, (_, i) => {
			const left = i % 2 === 0;
			const width = between(rand, 18, 64) * s;
			return {
				x: left ? between(rand, 0, 8) : w - width - between(rand, 0, 8),
				y: between(rand, bannerBottom + 8, h - 26 * s),
				width,
				height: between(rand, 2, 4.5) * s,
				color: pick(),
				dx: (left ? 1 : -1) * between(rand, 6, 16) * s,
				dur: between(rand, 2600, 5200),
				delay: between(rand, 0, 4000),
			};
		});
		const band = (height: number) => {
			const rects: Array<{x: number; y: number; width: number; height: number; color: string}> = [];
			let y = 0;
			while (y < height) {
				const rowH = between(rand, 1.5, 4.5) * s;
				let x = between(rand, -20, 10);
				while (x < w) {
					const width = between(rand, 10, 80) * s;
					if (rand() < 0.62) rects.push({x, y, width, height: rowH, color: pick()});
					x += width + between(rand, 4, 40) * s;
				}
				y += rowH + between(rand, 0.5, 3) * s;
			}
			return rects;
		};
		return {s, slices, bigCrumble, smallCrumble, shardsL, shardsR, tears, bandA: band(16 * s), bandB: band(7 * s), bannerBottom};
	}, [w, h, bannerBottom]);
}

function Defs({idPrefix, w, h, slices}: {idPrefix: string; w: number; h: number; slices: ReadonlyArray<{y: number; h: number}>}) {
	return (
		<>
			<pattern id={`${idPrefix}-scan`} width={4} height={3} patternUnits="userSpaceOnUse">
				<rect x={0} y={0} width={4} height={1} fill={WHITE} />
			</pattern>
			<pattern id={`${idPrefix}-grid`} width={6} height={6} patternUnits="userSpaceOnUse">
				<rect x={2.5} y={2.5} width={1.2} height={1.2} fill={CYAN} />
			</pattern>
			<radialGradient id={`${idPrefix}-fade`}>
				<stop offset="0" stopColor="#fff" stopOpacity={1} />
				<stop offset="0.55" stopColor="#fff" stopOpacity={0.5} />
				<stop offset="1" stopColor="#fff" stopOpacity={0} />
			</radialGradient>
			<mask id={`${idPrefix}-fade-mask`} maskContentUnits="objectBoundingBox">
				<rect width={1} height={1} fill={`url(#${idPrefix}-fade)`} />
			</mask>
			{slices.map((sl, i) => (
				<clipPath key={i} id={`${idPrefix}-slice-${i}`}>
					<rect x={-20} y={sl.y} width={w + 40} height={sl.h} />
				</clipPath>
			))}
			<clipPath id={`${idPrefix}-whole`}>
				<rect x={0} y={0} width={w} height={h} />
			</clipPath>
		</>
	);
}

export const Glitch: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const G = useLayout(geometry);
	const {s, bannerBottom: bb} = G;
	const defs = <Defs idPrefix={idPrefix} w={w} h={h} slices={G.slices} />;

	if (layer === 'back') {
		return (
			<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="back" defs={defs}>
				<g className={styles.boot}>
					<rect x={0} y={0} width={w} height={h} fill={`url(#${idPrefix}-scan)`} opacity={0.05} />
					<g opacity={0.4} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={-60 * s} y={h - 90 * s} width={150 * s} height={170 * s} fill={`url(#${idPrefix}-grid)`} />
					</g>
					<g opacity={0.35} mask={`url(#${idPrefix}-fade-mask)`}>
						<rect x={w - 90 * s} y={bb - 10} width={170 * s} height={150 * s} fill={`url(#${idPrefix}-grid)`} />
					</g>
				</g>
				{/* Datamosh bands sweeping down behind the content. */}
				<g transform={`translate(0 ${-20 * s})`}>
					<g className={styles.sweep} style={vars({dur: 5600, delay: 900, dy: h + 30 * s})}>
						{G.bandA.map((r, i) => (
							<rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={r.color} opacity={0.32} />
						))}
					</g>
				</g>
				<g transform={`translate(0 ${-10 * s})`}>
					<g className={styles.sweep} style={vars({dur: 7800, delay: 3800, dy: h + 20 * s})}>
						{G.bandB.map((r, i) => (
							<rect key={i} x={r.x} y={r.y} width={r.width} height={r.height} fill={r.color} opacity={0.28} />
						))}
					</g>
				</g>
				{avatar && (
					<g className={motion.spin} style={vars({dur: 16000})}>
						<circle cx={avatar.cx} cy={avatar.cy} r={avatar.r + 15 * s} fill="none" stroke={CYAN} strokeWidth={1.2} strokeDasharray="2 5 14 5" opacity={0.85} />
					</g>
				)}
			</EffectSvg>
		);
	}

	const inset = 2;
	const rr = Math.max(0, radius - inset);
	const len = 34 * s;
	const t = 6 * s;
	const fontSize = 6.5 * s;
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front" defs={defs}>
			<g className={styles.boot}>
				{/* Scanlines over the corners. */}
				<g opacity={0.22} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={-60 * s} y={-50 * s} width={170 * s} height={130 * s} fill={`url(#${idPrefix}-scan)`} />
				</g>
				<g opacity={0.2} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={w - 110 * s} y={-50 * s} width={170 * s} height={130 * s} fill={`url(#${idPrefix}-scan)`} />
				</g>
				<g opacity={0.18} mask={`url(#${idPrefix}-fade-mask)`}>
					<rect x={w - 100 * s} y={h - 80 * s} width={170 * s} height={150 * s} fill={`url(#${idPrefix}-scan)`} />
				</g>

				{/* RGB-split frame in slices that slip sideways. */}
				{G.slices.map((sl, i) => (
					<g key={i} clipPath={`url(#${idPrefix}-slice-${i})`}>
						<g className={styles.slip} style={vars({dur: sl.dur, delay: sl.delay, dx: sl.dx})}>
							<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={rr} fill="none" stroke={INK} strokeWidth={4.5} />
							<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={rr} fill="none" stroke={MAGENTA} strokeWidth={1.6} transform="translate(-1.4 0)" />
							<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={rr} fill="none" stroke={CYAN} strokeWidth={1.6} transform="translate(1.4 0)" />
							<rect x={inset} y={inset} width={w - inset * 2} height={h - inset * 2} rx={rr} fill="none" stroke={WHITE} strokeWidth={0.9} />
						</g>
					</g>
				))}
				{/* Banner edge: a broken RGB scan line. */}
				<g className={frame.drawIn} style={{animationDelay: '250ms'}}>
					<path d={`M${avatar ? avatar.cx + avatar.r + 16 * s : 12},${bb + 0.5} H${w * 0.72}`} stroke={MAGENTA} strokeWidth={1.2} transform="translate(-1 -1)" fill="none" pathLength={1} />
					<path d={`M${avatar ? avatar.cx + avatar.r + 16 * s : 12},${bb + 0.5} H${w * 0.72}`} stroke={CYAN} strokeWidth={1.2} transform="translate(1 1)" fill="none" pathLength={1} />
					<path d={`M${w * 0.76},${bb + 0.5} H${w - 10}`} stroke={WHITE} strokeWidth={1.2} fill="none" pathLength={1} />
				</g>

				{/* Torn signal slabs in the top corners. */}
				{([
					[G.shardsL, 0, 1],
					[G.shardsR, w, -1],
				] as const).map(([rows, ox, fx], k) => (
					<g key={k} transform={`translate(${ox} 0) scale(${fx} 1)`}>
						{rows.map((row, j) => {
							const slab = (
								<g>
									<rect x={row.x + 2.4} y={row.y + 1} width={row.width} height={row.height} fill={row.color === CYAN ? MAGENTA : CYAN} opacity={0.9} />
									<rect x={row.x} y={row.y} width={row.width} height={row.height} fill={row.color} stroke={INK} strokeWidth={0.9} />
									<rect x={row.x + 3} y={row.y + row.height * 0.3} width={row.width * 0.35} height={Math.max(0.8, row.height * 0.22)} fill={WHITE} opacity={0.7} />
									{row.bit > 0 && (
										<rect x={row.x + row.width + 3 * s} y={row.y} width={row.bit} height={row.height} fill={row.color} stroke={INK} strokeWidth={0.8} />
									)}
								</g>
							);
							return row.slip ? (
								<g key={j} className={styles.slip} style={vars({dur: row.dur, delay: row.delay, dx: row.dx})}>
									{slab}
								</g>
							) : (
								<g key={j}>{slab}</g>
							);
						})}
					</g>
				))}

				{/* HUD rulers down the side edges. */}
				{[0, 1].map((side) => {
					const ticks = [];
					const x = side ? w - 7 : 7;
					for (let y = bb + 24 * s, n = 0; y < h - 50 * s; y += 7 * s, n++) {
						const long = n % 4 === 0;
						ticks.push(
							<rect key={n} x={side ? x - (long ? 7 : 3.5) * s : x} y={y} width={(long ? 7 : 3.5) * s} height={1.1} fill={long ? (side ? MAGENTA : CYAN) : WHITE} opacity={long ? 0.9 : 0.45} />,
						);
					}
					return <g key={side}>{ticks}</g>;
				})}

				{/* Pixel crumble in the bottom corners. */}
				{G.smallCrumble.cells.map((cell, i) => {
					const c = G.smallCrumble.c;
					const block = <Block x={4 + cell.i * c} y={h - 4 - (cell.j + 1) * c} c={c} color={cell.color} />;
					return cell.anim ? (
						<g key={i} className={styles[cell.anim]} style={vars({dur: cell.dur, delay: cell.delay, dx: c, dy: -c})}>
							{block}
						</g>
					) : (
						<g key={i}>{block}</g>
					);
				})}
				{G.bigCrumble.cells.map((cell, i) => {
					const c = G.bigCrumble.c;
					const block = <Block x={w - 4 - (cell.i + 1) * c} y={h - 4 - (cell.j + 1) * c} c={c} color={cell.color} />;
					return cell.anim ? (
						<g key={i} className={styles[cell.anim]} style={vars({dur: cell.dur, delay: cell.delay, dx: -c, dy: -c})}>
							{block}
						</g>
					) : (
						<g key={i}>{block}</g>
					);
				})}

				{/* HUD corner brackets with readouts. */}
				{(
					[
						[inset + 1, inset + 1, 1, 1, CYAN, MAGENTA],
						[w - inset - 1, inset + 1, -1, 1, MAGENTA, CYAN],
						[inset + 1, h - inset - 1, 1, -1, MAGENTA, CYAN],
						[w - inset - 1, h - inset - 1, -1, -1, CYAN, LIME],
					] as const
				).map(([x, y, fx, fy, color, ghost], i) => (
					<g key={i} transform={`translate(${x} ${y}) scale(${fx} ${fy})`}>
						<g className={styles.slip} style={vars({dur: 3000 + i * 900, delay: 600 + i * 700, dx: 3 * s})}>
							<Bracket len={len} t={t} color={color} ghost={ghost} />
						</g>
					</g>
				))}
				<text x={86 * s} y={10 * s} fontFamily={MONO} fontSize={fontSize} fill={WHITE} opacity={0.85} letterSpacing={0.6}>
					SYS//0x3F
				</text>
				<text x={w - 74 * s} y={10 * s} fontFamily={MONO} fontSize={fontSize} fill={WHITE} opacity={0.85} textAnchor="end" letterSpacing={0.6}>
					REC
				</text>
				<circle className={styles.blink} cx={w - 74 * s - fontSize * 2.4} cy={10 * s - fontSize * 0.35} r={2.2 * s} fill={MAGENTA} stroke={INK} strokeWidth={0.6} />
			</g>

			{/* Tear bars flashing on the edges. */}
			{G.tears.map((tr, i) => (
				<g key={i} className={styles.tear} style={vars({dur: tr.dur, delay: tr.delay, dx: tr.dx})}>
					<rect x={tr.x} y={tr.y} width={tr.width} height={tr.height} fill={tr.color} stroke={INK} strokeWidth={0.6} />
					<rect x={tr.x + tr.width * 0.15} y={tr.y + tr.height + 1.5} width={tr.width * 0.5} height={1} fill={tr.color === CYAN ? MAGENTA : CYAN} />
				</g>
			))}

			{avatar && <Reticle avatar={avatar} s={s} fontSize={fontSize} />}
		</EffectSvg>
	);
};

function Reticle({avatar, s, fontSize}: {avatar: NonNullable<ProfileEffectGeometry['avatar']>; s: number; fontSize: number}) {
	const {cx, cy, r} = avatar;
	const R = r + 5;
	const arcs: ReadonlyArray<readonly [number, number]> = [
		[200, 250],
		[290, 340],
		[20, 70],
		[110, 160],
	];
	const box = r + 12 * s;
	const blen = 9 * s;
	return (
		<g>
			{arcs.map(([a, b], i) => (
				<g key={i} className={frame.ringArc} style={{animationDelay: `${200 + i * 90}ms`}}>
					<path d={arcPath(cx, cy, R, a, b)} stroke={MAGENTA} strokeWidth={1.6} fill="none" transform="translate(-1.2 0)" pathLength={1} />
					<path d={arcPath(cx, cy, R, a, b)} stroke={CYAN} strokeWidth={1.6} fill="none" transform="translate(1.2 0)" pathLength={1} />
					<path d={arcPath(cx, cy, R, a, b)} stroke={WHITE} strokeWidth={1} fill="none" pathLength={1} />
				</g>
			))}
			<g className={styles.lockOn} style={vars({delay: 350})}>
				{[0, 90, 180, 270].map((deg) => {
					const [x1, y1] = polar(cx, cy, R - 2, deg);
					const [x2, y2] = polar(cx, cy, R + 9 * s, deg);
					return (
						<g key={deg}>
							<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={INK} strokeWidth={3.4} />
							<line x1={x1} y1={y1} x2={x2} y2={y2} stroke={deg === 0 ? MAGENTA : WHITE} strokeWidth={1.6} />
						</g>
					);
				})}
				{(
					[
						[-1, -1],
						[1, -1],
						[1, 1],
						[-1, 1],
					] as const
				).map(([fx, fy], i) => (
					<path
						key={i}
						d={`M${cx + fx * box},${cy + fy * (box - blen)} V${cy + fy * box} H${cx + fx * (box - blen)}`}
						stroke={i % 2 ? MAGENTA : CYAN}
						strokeWidth={2.2}
						fill="none"
						strokeLinecap="square"
					/>
				))}
			</g>
			<text x={cx + box + 4} y={cy - box + fontSize} fontFamily={MONO} fontSize={fontSize} fill={CYAN} letterSpacing={0.6}>
				TGT_LOCK
			</text>
			<text x={cx + box + 4} y={cy - box + fontSize * 2.2} fontFamily={MONO} fontSize={fontSize * 0.85} fill={WHITE} opacity={0.6} letterSpacing={0.6}>
				{`${Math.round(between(seeded(Math.round(cx * 7 + cy)), 20, 99))}.${Math.round(r)}%`}
			</text>
		</g>
	);
}
