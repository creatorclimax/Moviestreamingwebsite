const CACHE_NAME = 'streamflix-v1';

// Only cache critical files that we KNOW exist.
// Do not blindly cache everything in PRECACHE_URLS if they might be missing.
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/logo-default.svg'
];

self.addEventListener('install', (event) => {
  // Activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[SW] Cache opened');

        // We fetch these individually so one failure doesn't break the whole install
        for (const url of CRITICAL_ASSETS) {
          try {
            const request = new Request(url, { cache: 'no-cache' });
            const response = await fetch(request);
            if (response.ok) {
              await cache.put(url, response);
            } else {
              console.warn(`[SW] Skip caching ${url}: ${response.status}`);
            }
          } catch (e) {
            console.warn(`[SW] Error fetching ${url}:`, e);
          }
        }
      } catch (error) {
        // This is the only place that could actually fail the installation
        console.error('[SW] Critical install error:', error);
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

  // Don't try to handle browser-sync or other dev tools
  if (event.request.url.includes('browser-sync')) return;

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
        
        // 3. Cache valid responses for static assets (optional)
        if (response && response.status === 200 && event.request.method === 'GET') {
          const url = new URL(event.request.url);
          // Only cache specific file types to avoid pollution
          if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|json|woff2)$/)) {
             try {
               const responseToCache = response.clone();
               const cache = await caches.open(CACHE_NAME);
               await cache.put(event.request, responseToCache);
             } catch (err) {
               // Ignore cache put errors (quota exceeded etc)
             }
          }
        }
        
        return response;
      } catch (error) {
        // Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          try {
            const cache = await caches.open(CACHE_NAME);
            const cachedIndex = await cache.match('/');
            if (cachedIndex) return cachedIndex;
          } catch (e) {
            // ignore
          }
        }
        // Let the browser handle the error
        throw error;
      }
    })()
  );
});