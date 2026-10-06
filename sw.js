// Service Worker 5HINE PWA
const CACHE_NAME = '5hine-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './ikon-192.png',
  './ikon-512.png'
];

// Install: cache aset utama
self.clients.claim('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: strategi cache-first untuk aset lokal, network untuk API
self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  // Selalu online untuk API/CDN eksternal
  if (
    url.includes('supabase.co') ||
    url.includes('cdn.jsdelivr.net') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    e.request.method !== 'GET'
  ) {
    return;
  }

  // Cache-first untuk aset lokal
  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request)
        .then((res) => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
