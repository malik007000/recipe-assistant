// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA-LoIR46eXhwOQ2bfLHhyBhLLBPKgSUZ0",
    authDomain: "recipe-assistant-ai.firebaseapp.com",
    projectId: "recipe-assistant-ai",
    storageBucket: "recipe-assistant-ai.firebasestorage.app",
    messagingSenderId: "1091487234501",
    appId: "1:1091487234501:web:3ca0a9203cacdb2f82b3ac"
};

// Initialize Firebase
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
