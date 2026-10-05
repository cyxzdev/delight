// SPDX-License-Identifier: AGPL-3.0-or-later

import styles from '@app/features/user/components/profile_effects/VideoEffect.module.css';
import type {ProfileEffectGeometry, ProfileEffectLayer} from '@app/features/user/components/profile_effects/effectKit';
import {delightServiceBaseUrl} from '@app/features/user/utils/DelightService';
import type {ProfileEffectId} from '@app/features/user/utils/ProfileEffectIds';
import type React from 'react';
import {useEffect, useRef} from 'react';

/**
 * Video profile effects (the Angelic collection): a short seamless loop of light on pure black, served by the sidecar
 * from delight/effects/<id>/ (loop.webm, loop.mp4, poster.webp) at /delight/effect-assets/<id>/. The layers draw it
 * with `mix-blend-mode: screen` (set on the layer by ProfileEffect), so black disappears and only the light remains.
 *
 * The art is split between the two layers so text stays crisp: over the banner (and around the avatar) it is drawn in
 * front of the card; below that it sits behind the card's content. The two copies share one clock so they stay in step.
 */

/** Bump when a video effect's files change so browsers fetch the new ones. */
const ASSET_VERSION = 1;

export interface VideoEffectConfig {
	id: ProfileEffectId;
	/** `object-position` of the art on the card (it is `object-fit: cover`). */
	position?: string;
}

export function videoEffectAssetUrl(id: ProfileEffectId, file: 'loop.webm' | 'loop.mp4' | 'poster.webp'): string {
	return `${delightServiceBaseUrl()}/effect-assets/${id}/${file}?v=${ASSET_VERSION}`;
}

/** Where the front copy stops (fading out over `FADE` px): the bottom of the avatar, else of the banner. */
function bandOf(geometry: ProfileEffectGeometry): number {
	if (geometry.avatar) return geometry.avatar.cy + geometry.avatar.r * 0.6;
	if (geometry.bannerBottom != null) return geometry.bannerBottom;
	return geometry.height * 0.25;
}

function maskFor(layer: 'front' | 'back', geometry: ProfileEffectGeometry): React.CSSProperties {
	const band = Math.round(bandOf(geometry));
	const fade = Math.round(Math.max(28, geometry.height * 0.1));
	const vertical =
		layer === 'front'
			? `linear-gradient(to bottom, #000 0, #000 ${band}px, transparent ${band + fade}px)`
			: `linear-gradient(to bottom, transparent 0, transparent ${band}px, #000 ${band + fade}px)`;
	const avatar = geometry.avatar;
	if (layer === 'back' || !avatar) return {maskImage: vertical, WebkitMaskImage: vertical};
	// Keep the avatar itself clear in front: the art passes behind it.
	const r = Math.round(avatar.r + 2);
	const hole = `radial-gradient(circle at ${avatar.cx}px ${avatar.cy}px, transparent ${r}px, #000 ${r + 6}px)`;
	return {
		maskImage: `${vertical}, ${hole}`,
		WebkitMaskImage: `${vertical}, ${hole}`,
		maskComposite: 'intersect',
		WebkitMaskComposite: 'source-in',
	} as React.CSSProperties;
}

/** Every copy of every video effect follows this clock, so the front/back copies (and several cards) stay in step. */
function clockTime(duration: number): number {
	return (performance.now() / 1000) % duration;
}

function useLoopPlayback(ref: React.RefObject<HTMLVideoElement | null>, enabled: boolean) {
	useEffect(() => {
		const video = ref.current;
		if (!video || !enabled) return;
		const ownerWindow = video.ownerDocument.defaultView;
		if (!ownerWindow) return;
		const doc = video.ownerDocument;
		video.muted = true;
		let visible = false;
		const sync = () => {
			const duration = video.duration;
			if (!Number.isFinite(duration) || duration <= 0) return;
			const target = clockTime(duration);
			const drift = Math.abs(video.currentTime - target);
			if (Math.min(drift, duration - drift) > 0.08) video.currentTime = target;
		};
		const update = () => {
			if (visible && !doc.hidden) {
				sync();
				void video.play().catch(() => {});
			} else {
				video.pause();
			}
		};
		const onMeta = () => update();
		video.addEventListener('loadedmetadata', onMeta);
		doc.addEventListener('visibilitychange', update);
		let observer: IntersectionObserver | null = null;
		if (typeof ownerWindow.IntersectionObserver !== 'undefined') {
			observer = new ownerWindow.IntersectionObserver((entries) => {
				visible = entries.some((entry) => entry.isIntersecting);
				update();
			});
			observer.observe(video);
		} else {
			visible = true;
			update();
		}
		const resync = ownerWindow.setInterval(() => {
			if (!video.paused) sync();
		}, 2000);
		return () => {
			video.removeEventListener('loadedmetadata', onMeta);
			doc.removeEventListener('visibilitychange', update);
			observer?.disconnect();
			ownerWindow.clearInterval(resync);
			video.pause();
		};
	}, [ref, enabled]);
}

export function videoEffectLayer({id, position = '50% 30%'}: VideoEffectConfig): ProfileEffectLayer {
	const VideoLayer: ProfileEffectLayer = ({layer, geometry, radius, still}) => {
		const ref = useRef<HTMLVideoElement>(null);
		useLoopPlayback(ref, !still);
		const style: React.CSSProperties = {...maskFor(layer, geometry), objectPosition: position, borderRadius: radius};
		const poster = videoEffectAssetUrl(id, 'poster.webp');
		if (still) {
			return <img className={styles.media} style={style} src={poster} alt="" draggable={false} decoding="async" />;
		}
		return (
			<video
				ref={ref}
				className={styles.media}
				style={style}
				poster={poster}
				muted
				loop
				playsInline
				autoPlay
				preload="metadata"
				disablePictureInPicture
				disableRemotePlayback
				aria-hidden="true"
				tabIndex={-1}
			>
				<source src={videoEffectAssetUrl(id, 'loop.webm')} type='video/webm; codecs="vp9"' />
				<source src={videoEffectAssetUrl(id, 'loop.mp4')} type="video/mp4" />
			</video>
		);
	};
	VideoLayer.displayName = `VideoEffect(${id})`;
	return VideoLayer;
}
