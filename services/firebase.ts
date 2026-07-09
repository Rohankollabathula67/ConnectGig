/**
 * ConnectGig — Firebase Initialization (§3.0)
 * Configures the Firebase Web SDK. If config keys are missing,
 * sets a flag to run in Simulated Mock Mode.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with your real Firebase web configuration
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

// Check if actual configuration has been provided
export const IS_FIREBASE_ENABLED = 
  firebaseConfig.apiKey !== "" && 
  firebaseConfig.projectId !== "";

let app;
let auth: any = null;
let db: any = null;

if (IS_FIREBASE_ENABLED) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.warn("⚠️ Firebase initialization failed, running in MOCK mode.", error);
  }
} else {
  console.log("ℹ️ No Firebase credentials. Running in Simulated MOCK Mode.");
}

export { app, auth, db };
export default app;
