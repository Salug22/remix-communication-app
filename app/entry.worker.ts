/// <reference lib="WebWorker" />

export {};

declare let self: ServiceWorkerGlobalScope;

// Install-Ereignis
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  event.waitUntil(self.skipWaiting());
});

// Activate-Ereignis
self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(self.clients.claim());
});

// Push-Ereignis
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  const data = event.data?.json() || {};
  const title = data.title || 'Default Notification Title';
  const options = {
    body: data.body || 'Default notification body',
    icon: '/192x192.png',
  };

  event.waitUntil(self.registration.showNotification(title, options));
});
