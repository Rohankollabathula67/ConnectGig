/**
 * ConnectGig — Privacy & Security Screen (Sprint 3 — App Store & Play Store Compliant)
 * Comprehensive privacy policy disclosures: data collection, permissions,
 * Razorpay payment encryption, and account deletion rights.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import {
  ChevronLeft,
  ShieldCheck,
  Lock,
  MapPin,
  CreditCard,
  Trash2,
  ExternalLink,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Card */}
        <Card variant="elevated" style={styles.heroCard} padding="xl">
          <View style={styles.heroIconWrap}>
            <ShieldCheck size={44} color={Colors.success} strokeWidth={2} />
          </View>
          <Text style={styles.heroTitle}>Your Privacy is Protected</Text>
          <Text style={styles.heroDesc}>
            ConnectGiG adheres to strict global data safety standards. All personal information, transaction logs, and live communications are encrypted in transit and at rest.
          </Text>
        </Card>

        {/* Section: Location Data */}
        <Text style={styles.sectionTitle}>LOCATION TRANSPARENCY</Text>
        <Card variant="default" style={styles.policyCard} padding="lg">
          <View style={styles.policyHeader}>
            <MapPin size={20} color={Colors.primary} />
            <Text style={styles.policyHeading}>GPS & Background Location</Text>
          </View>
          <Text style={styles.policyBody}>
            We collect foreground location data exclusively while the app is active to calculate nearby worker proximity and display real-time ETA route polylines. Your location is never shared with third parties for marketing purposes.
          </Text>
        </Card>

        {/* Section: Payments & Billing */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>PAYMENTS & ENCRYPTION</Text>
        <Card variant="default" style={styles.policyCard} padding="lg">
          <View style={styles.policyHeader}>
            <CreditCard size={20} color={Colors.primary} />
            <Text style={styles.policyHeading}>PCI-DSS Tokenized Payments</Text>
          </View>
          <Text style={styles.policyBody}>
            ConnectGiG partners with Razorpay for secure payment processing. We never store raw credit card numbers, debit card details, or UPI PINs on our servers. All transactions utilize 256-bit SSL encryption and tokenization.
          </Text>
        </Card>

        {/* Section: Account Data & Deletion */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>DATA RETENTION & RIGHTS</Text>
        <Card variant="default" style={styles.policyCard} padding="lg">
          <View style={styles.policyHeader}>
            <Trash2 size={20} color={Colors.error} />
            <Text style={styles.policyHeading}>Right to be Forgotten</Text>
          </View>
          <Text style={styles.policyBody}>
            In compliance with App Store and GDPR regulations, you have full authority to permanently delete your account and associated personal data at any time via the Danger Zone in Account Settings.
          </Text>
          <Pressable
            style={styles.settingsLink}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsLinkText}>Manage Account in Settings</Text>
            <ExternalLink size={14} color={Colors.primary} />
          </Pressable>
        </Card>

        {/* Contact Compliance */}
        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            For data protection inquiries or GDPR requests, contact our compliance officer at{' '}
            <Text
              style={styles.emailLink}
              onPress={() => Linking.openURL('mailto:privacy@connectgig.app')}
            >
              privacy@connectgig.app
            </Text>
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  heroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: Radii.full,
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  heroDesc: {
    ...Typography.body2,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 4,
  },
  sectionTitle: {
    ...Typography.overline,
    color: Colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  policyCard: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  policyHeading: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  policyBody: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  settingsLinkText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  footerNote: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  emailLink: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
