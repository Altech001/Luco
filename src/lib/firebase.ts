// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "studio-2723643286-18bf2",
  appId: "1:162184814059:web:fb5e9e0dc75e44bf800dae",
  apiKey: "AIzaSyAuIZCOT-jPwBqn5I3LSzdTxL7cP-us0eI",
  authDomain: "studio-2723643286-18bf2.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "162184814059"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
