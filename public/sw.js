/**
 * Service Worker for VibeCode Enterprise AI App Generator
 * Provides offline functionality and caching strategies for PWA
 */

const CACHE_NAME = 'vibecode-v1';
const RUNTIME_CACHE = 'vibecode-runtime-v1';
const API_CACHE = 'vibecode-api-v1';

/**
 * Assets to cache immediately on service worker installation
 */
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

/**
 * API endpoints to cache with network-first strategy
 */
const API_ENDPOINTS = [
  '/api/',
  'base44.app'
];

/**
 * Install event - cache essential assets
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && 
                   cacheName !== RUNTIME_CACHE && 
                   cacheName !== API_CACHE;
          })
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Fetch event - implement caching strategies
 * - Cache-first for static assets
 * - Network-first for API calls
 * - Fallback to offline page when network fails
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !isAPIEndpoint(url)) {
    return;
  }

  // API requests - Network first, fallback to cache
  if (isAPIEndpoint(url)) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // Navigation requests - Network first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Static assets - Cache first
  event.respondWith(cacheFirstStrategy(request));
});

/**
 * Check if URL is an API endpoint
 * @param {URL} url - URL to check
 * @returns {boolean} True if URL is an API endpoint
 */
function isAPIEndpoint(url) {
  return API_ENDPOINTS.some(endpoint => url.href.includes(endpoint));
}

/**
 * Cache-first strategy: Try cache, fallback to network
 * Best for static assets that don't change frequently
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response from cache or network
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    throw error;
  }
}

/**
 * Network-first strategy: Try network, fallback to cache
 * Best for API calls where fresh data is preferred
 * @param {Request} request - Fetch request
 * @returns {Promise<Response>} Response from network or cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache');
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

/**
 * Handle push notifications (if needed in future)
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Handle notification clicks
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});
