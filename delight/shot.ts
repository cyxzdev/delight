// Dev helper: screenshots of the running site through a shared headless Chrome (CDP on 9444, profile in /tmp).
//   bun scripts/shot.ts login [user] [password]     sign in once; the session persists in the profile
//   bun scripts/shot.ts png <path-or-url> <out.png> [--w 1440 --h 900 --wait 2500 --eval "<js run before shot>"]
//   bun scripts/shot.ts eval <path> <js>            open a page, evaluate, print JSON
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const PORT = +(process.env.SHOT_PORT || 9474);
const BASE = process.env.DELIGHT_URL || 'http://localhost:3131';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

async function ensureChrome() {
	try {
		await fetch(`http://127.0.0.1:${PORT}/json/version`);
		return;
	} catch {}
	spawn(CHROME, [`--remote-debugging-port=${PORT}`, '--headless=new', `--user-data-dir=/tmp/delight-fluxer-shot-${PORT}`, '--no-first-run', '--hide-scrollbars', '--window-size=1440,900', 'about:blank'], { detached: true, stdio: 'ignore' }).unref();
	for (let i = 0; i < 50; i++) {
		await Bun.sleep(200);
		try {
			await fetch(`http://127.0.0.1:${PORT}/json/version`);
			return;
		} catch {}
	}
	throw new Error('chrome did not start');
}

async function connect() {
	await ensureChrome();
	// A fresh tab per run, so several runs can screenshot at once; the profile keeps the session.
	const p = (await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: 'PUT' })).json()) as any;
	const ws = new WebSocket(p.webSocketDebuggerUrl);
	await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
	let id = 0;
	const pending = new Map<number, (m: any) => void>();
	ws.onmessage = (e) => {
		const m = JSON.parse(String(e.data));
		if (m.id && pending.has(m.id)) (pending.get(m.id)!(m), pending.delete(m.id));
	};
	const send = (method: string, params: any = {}) =>
		new Promise<any>((r) => {
			const i = ++id;
			pending.set(i, r);
			ws.send(JSON.stringify({ id: i, method, params }));
		});
	const evaluate = async (expression: string) => {
		const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
		return r.result?.result?.value ?? r.result?.exceptionDetails?.exception?.description;
	};
	const close = () => fetch(`http://127.0.0.1:${PORT}/json/close/${p.id}`).catch(() => {});
	return { ws, send, evaluate, close };
}

function flag(name: string, def: string) {
	const i = process.argv.indexOf(`--${name}`);
	return i > 0 ? process.argv[i + 1] : def;
}

const [cmd, a, b] = process.argv.slice(2);
const { ws, send, evaluate, close } = await connect();
await send('Page.enable');
await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setDeviceMetricsOverride', { width: +flag('w', '1440'), height: +flag('h', '900'), deviceScaleFactor: 1, mobile: false });

if (cmd === 'login') {
	await send('Page.navigate', { url: `${BASE}/login` });
	await Bun.sleep(4000);
	const user = a || 'demo@delight.local';
	const pass = b || 'delight-demo-password';
	await evaluate(`(() => {
		const set = (el, v) => { const d = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value'); d.set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); };
		const inputs = [...document.querySelectorAll('input')];
		set(inputs.find(i => i.type === 'email' || i.type === 'text'), ${JSON.stringify(user)});
		set(inputs.find(i => i.type === 'password'), ${JSON.stringify(pass)});
		(document.querySelector('button[type=submit]') || [...document.querySelectorAll('button')].find(b => /log ?in|sign ?in/i.test(b.textContent))).click();
	})()`);
	await Bun.sleep(4000);
	console.log(await evaluate('location.href'));
} else if (cmd === 'png') {
	const url = a.startsWith('http') ? a : BASE + (a.startsWith('/') ? a : '/' + a);
	await send('Page.navigate', { url });
	await Bun.sleep(+flag('wait', '2500'));
	const js = flag('eval', '');
	if (js) {
		console.log(JSON.stringify(await evaluate(js)));
		await Bun.sleep(800);
	}
	const shot = await send('Page.captureScreenshot', { format: 'png' });
	writeFileSync(b, Buffer.from(shot.result.data, 'base64'));
	console.log(b);
} else if (cmd === 'eval') {
	await send('Page.navigate', { url: a.startsWith('http') ? a : BASE + a });
	await Bun.sleep(+flag('wait', '2500'));
	console.log(JSON.stringify(await evaluate(b), null, 1));
} else {
	console.log('usage: bun scripts/shot.ts login|png|eval …');
}
ws.close();
await close();
process.exit(0);
