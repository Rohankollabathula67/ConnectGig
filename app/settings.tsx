/**
 * ConnectGig — Account Settings Screen
 * Features notification toggles, language configuration preferences, and linked account placeholders.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
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
});
