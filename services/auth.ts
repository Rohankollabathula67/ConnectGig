/**
 * ConnectGig — Authentication Service (§3.3)
 * Provides Phone OTP authentication workflows for Firebase & Simulated Mock mode.
 */

import { auth, db, IS_FIREBASE_ENABLED } from './firebase';
import { 
  signInWithPhoneNumber, 
  signOut as firebaseSignOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { UserRole } from '../types/user';

// Mock users database in memory for Simulated Mode
let mockUsers: Record<string, { uid: string; phone: string; role: UserRole; name: string }> = {
  '+15551234567': { uid: 'mock-client-uid', phone: '+15551234567', role: 'client', name: 'Alex Johnson' },
  '+15559876543': { uid: 'mock-worker-uid', phone: '+15559876543', role: 'provider', name: 'Alex Rivers' },
};

export interface AuthSession {
  uid: string;
  phoneNumber: string;
  role: UserRole;
  displayName: string;
}

export const authService = {
  /**
   * Mock OTP sender: sends a mock verification code
   */
  async sendOTP(phoneNumber: string): Promise<{ verificationId: string } | any> {
    if (!IS_FIREBASE_ENABLED) {
      console.log(`[Mock Auth] OTP Code '123456' sent to ${phoneNumber}`);
      return { verificationId: 'mock-verification-id', phoneNumber };
    }
    
    // Standard Firebase Auth Phone flow requires recaptchaVerifier (configured in UI component)
    throw new Error("reCAPTCHA verifier required for real firebase authentication phone flow.");
  },

  /**
   * Verifies the OTP code and returns/registers the user session
   */
  async verifyOTP(
    verificationId: string,
    code: string,
    phoneNumber: string,
    role: UserRole
  ): Promise<AuthSession> {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Network simulation

    if (!IS_FIREBASE_ENABLED || verificationId === 'mock-verification-id') {
      if (code !== '123456') {
        throw new Error("Invalid verification code. Enter '123456' for mock mode.");
      }
      
      const existingUser = mockUsers[phoneNumber];
      if (existingUser) {
        return {
          uid: existingUser.uid,
          phoneNumber: existingUser.phone,
          role: existingUser.role,
          displayName: existingUser.name,
        };
      } else {
        // Create new user in mock db
        const newUser = {
          uid: `mock-user-${Date.now()}`,
          phone: phoneNumber,
          role: role,
          name: role === 'client' ? 'Alex Johnson' : 'Alex Rivers',
        };
        mockUsers[phoneNumber] = newUser;
        return {
          uid: newUser.uid,
          phoneNumber: newUser.phone,
          role: newUser.role,
          displayName: newUser.name,
        };
      }
    }

    // Real Firebase auth verification logic (should be called with confirmationResult)
    throw new Error("Real verification requires Firebase ConfirmationResult object.");
  },

  /**
   * Signs the current user session out
   */
  async signOut(): Promise<void> {
    if (IS_FIREBASE_ENABLED && auth) {
      await firebaseSignOut(auth);
    }
    console.log("[Auth Service] Session cleared.");
  }
};
