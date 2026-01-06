// Minimal Service Worker to Fix Installation Error
// -----------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  // Force immediate activation
  self.skipWaiting();
  console.log('[SW] Service Worker Installed');
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately so the page is controlled
  event.waitUntil(self.clients.claim());
  console.log('[SW] Service Worker Activated');
});

// Note: Fetch listener removed temporarily to isolate the installation error.
// Once installation is confirmed working, runtime caching can be re-enabled.