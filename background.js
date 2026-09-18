const allowedHosts = new Set([
	'tools.oaslo.com',
	'raw.githubusercontent.com',
	'api.github.com',
	'community.hero-wars.com',
	'herowars.me',
]);

function validateRequest(request) {
	const url = new URL(request.url);
	const method = String(request.method || 'GET').toUpperCase();
	if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname)) {
		throw new Error('Request host is not allowed');
	}
	if (method !== 'GET' && method !== 'POST') {
		throw new Error('Request method is not allowed');
	}
	return { url, method };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message?.type !== 'HWrunner:request') {
		return;
	}

	(async () => {
		try {
			const { url, method } = validateRequest(message.request || {});
			const response = await fetch(url, {
				method,
				headers: message.request.headers || {},
				body: method === 'GET' ? undefined : message.request.data,
			});
			const headers = Object.fromEntries(response.headers.entries());
			const responseText = await response.text();
			sendResponse({
				response: {
					status: response.status,
					statusText: response.statusText,
					responseText,
					response: responseText,
					finalUrl: response.url,
					headers,
					responseHeaders: headers,
				},
			});
		} catch (error) {
			sendResponse({ error: { message: error.message || 'Request failed' } });
		}
	})();

	return true;
});
