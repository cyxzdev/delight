// SPDX-License-Identifier: AGPL-3.0-or-later

import type {User} from '@app/features/user/models/User';
import ProfileEffectStore from '@app/features/user/state/ProfileEffectStore';
import {DISABLED_PROFILE_EFFECT_IDS, type ProfileEffectChoice, type ProfileEffectId} from '@app/features/user/utils/ProfileEffectIds';

/**
 * Delight profile effects: animated SVG layers drawn in front of and behind a profile card
 * (see features/user/components/profile_effects). Everything that decides *who* gets *which* effect lives here.
 *
 * A user's choice is stored by the Delight sidecar (delight/service, served at /delight/effects) so everyone sees it:
 * an effect id, 'none' (explicitly no effect), or nothing stored (fall back to the default rule below).
 */
export {
	isProfileEffectId,
	PROFILE_EFFECT_IDS,
	type ProfileEffectChoice,
	type ProfileEffectId,
	ProfileEffectPrefs,
} from '@app/features/user/utils/ProfileEffectIds';

/** Delight launch day. Accounts created on/after this (UTC) get Spark Surge by default. */
export const SPARK_SURGE_ELIGIBLE_FROM = Date.UTC(2026, 9, 4);

type EffectUser = Pick<User, 'id' | 'createdAt'> & {bot?: boolean; system?: boolean};

/** The effect a user has when they haven't picked one. */
export function getDefaultProfileEffect(user: Pick<User, 'createdAt'> & {bot?: boolean; system?: boolean}): ProfileEffectId | null {
	if (user.bot || user.system) return null;
	const createdAt = user.createdAt.getTime();
	if (Number.isFinite(createdAt) && createdAt >= SPARK_SURGE_ELIGIBLE_FROM) return 'spark_surge';
	return null;
}

/**
 * The effect to draw on this user's profile card, or null for none. Reading it from an observer component subscribes
 * to the stored choice and queues a (batched) lookup; nothing is drawn until that lookup has answered, so a card
 * never flashes the default effect before switching to the user's pick.
 */
export function getProfileEffect(user: EffectUser | null | undefined): ProfileEffectId | null {
	if (user == null || user.bot || user.system) return null;
	const stored = ProfileEffectStore.getChoice(user.id);
	if (stored === undefined) return null;
	if (stored === 'none') return null;
	if (stored != null && !DISABLED_PROFILE_EFFECT_IDS.has(stored)) return stored;
	return getDefaultProfileEffect(user);
}

/** The current user's effective choice for the settings UI: their stored pick, else the default rule. */
export function getOwnProfileEffectChoice(user: EffectUser): ProfileEffectChoice | null | undefined {
	const stored = ProfileEffectStore.getChoice(user.id);
	if (stored === undefined) return undefined;
	if (stored != null && !DISABLED_PROFILE_EFFECT_IDS.has(stored)) return stored;
	return getDefaultProfileEffect(user) ?? 'none';
}
