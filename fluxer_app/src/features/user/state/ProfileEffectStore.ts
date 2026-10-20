// SPDX-License-Identifier: AGPL-3.0-or-later

import Authentication from '@app/features/auth/state/Authentication';
import SessionManager from '@app/features/platform/state/AuthSession';
import {Logger} from '@app/features/platform/utils/AppLogger';
import {delightServiceBaseUrl} from '@app/features/user/utils/DelightService';
import {
	isProfileEffectId,
	type ProfileEffectChoice,
	ProfileEffectPrefs,
} from '@app/features/user/utils/ProfileEffectIds';
import {makeAutoObservable, observable, runInAction} from 'mobx';

const logger = new Logger('ProfileEffectStore');

/** Lookups for users rendered within this window go out as one request. */
const BATCH_DELAY_MS = 50;
const MAX_IDS_PER_REQUEST = 100;
/** A cached answer is re-checked (in the background) when a card renders after this long. */
const REFRESH_AFTER_MS = 2 * 60_000;
/** After a failed lookup, wait this long before trying the same ids again. */
const RETRY_AFTER_MS = 30_000;

const serviceBaseUrl = delightServiceBaseUrl;

/**
 * Each user's stored profile effect choice, fetched from the Delight sidecar (`GET /delight/effects?ids=…`) in small
 * debounced batches for whoever is being rendered, and saved with `PUT /delight/effects/@me`.
 */
class ProfileEffectStore {
	/** userId → stored choice, or null when the user has nothing stored. Missing = not loaded yet. */
	private readonly choices = observable.map<string, ProfileEffectChoice | null>();
	// Bookkeeping that must not be observable: it is touched while observers render.
	private readonly fetchedAt = new Map<string, number>();
	private readonly pending = new Set<string>();
	private readonly inFlight = new Set<string>();
	private timer: ReturnType<typeof setTimeout> | null = null;
	saving = false;

	constructor() {
		makeAutoObservable<
			ProfileEffectStore,
			'choices' | 'fetchedAt' | 'pending' | 'inFlight' | 'timer'
		>(this, {choices: false, fetchedAt: false, pending: false, inFlight: false, timer: false}, {autoBind: true});
	}

	/**
	 * The stored choice for a user: an effect id or 'none', null if they have none stored, undefined while unknown.
	 * Safe to call during render — it only queues a lookup.
	 */
	getChoice(userId: string): ProfileEffectChoice | null | undefined {
		const value = this.choices.get(userId);
		const fetchedAt = this.fetchedAt.get(userId);
		if (fetchedAt == null || Date.now() - fetchedAt > REFRESH_AFTER_MS) this.request(userId);
		return value;
	}

	/** Queue a lookup (no observable state changes here, so it may run inside a render/reaction). */
	request(userId: string): void {
		if (!userId || this.pending.has(userId) || this.inFlight.has(userId)) return;
		this.pending.add(userId);
		if (this.timer == null) this.timer = setTimeout(() => void this.flush(), BATCH_DELAY_MS);
	}

	/** Force a fresh lookup of these users. */
	refresh(userIds: ReadonlyArray<string>): void {
		for (const id of userIds) {
			this.fetchedAt.delete(id);
			this.request(id);
		}
	}

	private async flush(): Promise<void> {
		this.timer = null;
		const ids = [...this.pending];
		this.pending.clear();
		for (let i = 0; i < ids.length; i += MAX_IDS_PER_REQUEST) {
			void this.fetchBatch(ids.slice(i, i + MAX_IDS_PER_REQUEST));
		}
	}

	private async fetchBatch(ids: Array<string>): Promise<void> {
		for (const id of ids) this.inFlight.add(id);
		let result: Record<string, unknown> | null = null;
		try {
			const response = await fetch(`${serviceBaseUrl()}/effects?ids=${ids.join(',')}`, {
				headers: {Accept: 'application/json'},
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			result = (await response.json()) as Record<string, unknown>;
		} catch (error) {
			logger.warn('Profile effect lookup failed; using defaults', error);
		} finally {
			for (const id of ids) this.inFlight.delete(id);
		}
		const now = Date.now();
		for (const id of ids) {
			// On failure, fall back to the default rule now and retry a little later.
			this.fetchedAt.set(id, result ? now : now - REFRESH_AFTER_MS + RETRY_AFTER_MS);
		}
		runInAction(() => {
			for (const id of ids) {
				const raw = result?.[id];
				const choice: ProfileEffectChoice | null = raw === 'none' || isProfileEffectId(raw) ? raw : null;
				// Keep a known answer if this lookup failed.
				if (result == null && this.choices.has(id)) continue;
				if (this.choices.get(id) !== choice || !this.choices.has(id)) this.choices.set(id, choice);
			}
		});
		this.migrateLegacyOptOut(result, ids);
	}

	/** Before choices were stored server-side, the effect could be hidden per device. Carry that over once. */
	private migrateLegacyOptOut(result: Record<string, unknown> | null, ids: ReadonlyArray<string>): void {
		const me = Authentication.currentUserId;
		if (!me || result == null || !ids.includes(me) || ProfileEffectPrefs.showOwnProfileEffect) return;
		if (result[me] == null) {
			void this.saveOwnChoice('none').catch(() => {});
		}
		ProfileEffectPrefs.setShowOwnProfileEffect(true);
	}

	/** Save the current user's choice ('none' = no effect, null = clear and use the default rule). */
	async saveOwnChoice(choice: ProfileEffectChoice | null): Promise<void> {
		const me = Authentication.currentUserId;
		const token = SessionManager.token;
		if (!me || !token) throw new Error('Not signed in');
		const previous = this.choices.has(me) ? this.choices.get(me) : undefined;
		runInAction(() => {
			this.saving = true;
			this.choices.set(me, choice);
		});
		try {
			const response = await fetch(`${serviceBaseUrl()}/effects/@me`, {
				method: 'PUT',
				headers: {'Content-Type': 'application/json', Authorization: token},
				body: JSON.stringify({effect: choice}),
			});
			// 403 = a premium effect picked by someone who isn't premium; callers read `status`.
			if (!response.ok) throw Object.assign(new Error(`HTTP ${response.status}`), {status: response.status});
			this.fetchedAt.set(me, Date.now());
		} catch (error) {
			logger.error('Saving profile effect failed', error);
			runInAction(() => {
				if (previous === undefined) this.choices.delete(me);
				else this.choices.set(me, previous);
			});
			throw error;
		} finally {
			runInAction(() => {
				this.saving = false;
			});
		}
		// Re-read what the server stored, so this device agrees with everyone else.
		this.refresh([me]);
	}
}

export default new ProfileEffectStore();
