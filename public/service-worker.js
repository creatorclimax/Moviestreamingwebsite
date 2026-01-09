const CACHE_NAME = 'CruishubFilx-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Cache opened');

        // Critical assets only. 
        // We use individual fetch calls to ensure one failure doesn't break the entire install.
        const urlsToCache = ['/', '/manifest.webmanifest'];
        
        for (const url of urlsToCache) {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`[SW] Cached: ${url}`);
            } else {
              console.warn(`[SW] Failed to fetch ${url}: ${response.status}`);
            }
          } catch (err) {
            console.warn(`[SW] Fetch error for ${url}:`, err);
            // We intentionally swallow the error so installation succeeds
          }
        }
      } catch (error) {
        console.error('[SW] Critical error during install:', error);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    (async () => {
      try {
        // 1. Try cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // 2. Network
        const response = await fetch(event.request);
        
        // 3. Cache valid responses for static assets (optional enhancement)
        // We clone the response because it can only be consumed once
        if (response && response.status === 200 && event.request.method === 'GET') {
          const url = new URL(event.request.url);
          // Simple heuristic: Cache images, scripts, styles
          if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|json)$/)) {
             const responseToCache = response.clone();
             caches.open(CACHE_NAME).then(cache => {
               cache.put(event.request, responseToCache).catch(err => console.warn('[SW] Cache put failed', err));
             });
          }
        }
        
        return response;
      } catch (error) {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/');
          if (cachedIndex) return cachedIndex;
        }
        throw error;
      }
    })()
  );
});
