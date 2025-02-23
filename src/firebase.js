// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aspirant-arena.firebaseapp.com",
  projectId: "aspirant-arena",
  storageBucket: "aspirant-arena.firebasestorage.app",
  messagingSenderId: "697889055113",
  appId: "1:697889055113:web:c5fe6e69347b81c0968158",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
