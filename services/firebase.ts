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
import { getAuth, Auth } from 'firebase/auth';

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

if (missing.length > 0) {
  throw new Error(
    `[ConnectGig] Missing Firebase environment variables:\n` +
    missing.map((k) => `  • ${k}`).join('\n') +
    `\n\nCopy .env.example → .env and fill in your Firebase project credentials.\n` +
    `Get them from: Firebase Console → Project Settings → General → Your apps → SDK setup`
  );
}

// ── Firebase config ───────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
};

// ── Initialize (idempotent — safe to import multiple times) ───────────────────
const app: FirebaseApp = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0];

// ── Service instances ─────────────────────────────────────────────────────────
export const firebaseAuth: Auth = getAuth(app);
export const db: Firestore      = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

// Convenience flag — always true now (throws above if not configured)
export const IS_FIREBASE_ENABLED = true;

console.log(`🔥 Firebase initialised — project: ${firebaseConfig.projectId}`);

export default app;
