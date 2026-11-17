const CACHE = 'exodia-v508';
const PIECES = ['palm', 'thumb-left', 'index', 'middle', 'ring', 'thumb-right'].flatMap((name) => [`/fist/${name}-line.png`, `/fist/${name}-fill.png`]);
const SHELL = ['/', '/styles.css', '/app.js', '/manifest.webmanifest', '/anatomy.json', '/changes.json', '/favicon-64.png', '/logo.png', '/logo-blue.png', '/icon-192.png', '/icon-512.png', '/icon-maskable-512.png', '/apple-touch-icon.png', '/hamsa-512.png', '/hamsa-512-blue.png', '/hamsa-mask.png', '/hamsa-mask-back.png', ...PIECES];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

// The 3D body's big files (the 2 MB model and three.js, pinned to one version) keep their own cache that a new
// version of the app doesn't empty, so after an update the body still opens straight from the phone. Bump the
// number here only when the model itself changes.
const BIG = 'exodia-3d-1';
const big = (url) => url.pathname.startsWith('/models/') || url.href.startsWith('https://cdn.jsdelivr.net/npm/three@0.170.0/');

// Takes over at once; old copies are cleared after, so the open app isn't kept waiting for that.
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE && key !== BIG).map((key) => caches.delete(key)))).catch(() => {});
});

// Everything the app needs opens straight from the phone; the network only refreshes the copy for next time.
// A new deploy installs a new worker with a fresh copy, which the next open uses, so the page never reloads.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'GET' && big(url)) {
    event.respondWith(caches.open(BIG).then(async (cache) => (await cache.match(event.request)) || fetch(event.request).then((response) => {
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    })));
    return;
  }
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

// The open page asks which version it runs, so "What's new" shows the notes for exactly that version.
self.addEventListener('message', (event) => {
  if (event.data === 'version') event.source?.postMessage({ version: Number(CACHE.split('-v')[1]) });
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
    // One notice per workout and one for friend requests: a newer one about the same plan replaces the older one,
    // so the phone shows a short stack, never a pile of changes to the same day.
    const tagOf = (notice) => (/\/together\/(\d{4}-\d{2}-\d{2})/.exec(notice.url || '')?.[1] ? `exodia-plan-${/\/together\/(\d{4}-\d{2}-\d{2})/.exec(notice.url)[1]}` : /friends|\/friend\//.test(notice.url || '') ? `exodia-friend-${notice.title}` : `exodia-${notice.id}`);
    await Promise.all(notices.reverse().map((notice) => self.registration.showNotification(notice.title, { body: notice.body, tag: tagOf(notice), renotify: true, icon: '/icon-192.png', badge: '/favicon-64.png', data: { url: notice.url } })));
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
