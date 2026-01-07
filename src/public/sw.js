// Minimal Service Worker to Fix Installation Error
// -----------------------------------------------------------------------------

self.addEventListener('install', (event) => {
  // Force immediate activation
  // event.waitUntil() ensures the browser doesn't terminate the worker
  // before the promise resolves.
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  // Claim clients immediately so the page is controlled
  event.waitUntil(self.clients.claim());
});

// Note: Fetch listener removed temporarily to isolate the installation error.
// Once installation is confirmed working, runtime caching can be re-enabled.