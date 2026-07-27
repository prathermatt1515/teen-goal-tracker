// Nolan's Goal Tracker — service worker
// Handles offline app-shell caching so the app opens instantly and works
// without a connection. Firestore has its own offline persistence for the
// data itself; this just caches the static files (HTML/CSS/JS/icons).

const CACHE_NAME = 'nolan-tracker-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './config.js',
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
  // Network-first for Firestore/API calls (never cache those), cache-first
  // for the static app shell so it loads instantly and works offline.
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('googleapis.com') || url.includes('ourmanna.com')) {
    return; // let these hit the network normally
  }
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
