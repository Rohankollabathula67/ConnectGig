/**
 * ConnectGig — Global Error Boundary Component (§6.0, §8.0)
 * Graceful error screen for uncaught React Native exceptions.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCircle, RefreshCw } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Button } from './ui/Button';
import { router } from 'expo-router';

export interface ErrorBoundaryProps {
  error: Error;
  retry: () => Promise<void> | void;
}

export function ErrorBoundaryFallback({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <AlertCircle size={48} color={Colors.error} strokeWidth={2} />
        </View>

        <Text style={styles.title}>Oops! Something went wrong.</Text>
        <Text style={styles.subtitle}>
          An unexpected error occurred. Our team has been notified.
        </Text>

        <View style={styles.errorDetailsBox}>
          <Text style={styles.errorLabel}>ERROR DETAILS</Text>
          <Text style={styles.errorText} numberOfLines={6}>
            {error?.message || 'Unknown runtime exception.'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            title="Try Again"
            onPress={() => retry()}
            size="lg"
            fullWidth
          />
          <Button
            title="Return to Home"
            variant="secondary"
            onPress={() => router.replace('/')}
            size="lg"
            fullWidth
            style={{ marginTop: 12 }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center' },
  content: { paddingHorizontal: Spacing.screenPadding, alignItems: 'center' },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: { ...Typography.title2, color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xxl },
  
  errorDetailsBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    marginBottom: Spacing.xxxl,
  },
  errorLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5, marginBottom: 6 },
  errorText: { ...Typography.caption, color: Colors.textSecondary, fontFamily: 'monospace' },
  
  actions: { width: '100%' },
});
