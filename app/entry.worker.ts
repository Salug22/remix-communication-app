/// <reference lib="WebWorker" />

export {};

declare let self: ServiceWorkerGlobalScope;

// Install und Activate Events
self.addEventListener("install", (event) => {
  console.log("Service worker installed");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activated");
  event.waitUntil(self.clients.claim());
});

// Push Event
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  const data = event.data?.json() || {};
  const title = data.title || "Default Title";
  const options = {
    body: data.body || "Default body text",
    icon: data.icon || "/192x192.png",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Message-Ereignis: Simuliere Push-Benachrichtigung
self.addEventListener("message", (event) => {
  if (event.data?.type === "PUSH_TEST") {
    const data = JSON.parse(event.data.payload);
    const title = data.title || "Default Title";
    const options = {
      body: data.body || "Default Body",
      icon: data.icon || "/192x192.png",
    };

    self.registration.showNotification(title, options);
  }
});
