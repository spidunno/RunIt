for (const key of Object.keys(console)) {
	if (typeof console[key] === 'function') {
		console[key] = () => undefined;
	}
}
(await import("https://esm.sh/console-feed")).Hook(console,postMessage.bind(this));
onerror=(ev, source, lineno, colno, error) => {console.error(error); return false};
globalThis.onunhandledrejection=ev=>{ev.preventDefault();console.error(ev.reason);return false};
(() => {
	const pm = postMessage.bind(this);
	globalThis.prompt = (message, defaultValue) => {
	const sab = new SharedArrayBuffer(8, {maxByteLength: 16384});
	const ia = new Int32Array(sab);
	const ua = new Uint8Array(sab);
	pm([{ method: 'prompt', data: [sab, message, defaultValue] }]);
	Atomics.wait(ia, 0, 0);
	const td = new TextDecoder();
	return td.decode(ua.slice(8)) || '';
}})();
delete globalThis.postMessage;