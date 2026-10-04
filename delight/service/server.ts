// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Delight sidecar: small bits of per-user state that Fluxer's API has no field for (today: the profile effect each user
// picked). Served by the edge at /delight/* (Caddy strips the prefix).
//
//   GET  /effects?ids=1,2,3   → {"1": "snowfall", "3": "none"}   (only ids with a stored choice)
//   PUT  /effects/@me          body {"effect": "<id>" | "none" | null}   (null clears → client falls back to default rule)
//   GET  /health               → "ok"
//
// PUT is authenticated by forwarding the caller's Authorization header to Fluxer's API (GET /v1/users/@me).

import {Database} from 'bun:sqlite';

const PORT = Number(process.env.PORT ?? 3000);
const DATA_DIR = process.env.DATA_DIR ?? '/data';
const FLUXER_API_URL = (process.env.FLUXER_API_URL ?? 'http://api:8080').replace(/\/$/, '');
const FLUXER_ORIGIN = process.env.FLUXER_ORIGIN ?? 'http://localhost:3131';

/** Keep in sync with PROFILE_EFFECTS in fluxer_app/src/features/user/components/profile_effects/registry.ts. */
const EFFECT_IDS = new Set(
	(
		process.env.DELIGHT_EFFECT_IDS ??
		'spark_surge,sakura_drift,snowfall,ember,starlight,heartbeat,rainy_day,bubbles,confetti,glitch,synthwave'
	)
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean),
);
const MAX_IDS = 200;
const SNOWFLAKE = /^\d{1,20}$/;

const db = new Database(`${DATA_DIR}/delight.sqlite`, {create: true});
db.exec('PRAGMA journal_mode = WAL;');
db.exec(
	'CREATE TABLE IF NOT EXISTS profile_effects (user_id TEXT PRIMARY KEY, effect TEXT NOT NULL, updated_at INTEGER NOT NULL)',
);
const upsertEffect = db.prepare(
	'INSERT INTO profile_effects (user_id, effect, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET effect = ?2, updated_at = ?3',
);
const deleteEffect = db.prepare('DELETE FROM profile_effects WHERE user_id = ?1');

// --- auth: Authorization header → user id (cached briefly so a burst of saves costs one API call) ---

const authCache = new Map<string, {userId: string; expires: number}>();

async function resolveUserId(authorization: string | null, forwardedFor: string | null): Promise<string | null> {
	if (!authorization || authorization.length > 512) return null;
	const cached = authCache.get(authorization);
	if (cached && cached.expires > Date.now()) return cached.userId;
	try {
		const response = await fetch(`${FLUXER_API_URL}/v1/users/@me`, {
			// Fluxer's API rejects requests without a client IP header (it trusts the edge's X-Forwarded-For); pass the
			// caller's on.
			headers: {
				Authorization: authorization,
				Origin: FLUXER_ORIGIN,
				Accept: 'application/json',
				'X-Forwarded-For': forwardedFor || '127.0.0.1',
			},
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) return null;
		const body = (await response.json()) as {id?: unknown};
		const userId = typeof body.id === 'string' && SNOWFLAKE.test(body.id) ? body.id : null;
		if (userId) {
			if (authCache.size > 5000) authCache.clear();
			authCache.set(authorization, {userId, expires: Date.now() + 60_000});
		}
		return userId;
	} catch (error) {
		console.error('auth lookup failed', error);
		return null;
	}
}

// --- light rate limit for writes: 20 per minute per user ---

const writes = new Map<string, number[]>();

function allowWrite(userId: string): boolean {
	const now = Date.now();
	const recent = (writes.get(userId) ?? []).filter((t) => now - t < 60_000);
	if (recent.length >= 20) {
		writes.set(userId, recent);
		return false;
	}
	recent.push(now);
	writes.set(userId, recent);
	if (writes.size > 10_000) writes.clear();
	return true;
}

function json(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {'Content-Type': 'application/json', 'Cache-Control': 'no-store'},
	});
}

function getEffects(url: URL): Response {
	const ids = [
		...new Set(
			(url.searchParams.get('ids') ?? '')
				.split(',')
				.map((id) => id.trim())
				.filter((id) => SNOWFLAKE.test(id)),
		),
	];
	if (ids.length > MAX_IDS) return json({error: `at most ${MAX_IDS} ids`}, 400);
	if (ids.length === 0) return json({});
	const rows = db
		.query(`SELECT user_id, effect FROM profile_effects WHERE user_id IN (${ids.map(() => '?').join(',')})`)
		.all(...ids) as Array<{user_id: string; effect: string}>;
	const result: Record<string, string> = {};
	for (const row of rows) result[row.user_id] = row.effect;
	return json(result);
}

async function putOwnEffect(request: Request): Promise<Response> {
	const userId = await resolveUserId(
		request.headers.get('authorization'),
		request.headers.get('x-forwarded-for'),
	);
	if (!userId) return json({error: 'unauthorized'}, 401);
	let body: {effect?: unknown};
	try {
		body = (await request.json()) as {effect?: unknown};
	} catch {
		return json({error: 'invalid json'}, 400);
	}
	const effect = body?.effect;
	if (effect !== null && effect !== 'none' && !(typeof effect === 'string' && EFFECT_IDS.has(effect))) {
		return json({error: 'unknown effect'}, 400);
	}
	if (!allowWrite(userId)) return json({error: 'slow down'}, 429);
	if (effect === null) deleteEffect.run(userId);
	else upsertEffect.run(userId, effect, Date.now());
	return json({user_id: userId, effect});
}

Bun.serve({
	port: PORT,
	async fetch(request) {
		const url = new URL(request.url);
		try {
			if (url.pathname === '/health') return new Response('ok');
			if (url.pathname === '/effects' && request.method === 'GET') return getEffects(url);
			if (url.pathname === '/effects/@me' && request.method === 'PUT') return await putOwnEffect(request);
			return json({error: 'not found'}, 404);
		} catch (error) {
			console.error(error);
			return json({error: 'internal error'}, 500);
		}
	},
});

console.log(`delight-svc listening on :${PORT} (${EFFECT_IDS.size} effects)`);
