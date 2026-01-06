const CACHE_NAME = 'streamflix-final-v1';

// -----------------------------------------------------------------------------
// INSTALL PHASE: DO NOTHING
// -----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('[SW] Install event complete (Skipping precache)');
});

// -----------------------------------------------------------------------------
// ACTIVATE PHASE
// -----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  console.log('[SW] Activate event complete');
});

// -----------------------------------------------------------------------------
// FETCH PHASE: RUNTIME CACHING ONLY
// -----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  // 1. Validations: specific schemes only
  if (!event.request.url.startsWith('http')) return;
  if (event.request.method !== 'GET') return;

  // 2. Browser default for navigation (HTML) to ensure freshness
  if (event.request.mode === 'navigate') {
    return;
  }

  // 3. Stale-While-Revalidate for Assets
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(event.request);
      
      // If we have a cached response, return it immediately
      if (cachedResponse) {
        // ...but update the cache in the background (Revalidate)
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
        }).catch(() => {/* ignore background errors */});
        
        return cachedResponse;
      }

      // If no cache, fetch from network
      try {
        const networkResponse = await fetch(event.request);
        
        // Cache if it's a valid asset
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const url = new URL(event.request.url);
          // Cache images, fonts, scripts, styles
          if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|json|woff2)$/)) {
            cache.put(event.request, networkResponse.clone());
          }
        }
        
        return networkResponse;
      } catch (error) {
        // Network failed and not in cache
        throw error;
      }
    })()
  );
});