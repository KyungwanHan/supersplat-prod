var version = "1.15.0";

// Simple logging for Service Worker (cannot use ES6 modules)
const swLog = {
    info: (message) => {
        console.log(`[ServiceWorker] ${message}`);
    },
    debug: (message) => {
        // 개발 환경에서만 디버그 로그 출력 (간단한 조건)
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
            console.log(`[ServiceWorker] ${message}`);
        }
    }
};
const cacheName = `superSplat-v${version}-cache-bust`;
// Add timestamp for cache busting
const buildTimestamp = Date.now();
const cacheUrls = [
    './',
    './index.html',
    './manifest.json',
    './static/icons/logo-192.png',
    './static/icons/logo-512.png',
    './static/images/screenshot-narrow.jpg',
    './static/images/screenshot-wide.jpg'
    // Note: index.css and index.js are now dynamically named with hashes
    // They will be cached on-demand when requested
];
self.addEventListener('install', (event) => {
    swLog.info(`Installing v${version} with timestamp ${buildTimestamp}`);
    // Skip waiting to activate new SW immediately
    self.skipWaiting();
    // create cache for current version
    event.waitUntil(caches.open(cacheName)
        .then((cache) => {
        cache.addAll(cacheUrls);
    }));
});
self.addEventListener('activate', (event) => {
    swLog.info(`Activating v${version}`);
    // Immediately take control of all clients
    event.waitUntil(self.clients.claim());
    // delete the old caches once this one is activated
    caches.keys().then((names) => {
        return Promise.all(names.map((name) => {
            if (name !== cacheName) {
                swLog.debug(`Deleting old cache: ${name}`);
                return caches.delete(name);
            }
            return undefined;
        }));
    });
});
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    // Network-first strategy for cache busting
    swLog.debug(`Fetching from network first: ${url.pathname}`);
    event.respondWith(fetch(event.request)
        .then((response) => {
        // Clone the response before using it
        const responseClone = response.clone();
        // Update the cache with the fresh response
        caches.open(cacheName).then((cache) => {
            cache.put(event.request, responseClone);
        });
        return response;
    })
        .catch(() => {
        // Fall back to cache if network fails
        return caches.match(event.request);
    }));
});
//# sourceMappingURL=sw.BYyCOjZV.js.map
