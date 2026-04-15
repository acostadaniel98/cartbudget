/**
 * Service Worker para CartBudget
 * Maneja cacheo offline y estrategia de actualización
 * Optimizado para móviles (iOS y Android)
 */

const CACHE_NAME = 'cartbudget-v1';
const RUNTIME_CACHE = 'cartbudget-runtime-v1';
const OFFLINE_URL = '/';

const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/sw.js',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching core assets');
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url))
      ).then(() => {
        console.log('[ServiceWorker] Core assets cached');
      });
    }).then(() => self.skipWaiting()).catch(err => {
      console.error('[ServiceWorker] Install error:', err);
    })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    }).catch(err => {
      console.error('[ServiceWorker] Activate error:', err);
    })
  );
});

// Interceptar peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo manejar GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar peticiones de chrome extensions y otros
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Estrategia Network First para HTML (generalmente pages)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Estrategia Cache First para assets estáticos
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Estrategia Network First para APIs
  event.respondWith(networkFirst(request));
});

/**
 * Network First - Intenta red primero, fallback a caché
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);

    // Si es exitosa, guardar en cache
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[ServiceWorker] Network failed, trying cache:', request.url);

    // Fallback a caché
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Si es HTML, retornar página offline
    if (request.headers.get('accept')?.includes('text/html')) {
      const offlineResponse = await caches.match(OFFLINE_URL);
      return offlineResponse || new Response('Offline', { status: 503 });
    }

    // Para otros requests, retornar error
    return new Response('Offline', { status: 503 });
  }
}

/**
 * Cache First - Intenta caché primero, fallback a red
 */
async function cacheFirst(request) {
  try {
    // Buscar en caché
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Si no está en caché, traer de red
    const response = await fetch(request);

    // Guardar respuesta en caché si es exitosa
    if (response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[ServiceWorker] Cache first failed:', request.url);

    // Si falla, intentar caché
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

/**
 * Determina si una URL es un asset estático
 */
function isStaticAsset(url) {
  const staticPatterns = [
    /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/i,
    /_next\/static/,
    /manifest.json/,
  ];

  return staticPatterns.some((pattern) => pattern.test(url.pathname));
}

/**
 * Mensaje desde cliente para limpiar caché
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName);
      });
    });
  }
});
