const CACHE = 'exodia-v449';
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
  if (event.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/lab/') || url.pathname === '/TODO.md') return;
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

// Notifications: the push carries nothing, so ask Exodia what happened and show that. Tapping one opens exactly
// there (the planned day, or the friend), in the open app if there is one.
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    const subscription = await self.registration.pushManager.getSubscription();
    let notices = [];
    try {
      const response = await fetch('/api/push', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ action: 'latest', endpoint: subscription?.endpoint }) });
      notices = (await response.json()).notices || [];
    } catch { /* offline: show the plain one below */ }
    if (!notices.length) notices = [{ id: 0, title: 'Exodia', body: 'Something changed in Train together.', url: '/#/together' }];
    await Promise.all(notices.reverse().map((notice) => self.registration.showNotification(notice.title, { body: notice.body, tag: `exodia-${notice.id}`, icon: '/icon-192.png', badge: '/favicon-64.png', data: { url: notice.url } })));
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/', self.location.origin).href;
  event.waitUntil((async () => {
    const open = (await self.clients.matchAll({ type: 'window', includeUncontrolled: true })).find((client) => new URL(client.url).origin === self.location.origin);
    if (open) {
      await open.focus();
      open.postMessage({ open: url });
      return;
    }
    await self.clients.openWindow(url);
  })());
});
