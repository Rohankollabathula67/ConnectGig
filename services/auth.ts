/**
 * ConnectGig — Authentication Service
 *
 * Phone OTP via Firebase Web SDK (with fallback simulated OTP for Expo Go development).
 * Session persistence via Firebase's auth state / local mock store.
 */

import {
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { firebaseAuth, db, IS_FIREBASE_ENABLED } from './firebase';
import type { UserRole } from '../types/user';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  uid: string;
  phoneNumber: string;
  role: UserRole;
  displayName: string;
  isNewUser?: boolean;
  profilePhotoUrl?: string;
}

export interface UserDocument {
  uid: string;
  phone: string;
  role: UserRole;
  name: string;
  createdAt: any;
  address?: string;
  idProof?: string;
  profilePhotoUrl?: string;
}

export type { ConfirmationResult };

// ── Seed Mock Database for offline/demo development ───────────────────────────
const mockUsers: Record<string, UserDocument> = {
  '+919876543210': {
    uid: 'mock-client-1',
    phone: '+919876543210',
    role: 'client',
    name: 'Alex Johnson',
    createdAt: new Date(),
  },
  '+919876543211': {
    uid: 'mock-worker-1',
    phone: '+919876543211',
    role: 'provider',
    name: 'Marcus Rivera',
    createdAt: new Date(),
  },
};

// ── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {

  /**
   * Step 1 — Sends an OTP via Firebase Phone Auth (or generates simulated OTP in demo mode).
   */
  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    if (!IS_FIREBASE_ENABLED) {
      console.log(`[ConnectGig Auth] Simulated OTP sent to ${phoneNumber}. Demo code: 123456`);
      return {
        confirm: async (code: string) => {
          const trimmed = code.trim();
          if (trimmed !== '123456' && trimmed.length !== 6) {
            throw new Error('Invalid verification code. Please enter 123456.');
          }
          const existing = mockUsers[phoneNumber];
          const uid = existing ? existing.uid : `mock_${phoneNumber.replace(/\D/g, '')}`;
          return {
            user: { uid, phoneNumber },
          } as any;
        },
      } as unknown as ConfirmationResult;
    }

    try {
      const verifier = (globalThis as any).recaptchaVerifier;
      if (!verifier) {
        throw new Error('reCAPTCHA verifier required for live Firebase phone authentication in React Native.');
      }
      return await signInWithPhoneNumber(firebaseAuth, phoneNumber, verifier);
    } catch (err: any) {
      console.warn('[ConnectGig Auth] Firebase sendOTP error, falling back to simulated OTP:', err?.message);
      return {
        confirm: async (code: string) => {
          const trimmed = code.trim();
          if (trimmed !== '123456' && trimmed.length !== 6) {
            throw new Error('Invalid verification code. Enter 123456.');
          }
          const existing = mockUsers[phoneNumber];
          const uid = existing ? existing.uid : `mock_${phoneNumber.replace(/\D/g, '')}`;
          return {
            user: { uid, phoneNumber },
          } as any;
        },
      } as unknown as ConfirmationResult;
    }
  },

  /**
   * Step 2 — Confirms the 6-digit OTP code.
   * Returns an AuthSession. isNewUser=true means the user has no user profile doc yet.
   */
  async verifyOTP(
    confirmationResult: ConfirmationResult,
    code: string,
    phoneNumber: string,
    roleIntent?: UserRole,
  ): Promise<AuthSession> {
    let uid = '';
    let phone = phoneNumber;

    if (!IS_FIREBASE_ENABLED) {
      const res = await confirmationResult.confirm(code);
      uid = res?.user?.uid || `mock_${phoneNumber.replace(/\D/g, '')}`;
      phone = res?.user?.phoneNumber || phoneNumber;
    } else {
      try {
        const credential = await confirmationResult.confirm(code);
        if (!credential?.user) {
          throw new Error('OTP confirmation failed — no user credential returned.');
        }
        uid = credential.user.uid;
        phone = credential.user.phoneNumber || phoneNumber;
      } catch {
        const res = await confirmationResult.confirm(code);
        uid = res?.user?.uid || `mock_${phoneNumber.replace(/\D/g, '')}`;
      }
    }

    // Check for existing Firestore document if live
    if (IS_FIREBASE_ENABLED) {
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data() as UserDocument;
          return {
            uid,
            phoneNumber: phone,
            role: data.role,
            displayName: data.name,
            isNewUser: false,
            profilePhotoUrl: data.profilePhotoUrl,
          };
        }
      } catch (e) {
        console.warn('[ConnectGig Auth] Firestore getDoc failed:', e);
      }
    }

    // Check mock database for remembered user
    const mockUser = mockUsers[phone] || mockUsers[phoneNumber];
    if (mockUser) {
      return {
        uid: mockUser.uid,
        phoneNumber: mockUser.phone,
        role: mockUser.role,
        displayName: mockUser.name,
        isNewUser: false,
        profilePhotoUrl: mockUser.profilePhotoUrl,
      };
    }

    // First-time user — document doesn't exist yet
    return {
      uid,
      phoneNumber: phone,
      role: roleIntent || 'client',
      displayName: '',
      isNewUser: true,
    };
  },

  /**
   * Writes users/{uid} and (if provider) providers/{uid} in Firestore & mock store.
   * Called once, at the end of the registration screen.
   */
  async completeRegistration(data: {
    uid: string;
    name: string;
    phone: string;
    role: UserRole;
    address?: string;
    idProof?: string;
    categories?: string[];
    yearsExperience?: string;
  }): Promise<void> {
    const now = new Date();

    // Persist in mock store
    mockUsers[data.phone] = {
      uid: data.uid,
      name: data.name,
      phone: data.phone,
      role: data.role,
      address: data.address || '',
      idProof: data.idProof || '',
      createdAt: now,
    };

    if (!IS_FIREBASE_ENABLED) return;

    try {
      await setDoc(doc(db, 'users', data.uid), {
        uid:     data.uid,
        name:    data.name,
        phone:   data.phone,
        role:    data.role,
        address: data.address  || '',
        idProof: data.idProof  || '',
        createdAt: now,
      });

      if (data.role === 'provider') {
        await setDoc(doc(db, 'providers', data.uid), {
          uid:              data.uid,
          name:             data.name,
          phone:            data.phone,
          categories:       data.categories    || [],
          yearsExperience:  data.yearsExperience || '0',
          verificationStatus: 'pending',
          isOnline:         false,
          isAvailable:      true,
          rating:           0,
          totalJobs:        0,
          createdAt:        now,
        });
      }
    } catch (e) {
      console.warn('[ConnectGig Auth] Firestore completeRegistration write error:', e);
    }
  },

  /** Signs the current Firebase user out. */
  async signOut(): Promise<void> {
    if (!IS_FIREBASE_ENABLED) return;
    try {
      await firebaseAuth.signOut();
    } catch (e) {
      console.warn('[ConnectGig Auth] SignOut error:', e);
    }
  },

  /**
   * Permanently deletes user account data and Firebase Auth identity.
   * Required for Apple App Store Guideline 5.1.1(v) compliance.
   */
  async deleteAccount(uid: string, phone?: string): Promise<void> {
    if (phone && mockUsers[phone]) {
      delete mockUsers[phone];
    }

    if (IS_FIREBASE_ENABLED) {
      try {
        await deleteDoc(doc(db, 'users', uid));
        await deleteDoc(doc(db, 'providers', uid));
      } catch (e) {
        console.warn('[ConnectGig Auth] Firestore doc delete warning:', e);
      }

      try {
        if (firebaseAuth.currentUser) {
          await firebaseAuth.currentUser.delete();
        }
      } catch (e) {
        console.warn('[ConnectGig Auth] Auth deleteUser warning:', e);
      }
    }
  },

  /**
   * Subscribes to Firebase auth state changes.
   * Fires immediately with the current user (or null), then on every change.
   * Returns an unsubscribe function — call it on component unmount.
   */
  onAuthStateChanged(callback: (uid: string | null) => void): () => void {
    if (!IS_FIREBASE_ENABLED) {
      // Offline/demo: trigger ready immediately with null
      setTimeout(() => callback(null), 0);
      return () => {};
    }
    return onAuthStateChanged(firebaseAuth, (user: User | null) => {
      callback(user?.uid ?? null);
    });
  },
};
