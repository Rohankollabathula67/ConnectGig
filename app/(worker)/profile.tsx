/**
 * ConnectGig — Worker Profile Screen
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronRight, Settings, HelpCircle, Shield, LogOut, Star, Briefcase } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';

const MENU_ITEMS = [
  { icon: Briefcase, label: 'Service Categories' },
  { icon: Settings, label: 'Account Settings' },
  { icon: Star, label: 'My Reviews' },
  { icon: Shield, label: 'Verification Status' },
  { icon: HelpCircle, label: 'Help & Support' },
];

export default function WorkerProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name="Alex Rivers" size="xl" />
          <Text style={styles.name}>Alex Rivers</Text>
          <View style={styles.badgeRow}>
            <Badge type="verified" />
            <Badge type="topPro" />
          </View>
          <Text style={styles.phone}>+1 (555) 987-6543</Text>
          <Pressable style={styles.editButton}>
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
        </Card>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable key={index} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
              <item.icon size={20} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2} />
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.menuPressed]}
        >
          <LogOut size={20} color={Colors.error} strokeWidth={2} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg },
  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.xxl },
  profileCard: { alignItems: 'center', paddingVertical: Spacing.xxxl, marginBottom: Spacing.xxl },
  name: { ...Typography.title2, color: Colors.textPrimary, marginTop: Spacing.md },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  phone: { ...Typography.body2, color: Colors.textSecondary, marginTop: 4 },
  editButton: { marginTop: Spacing.lg, paddingVertical: 8, paddingHorizontal: 24, borderRadius: Radii.full, borderWidth: 1, borderColor: Colors.primary },
  editText: { ...Typography.body2SemiBold, color: Colors.primary },
  menuSection: { backgroundColor: Colors.card, borderRadius: Radii.card, ...Shadows.card, overflow: 'hidden', marginBottom: Spacing.xxl },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuPressed: { backgroundColor: Colors.surface },
  menuLabel: { ...Typography.body, color: Colors.textPrimary, flex: 1 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xl, backgroundColor: Colors.card, borderRadius: Radii.card, ...Shadows.card },
  logoutText: { ...Typography.body, color: Colors.error },
});
