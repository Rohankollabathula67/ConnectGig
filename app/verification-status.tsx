/**
 * ConnectGig — Verification Status Screen
 * Displays provider credential status (verified/pending/rejected) and uploaded documents checklist.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../store/authStore';

export default function VerificationStatusScreen() {
  const { user } = useAuthStore();
  const isVerified = true; // Seed verified status default

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Verification Status</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Indicator Card */}
        <Card variant="elevated" style={styles.statusCard} padding="xl">
          <View style={styles.iconContainer}>
            <ShieldCheck size={48} color={isVerified ? Colors.success : Colors.warning} strokeWidth={2} />
          </View>
          <Text style={styles.statusTitle}>{isVerified ? 'Profile Verified' : 'Pending Verification'}</Text>
          <Text style={styles.statusDesc}>
            {isVerified 
              ? 'Your credentials have been successfully reviewed and verified by ConnectGiG compliance agents.' 
              : 'Our support compliance agents are currently reviewing your address and ID proof files.'}
          </Text>
          <View style={styles.badgeRow}>
            <Badge type="verified" label={isVerified ? "Verified Expert" : "Verification Pending"} />
          </View>
        </Card>

        {/* Verification Checkpoints */}
        <Text style={styles.sectionTitle}>Verification Checkpoints</Text>
        <Card variant="default" style={styles.checkpointsCard} padding="lg">
          <View style={styles.checkpointRow}>
            <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>OTP Phone Verification</Text>
              <Text style={styles.checkpointDesc}>Completed during registration</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.checkpointRow}>
            <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>Aadhaar Card / ID Proof</Text>
              <Text style={styles.checkpointDesc}>Uploaded & validated</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.checkpointRow}>
            <CheckCircle2 size={20} color={Colors.success} strokeWidth={2} />
            <View style={styles.checkpointMeta}>
              <Text style={styles.checkpointLabel}>Skill Badging Verification</Text>
              <Text style={styles.checkpointDesc}>Checked & approved</Text>
            </View>
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

  statusCard: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xl },
  iconContainer: { marginBottom: Spacing.sm },
  statusTitle: { ...Typography.title2, color: Colors.textPrimary },
  statusDesc: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20, marginVertical: Spacing.sm },
  badgeRow: { marginTop: Spacing.xs },

  sectionTitle: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5, marginBottom: Spacing.sm },
  checkpointsCard: { gap: Spacing.md },
  checkpointRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.xs },
  checkpointMeta: { flex: 1 },
  checkpointLabel: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  checkpointDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.divider },
});
