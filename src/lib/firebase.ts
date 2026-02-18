import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDWjP7fy2ArhbhtV99kn30HR65bpsBHbwk",
    authDomain: "iaai-9c32c.firebaseapp.com",
    projectId: "iaai-9c32c",
    storageBucket: "iaai-9c32c.firebasestorage.app",
    messagingSenderId: "416412637017",
    appId: "1:416412637017:web:e9e0b3f1aabeeebdca5e48",
    measurementId: "G-TNVC2TMY9Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);

export { app, analytics, db };