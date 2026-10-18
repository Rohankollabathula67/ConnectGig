/**
 * ConnectGig — Auth Store (Zustand)
 *
 * Manages the user session via Firebase auth state.
 * No mock mode. Firebase must be configured (see services/firebase.ts).
 */

import { create } from 'zustand';
import { authService, AuthSession, ConfirmationResult } from '../services/auth';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import type { UserRole } from '../types/user';

interface AuthState {
  user: AuthSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  /** True once onAuthStateChanged has fired its first result */
  ready: boolean;
  /** Stored between sendOTP and verifyOTP steps */
  confirmationResult: ConfirmationResult | null;

  /** Start Firebase auth listener — call once at app root mount */
  initAuthListener: () => () => void;
  sendOTP: (phoneNumber: string) => Promise<void>;
  verifyOTP: (code: string, phoneNumber: string, roleIntent?: UserRole) => Promise<void>;
  completeRegistration: (data: {
    name: string;
    role: UserRole;
    address?: string;
    idProof?: string;
    categories?: string[];
    yearsExperience?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (profile: Partial<AuthSession>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  ready: false,
  confirmationResult: null,

  // ── Session Persistence ───────────────────────────────────────────────────
  initAuthListener: () => {
    const unsubscribe = authService.onAuthStateChanged(async (uid) => {
      if (!uid) {
        set({ user: null, isAuthenticated: false, loading: false, ready: true });
        return;
      }

      set({ loading: true });
      try {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists()) {
          const data = snap.data() as any;
          set({
            user: {
              uid,
              phoneNumber:    data.phone || '',
              role:           data.role,
              displayName:    data.name,
              isNewUser:      false,
              profilePhotoUrl: data.profilePhotoUrl,
            },
            isAuthenticated: true,
            loading: false,
            ready: true,
          });
        } else {
          // Firebase session exists but registration not yet completed
          set({
            user: { uid, phoneNumber: '', role: 'client', displayName: '', isNewUser: true },
            isAuthenticated: true,
            loading: false,
            ready: true,
          });
        }
      } catch (e: any) {
        console.error('[AuthStore] Failed to fetch user doc:', e);
        set({ loading: false, ready: true });
      }
    });

    return unsubscribe;
  },

  // ── Send OTP ──────────────────────────────────────────────────────────────
  sendOTP: async (phoneNumber: string) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.sendOTP(phoneNumber);
      set({ confirmationResult: result, loading: false });
    } catch (e: any) {
      const msg = e?.message || 'Failed to send OTP.';
      set({ loading: false, error: msg });
      throw e;
    }
  },

  // ── Verify OTP ────────────────────────────────────────────────────────────
  verifyOTP: async (code: string, phoneNumber: string, roleIntent?: UserRole) => {
    set({ loading: true, error: null });
    const { confirmationResult } = get();
    if (!confirmationResult) {
      const err = 'No OTP sent yet. Please request a code first.';
      set({ loading: false, error: err });
      throw new Error(err);
    }
    try {
      const session = await authService.verifyOTP(confirmationResult, code, phoneNumber, roleIntent);
      set({
        user: session,
        isAuthenticated: true,
        loading: false,
        confirmationResult: null,
      });
    } catch (e: any) {
      const msg = e?.message || 'OTP verification failed.';
      set({ loading: false, error: msg });
      throw e;
    }
  },

  // ── Complete Registration ─────────────────────────────────────────────────
  completeRegistration: async (data) => {
    set({ loading: true, error: null });
    const { user } = get();
    if (!user) throw new Error('No authenticated user found in store.');
    try {
      await authService.completeRegistration({
        uid:   user.uid,
        phone: user.phoneNumber,
        ...data,
      });
      set({
        user: { ...user, displayName: data.name, role: data.role, isNewUser: false },
        loading: false,
      });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Registration failed.' });
      throw e;
    }
  },

  // ── Logout ────────────────────────────────────────────────────────────────
  logout: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, isAuthenticated: false, loading: false, error: null, confirmationResult: null });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Logout failed.' });
    }
  },

  // ── Delete Account (App Store 5.1.1 Compliance) ───────────────────────────
  deleteAccount: async () => {
    set({ loading: true });
    const { user } = get();
    try {
      if (user?.uid) {
        await authService.deleteAccount(user.uid, user.phoneNumber);
      }
      set({ user: null, isAuthenticated: false, loading: false, error: null, confirmationResult: null });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to delete account.' });
      throw e;
    }
  },

  // ── Update Profile (in-memory) ────────────────────────────────────────────
  updateProfile: (profile: Partial<AuthSession>) => {
    set((state) => state.user ? { user: { ...state.user, ...profile } } : {});
  },
}));
