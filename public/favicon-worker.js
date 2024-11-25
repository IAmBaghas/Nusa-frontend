/* eslint-disable no-undef */
// Version the cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `favicon-cache-${CACHE_VERSION}`;

// Use 'globalThis' instead of 'self'
globalThis.addEventListener('install', (event) => {
  globalThis.skipWaiting();
  // Clear any existing favicon cache on install
  event.waitUntil(
    caches.delete(CACHE_NAME)
  );
});

globalThis.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // Clear all caches that might contain favicons
      caches.keys().then(keys => Promise.all(
        keys.map(key => caches.delete(key))
      )),
      // Take control immediately
      clients.claim()
    ])
  );
});

globalThis.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle header image requests
  if (url.pathname.includes('/uploads/header/')) {
    event.respondWith(
      fetch(event.request.url + '?t=' + Date.now(), {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).then(response => {
        // Clone the response before using it
        const responseToCache = response.clone();
        
        // Clear old cache and store new response
        caches.open(CACHE_NAME).then(cache => {
          cache.delete(event.request);
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        return caches.match(event.request);
      })
    );
  }
});

// Listen for messages from the client
globalThis.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_FAVICON_CACHE') {
    event.waitUntil(
      Promise.all([
        // Clear all caches
        caches.keys().then(keys => Promise.all(
          keys.map(key => caches.delete(key))
        ))
      ])
    );
  }
}); 