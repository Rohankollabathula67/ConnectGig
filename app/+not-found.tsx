/**
 * ConnectGig — 404 / Unmatched Route Screen
 * Rendered whenever an invalid or missing route is accessed.
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { Compass, Home, ArrowLeft } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Button } from '../components/ui/Button';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found', headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Compass size={64} color={Colors.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.code}>404</Text>
          <Text style={styles.title}>Screen Not Found</Text>
          <Text style={styles.subtitle}>
            The screen or link you were trying to open does not exist or has been moved.
          </Text>

          <View style={styles.actions}>
            <Button
              title="Back to Home"
              onPress={() => router.replace('/')}
              icon={<Home size={18} color={Colors.textWhite} />}
              size="lg"
              fullWidth
            />
            <Button
              title="Go Back"
              variant="secondary"
              onPress={() => safeGoBack()}
              icon={<ArrowLeft size={18} color={Colors.textPrimary} />}
              size="lg"
              fullWidth
              style={styles.secondaryBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 420,
    paddingHorizontal: Spacing.screenPadding,
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primaryBg10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  code: {
    ...Typography.heroTitle,
    color: Colors.primary,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    ...Typography.title1,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxxl,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  secondaryBtn: {
    marginTop: 4,
  },
});
