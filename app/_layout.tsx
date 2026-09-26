/**
 * ConnectGig — Root Layout
 * Handles font loading, splash screen, and initial routing.
 * Starts Firebase Auth session listener on mount for session persistence.
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { ErrorBoundaryFallback } from '../components/ErrorBoundary';
import { useAuthStore } from '../store/authStore';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return <ErrorBoundaryFallback error={error} retry={retry} />;
}

// Keep splash screen visible while we prepare
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Activate global push notifications listeners
  useNotifications();

  // Start Firebase Auth persistence listener
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initAuthListener();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Hide native splash after a short delay (our custom splash takes over)
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(client)" />
        <Stack.Screen name="(worker)" />
        <Stack.Screen
          name="service-request"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="searching"
          options={{ animation: 'fade' }}
        />
        <Stack.Screen
          name="job-tracking"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="job-request/[id]"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="notifications"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="rating"
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="all-services"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="settings"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="privacy"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="help-support"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="my-reviews"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="provider-categories"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="verification-status"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
