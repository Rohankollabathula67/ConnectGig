/**
 * ConnectGig — Authentication Service
 *
 * Real phone OTP via Firebase Web SDK (firebase/auth).
 * Session persistence via Firebase's built-in auth state.
 *
 * ⚠️  MOCK MODE IS PERMANENTLY REMOVED.
 * The "any phone + 123456" bypass no longer exists.
 * For development testing without burning real SMS credits:
 *   Firebase Console → Authentication → Sign-in method → Phone
 *   → Phone numbers for testing → add your number + a fixed code.
 */

import {
  signInWithPhoneNumber,
  ConfirmationResult,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseAuth, db } from './firebase';
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

// ── Auth Service ──────────────────────────────────────────────────────────────

export const authService = {

  /**
   * Step 1 — Sends a real OTP via Firebase Phone Auth.
   * For dev/testing: add test numbers in Firebase Console first so you're not
   * charged for SMS during development.
   */
  async sendOTP(phoneNumber: string): Promise<ConfirmationResult> {
    return await signInWithPhoneNumber(firebaseAuth, phoneNumber);
  },

  /**
   * Step 2 — Confirms the 6-digit OTP code.
   * Returns an AuthSession. isNewUser=true means the user has no Firestore doc yet.
   */
  async verifyOTP(
    confirmationResult: ConfirmationResult,
    code: string,
    phoneNumber: string,
  ): Promise<AuthSession> {
    const credential = await confirmationResult.confirm(code);
    if (!credential?.user) {
      throw new Error('OTP confirmation failed — no user credential returned.');
    }

    const uid  = credential.user.uid;
    const phone = credential.user.phoneNumber || phoneNumber;

    // Check for existing Firestore document
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

    // First-time user — document doesn't exist yet
    return {
      uid,
      phoneNumber: phone,
      role: 'client',
      displayName: '',
      isNewUser: true,
    };
  },

  /**
   * Writes users/{uid} and (if provider) providers/{uid} in Firestore.
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
  },

  /** Signs the current Firebase user out. */
  async signOut(): Promise<void> {
    await firebaseAuth.signOut();
  },

  /**
   * Subscribes to Firebase auth state changes.
   * Fires immediately with the current user (or null), then on every change.
   * Returns an unsubscribe function — call it on component unmount.
   */
  onAuthStateChanged(callback: (uid: string | null) => void): () => void {
    return onAuthStateChanged(firebaseAuth, (user: User | null) => {
      callback(user?.uid ?? null);
    });
  },
};
