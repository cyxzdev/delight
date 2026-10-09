// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Delight sidecar: small bits of per-user state that Fluxer's API has no field for (the profile effect and profile frame
// each user picked, badges). Served by the edge at /delight/* (Caddy strips the prefix).
//
//   GET  /effects?ids=1,2,3   → {"1": "snowfall", "3": "none"}   (only ids with a stored choice)
//   PUT  /effects/@me          body {"effect": "<id>" | "none" | null}   (null clears → client falls back to default rule)
//   GET  /badges?ids=1,2,3    → {"1": ["og","staff"]}           (only ids with badges; public)
//   GET  /badges/@me/manage   → {"can_manage": bool}             (is the caller badge staff?)
//   PUT  /badges/:userId       body {"badges": ["og", ...]}      (staff only; replaces the set)
//   POST /badges/:userId/:id   DELETE /badges/:userId/:id         (staff only; grant / revoke one)
//   GET  /badge-assets/<id>.png, <id>@64.png                      (badge artwork, from ./badges)
//   GET  /frames?ids=1,2,3    → {"1": "starlit_sparkles"}       (only ids with a stored choice)
//   PUT  /frames/@me           body {"frame": "<id>" | "none" | null}   (null clears; default is no frame)
//   GET  /frame-assets/<frameId>/<name>.webp                      (profile frame artwork, from ./frames)
//   GET  /effect-assets/<effectId>/<name>.(mp4|webm|webp)          (video profile effects, from ./effects; Range-aware)
//
// Premium effects (PREMIUM_EFFECT_IDS) can only be saved by users holding a premium badge (PREMIUM_BADGES: subscriber or
// staff); others get 403 {"error": "premium required"}. A stored premium pick is only served while its owner is premium.
//   GET  /health               → "ok"
//
// Writes are authenticated by forwarding the caller's Authorization header to Fluxer's API (GET /v1/users/@me).
// Badge staff = Fluxer instance admins (`acls` contains "*" or "user:update:flags", or `is_staff`), plus any id in
// DELIGHT_ADMIN_USER_IDS. badges-cli.ts edits the same database without HTTP.

import {Database} from 'bun:sqlite';
import {BADGE_IDS, openBadgeDb} from './badges-db';

const PORT = Number(process.env.PORT ?? 3000);
const DATA_DIR = process.env.DATA_DIR ?? '/data';
const FLUXER_API_URL = (process.env.FLUXER_API_URL ?? 'http://api:8080').replace(/\/$/, '');
const FLUXER_ORIGIN = process.env.FLUXER_ORIGIN ?? 'http://localhost:3131';

/** Keep in sync with PROFILE_EFFECTS in fluxer_app/src/features/user/components/profile_effects/registry.ts. */
const EFFECT_IDS = new Set(
	(
		process.env.DELIGHT_EFFECT_IDS ??
		'spark_surge,sakura_drift,snowfall,ember,starlight,heartbeat,rainy_day,bubbles,confetti,glitch,synthwave,gilded_banner,' +
			'seraph,moonwing,halo_light,feather_fall,stardust_veil'
	)
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean),
);
/**
 * Effects only premium users may pick (the "Angelic" collection). Keep in sync with PREMIUM_PROFILE_EFFECT_IDS in
 * fluxer_app/src/features/user/utils/ProfileEffectIds.ts.
 */
const PREMIUM_EFFECT_IDS = new Set(
	(process.env.DELIGHT_PREMIUM_EFFECT_IDS ?? 'seraph,moonwing,halo_light,feather_fall,stardust_veil')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean),
);
/** Effects switched off for now (stay in the code and assets, but nobody can pick or show them). */
const DISABLED_EFFECT_IDS = new Set(
	(process.env.DELIGHT_DISABLED_EFFECT_IDS ?? 'seraph,moonwing,halo_light,feather_fall,stardust_veil')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean),
);
/** Badges that make a user premium. Keep in sync with PREMIUM_BADGE_IDS in ProfileEffectIds.ts. */
const PREMIUM_BADGES = new Set(
	(process.env.DELIGHT_PREMIUM_BADGES ?? 'subscriber,staff')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean),
);
const EFFECT_ASSET_DIR = process.env.DELIGHT_EFFECT_ASSET_DIR ?? `${import.meta.dir}/../effects`;
/** Keep in sync with PROFILE_FRAME_IDS in fluxer_app/src/features/user/utils/ProfileFrameIds.ts. */
const FRAME_IDS = new Set(
	(process.env.DELIGHT_FRAME_IDS ?? 'starlit_sparkles,candle_drip,eclipse,rose_filigree,kitty_ears')
		.split(',')
		.map((id) => id.trim())
		.filter(Boolean),
);
const FRAME_ASSET_DIR = process.env.DELIGHT_FRAME_ASSET_DIR ?? `${import.meta.dir}/../frames`;
const MAX_IDS = 200;
const SNOWFLAKE = /^\d{1,20}$/;

