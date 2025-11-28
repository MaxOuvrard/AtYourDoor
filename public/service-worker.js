const CACHE_NAME = 'ayd-cache-v1'
const RUNTIME_CACHE = 'ayd-runtime-v1'
const OFFLINE_URL = '/index.html'

self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        OFFLINE_URL,
        '/manifest.json',
        '/assets/css/style.css'
      ])
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE).map(k => caches.delete(k))
      )
    }).then(() => self.clients.claim())
  )
})

// Helper: cache-first for images
async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (e) {
    return cached || Response.error()
  }
}

// Helper: network-first for API
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE)
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (e) {
    const cached = await cache.match(request)
    return cached || caches.match(OFFLINE_URL)
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event

  // navigation requests -> offline page fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    )
    return
  }

  const url = new URL(request.url)

  // API requests -> network-first
  if (url.pathname.startsWith('/api/') || url.pathname.includes('/api/')) {
    event.respondWith(networkFirst(request))
    return
  }

  // Images -> cache-first
  if (request.destination === 'image' || /\.(png|jpg|jpeg|webp|avif|gif|svg)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request))
    return
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(request).then((response) => response || fetch(request))
  )
})
