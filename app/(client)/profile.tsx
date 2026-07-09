/**
 * ConnectGig — Client Profile Screen
 */

import { router } from 'expo-router';
import { ChevronRight, HelpCircle, LogOut, Settings, Shield, Star } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/colors';
import { Radii, Shadows, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

const MENU_ITEMS = [
  { icon: Settings, label: 'Account Settings', route: '' },
  { icon: Star, label: 'My Reviews', route: '' },
  { icon: Shield, label: 'Privacy & Security', route: '' },
  { icon: HelpCircle, label: 'Help & Support', route: '' },
];

export default function ClientProfileScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Card */}
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name="Alex Johnson" size="xl" />
          <Text style={styles.name}>Kollabathula Rohan</Text>
          <Text style={styles.phone}>+91 7674834552</Text>
          <Pressable style={styles.editButton}>
            <Text style={styles.editText}>Edit Profile</Text>
          </Pressable>
        </Card>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, index) => (
            <Pressable key={index} style={({ pressed }) => [styles.menuItem, pressed && styles.menuPressed]}>
              <item.icon size={20} color={Colors.textSecondary} strokeWidth={2} />
              <Text style={styles.menuLabel}>{item.label}</Text>
              <ChevronRight size={18} color={Colors.textMuted} strokeWidth={2} />
            </Pressable>
          ))}
        </View>

        {/* Logout */}
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
