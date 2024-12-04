import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyB-U56d07yr7i5Pb7UF6eDFqOyvKSKIvKg",
    authDomain: "communication-app-b5d57.firebaseapp.com",
    projectId: "communication-app-b5d57",
    storageBucket: "communication-app-b5d57.firebasestorage.app",
    messagingSenderId: "129019088587",
    appId: "1:129019088587:web:821068549310b356f0554e",
    measurementId: "G-THEWPN16HN",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export const messaging = (async () => {
    if (typeof window !== "undefined" && (await isSupported())) {
        return getMessaging(app);
    } else {
        console.warn("Firebase Messaging wird nicht unterstützt oder läuft außerhalb des Browsers.");
        return null;
    }
})();

export default db;
