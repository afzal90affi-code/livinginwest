import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCA52fGxmdD1bMjyln0_27Bmmvj_S2x3_0",
  authDomain: "livinginwest-15d05.firebaseapp.com",
  projectId: "livinginwest-15d05",
  storageBucket: "livinginwest-15d05.firebasestorage.app",
  messagingSenderId: "657402167666",
  appId: "1:657402167666:web:e607676ecd13e5e38fddeb",
  measurementId: "G-2R825E04J8"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);