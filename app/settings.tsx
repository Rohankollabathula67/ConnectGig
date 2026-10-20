/**
 * ConnectGig — Account Settings Screen
 * Features notification toggles, language configuration preferences, and linked account placeholders.
 */

import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { ChevronLeft, Trash2, Shield, FileText, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

  const { deleteAccount } = useAuthStore();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account and all associated profile data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              router.replace('/(auth)/login');
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete account. Please try again.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <Card variant="elevated" style={styles.card} padding="lg">
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Receive live updates on booking requests</Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: Colors.divider, true: Colors.primaryBg }}
              thumbColor={pushEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Email Alerts</Text>
              <Text style={styles.settingDesc}>Receive daily summary of transactions</Text>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: Colors.divider, true: Colors.primaryBg }}
              thumbColor={emailEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>SMS Reminders</Text>
              <Text style={styles.settingDesc}>Receive critical status alerts via SMS</Text>
            </View>
            <Switch
              value={smsEnabled}
              onValueChange={setSmsEnabled}
              trackColor={{ false: Colors.divider, true: Colors.primaryBg }}
              thumbColor={smsEnabled ? Colors.primary : Colors.textMuted}
            />
          </View>
        </Card>

        {/* Preferences Section */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <Card variant="elevated" style={styles.card} padding="lg">
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Language</Text>
              <Text style={styles.settingDesc}>Select your default language preference</Text>
            </View>
            <Text style={styles.prefValue}>English (IN)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Linked Account</Text>
              <Text style={styles.settingDesc}>Link Google or Apple profile details</Text>
            </View>
            <Text style={styles.prefLink}>Link Account</Text>
          </View>
        </Card>

        {/* Legal & Compliance */}
        <Text style={styles.sectionHeader}>Legal & Compliance</Text>
        <Card variant="elevated" style={styles.card} padding="lg">
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/privacy')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <Shield size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <Text style={styles.settingDesc}>How we handle your personal data & permissions</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/terms')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.menuIconBox}>
                <FileText size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Terms of Service</Text>
                <Text style={styles.settingDesc}>Platform rules, escrow, contractor terms & safety</Text>
              </View>
            </View>
            <ChevronRight size={18} color={Colors.textMuted} />
          </Pressable>
        </Card>

        {/* Account & Data Management (Apple Guideline 5.1.1) */}
        <Text style={[styles.sectionHeader, { color: Colors.error }]}>Account Actions</Text>
        <Card variant="elevated" style={styles.card} padding="lg">
          <Pressable
            style={styles.deleteRow}
            onPress={handleDeleteAccount}
            disabled={deleting}
          >
            <View style={styles.deleteInfo}>
              <View style={styles.deleteIconBox}>
                <Trash2 size={18} color={Colors.error} />
              </View>
              <View>
                <Text style={styles.deleteLabel}>
                  {deleting ? 'Deleting Account...' : 'Delete Account'}
                </Text>
                <Text style={styles.deleteDesc}>
                  Permanently remove your account and all associated data
                </Text>
              </View>
            </View>
          </Pressable>
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
  sectionHeader: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5, marginBottom: Spacing.sm, marginTop: Spacing.xl },
  card: { gap: Spacing.md },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  settingLabel: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  settingDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2, maxWidth: '80%' },
  prefValue: { ...Typography.body2, color: Colors.textSecondary },
  prefLink: { ...Typography.body2SemiBold, color: Colors.primary },
  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.xs },
  deleteRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.xs },
  deleteInfo: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flex: 1 },
  deleteIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteLabel: { ...Typography.body2SemiBold, color: Colors.error },
  deleteDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2, maxWidth: '90%' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radii.sm,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
