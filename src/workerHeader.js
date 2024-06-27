for (const entry of Object.entries(console)) {
	const name = entry[0];
	console[name] = (...data) => {
		postMessage({ method: name, data });
	}
}
onerror = (ev) => {
	console.error(ev);
}