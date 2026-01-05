const CACHE_NAME = 'streamflix-v1';

// We will try to cache these, but we won't fail installation if some are missing
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[SW] Installing and pre-caching...');
      
      // Attempt to cache all files, but don't throw if one fails
      // This prevents the "TypeError: ServiceWorker script encountered an error during installation"
      // which happens if cache.addAll() hits a 404
      const promises = PRECACHE_URLS.map(async (url) => {
        try {
          const request = new Request(url, { cache: 'no-cache' });
          const response = await fetch(request);
          if (response.ok) {
            await cache.put(url, response);
          } else {
            console.warn(`[SW] Failed to cache ${url}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`[SW] Fetch failed for ${url}:`, error);
        }
      });

      await Promise.all(promises);
      console.log('[SW] Install complete');
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Navigation: Network First, Fallback to Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/')
            .then(res => res || caches.match('/index.html'));
        })
    );
    return;
  }

  // Assets: Cache First
  // We check for common asset extensions or paths
  if (
    url.pathname.startsWith('/assets/') || 
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|json|ico)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          // Verify valid response before caching
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
  }
});