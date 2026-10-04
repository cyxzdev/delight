// SPDX-License-Identifier: AGPL-3.0-or-later

/** Every profile frame id. Keep in sync with the allow-list in delight/service/server.ts (FRAME_IDS) and the registry in
 * features/user/components/profile_frames/registry.ts. */
export const PROFILE_FRAME_IDS = ['starlit_sparkles', 'candle_drip', 'eclipse', 'rose_filigree', 'kitty_ears'] as const;

export type ProfileFrameId = (typeof PROFILE_FRAME_IDS)[number];
/** What can be stored for a user: a frame, or 'none' for an explicit "no frame". */
export type ProfileFrameChoice = ProfileFrameId | 'none';

export function isProfileFrameId(value: unknown): value is ProfileFrameId {
	return typeof value === 'string' && (PROFILE_FRAME_IDS as ReadonlyArray<string>).includes(value);
}
