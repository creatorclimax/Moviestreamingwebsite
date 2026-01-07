// Service Worker
const CACHE_NAME = 'streamflix-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installed');
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activated');
  // Claim clients immediately
  event.waitUntil(self.clients.claim());
});
