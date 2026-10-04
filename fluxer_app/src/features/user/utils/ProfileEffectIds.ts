// SPDX-License-Identifier: AGPL-3.0-or-later

import {makePersistent} from '@app/features/platform/utils/MobXPersistence';
import {makeAutoObservable} from 'mobx';

/** Every profile effect id. Keep in sync with the allow-list in delight/service/server.ts and the registry in
 * features/user/components/profile_effects/registry.ts. */
export const PROFILE_EFFECT_IDS = [
	'spark_surge',
	'sakura_drift',
	'snowfall',
	'ember',
	'starlight',
	'heartbeat',
	'rainy_day',
	'bubbles',
	'confetti',
	'glitch',
	'synthwave',
] as const;

export type ProfileEffectId = (typeof PROFILE_EFFECT_IDS)[number];
/** What can be stored for a user: an effect, or 'none' for an explicit "no effect". */
export type ProfileEffectChoice = ProfileEffectId | 'none';

export function isProfileEffectId(value: unknown): value is ProfileEffectId {
	return typeof value === 'string' && (PROFILE_EFFECT_IDS as ReadonlyArray<string>).includes(value);
}

class ProfileEffectPreferences {
	/**
	 * Legacy per-device opt-out from before choices were stored server-side. If it is off, the first time we learn
	 * that nothing is stored for the current user we save 'none' for them and turn it back on (see ProfileEffectStore).
	 */
	showOwnProfileEffect = true;

	constructor() {
		makeAutoObservable(this, {}, {autoBind: true});
		void makePersistent(this, 'DelightProfileEffectPreferences', ['showOwnProfileEffect']);
	}

	setShowOwnProfileEffect(value: boolean): void {
		this.showOwnProfileEffect = value;
	}
}

export const ProfileEffectPrefs = new ProfileEffectPreferences();

