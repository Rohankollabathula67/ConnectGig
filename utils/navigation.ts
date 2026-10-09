/**
 * ConnectGig — Navigation Utilities
 * Safe navigation helpers that prevent "GO_BACK was not handled" crashes.
 */

import { router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

/**
 * Returns the default home route based on the current user's role.
 */
export function getDefaultHomeRoute(): string {
  try {
    const { isAuthenticated, user } = useAuthStore.getState();
    if (isAuthenticated && user) {
      if (user.role === 'provider') return '/(worker)/dashboard';
      return '/(client)/home';
    }
  } catch {}
  return '/';
}

/**
 * Safely navigates back. If there is no screen to go back to
 * (e.g. after a router.replace()), navigates to the fallback route instead.
 */
export function safeGoBack(fallback?: string) {
  try {
    if (router.canGoBack()) {
      router.back();
      return;
    }
  } catch {}

  const target = fallback || getDefaultHomeRoute();
  try {
    router.replace(target as any);
  } catch {
    router.replace('/' as any);
  }
}
