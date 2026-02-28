const CACHE_NAME = 'edgebet-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip API calls
  if (event.request.url.includes('render.com') || event.request.url.includes('localhost:')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((fetchResponse) => {
        // Don't cache non-success responses
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }
        
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return fetchResponse;
      });
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'New betting opportunity detected!',
    icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 192 192\'%3E%3Crect fill=\'%2322d3ee\' width=\'192\' height=\'192\' rx=\'32\'/%3E%3Ctext x=\'96\' y=\'120\' font-size=\'100\' text-anchor=\'middle\' fill=\'%2309090b\'%3E⚡%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 96 96\'%3E%3Crect fill=\'%2322d3ee\' width=\'96\' height=\'96\'/%3E%3C/svg%3E',
    tag: data.tag || 'edgebet-alert',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'View Pick' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'EdgeBet AI Alert', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data;
  
  if (action === 'view' || !action) {
    event.waitUntil(
      clients.openWindow(data.url || '/')
    );
  }
});
