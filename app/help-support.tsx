/**
 * ConnectGig — Help & Support Screen
 * List FAQs and helpline information.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Mail, PhoneCall } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';

const FAQS = [
  { q: "How does the AI matchmaking search work?", a: "Our geohash proximity filter identifies matching service experts within a 4km radius, expanding the query up to 20km until an provider accepts." },
  { q: "What are the payment checkout options?", a: "ConnectGiG integrates secure test-mode order checks and confirms transaction status tags instantly." },
  { q: "How do I update my profile details?", a: "Head to Profile dashboard tab and select Edit Profile row to configure your name, credentials and profile image uploads." },
];

export default function HelpSupportScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqList}>
          {FAQS.map((faq, idx) => (
            <Card key={idx} variant="default" style={styles.faqCard} padding="lg">
              <Text style={styles.faqQ}>Q: {faq.q}</Text>
              <Text style={styles.faqA}>{faq.a}</Text>
            </Card>
          ))}
        </View>

        {/* Contact Info */}
        <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Contact Helpdesk</Text>
        <Card variant="elevated" style={styles.contactCard} padding="lg">
          <View style={styles.contactRow}>
            <Mail size={18} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.contactText}>support@connectgig.com</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.contactRow}>
            <PhoneCall size={18} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.contactText}>1800-420-9999 (Toll-Free)</Text>
          </View>
        </Card>
      </ScrollView>
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
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: 40 },
  sectionTitle: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5, marginBottom: Spacing.sm },
  faqList: { gap: Spacing.md },
  faqCard: { gap: Spacing.xs },
  faqQ: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  faqA: { ...Typography.caption, color: Colors.textSecondary, lineHeight: 16 },
  contactCard: { gap: Spacing.md },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  contactText: { ...Typography.body2, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.divider },
});
