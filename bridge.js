const manifest = chrome.runtime.getManifest();
const runnerInfo = {
	name: manifest.name,
	version: manifest.version,
	author: manifest.author,
	homepage: manifest.homepage_url,
};

window.addEventListener('HWrunner:extension-info-request', (event) => {
	const { id } = event.detail || {};
	if (!id) {
		return;
	}

	window.dispatchEvent(new CustomEvent('HWrunner:extension-info-response', {
		detail: { id, runnerInfo },
	}));
});

window.addEventListener('HWrunner:extension-request', (event) => {
	const { id, request } = event.detail || {};
	if (!id || !request) {
		return;
	}

	chrome.runtime.sendMessage({ type: 'HWrunner:request', request })
		.then((result) => {
			window.dispatchEvent(new CustomEvent('HWrunner:extension-response', {
				detail: { id, ...result },
			}));
		})
		.catch((error) => {
			window.dispatchEvent(new CustomEvent('HWrunner:extension-response', {
				detail: { id, error: { message: error.message || 'Request failed' } },
			}));
		});
});
