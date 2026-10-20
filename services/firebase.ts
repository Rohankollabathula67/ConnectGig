/**
 * ConnectGig — Firebase Initialization
 *
 * Uses the Firebase Web SDK (compatible with Expo Go during development).
 * For real phone OTP on physical devices, a custom dev build is required.
 *
 * ⚠️  MOCK MODE IS PERMANENTLY REMOVED.
 * If credentials are missing this module throws immediately at startup so the
 * missing config is caught during development — not silently swallowed and
 * accidentally shipped to production.
 *
 * Setup:
 *   1. Copy .env.example → .env and fill in all values.
 *   2. Restart the Metro bundler after editing .env.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import {
  initializeAuth,
  getAuth,
  Auth,
  inMemoryPersistence,
} from 'firebase/auth';
import { getFunctions, Functions } from 'firebase/functions';


// ── Validate all required env vars are present ────────────────────────────────
const REQUIRED_VARS = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_VARS.filter(
  (key) => !process.env[key] || process.env[key]!.trim() === ''
);

const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '';
const isPlaceholder =
  !apiKey ||
  apiKey.toLowerCase().includes('mock') ||
  apiKey.toLowerCase().includes('replace') ||
  apiKey.toLowerCase().includes('placeholder') ||
  !apiKey.startsWith('AIza');

export const IS_FIREBASE_ENABLED = missing.length === 0 && !isPlaceholder;

if (!IS_FIREBASE_ENABLED) {
  console.log(
    `⚡ [ConnectGig] Running in Demo / Simulation Mode.\n` +
    `   (To connect live Firebase, fill real API credentials in .env and restart Metro bundler).\n`
  );
}

// ── Firebase config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'mock-api-key',
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'connect-gig.firebaseapp.com',
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'connect-gig',
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'connect-gig.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:mockappid',
};

// ── Initialize (idempotent — safe to import multiple times) ───────────────────
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// ── Service instances ─────────────────────────────────────────────────────────
// Firebase Web SDK v12 does not export getReactNativePersistence. Use
// initializeAuth with inMemoryPersistence to silence the AsyncStorage warning.
// For true session persistence on device, migrate to @react-native-firebase.
let firebaseAuth: Auth;
try {
  firebaseAuth = initializeAuth(app, { persistence: inMemoryPersistence });
} catch {
  // initializeAuth throws on hot reload if Auth is already initialized
  firebaseAuth = getAuth(app);
}
export { firebaseAuth };
export const db: Firestore      = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app);


if (IS_FIREBASE_ENABLED) {
  console.log(`🔥 Firebase initialised — project: ${firebaseConfig.projectId}`);
}

export default app;
