const CACHE = 'exodia-v316';
const PIECES = ['palm', 'thumb-left', 'index', 'middle', 'ring', 'thumb-right'].flatMap((name) => [`/fist/${name}-line.png`, `/fist/${name}-fill.png`]);
const SHELL = ['/', '/styles.css', '/app.js', '/manifest.webmanifest', '/anatomy.json', '/changes.json', '/favicon-64.png', '/logo.png', '/logo-blue.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png', '/hamsa-512.png', '/hamsa-512-blue.png', '/hamsa-mask.png', '/hamsa-mask-back.png', ...PIECES];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

// Everything the app needs opens straight from the phone; the network only refreshes the copy for next time.
// A new deploy installs a new worker with a fresh copy, which the next open uses, so the page never reloads.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname === '/TODO.md') return;
  const key = event.request.mode === 'navigate' ? '/' : event.request;
  event.respondWith(caches.open(CACHE).then(async (cache) => {
    const cached = await cache.match(key, { ignoreSearch: event.request.mode === 'navigate' });
    const fresh = fetch(event.request).then((response) => {
      if (response.ok && event.request.mode !== 'navigate') cache.put(event.request, response.clone());
      return response;
    });
    if (cached) {
      event.waitUntil(fresh.catch(() => {}));
      return cached;
    }
    return fresh.catch(() => cache.match('/'));
  }));
});
