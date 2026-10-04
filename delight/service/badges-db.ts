// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Delight profile badges: storage shared by the sidecar (server.ts) and the admin CLI (badges-cli.ts).

import type {Database} from 'bun:sqlite';

/**
 * Badge ids in display order. Keep in sync with DELIGHT_BADGES in
 * fluxer_app/src/features/user/utils/DelightBadges.ts (and the artwork in delight/badges/<id>.png).
 */
export const BADGE_ORDER = [
	'staff',
	'og',
	'developer',
	'moderator',
	'partner',
	'verified',
	'subscriber',
	'booster',
	'early_supporter',
	'bug_hunter',
] as const;

export const BADGE_IDS: ReadonlySet<string> = new Set(BADGE_ORDER);
const RANK = new Map<string, number>(BADGE_ORDER.map((id, index) => [id, index]));

export function sortBadges(ids: Iterable<string>): Array<string> {
	return [...new Set(ids)].filter((id) => RANK.has(id)).sort((a, b) => RANK.get(a)! - RANK.get(b)!);
}

export function openBadgeDb(db: Database) {
	db.exec(
		'CREATE TABLE IF NOT EXISTS user_badges (user_id TEXT NOT NULL, badge_id TEXT NOT NULL, granted_at INTEGER NOT NULL, PRIMARY KEY (user_id, badge_id))',
	);
	// user id ↔ username, remembered whenever someone authenticates with the sidecar (lets the CLI take usernames).
	db.exec(
		'CREATE TABLE IF NOT EXISTS known_users (user_id TEXT PRIMARY KEY, username TEXT NOT NULL, updated_at INTEGER NOT NULL)',
	);
	const insert = db.prepare('INSERT OR IGNORE INTO user_badges (user_id, badge_id, granted_at) VALUES (?1, ?2, ?3)');
	const remove = db.prepare('DELETE FROM user_badges WHERE user_id = ?1 AND badge_id = ?2');
	const remember = db.prepare(
		'INSERT INTO known_users (user_id, username, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET username = ?2, updated_at = ?3',
	);
	const byName = db.prepare('SELECT user_id FROM known_users WHERE lower(username) = lower(?1)');

	return {
		/** userId → badge ids (display order); users without badges are left out. */
		lookup(userIds: ReadonlyArray<string>): Record<string, Array<string>> {
			if (userIds.length === 0) return {};
			const rows = db
				.query(`SELECT user_id, badge_id FROM user_badges WHERE user_id IN (${userIds.map(() => '?').join(',')})`)
				.all(...userIds) as Array<{user_id: string; badge_id: string}>;
			const grouped: Record<string, Array<string>> = {};
			for (const row of rows) (grouped[row.user_id] ??= []).push(row.badge_id);
			for (const id of Object.keys(grouped)) grouped[id] = sortBadges(grouped[id]);
			return grouped;
		},
		grant(userId: string, badgeId: string): void {
			insert.run(userId, badgeId, Date.now());
		},
		revoke(userId: string, badgeId: string): void {
			remove.run(userId, badgeId);
		},
		/** Replace a user's whole badge set (keeps the original grant time of badges they already had). */
		set(userId: string, badgeIds: ReadonlyArray<string>): void {
			const wanted = new Set(badgeIds);
			db.transaction(() => {
				const current = (this.lookup([userId])[userId] ?? []) as Array<string>;
				for (const id of current) if (!wanted.has(id)) remove.run(userId, id);
				for (const id of wanted) insert.run(userId, id, Date.now());
			})();
		},
		rememberName(userId: string, username: string): void {
			remember.run(userId, username, Date.now());
		},
		resolveName(username: string): string | null {
			return (byName.get(username) as {user_id: string} | null)?.user_id ?? null;
		},
		all(): Array<{user_id: string; badge_id: string; granted_at: number}> {
			return db.query('SELECT user_id, badge_id, granted_at FROM user_badges ORDER BY user_id, granted_at').all() as Array<{
				user_id: string;
				badge_id: string;
				granted_at: number;
			}>;
		},
	};
}
