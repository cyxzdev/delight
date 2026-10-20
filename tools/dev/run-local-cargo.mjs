import {spawn} from 'node:child_process';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const cargoHome = resolve(workspaceRoot, '.cargo-home');
const command = process.platform === 'win32' ? 'cargo.exe' : 'cargo';
const cargoArgs = process.argv.slice(2);
const startupTimeouts = [
	['FLUXER_DEV_RUST_SERVICE_READY_TIMEOUT', '900'],
	['FLUXER_DEV_GATEWAY_READY_TIMEOUT', '900'],
	['FLUXER_DEV_API_READY_TIMEOUT', '900'],
].map(([name, fallback]) => [name, process.env[name] ?? fallback]);

function run(program, args, env = process.env) {
	return new Promise((resolveExit) => {
		const child = spawn(program, args, {
			cwd: workspaceRoot,
			env,
			stdio: 'inherit',
			windowsHide: process.platform === 'win32',
		});

		child.on('error', (error) => {
			console.error(`Could not start ${program}: ${error.message}`);
			resolveExit(1);
		});

		child.on('exit', (code, signal) => {
			resolveExit(signal ? 1 : (code ?? 1));
		});
	});
}

if (process.platform === 'win32') {
	const composeArgs = ['compose', '-f', '.devcontainer/docker-compose.yml'];
	const startupExitCode = await run('docker', [...composeArgs, 'up', '-d']);
	if (startupExitCode !== 0) {
		process.exitCode = startupExitCode;
	} else {
		const startupEnvArgs = startupTimeouts.flatMap(([name, value]) => ['-e', `${name}=${value}`]);
		process.exitCode = await run('docker', [
			...composeArgs,
			'exec',
			'-T',
			...startupEnvArgs,
			'workspace',
			'node',
			'tools/dev/run-local-cargo.mjs',
			...cargoArgs,
		]);
	}
} else {
	process.exitCode = await run(command, cargoArgs, {
		...process.env,
		CARGO_HOME: cargoHome,
		...Object.fromEntries(startupTimeouts),
	});
}
