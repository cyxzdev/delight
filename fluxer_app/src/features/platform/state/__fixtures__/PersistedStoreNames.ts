// SPDX-License-Identifier: AGPL-3.0-or-later

import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {AppStorageKey} from '@app/features/platform/state/AppStorageKeys';

const SOURCE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const EXCLUDED_PATH_PATTERN = /node_modules|\.test\.|__fixtures__/;
const PERSISTED_STORE_PATTERN = /makePersistent\(\s*this,\s*([A-Za-z_.']+)/g;

function collectSourceFiles(directory: string): Array<string> {
	const files: Array<string> = [];
	for (const entry of readdirSync(directory, {withFileTypes: true})) {
		const path = join(directory, entry.name);
		if (EXCLUDED_PATH_PATTERN.test(path)) {
			continue;
		}
		if (entry.isDirectory()) {
			files.push(...collectSourceFiles(path));
		} else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
			files.push(path);
		}
	}
	return files;
}

function resolveStoreName(expression: string, source: string): string {
	if (expression.startsWith("'")) {
		return expression.slice(1, -1);
	}
	const value = expression.startsWith('AppStorageKey.')
		? (AppStorageKey as Record<string, string>)[expression.slice('AppStorageKey.'.length)]
		: new RegExp(`const ${expression} = '([^']+)'`).exec(source)?.[1];
	if (value === undefined) {
		throw new Error(`makePersistent is called with an unresolvable store name: ${expression}`);
	}
	return value;
}

export const STORES_WITHOUT_DEPLOYED_DATA: ReadonlySet<string> = new Set(['SourceMaps', 'BackgroundAccountPresence']);

let cachedPersistedStoreNames: ReadonlyArray<string> | null = null;

export function readPersistedStoreNames(): Array<string> {
	if (cachedPersistedStoreNames) {
		return [...cachedPersistedStoreNames];
	}

	const names = new Set<string>();
	for (const path of collectSourceFiles(SOURCE_ROOT)) {
		const source = readFileSync(path, 'utf8');
		for (const match of source.matchAll(PERSISTED_STORE_PATTERN)) {
			names.add(resolveStoreName(match[1]!, source));
		}
	}
	cachedPersistedStoreNames = [...names].sort();
	return [...cachedPersistedStoreNames];
}