const db = new Database(`${DATA_DIR}/delight.sqlite`, {create: true});
db.exec('PRAGMA journal_mode = WAL;');
db.exec(
	'CREATE TABLE IF NOT EXISTS profile_effects (user_id TEXT PRIMARY KEY, effect TEXT NOT NULL, updated_at INTEGER NOT NULL)',
);
const badgeDb = openBadgeDb(db);
const BADGE_ASSET_DIR = process.env.DELIGHT_BADGE_ASSET_DIR ?? `${import.meta.dir}/../badges`;
const ADMIN_USER_IDS = new Set(
	(process.env.DELIGHT_ADMIN_USER_IDS ?? '')
		.split(',')
		.map((id) => id.trim())
		.filter((id) => SNOWFLAKE.test(id)),
);
const ADMIN_ACLS = new Set(['*', 'user:update:flags']);
const upsertEffect = db.prepare(
	'INSERT INTO profile_effects (user_id, effect, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET effect = ?2, updated_at = ?3',
);
const deleteEffect = db.prepare('DELETE FROM profile_effects WHERE user_id = ?1');
db.exec(
	'CREATE TABLE IF NOT EXISTS profile_frames (user_id TEXT PRIMARY KEY, frame TEXT NOT NULL, updated_at INTEGER NOT NULL)',
);
const upsertFrame = db.prepare(
	'INSERT INTO profile_frames (user_id, frame, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(user_id) DO UPDATE SET frame = ?2, updated_at = ?3',
);
const deleteFrame = db.prepare('DELETE FROM profile_frames WHERE user_id = ?1');

// --- auth: Authorization header → user id (cached briefly so a burst of saves costs one API call) ---

interface Caller {
	userId: string;
	isAdmin: boolean;
}

const authCache = new Map<string, Caller & {expires: number}>();

async function resolveUserId(authorization: string | null, forwardedFor: string | null): Promise<string | null> {
	return (await resolveCaller(authorization, forwardedFor))?.userId ?? null;
}

async function resolveCaller(authorization: string | null, forwardedFor: string | null): Promise<Caller | null> {
	if (!authorization || authorization.length > 512) return null;
	const cached = authCache.get(authorization);
	if (cached && cached.expires > Date.now()) return cached;
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
		const body = (await response.json()) as {id?: unknown; username?: unknown; is_staff?: unknown; acls?: unknown};
		const userId = typeof body.id === 'string' && SNOWFLAKE.test(body.id) ? body.id : null;
		if (!userId) return null;
		const acls = Array.isArray(body.acls) ? body.acls : [];
		const isAdmin =
			body.is_staff === true || ADMIN_USER_IDS.has(userId) || acls.some((acl) => ADMIN_ACLS.has(String(acl)));
		if (typeof body.username === 'string') badgeDb.rememberName(userId, body.username);
		const caller = {userId, isAdmin};
		if (authCache.size > 5000) authCache.clear();
		authCache.set(authorization, {...caller, expires: Date.now() + 60_000});
		return caller;
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
	const premiumRows = rows.filter((row) => PREMIUM_EFFECT_IDS.has(row.effect));
	const badges = premiumRows.length > 0 ? badgeDb.lookup(premiumRows.map((row) => row.user_id)) : {};
	for (const row of rows) {
		if (DISABLED_EFFECT_IDS.has(row.effect)) continue;
		// A premium pick only shows while its owner is premium (otherwise they fall back to the default rule).
		if (PREMIUM_EFFECT_IDS.has(row.effect) && !isPremium(badges[row.user_id])) continue;
		result[row.user_id] = row.effect;
	}
	return json(result);
}

function isPremium(badges: ReadonlyArray<string> | undefined): boolean {
	return (badges ?? []).some((id) => PREMIUM_BADGES.has(id));
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
	if (typeof effect === 'string' && DISABLED_EFFECT_IDS.has(effect)) return json({error: 'effect unavailable'}, 400);
	if (typeof effect === 'string' && PREMIUM_EFFECT_IDS.has(effect) && !isPremium(badgeDb.lookup([userId])[userId])) {
		return json({error: 'premium required'}, 403);
	}
	if (!allowWrite(userId)) return json({error: 'slow down'}, 429);
	if (effect === null) deleteEffect.run(userId);
	else upsertEffect.run(userId, effect, Date.now());
	return json({user_id: userId, effect});
}

