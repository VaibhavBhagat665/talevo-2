// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

// Your Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyArx9uO2fZlXjWdcHjQVkxk9glNjqo_Grw",
  authDomain: "talevo-f47de.firebaseapp.com",
  projectId: "talevo-f47de",
  storageBucket: "talevo-f47de.firebasestorage.app",
  messagingSenderId: "277525013867",
  appId: "1:277525013867:web:8d8977a943d7febe8e982e",
  measurementId: "G-LLG62MEY9G"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = db;
window.firebaseUtils = {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  doc,
  setDoc,
  getDoc
};

console.log('Firebase initialized successfully');