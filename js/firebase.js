import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    deleteDoc,
    updateDoc,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC3lAw9yJ6lBnCoaLJpYwOuJLJ8gmxm24o",
  authDomain: "mass-register-b9715.firebaseapp.com",
  projectId: "mass-register-b9715",
  storageBucket: "mass-register-b9715.firebasestorage.app",
  messagingSenderId: "987133106693",
  appId: "1:987133106693:web:a3e0b1c0776329e48c9a6c"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);


export {
    onAuthStateChanged,
    collection,
    addDoc,
    serverTimestamp,
    getDocs,
    query,
    where,
    deleteDoc,
    updateDoc,
    doc,
    setDoc,
};