function getFrames(url: URL): Response {
	const ids = parseIds(url);
	if (ids instanceof Response) return ids;
	if (ids.length === 0) return json({});
	const rows = db
		.query(`SELECT user_id, frame FROM profile_frames WHERE user_id IN (${ids.map(() => '?').join(',')})`)
		.all(...ids) as Array<{user_id: string; frame: string}>;
	const result: Record<string, string> = {};
	for (const row of rows) result[row.user_id] = row.frame;
	return json(result);
}

async function putOwnFrame(request: Request): Promise<Response> {
	const userId = await resolveUserId(request.headers.get('authorization'), request.headers.get('x-forwarded-for'));
	if (!userId) return json({error: 'unauthorized'}, 401);
	let body: {frame?: unknown};
	try {
		body = (await request.json()) as {frame?: unknown};
	} catch {
		return json({error: 'invalid json'}, 400);
	}
	const frame = body?.frame;
	if (frame !== null && frame !== 'none' && !(typeof frame === 'string' && FRAME_IDS.has(frame))) {
		return json({error: 'unknown frame'}, 400);
	}
	if (!allowWrite(userId)) return json({error: 'slow down'}, 429);
	if (frame === null) deleteFrame.run(userId);
	else upsertFrame.run(userId, frame, Date.now());
	return json({user_id: userId, frame});
}

const FRAME_ASSET = /^\/frame-assets\/([a-z_]+)\/([a-z0-9_-]+)\.(webp|png)$/;

async function getFrameAsset(pathname: string): Promise<Response> {
	const match = FRAME_ASSET.exec(pathname);
	if (!match || !FRAME_IDS.has(match[1])) return json({error: 'not found'}, 404);
	const file = Bun.file(`${FRAME_ASSET_DIR}/${match[1]}/${match[2]}.${match[3]}`);
	if (!(await file.exists())) return json({error: 'not found'}, 404);
	return new Response(file, {
		headers: {'Content-Type': `image/${match[3]}`, 'Cache-Control': 'public, max-age=86400'},
	});
}

const EFFECT_ASSET = /^\/effect-assets\/([a-z_]+)\/([a-z0-9_-]+)\.(mp4|webm|webp)$/;
const EFFECT_ASSET_TYPES: Record<string, string> = {mp4: 'video/mp4', webm: 'video/webm', webp: 'image/webp'};

/** Video effect artwork. Honours single byte ranges, which Safari needs before it will play a video. */
async function getEffectAsset(request: Request, pathname: string): Promise<Response> {
	const match = EFFECT_ASSET.exec(pathname);
	if (!match || !EFFECT_IDS.has(match[1])) return json({error: 'not found'}, 404);
	const file = Bun.file(`${EFFECT_ASSET_DIR}/${match[1]}/${match[2]}.${match[3]}`);
	if (!(await file.exists())) return json({error: 'not found'}, 404);
	const headers: Record<string, string> = {
		'Content-Type': EFFECT_ASSET_TYPES[match[3]],
		'Cache-Control': 'public, max-age=86400',
		'Accept-Ranges': 'bytes',
	};
	const size = file.size;
	const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
	if (range && (range[1] || range[2])) {
		let start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
		let end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
		if (start >= size || start > end) {
			return new Response(null, {status: 416, headers: {...headers, 'Content-Range': `bytes */${size}`}});
		}
		start = Math.max(0, start);
		end = Math.max(start, end);
		return new Response(file.slice(start, end + 1), {
			status: 206,
			headers: {...headers, 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1)},
		});
	}
	return new Response(file, {headers});
}

function parseIds(url: URL): Array<string> | Response {
	const ids = [
		...new Set(
			(url.searchParams.get('ids') ?? '')
				.split(',')
				.map((id) => id.trim())
				.filter((id) => SNOWFLAKE.test(id)),
		),
	];
	if (ids.length > MAX_IDS) return json({error: `at most ${MAX_IDS} ids`}, 400);
	return ids;
}

function getBadges(url: URL): Response {
	const ids = parseIds(url);
	if (ids instanceof Response) return ids;
	return json(badgeDb.lookup(ids));
}

