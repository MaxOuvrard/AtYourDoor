self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('ayd-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/assets/css/style.css',
        // Ajoutez ici d'autres fichiers statiques à mettre en cache
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
