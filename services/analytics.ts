/**
 * ConnectGig — Analytics & Telemetry Service (§7.1)
 * Tracks user engagement, job funnels, payments, and conversion metrics.
 * Safe in Expo Go / simulation mode and production builds.
 */

import { IS_FIREBASE_ENABLED } from './firebase';

export type AnalyticsEventName =
  | 'app_opened'
  | 'user_login'
  | 'user_signup'
  | 'profile_updated'
  | 'service_requested'
  | 'worker_matched'
  | 'job_accepted'
  | 'job_cancelled'
  | 'job_completed'
  | 'payment_initiated'
  | 'payment_success'
  | 'payment_failed'
  | 'payout_requested'
  | 'rating_submitted'
  | 'screen_view';

class AnalyticsService {
  /**
   * Log an event with optional key-value properties.
   */
  async logEvent(name: AnalyticsEventName, params?: Record<string, any>): Promise<void> {
    if (__DEV__) {
      console.log(`📊 [Analytics] Event: ${name}`, params || {});
    }

    if (!IS_FIREBASE_ENABLED) {
      return;
    }

    try {
      // In production builds, events can be synced to Firebase / PostHog
    } catch (err) {
      console.warn(`[Analytics] Failed to track ${name}:`, err);
    }
  }

  /** Track screen navigation */
  async logScreenView(screenName: string): Promise<void> {
    return this.logEvent('screen_view', { screen_name: screenName });
  }

  /** Track user sign in */
  async logLogin(method: string, role?: string): Promise<void> {
    return this.logEvent('user_login', { method, role });
  }

  /** Track registration completion */
  async logSignUp(role: string): Promise<void> {
    return this.logEvent('user_signup', { role });
  }

  /** Track client creating a gig request */
  async logServiceRequested(category: string, estimatedCost: number): Promise<void> {
    return this.logEvent('service_requested', { category, estimatedCost });
  }

  /** Track worker accepting a gig */
  async logJobAccepted(requestId: string, category?: string): Promise<void> {
    return this.logEvent('job_accepted', { requestId, category });
  }

  /** Track worker completing a job */
  async logJobCompleted(requestId: string, payout: number): Promise<void> {
    return this.logEvent('job_completed', { requestId, payout });
  }

  /** Track client payment completion */
  async logPaymentSuccess(requestId: string, amount: number): Promise<void> {
    return this.logEvent('payment_success', { requestId, amount });
  }

  /** Track feedback & rating */
  async logRatingSubmitted(rating: number, category?: string): Promise<void> {
    return this.logEvent('rating_submitted', { rating, category });
  }

  /** Track worker payout request */
  async logPayoutRequested(amount: number, method: 'upi' | 'bank'): Promise<void> {
    return this.logEvent('payout_requested', { amount, method });
  }
}

export const analyticsService = new AnalyticsService();
