/**
 * ConnectGig — Privacy & Security Screen
 * Placeholder info panel details.
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ShieldAlert } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <ShieldAlert size={64} color={Colors.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.headline}>Your Privacy is Protected</Text>
        <Text style={styles.desc}>
          At ConnectGiG, we implement end-to-end security measures. Your account authentication, transaction logs, and phone numbers are encrypted.
        </Text>
        <Card variant="default" style={styles.infoCard} padding="lg">
          <Text style={styles.infoTitle}>Secure Access Controls</Text>
          <Text style={styles.infoDesc}>
            Two-Factor Authentication is currently managed via verified OTP login links tied to your active device phone number.
          </Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  backButton: { width: 40, height: 40, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  content: { flex: 1, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xxxl, alignItems: 'center' },
  iconContainer: { marginBottom: Spacing.xl },
  headline: { ...Typography.title2, color: Colors.textPrimary, marginBottom: Spacing.md, textAlign: 'center' },
  desc: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: Spacing.xxl },
  infoCard: { width: '100%', gap: Spacing.xs },
  infoTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  infoDesc: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 16 },
});
