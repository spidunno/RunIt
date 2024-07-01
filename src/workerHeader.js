for (const key of Object.keys(console)) {
	if (typeof console[key] === 'function') {
		console[key] = () => undefined;
	}
}
(await import("https://esm.sh/console-feed")).Hook(console,postMessage.bind(this));
onerror=console.error;
delete globalThis.postMessage;