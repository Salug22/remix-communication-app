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

// Message-Ereignis: Simuliere Push-Benachrichtigung
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PUSH_TEST') {
    const { title, body, icon } = event.data.payload;

    self.registration.showNotification(title || 'Default Title', {
      body: body || 'Default Body',
      icon: icon || '/192x192.png',
    });
  }
});
