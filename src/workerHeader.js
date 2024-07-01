for (const key of Object.keys(console)) {
	if (typeof console[key] === 'function') {
		console[key] = () => undefined;
	}
}
(await import("https://esm.sh/console-feed")).Hook(console,postMessage.bind(this));
onerror=(ev, source, lineno, colno, error) => {console.error(error); return false};
globalThis.onunhandledrejection=ev=>{ev.preventDefault();console.error(ev.reason);return false};
delete globalThis.postMessage;