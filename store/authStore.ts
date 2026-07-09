/**
 * ConnectGig — Auth Store (§3.3)
 * Zustand store for user session management, credentials, and roles.
 */

import { create } from 'zustand';
import { authService, AuthSession } from '../services/auth';
import type { UserRole } from '../types/user';

interface AuthState {
  user: AuthSession | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sendOTP: (phoneNumber: string) => Promise<{ verificationId: string }>;
  verifyOTP: (verificationId: string, code: string, phoneNumber: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,

  sendOTP: async (phoneNumber: string) => {
    set({ loading: true, error: null });
    try {
      const res = await authService.sendOTP(phoneNumber);
      set({ loading: false });
      return res;
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Failed to send verification code.' });
      throw e;
    }
  },

  verifyOTP: async (verificationId: string, code: string, phoneNumber: string, role: UserRole) => {
    set({ loading: true, error: null });
    try {
      const session = await authService.verifyOTP(verificationId, code, phoneNumber, role);
      set({ user: session, isAuthenticated: true, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'OTP verification failed.' });
      throw e;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authService.signOut();
      set({ user: null, isAuthenticated: false, loading: false, error: null });
    } catch (e: any) {
      set({ loading: false, error: e?.message || 'Logout failed.' });
    }
  },
}));