async function requireAdmin(request: Request): Promise<Caller | Response> {
	const caller = await resolveCaller(request.headers.get('authorization'), request.headers.get('x-forwarded-for'));
	if (!caller) return json({error: 'unauthorized'}, 401);
	if (!caller.isAdmin) return json({error: 'forbidden'}, 403);
	if (!allowWrite(caller.userId)) return json({error: 'slow down'}, 429);
	return caller;
}

async function handleBadgeWrite(request: Request, userId: string, badgeId: string | null): Promise<Response> {
	if (!SNOWFLAKE.test(userId)) return json({error: 'bad user id'}, 400);
	const caller = await requireAdmin(request);
	if (caller instanceof Response) return caller;
	if (badgeId == null) {
		let body: {badges?: unknown};
		try {
			body = (await request.json()) as {badges?: unknown};
		} catch {
			return json({error: 'invalid json'}, 400);
		}
		if (!Array.isArray(body?.badges) || body.badges.some((id) => typeof id !== 'string' || !BADGE_IDS.has(id))) {
			return json({error: 'unknown badge'}, 400);
		}
		badgeDb.set(userId, body.badges as Array<string>);
	} else {
		if (!BADGE_IDS.has(badgeId)) return json({error: 'unknown badge'}, 400);
		if (request.method === 'POST') badgeDb.grant(userId, badgeId);
		else badgeDb.revoke(userId, badgeId);
	}
	console.log(`badges: ${caller.userId} ${request.method} ${userId} ${badgeId ?? '(set)'}`);
	return json({user_id: userId, badges: badgeDb.lookup([userId])[userId] ?? []});
}

const BADGE_ASSET = /^\/badge-assets\/([a-z_]+)(@64)?\.png$/;

async function getBadgeAsset(pathname: string): Promise<Response> {
	const match = BADGE_ASSET.exec(pathname);
	if (!match || !BADGE_IDS.has(match[1])) return json({error: 'not found'}, 404);
	const file = Bun.file(`${BADGE_ASSET_DIR}/${match[1]}${match[2] ?? ''}.png`);
	if (!(await file.exists())) return json({error: 'not found'}, 404);
	return new Response(file, {
		headers: {'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400'},
	});
}

const BADGE_WRITE = /^\/badges\/(\d{1,20})(?:\/([a-z_]+))?$/;

Bun.serve({
	hostname: process.env.HOST || "0.0.0.0",
	port: PORT,
	async fetch(request) {
		const url = new URL(request.url);
		try {
			if (url.pathname === '/health') return new Response('ok');
			if (url.pathname === '/effects' && request.method === 'GET') return getEffects(url);
			if (url.pathname === '/effects/@me' && request.method === 'PUT') return await putOwnEffect(request);
			if (url.pathname === '/frames' && request.method === 'GET') return getFrames(url);
			if (url.pathname === '/frames/@me' && request.method === 'PUT') return await putOwnFrame(request);
			if (url.pathname.startsWith('/frame-assets/') && request.method === 'GET') {
				return await getFrameAsset(url.pathname);
			}
			if (url.pathname.startsWith('/effect-assets/') && (request.method === 'GET' || request.method === 'HEAD')) {
				return await getEffectAsset(request, url.pathname);
			}
			if (url.pathname === '/badges' && request.method === 'GET') return getBadges(url);
			if (url.pathname === '/badges/@me/manage' && request.method === 'GET') {
				const caller = await resolveCaller(
					request.headers.get('authorization'),
					request.headers.get('x-forwarded-for'),
				);
				return json({can_manage: caller?.isAdmin ?? false});
			}
			if (url.pathname.startsWith('/badge-assets/') && request.method === 'GET') {
				return await getBadgeAsset(url.pathname);
			}
			const badgeWrite = BADGE_WRITE.exec(url.pathname);
			if (badgeWrite) {
				const [, userId, badgeId] = badgeWrite;
				if (!badgeId && request.method === 'PUT') return await handleBadgeWrite(request, userId, null);
				if (badgeId && (request.method === 'POST' || request.method === 'DELETE')) {
					return await handleBadgeWrite(request, userId, badgeId);
				}
			}
			return json({error: 'not found'}, 404);
		} catch (error) {
			console.error(error);
			return json({error: 'internal error'}, 500);
		}
	},
});

console.log(`delight-svc listening on :${PORT} (${EFFECT_IDS.size} effects, ${PREMIUM_EFFECT_IDS.size} premium, ${FRAME_IDS.size} frames, ${BADGE_IDS.size} badges)`);
