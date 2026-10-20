/**
 * ConnectGig — Terms of Service Screen
 * Compliant with Apple App Store Review Guidelines §5.1.1 and Google Play Policies.
 * Transparent marketplace terms, independent contractor status, payment escrow,
 * cancellation policy, safety, liability, and dispute resolution.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import {
  ChevronLeft,
  FileText,
  ShieldCheck,
  Scale,
  CreditCard,
  AlertTriangle,
  UserCheck,
  HelpCircle,
  ExternalLink,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

const TERMS_SECTIONS = [
  {
    icon: FileText,
    title: '1. Platform Intermediary Role',
    content:
      'ConnectGig operates strictly as an on-demand marketplace technology platform connecting independent service professionals ("Workers" or "Providers") with registered consumers ("Clients"). ConnectGig does not directly provide maintenance, plumbing, electrical, or cleaning services, nor does it employ service technicians as direct staff.',
  },
  {
    icon: UserCheck,
    title: '2. Independent Contractor Status',
    content:
      'Service Providers are autonomous, self-employed independent contractors. Providers maintain full discretion over their working hours, gig acceptance, route selection, and equipment. Nothing in this agreement constitutes an employer-employee relationship, partnership, joint venture, or agency between ConnectGig and any Provider.',
  },
  {
    icon: ShieldCheck,
    title: '3. Identity Verification & Compliance',
    content:
      'To foster marketplace trust and safety, all Service Providers agree to undergo verification by submitting legitimate identity proofs (such as Aadhaar or PAN) and relevant trade licenses. ConnectGig reserves the full authority to suspend, restrict, or terminate any account found misrepresenting credentials or violating security standards.',
  },
  {
    icon: CreditCard,
    title: '4. Booking, Escrow & Payment Processing',
    content:
      'All payments are processed securely through PCI-DSS Level 1 compliant financial partners (including Razorpay). Service charges are displayed prior to booking confirmation. For Client protection, payments are held in escrow release until the client verifies satisfactory completion of the gig or provides rating confirmation.',
  },
  {
    icon: AlertTriangle,
    title: '5. Cancellation, Refunds & No-Show Policy',
    content:
      'Clients may cancel bookings without penalty prior to provider dispatch. Cancellations occurring after provider arrival or no-show incidents may incur a nominal dispatch fee credited to the provider. Disputed charges or incomplete jobs are eligible for immediate support review and refund adjustment.',
  },
  {
    icon: Scale,
    title: '6. User Conduct & Zero Tolerance',
    content:
      'ConnectGig enforces a strict zero-tolerance policy against discrimination, harassment, unlawful conduct, property damage, and fraudulent reviews. Breaches will result in immediate permanent banning from the network and referral to law enforcement when appropriate.',
  },
  {
    icon: HelpCircle,
    title: '7. Limitation of Liability & Warranty Disclaimer',
    content:
      'ConnectGig provides the technology platform "as is" and "as available". To the maximum extent permitted by applicable law, ConnectGig disclaims all express or implied warranties regarding workmanship quality and shall not be liable for incidental, indirect, or consequential damages.',
  },
  {
    icon: Scale,
    title: '8. Dispute Resolution & Governing Law',
    content:
      'Any claim or dispute arising out of or related to platform usage shall first be submitted to our dedicated Conciliation Support Team. If unresolved within 30 days, disputes shall be settled through binding individual arbitration under Indian Arbitration and Conciliation statutes.',
  },
];

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <Card variant="elevated" style={styles.heroCard} padding="xl">
          <View style={styles.badgeRow}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionBadgeText}>Version 1.2 • Updated Oct 2026</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>ConnectGig Platform Terms</Text>
          <Text style={styles.heroSubtitle}>
            These Terms of Service govern your access to and use of the ConnectGig mobile application, website, and matching services. Please read them carefully.
          </Text>
        </Card>

        {/* Quick Links */}
        <View style={styles.quickLinksRow}>
          <Pressable
            style={styles.quickLinkBtn}
            onPress={() => router.push('/privacy')}
          >
            <ShieldCheck size={16} color={Colors.primary} />
            <Text style={styles.quickLinkText}>Privacy Policy</Text>
          </Pressable>
          <Pressable
            style={styles.quickLinkBtn}
            onPress={() => router.push('/help-support')}
          >
            <HelpCircle size={16} color={Colors.primary} />
            <Text style={styles.quickLinkText}>Help & Support</Text>
          </Pressable>
        </View>

        {/* Sections */}
        <View style={styles.sectionsList}>
          {TERMS_SECTIONS.map((sec, index) => {
            const Icon = sec.icon;
            return (
              <Card key={index} variant="default" style={styles.sectionCard} padding="lg">
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.iconCircle}>
                    <Icon size={18} color={Colors.primary} strokeWidth={2} />
                  </View>
                  <Text style={styles.sectionCardTitle}>{sec.title}</Text>
                </View>
                <Text style={styles.sectionCardBody}>{sec.content}</Text>
              </Card>
            );
          })}
        </View>

        {/* Contact & Grievance Officer */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Grievance & Legal Officer</Text>
        <Card variant="elevated" style={styles.contactCard} padding="lg">
          <Text style={styles.contactIntro}>
            For legal inquiries, copyright notices, or regulatory compliance requests, please reach out directly:
          </Text>
          <Pressable
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:legal@connectgig.app')}
          >
            <Text style={styles.contactEmail}>legal@connectgig.app</Text>
            <ExternalLink size={14} color={Colors.primary} />
          </Pressable>
          <Text style={styles.contactAddress}>
            ConnectGig Technologies Pvt. Ltd.{'\n'}
            Tech Park Corridor, Bengaluru, Karnataka 560103
          </Text>
        </Card>
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
  },
  scrollContent: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: 48,
  },
  heroCard: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    gap: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  versionBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  versionBadgeText: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '700',
  },
  heroTitle: {
    ...Typography.title2,
    color: Colors.textPrimary,
  },
  heroSubtitle: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
  },
  quickLinksRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickLinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderRadius: Radii.button,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  quickLinkText: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
  },
  sectionsList: {
    gap: Spacing.md,
  },
  sectionCard: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radii.full,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCardTitle: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
    flex: 1,
  },
  sectionCardBody: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: {
    ...Typography.overline,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  contactCard: {
    gap: Spacing.sm,
  },
  contactIntro: {
    ...Typography.caption,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactEmail: {
    ...Typography.body2SemiBold,
    color: Colors.primary,
  },
  contactAddress: {
    ...Typography.micro,
    color: Colors.textMuted,
    lineHeight: 16,
    marginTop: 4,
  },
});
