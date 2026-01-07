importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log(`[ServiceWorker] Workbox loaded`);

  // 1. Force activation (from your example)
  self.skipWaiting();
  workbox.core.clientsClaim();

  // 2. Handle Navigation (HTML) -> Network First
  // Matches your example's logic for the root route, but applies to all navigation
  workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new workbox.strategies.NetworkFirst({
      cacheName: 'pages-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // 3. Handle Assets (JS/CSS) -> Stale While Revalidate
  // This is better than NetworkOnly for performance
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'worker',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'assets-cache',
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 4. Handle Images -> Cache First
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
      ],
    })
  );

  // 5. Fallback logic (from your example)
  // If anything fails, we could serve a fallback, but NetworkFirst/StaleWhileRevalidate handles most cases.

} else {
  console.log(`[ServiceWorker] Workbox failed to load`);
}
