const CACHE_NAME = 'streamflix-v2';

self.addEventListener('install', (event) => {
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately so the controller is active on the first load
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignore non-http requests (like chrome-extension://)
  if (!request.url.startsWith('http')) return;

  // 1. Navigation (HTML) -> Network First
  // Try network first to get the latest content. If offline, fall back to cache.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response because it can only be consumed once
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // 2. Assets (CSS/JS/Images) -> Stale While Revalidate
  // Serve from cache immediately if available, but update the cache in the background.
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Network failed, nothing to do (cached response already returned if available)
          });

        // Return cached response if available, otherwise wait for network
        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  // Default: Network Only for everything else (API calls, etc.)
  // We don't call respondWith, letting the browser handle it normally.
});
