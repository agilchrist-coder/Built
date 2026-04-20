// Stipum Service Worker
// Caches static assets and previously fetched immutable records.
// Protocol integrity is enforced by Base44 — the SW never touches submission data.

const CACHE_VERSION = 'stipum-v1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const RECORDS_CACHE = `${CACHE_VERSION}-records`;

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// ---------------------------------------------------------------------------
// Install: pre-cache shell assets
// ---------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

// ---------------------------------------------------------------------------
// Activate: remove old caches
// ---------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('stipum-') && k !== STATIC_CACHE && k !== RECORDS_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ---------------------------------------------------------------------------
// Fetch: network-first for API calls, cache-first for static assets,
//        stale-while-revalidate for immutable record pages.
// ---------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept non-GET or cross-origin requests to Base44
  if (request.method !== 'GET') return;

  // Immutable record pages — cache after first load
  if (url.pathname.startsWith('/record/')) {
    event.respondWith(staleWhileRevalidate(RECORDS_CACHE, request));
    return;
  }

  // Static assets (_next/static, fonts, manifest, icons)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirst(STATIC_CACHE, request));
    return;
  }

  // Everything else: network first, fall back to cache
  event.respondWith(networkFirst(STATIC_CACHE, request));
});

// ---------------------------------------------------------------------------
// Strategy helpers
// ---------------------------------------------------------------------------

async function cacheFirst(cacheName, request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(cacheName, request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Offline — no cached version available.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function staleWhileRevalidate(cacheName, request) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkFetch = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });

  return cached || networkFetch;
}
