// Delight: sits between the edge and the prebuilt admin panel, and shows "Delight" wherever the panel's
// hard-coded templates say "Fluxer". Everything else (methods, headers, cookies, redirects, bodies) passes through.
const UPSTREAM = process.env.DELIGHT_ADMIN_UPSTREAM || 'http://admin:8080';
const PRODUCT = process.env.DELIGHT_PRODUCT_NAME || 'Delight';
const WORD = /\bFluxer\b/g;

Bun.serve({
	hostname: process.env.HOST || "0.0.0.0",
	port: Number(process.env.PORT || 3001),
	async fetch(request) {
		const url = new URL(request.url);
		const target = UPSTREAM + url.pathname + url.search;
		const headers = new Headers(request.headers);
		headers.set('accept-encoding', 'identity');
		const upstream = await fetch(target, {
			method: request.method,
			headers,
			body: request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.arrayBuffer(),
			redirect: 'manual',
		});
		const out = new Headers(upstream.headers);
		const type = out.get('content-type') || '';
		if (!/text\/html|text\/plain/.test(type)) {
			return new Response(upstream.body, {status: upstream.status, headers: out});
		}
		const text = (await upstream.text()).replace(WORD, PRODUCT);
		out.delete('content-length');
		out.delete('content-encoding');
		return new Response(text, {status: upstream.status, headers: out});
	},
});
console.log('admin proxy ready');
