// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	bannerBottomOf,
	between,
	EffectSvg,
	type ProfileEffectLayer,
	scaleFor,
	seeded,
	vars,
} from '@app/features/user/components/profile_effects/effectKit';
import styles from '@app/features/user/components/profile_effects/Glitch.module.css';
import {useMemo} from 'react';

/** "Glitch" — RGB-split corner brackets and avatar ring, corrupted pixel blocks flickering on the edges, a scanline. */

const RED = '#ff2e63';
const CYAN = '#08d9d6';
const WHITE = '#ececec';

function useLayout(w: number, h: number, bannerBottom: number) {
	return useMemo(() => {
		const s = scaleFor(w);
		const rand = seeded(0x611c);
		const colors = [RED, CYAN, WHITE, CYAN, RED];
		const blocks = Array.from({length: 16}, (_, i) => {
			// Hug the edges: left/right strips, the banner's bottom edge and the card's bottom.
			const zone = i % 4;
			const bw = between(rand, 6, 30) * s;
			const bh = between(rand, 2, 5) * s;
			let x: number;
			let y: number;
			if (zone === 0) {
				x = between(rand, 0, 18 * s);
				y = between(rand, 10, h - 10);
			} else if (zone === 1) {
				x = w - bw - between(rand, 0, 18 * s);
				y = between(rand, 10, h - 10);
			} else if (zone === 2) {
				x = between(rand, w * 0.35, w - bw);
				y = bannerBottom + between(rand, -10, 4);
			} else {
				x = between(rand, 0, w - bw);
				y = h - between(rand, 4, 16) * s;
			}
			return {
				x,
				y,
				w: bw,
				h: bh,
				color: colors[i % colors.length],
				dur: between(rand, 2200, 4200),
				delay: between(rand, 0, 3000),
				dx: between(rand, -8, 8),
			};
		});
		return {s, blocks};
	}, [w, h, bannerBottom]);
}

/** An L-shaped corner bracket at (x, y) opening towards (dx, dy). */
function bracket(x: number, y: number, dx: number, dy: number, size: number): string {
	return `M${x + dx * size},${y} L${x},${y} L${x},${y + dy * size}`;
}

export const Glitch: ProfileEffectLayer = ({layer, geometry, radius, idPrefix}) => {
	const {width: w, height: h, avatar} = geometry;
	const bannerBottom = bannerBottomOf(geometry);
	const {s, blocks} = useLayout(w, h, bannerBottom);
	if (layer === 'back') {
		const patternId = `${idPrefix}-scanlines`;
		return (
			<EffectSvg
				geometry={geometry}
				radius={radius}
				idPrefix={idPrefix}
				layer="back"
				defs={
					<pattern id={patternId} width={4} height={3} patternUnits="userSpaceOnUse">
						<rect width={4} height={1} fill={WHITE} />
					</pattern>
				}
			>
				<g className={styles.boot}>
					<rect width={w} height={h} fill={`url(#${patternId})`} opacity={0.045} />
					<g opacity={0.1}>
						<rect
							className={styles.scan}
							x={0}
							y={-6}
							width={w}
							height={6}
							fill={CYAN}
							style={vars({dur: 5200, delay: 900, dy: h + 12})}
						/>
					</g>
				</g>
			</EffectSvg>
		);
	}
	const inset = 5;
	const size = 18 * s;
	const brackets = [
		bracket(inset, inset, 1, 1, size),
		bracket(w - inset, inset, -1, 1, size),
		bracket(inset, h - inset, 1, -1, size),
		bracket(w - inset, h - inset, -1, -1, size),
	].join(' ');
	return (
		<EffectSvg geometry={geometry} radius={radius} idPrefix={idPrefix} layer="front">
			<g className={styles.boot}>
				{/* Corner brackets with a red/cyan split. */}
				<g className={styles.jitterA} style={vars({dur: 2600})}>
					<path d={brackets} stroke={RED} strokeWidth={2} fill="none" opacity={0.85} transform="translate(-1.5 0)" />
				</g>
				<g className={styles.jitterB} style={vars({dur: 2600})}>
					<path d={brackets} stroke={CYAN} strokeWidth={2} fill="none" opacity={0.85} transform="translate(1.5 0)" />
				</g>
				<path d={brackets} stroke={WHITE} strokeWidth={2} fill="none" />

				{blocks.map((b, i) => (
					<rect
						key={i}
						className={styles.block}
						x={b.x}
						y={b.y}
						width={b.w}
						height={b.h}
						fill={b.color}
						style={vars({dur: b.dur, delay: b.delay, dx: b.dx})}
					/>
				))}

				{avatar && (
					<>
						<g className={styles.jitterA} style={vars({dur: 3100, delay: 400})}>
							<circle
								cx={avatar.cx - 1.5}
								cy={avatar.cy}
								r={avatar.r + 3}
								fill="none"
								stroke={RED}
								strokeWidth={1.5}
								strokeDasharray="22 5 6 5"
								opacity={0.9}
							/>
						</g>
						<g className={styles.jitterB} style={vars({dur: 3100, delay: 400})}>
							<circle
								cx={avatar.cx + 1.5}
								cy={avatar.cy}
								r={avatar.r + 3}
								fill="none"
								stroke={CYAN}
								strokeWidth={1.5}
								strokeDasharray="22 5 6 5"
								opacity={0.9}
							/>
						</g>
					</>
				)}
			</g>
		</EffectSvg>
	);
};
