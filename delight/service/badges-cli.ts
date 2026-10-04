// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Delight badge admin CLI. Edits the sidecar's SQLite database directly (no HTTP, no auth).
//
//   bun delight/service/badges-cli.ts grant  <userId|username> <badge> [badge…]
//   bun delight/service/badges-cli.ts revoke <userId|username> <badge> [badge…]
//   bun delight/service/badges-cli.ts set    <userId|username> [badge…]      (replaces the whole set; none = clear)
//   bun delight/service/badges-cli.ts show   <userId|username>
//   bun delight/service/badges-cli.ts list                                     (every grant)
//   bun delight/service/badges-cli.ts badges                                   (known badge ids)
//
// Run on the host, it resolves usernames through Fluxer's Postgres and re-runs itself inside the delight-svc
// container (`docker compose exec delight-svc bun /app/badges-cli.ts …`), where the database lives. Inside the
// container it accepts user ids, or usernames of anyone who has used the sidecar.

import {Database} from 'bun:sqlite';
import {existsSync} from 'node:fs';
import {BADGE_ORDER, openBadgeDb} from './badges-db';

const SNOWFLAKE = /^\d{1,20}$/;
const COMMANDS = new Set(['grant', 'revoke', 'set', 'show', 'list', 'badges']);
const DATA_DIR = process.env.DATA_DIR ?? '/data';
const COMPOSE_DIR = `${import.meta.dir}/../../deploy/self-hosting`;

function usage(message?: string): never {
	if (message) console.error(`error: ${message}\n`);
	console.error(
		'usage: badges-cli.ts grant|revoke <user> <badge…> | set <user> [badge…] | show <user> | list | badges\n' +
			`badges: ${BADGE_ORDER.join(', ')}`,
	);
	process.exit(1);
}

const [command, target, ...rest] = process.argv.slice(2);
if (!command || !COMMANDS.has(command)) usage();
if (command === 'badges') {
	console.log(BADGE_ORDER.join('\n'));
	process.exit(0);
}
const needsUser = command !== 'list';
if (needsUser && !target) usage('missing user');
const badges = rest.map((badge) => badge.trim()).filter(Boolean);
for (const badge of badges) {
	if (!(BADGE_ORDER as ReadonlyArray<string>).includes(badge)) usage(`unknown badge "${badge}"`);
}
if ((command === 'grant' || command === 'revoke') && badges.length === 0) usage('missing badge');

const inContainer = existsSync(`${DATA_DIR}/delight.sqlite`) || process.env.DELIGHT_BADGES_LOCAL === '1';

if (!inContainer) {
	// Host: resolve a username via Fluxer's Postgres, then run inside the container.
	let user = target;
	if (needsUser && !SNOWFLAKE.test(target)) {
		const name = target.replace(/^@/, '').replace(/#\d+$/, '');
		if (!/^[\w.-]{1,64}$/.test(name)) usage(`bad username "${target}"`);
		const sql = `select row_data->'user_id'->>'value' from fluxer_kv where table_name='users' and lower(row_data->>'username') = lower('${name}') limit 2`;
		const lookup = Bun.spawnSync(
			['docker', 'compose', 'exec', '-T', 'postgres', 'psql', '-U', 'fluxer', '-d', 'fluxer', '-tAc', sql],
			{cwd: COMPOSE_DIR, stderr: 'inherit'},
		);
		const ids = lookup.stdout.toString().split('\n').map((line) => line.trim()).filter((id) => SNOWFLAKE.test(id));
		if (ids.length !== 1) {
			console.error(ids.length === 0 ? `no user named "${name}"` : `"${name}" is ambiguous: ${ids.join(', ')}`);
			process.exit(1);
		}
		user = ids[0];
		console.error(`${name} → ${user}`);
	}
	const args = ['/app/badges-cli.ts', command, ...(needsUser ? [user] : []), ...badges];
	const run = Bun.spawnSync(['docker', 'compose', 'exec', '-T', 'delight-svc', 'bun', ...args], {
		cwd: COMPOSE_DIR,
		stdout: 'inherit',
		stderr: 'inherit',
	});
	process.exit(run.exitCode ?? 1);
}

const db = new Database(`${DATA_DIR}/delight.sqlite`, {create: true});
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 5000;');
const badgeDb = openBadgeDb(db);

if (command === 'list') {
	for (const row of badgeDb.all()) {
		console.log(`${row.user_id}\t${row.badge_id}\t${new Date(row.granted_at).toISOString()}`);
	}
	process.exit(0);
}

const userId = SNOWFLAKE.test(target) ? target : badgeDb.resolveName(target.replace(/^@/, '').replace(/#\d+$/, ''));
if (!userId) {
	console.error(`unknown user "${target}" (pass a user id, or run this from the host so usernames resolve)`);
	process.exit(1);
}

if (command === 'grant') for (const badge of badges) badgeDb.grant(userId, badge);
else if (command === 'revoke') for (const badge of badges) badgeDb.revoke(userId, badge);
else if (command === 'set') badgeDb.set(userId, badges);

console.log(`${userId}: ${(badgeDb.lookup([userId])[userId] ?? []).join(', ') || '(no badges)'}`);
