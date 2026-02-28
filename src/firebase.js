import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB5m68hQfwBcTaGMTfZsO2KNQyVN9Uy9GA",
    authDomain: "controlface-desplegador.firebaseapp.com",
    projectId: "controlface-desplegador",
    storageBucket: "controlface-desplegador.firebasestorage.app",
    messagingSenderId: "219215115908",
    appId: "1:219215115908:web:bf7a09dd5a313cb11834d1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
