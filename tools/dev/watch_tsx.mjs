// SPDX-License-Identifier: AGPL-3.0-or-later

import { spawn } from 'node:child_process';
import { readdir, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [tsxCli, entrypoint] = process.argv.slice(2);

if (!tsxCli || !entrypoint) {
	console.error('Usage: node watch_tsx.mjs <tsx-cli> <entrypoint>');
	process.exit(2);
}

const apiRoot = process.cwd();
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const apiSource = join(apiRoot, 'src');
const packagesRoot = join(repoRoot, 'packages');
const fixedFiles = [
	join(apiRoot, 'package.json'),
	join(apiRoot, 'tsconfig.json'),
	join(repoRoot, 'package.json'),
	join(repoRoot, 'pnpm-workspace.yaml'),
	join(repoRoot, 'tsconfig.base.json'),
];
const ignoredDirectories = new Set(['.git', 'node_modules', 'test', 'tests', '__tests__', 'coverage', 'dist']);
const sourceExtensions = new Set(['.cjs', '.cts', '.js', '.json', '.jsx', '.mjs', '.mts', '.ts', '.tsx']);
const pollIntervalMs = Math.max(500, Number(process.env.FLUXER_DEV_TS_POLL_MS) || 1000);

const sleep = (durationMs) => new Promise((resolvePromise) => setTimeout(resolvePromise, durationMs));

async function collectSourceFiles(directory, files) {
	let entries;
	try {
		entries = await readdir(directory, { withFileTypes: true });
	} catch (error) {
		if (error.code === 'ENOENT') return;
		throw error;
	}

	for (const entry of entries) {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) {
			if (!ignoredDirectories.has(entry.name)) await collectSourceFiles(path, files);
			continue;
		}
		if (!entry.isFile() || !sourceExtensions.has(extname(entry.name)) || entry.name.endsWith('.d.ts')) continue;
		if (/\.(?:test|spec|stories)\.[^.]+$/.test(entry.name)) continue;
		files.add(path);
	}
}

async function sourceFiles() {
	const files = new Set(fixedFiles);
	await collectSourceFiles(apiSource, files);
	let packages;
	try {
		packages = await readdir(packagesRoot, { withFileTypes: true });
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
		packages = [];
	}
	for (const entry of packages) {
		if (!entry.isDirectory()) continue;
		const packageRoot = join(packagesRoot, entry.name);
		files.add(join(packageRoot, 'package.json'));
		await collectSourceFiles(join(packageRoot, 'src'), files);
	}
	return files;
}

async function snapshot() {
	const paths = await sourceFiles();
	const result = new Map();
	const queue = [...paths];
	let cursor = 0;
	const readers = Array.from({ length: Math.min(8, queue.length) }, async () => {
		while (cursor < queue.length) {
			const path = queue[cursor++];
			try {
				const metadata = await stat(path);
				result.set(path, `${metadata.size}:${metadata.mtimeMs}`);
			} catch (error) {
				if (error.code !== 'ENOENT') throw error;
			}
		}
	});
	await Promise.all(readers);
	return result;
}

function snapshotsMatch(left, right) {
	if (left.size !== right.size) return false;
	for (const [path, signature] of left) {
		if (right.get(path) !== signature) return false;
	}
	return true;
}

function startEntrypoint() {
	console.log(`[dev-ts-watch] Starting ${entrypoint}`);
	const child = spawn(tsxCli, [entrypoint], {
		cwd: apiRoot,
		env: process.env,
		stdio: 'inherit',
	});
	child.on('error', (error) => {
		console.error(`[dev-ts-watch] Could not start ${entrypoint}:`, error);
		if (!stopping && !restarting) process.exit(1);
	});
	child.on('exit', (code, signal) => {
		if (!stopping && !restarting) {
			console.error(`[dev-ts-watch] ${entrypoint} exited (${signal ?? code ?? 'unknown'})`);
			process.exit(code ?? 1);
		}
	});
	return child;
}

async function stopEntrypoint(child) {
	if (!child || child.exitCode !== null || child.signalCode !== null) return;
	const exited = new Promise((resolvePromise) => child.once('exit', resolvePromise));
	child.kill('SIGTERM');
	let timer;
	await Promise.race([
		exited,
		new Promise((resolvePromise) => {
			timer = setTimeout(() => {
				child.kill('SIGKILL');
				resolvePromise();
			}, 5000);
		}),
	]);
	clearTimeout(timer);
}

let stopping = false;
let restarting = false;
let child;
let currentSnapshot;
let scanInProgress = false;
let pollTimer;

async function shutdown(exitCode) {
	if (stopping) return;
	stopping = true;
	clearInterval(pollTimer);
	await stopEntrypoint(child);
	process.exit(exitCode);
}

process.once('SIGINT', () => void shutdown(130));
process.once('SIGTERM', () => void shutdown(143));

async function pollForChanges() {
	if (scanInProgress || stopping) return;
	scanInProgress = true;
	try {
		const nextSnapshot = await snapshot();
		if (!snapshotsMatch(currentSnapshot, nextSnapshot)) {
			await sleep(250);
			currentSnapshot = await snapshot();
			console.log(`[dev-ts-watch] Source change detected; restarting ${entrypoint}`);
			restarting = true;
			await stopEntrypoint(child);
			if (!stopping) child = startEntrypoint();
			restarting = false;
		} else {
			currentSnapshot = nextSnapshot;
		}
	} catch (error) {
		console.error('[dev-ts-watch] Source polling failed:', error);
		process.exitCode = 1;
		void shutdown(1);
	} finally {
		scanInProgress = false;
	}
}

currentSnapshot = await snapshot();
console.log(`[dev-ts-watch] Polling ${currentSnapshot.size} API/workspace source files every ${pollIntervalMs}ms`);
child = startEntrypoint();
pollTimer = setInterval(() => void pollForChanges(), pollIntervalMs);
