const CACHE_NAME = 'gima-ai-studio-v2';
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache partial error (ignored):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // 1. Never intercept non-GET requests (e.g. POST /api/generate-image)
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // 2. Never intercept external domains (e.g. media.pollinations.ai, gen.pollinations.ai)
  if (url.origin !== self.location.origin) {
    return;
  }

  // 3. Never intercept API routes (/api/*) - allow direct network pass-through
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // 4. Handle same-origin static navigation and shell assets with guaranteed valid Response
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached shell and update in background if possible
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Fetch from network
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Fallback for navigation requests
          if (request.mode === 'navigate') {
            const fallback = await caches.match('/');
            if (fallback) return fallback;
          }

          // Guaranteed valid Response: Never return undefined or null
          return new Response('Network unavailable', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    }).catch(() => {
      return new Response('Network error', {
        status: 500,
        statusText: 'Internal Error',
        headers: { 'Content-Type': 'text/plain' }
      });
    })
  );
});
