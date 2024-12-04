importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.14.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyB-U56d07yr7i5Pb7UF6eDFqOyvKSKIvKg",
    authDomain: "communication-app-b5d57.firebaseapp.com",
    projectId: "communication-app-b5d57",
    storageBucket: "communication-app-b5d57.firebasestorage.app",
    messagingSenderId: "129019088587",
    appId: "1:129019088587:web:821068549310b356f0554e",
    measurementId: "G-THEWPN16HN"
});

// Messaging initialisieren
const messaging = firebase.messaging();

// Hintergrundnachricht empfangen
messaging.onBackgroundMessage((payload) => {
    console.log('Nachricht im Hintergrund empfangen:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192x192.png', // Passe das Icon an deine App an
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
