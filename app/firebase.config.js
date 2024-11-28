import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

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

export default db;
