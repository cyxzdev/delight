// SPDX-License-Identifier: AGPL-3.0-or-later

import type {User} from '@app/features/user/models/User';
import ProfileFrameStore from '@app/features/user/state/ProfileFrameStore';
import type {ProfileFrameChoice, ProfileFrameId} from '@app/features/user/utils/ProfileFrameIds';

/**
 * Delight profile frames: illustrated art hugging the outline of a profile card (see
 * features/user/components/profile_frames). A user's choice is stored by the Delight sidecar (/delight/frames) so
 * everyone sees it. Nobody has a frame by default.
 */
export {
	isProfileFrameId,
	PROFILE_FRAME_IDS,
	type ProfileFrameChoice,
	type ProfileFrameId,
} from '@app/features/user/utils/ProfileFrameIds';

type FrameUser = Pick<User, 'id'> & {bot?: boolean; system?: boolean};

/** The frame to draw on this user's card, or null. Reading it from an observer subscribes and queues a batched lookup. */
export function getProfileFrame(user: FrameUser | null | undefined): ProfileFrameId | null {
	if (user == null || user.bot || user.system) return null;
	const stored = ProfileFrameStore.getChoice(user.id);
	if (stored == null || stored === 'none') return null;
	return stored;
}

/** The current user's choice for the settings UI ('none' when nothing is stored, undefined while loading). */
export function getOwnProfileFrameChoice(user: FrameUser): ProfileFrameChoice | undefined {
	const stored = ProfileFrameStore.getChoice(user.id);
	if (stored === undefined) return undefined;
	return stored ?? 'none';
}
