// Nolan's Goal Tracker — service worker
// Handles offline app-shell caching so the app opens instantly and works
// without a connection. Firestore has its own offline persistence for the
// data itself; this just caches the static files (HTML/CSS/JS/icons).
//
// IMPORTANT: bump CACHE_NAME (v1 -> v2 -> v3...) every time you push a
// meaningful update. Browsers only detect a new service worker by
// byte-comparing this file, and old caches only get cleared in the
// 'activate' step below when CACHE_NAME actually changes. Forgetting to
// bump it means real-world devices can keep serving a stale, already-fixed
// bug indefinitely.

const CACHE_NAME = 'nolan-tracker-v2';
const APP_SHELL = [
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // Never cache Firestore/API calls — always hit the network.
  if (url.includes('firestore.googleapis.com') || url.includes('googleapis.com') || url.includes('ourmanna.com')) {
    return;
  }

  // The page itself (index.html / config.js) — network-first, so any fix
  // or update you push shows up the next time there's a connection.
  // Falls back to the cached copy only when actually offline.
  if (event.request.mode === 'navigate' || url.endsWith('index.html') || url.endsWith('config.js') || url.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets that rarely change (icons, manifest) — cache-first is
  // fine here since there's little cost to them being briefly stale.
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
