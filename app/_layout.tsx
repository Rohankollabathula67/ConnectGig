/**
 * ConnectGig — Root Layout
 * Handles font loading, splash screen, and initial routing
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import { ErrorBoundaryFallback } from '../components/ErrorBoundary';

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => Promise<void> }) {
  return <ErrorBoundaryFallback error={error} retry={retry} />;
}

// Keep splash screen visible while we prepare
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Activate global push notifications listeners
  useNotifications();

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
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}
