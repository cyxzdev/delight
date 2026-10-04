// SPDX-License-Identifier: AGPL-3.0-or-later

import {
	CandleOverlay,
	EclipseOverlay,
	type FrameOverlay,
	KittyOverlay,
	RoseOverlay,
	StarlitOverlay,
} from '@app/features/user/components/profile_frames/overlays';
import {delightServiceBaseUrl} from '@app/features/user/utils/DelightService';
import {PROFILE_FRAME_IDS, type ProfileFrameId} from '@app/features/user/utils/ProfileFrameIds';
import type {MessageDescriptor} from '@lingui/core';
import {msg} from '@lingui/core/macro';

/**
 * Every Delight profile frame. A frame is illustrated artwork hugging the card's outline: a rich band along the top
 * that rises above the card, optional trims, and a piece along the bottom edge. Artwork lives in
 * delight/frames/<id>/<piece>.webp and is served by the sidecar at /delight/frame-assets/<id>/<piece>.webp.
 *
 * To add one:
 *  1. add its id to PROFILE_FRAME_IDS (features/user/utils/ProfileFrameIds.ts) and to FRAME_IDS in
 *     delight/service/server.ts (or the DELIGHT_FRAME_IDS env var of the delight-svc container);
 *  2. put its pieces in delight/frames/<id>/ (transparent WebP, ~1280px wide for bands) and describe where each sits
 *     below, in card widths (see FramePiece);
 *  3. optionally add a small animated overlay (overlays.tsx). The picker tiles render it automatically.
 */

/** Bump when artwork changes so browsers fetch the new files. */
const ASSET_VERSION = 3;

export interface FramePiece {
	/** File name in delight/frames/<id>/, without `.webp`. */
	name: string;
	/** 'top': `y` is measured from the card's top edge; 'bottom': from its bottom edge. */
	anchor: 'top' | 'bottom';
	/** Position and size in card widths, relative to the card's left edge and the anchor edge (negative = up/left). */
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface ProfileFrameDefinition {
	id: ProfileFrameId;
	name: MessageDescriptor;
	description: MessageDescriptor;
	pieces: ReadonlyArray<FramePiece>;
	Overlay?: FrameOverlay;
}

const DEFINITIONS: Record<ProfileFrameId, Omit<ProfileFrameDefinition, 'id'>> = {
	starlit_sparkles: {
		name: msg({message: 'Starlit Sparkles', comment: 'Name of a profile frame: a crown of glowing sparkles.'}),
		description: msg({
			message: 'A crown of cyan, pink and violet sparkles that twinkle down your card.',
			comment: 'Short description of the Starlit Sparkles profile frame.',
		}),
		pieces: [
			{name: 'top', anchor: 'top', x: -0.058, y: -0.1457, w: 1.113, h: 0.2391},
			{name: 'bottom', anchor: 'bottom', x: -0.0336, y: -0.0736, w: 1.075, h: 0.155},
		],
		Overlay: StarlitOverlay,
	},
	candle_drip: {
		name: msg({message: 'Candle Drip', comment: 'Name of a profile frame: neon candles with dripping wax.'}),
		description: msg({
			message: 'Neon candles flicker on a ledge of dripping teal wax.',
			comment: 'Short description of the Candle Drip profile frame.',
		}),
		pieces: [
			{name: 'top', anchor: 'top', x: -0.0257, y: -0.3382, w: 1.0486, h: 0.6215},
			{name: 'bottom', anchor: 'bottom', x: -0.0275, y: -0.2056, w: 1.0556, h: 0.3387},
		],
		Overlay: CandleOverlay,
	},
	eclipse: {
		name: msg({message: 'Blazing Sun', comment: 'Name of a profile frame: a bright sun breaking through amber smoke clouds.'}),
		description: msg({
			message: 'A blazing sun breaks through billowing amber smoke.',
			comment: 'Short description of the Eclipse profile frame.',
		}),
		pieces: [
			{name: 'top', anchor: 'top', x: -0.0647, y: -0.2596, w: 1.1265, h: 0.3015},
			{name: 'bottom', anchor: 'bottom', x: -0.0359, y: -0.0789, w: 1.0669, h: 0.1852},
		],
		Overlay: EclipseOverlay,
	},
	rose_filigree: {
		name: msg({message: 'Rose Filigree', comment: 'Name of a profile frame: white roses and silver scrollwork.'}),
		description: msg({
			message: 'Ivory roses and silver filigree scrolls curling down your card.',
			comment: 'Short description of the Rose Filigree profile frame.',
		}),
		pieces: [
			{name: 'top', anchor: 'top', x: -0.0625, y: -0.1792, w: 1.1264, h: 0.6268},
			{name: 'bottom', anchor: 'bottom', x: 0.0823, y: -0.1028, w: 0.8276, h: 0.2122},
		],
		Overlay: RoseOverlay,
	},
	kitty_ears: {
		name: msg({message: 'Kitty Ears', comment: 'Name of a profile frame: a white cat peeking over the card.'}),
		description: msg({
			message: 'A sleepy white kitty peeks over your card and holds on with both paws.',
			comment: 'Short description of the Kitty Ears profile frame.',
		}),
		pieces: [
			{name: 'top', anchor: 'top', x: -0.0275, y: -0.3162, w: 1.055, h: 0.3203},
			{name: 'paw', anchor: 'bottom', x: -0.045, y: -0.135, w: 0.25, h: 0.2143},
			{name: 'paw-right', anchor: 'bottom', x: 1 - 0.25 + 0.045, y: -0.135, w: 0.25, h: 0.2143},
		],
		Overlay: KittyOverlay,
	},
};

export const PROFILE_FRAMES: ReadonlyArray<ProfileFrameDefinition> = PROFILE_FRAME_IDS.map((id) => ({
	id,
	...DEFINITIONS[id],
}));

export function getProfileFrameDefinition(id: ProfileFrameId): ProfileFrameDefinition {
	return {id, ...DEFINITIONS[id]};
}

export function profileFrameAssetUrl(id: ProfileFrameId, piece: string): string {
	return `${delightServiceBaseUrl()}/frame-assets/${id}/${piece}.webp?v=${ASSET_VERSION}`;
}

/** Room overlays (twinkles) may take beyond the artwork, in card widths. */
const OVERLAY_MARGIN = 0.03;

/**
 * How far a frame reaches beyond the card at a given card width, in px: `top` above the top edge, `bottom` below the
 * bottom edge. Hosts pad by this so popouts are positioned (and kept on screen) with the frame included.
 */
export function getProfileFrameSpill(
	id: ProfileFrameId | null | undefined,
	cardWidth: number,
): {top: number; bottom: number} {
	if (!id) return {top: 0, bottom: 0};
	let top = 0;
	let bottom = 0;
	for (const piece of DEFINITIONS[id].pieces) {
		if (piece.anchor === 'top') top = Math.max(top, -piece.y);
		else bottom = Math.max(bottom, piece.y + piece.h);
	}
	return {
		top: Math.ceil((top + OVERLAY_MARGIN) * cardWidth),
		bottom: Math.ceil((bottom + (bottom > 0 ? OVERLAY_MARGIN : 0)) * cardWidth),
	};
}
