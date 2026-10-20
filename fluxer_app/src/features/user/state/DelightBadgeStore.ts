// SPDX-License-Identifier: AGPL-3.0-or-later

import Authentication from '@app/features/auth/state/Authentication';
import SessionManager from '@app/features/platform/state/AuthSession';
import {Logger} from '@app/features/platform/utils/AppLogger';
import {sortDelightBadgeIds} from '@app/features/user/utils/DelightBadges';
import {delightServiceBaseUrl} from '@app/features/user/utils/DelightService';
import {makeAutoObservable, observable, runInAction} from 'mobx';

const logger = new Logger('DelightBadgeStore');

/** Lookups for users rendered within this window go out as one request. */
const BATCH_DELAY_MS = 50;
const MAX_IDS_PER_REQUEST = 100;
/** A cached answer is re-checked (in the background) when a profile renders after this long. */
const REFRESH_AFTER_MS = 5 * 60_000;
/** After a failed lookup, wait this long before trying the same ids again. */
const RETRY_AFTER_MS = 30_000;

const EMPTY: ReadonlyArray<string> = Object.freeze([]);

/**
 * Delight profile badges per user, fetched from the Delight sidecar (`GET /delight/badges?ids=…`) in small debounced
 * batches for whoever is being rendered. Staff (instance admins) can change them (`PUT /delight/badges/:userId`).
 */
class DelightBadgeStore {
	/** userId → badge ids in display order. Missing = not loaded yet. */
	private readonly badges = observable.map<string, ReadonlyArray<string>>();
	// Bookkeeping that must not be observable: it is touched while observers render.
	private readonly fetchedAt = new Map<string, number>();
	private readonly pending = new Set<string>();
	private readonly inFlight = new Set<string>();
	private timer: ReturnType<typeof setTimeout> | null = null;
	private canManageFor: string | null = null;
	/** Whether the signed-in user may grant badges (null = not checked yet). */
	canManage: boolean | null = null;

	constructor() {
		makeAutoObservable<
			DelightBadgeStore,
			'badges' | 'fetchedAt' | 'pending' | 'inFlight' | 'timer' | 'canManageFor'
		>(
			this,
			{badges: false, fetchedAt: false, pending: false, inFlight: false, timer: false, canManageFor: false},
			{autoBind: true},
		);
	}

	/** A user's badge ids (empty while unknown). Safe to call during render — it only queues a lookup. */
	getBadges(userId: string): ReadonlyArray<string> {
		const fetchedAt = this.fetchedAt.get(userId);
		if (fetchedAt == null || Date.now() - fetchedAt > REFRESH_AFTER_MS) this.request(userId);
		return this.badges.get(userId) ?? EMPTY;
	}

	/** Queue a lookup (no observable state changes here, so it may run inside a render/reaction). */
	request(userId: string): void {
		if (!userId || this.pending.has(userId) || this.inFlight.has(userId)) return;
		this.pending.add(userId);
		if (this.timer == null) this.timer = setTimeout(() => void this.flush(), BATCH_DELAY_MS);
	}

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
			const response = await fetch(`${delightServiceBaseUrl()}/badges?ids=${ids.join(',')}`, {
				headers: {Accept: 'application/json'},
			});
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			result = (await response.json()) as Record<string, unknown>;
		} catch (error) {
			logger.warn('Badge lookup failed', error);
		} finally {
			for (const id of ids) this.inFlight.delete(id);
		}
		const now = Date.now();
		for (const id of ids) this.fetchedAt.set(id, result ? now : now - REFRESH_AFTER_MS + RETRY_AFTER_MS);
		if (!result) return;
		runInAction(() => {
			for (const id of ids) {
				const raw = result[id];
				const next = Array.isArray(raw)
					? sortDelightBadgeIds(raw.filter((v): v is string => typeof v === 'string'))
					: [];
				const prev = this.badges.get(id);
				if (!prev || prev.length !== next.length || prev.some((v, i) => v !== next[i])) {
					this.badges.set(id, next.length ? next : EMPTY);
				}
			}
		});
	}

	/** Ask the sidecar once per session whether the signed-in user is badge staff. */
	checkCanManage(): void {
		const me = Authentication.currentUserId;
		const token = SessionManager.token;
		if (!me || !token || this.canManageFor === me) return;
		this.canManageFor = me;
		void (async () => {
			try {
				const response = await fetch(`${delightServiceBaseUrl()}/badges/@me/manage`, {
					headers: {Accept: 'application/json', Authorization: token},
				});
				const body = response.ok ? ((await response.json()) as {can_manage?: unknown}) : null;
				runInAction(() => {
					this.canManage = body?.can_manage === true;
				});
			} catch (error) {
				logger.warn('Badge permission check failed', error);
				this.canManageFor = null;
			}
		})();
	}

	/** Staff only: replace a user's badge set. */
	async setBadges(userId: string, badgeIds: ReadonlyArray<string>): Promise<void> {
		const token = SessionManager.token;
		if (!token) throw new Error('Not signed in');
		const next = sortDelightBadgeIds(badgeIds);
		const response = await fetch(`${delightServiceBaseUrl()}/badges/${userId}`, {
			method: 'PUT',
			headers: {'Content-Type': 'application/json', Authorization: token},
			body: JSON.stringify({badges: next}),
		});
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const body = (await response.json()) as {badges?: Array<string>};
		runInAction(() => {
			this.badges.set(userId, sortDelightBadgeIds(body.badges ?? next));
		});
		this.fetchedAt.set(userId, Date.now());
	}
}

export default new DelightBadgeStore();
