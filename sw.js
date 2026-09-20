const CACHE_NAME = 'server-stats-v1';
const urlsToCache = [
  './',
  './index.php',
  './style.css',
  './script.js',
  './icon.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
      return;
  }
  
  // Don't cache API calls
  if (event.request.url.includes('api=true')) {
      return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Cache hit
        }
        return fetch(event.request);
      })
  );
});
