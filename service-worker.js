const CACHE_NAME = 'primo-tracker-v456';

const PRECACHE = [
  '/primo-tracker/genshin/genshin.html',
  '/primo-tracker/hsr/hsr.html',
];

// Install: precache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting(); // take over immediately
});

// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Network-first for HTML and JSON (always get fresh HTML and data files)
  if (e.request.mode === 'navigate' ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for everything else (images, fonts, etc.)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
