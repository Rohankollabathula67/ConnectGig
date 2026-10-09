/**
 * ConnectGig — Unified Registration Screen (§3.3)
 * 
 * Shown to NEW users immediately after first-time phone OTP verification.
 * Collects: full name, role (Client / Worker), address, ID proof.
 * If Worker → also collects service categories (multi-select) and experience.
 * 
 * On submit → writes users/{uid} (and providers/{uid} if Worker) in Firestore,
 * then routes to the appropriate home screen.
 */

import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Circle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import type { UserRole } from '../../types/user';

// ── Provider category multi-select data ──────────────────────────────────────
const PROVIDER_CATEGORIES = [
  { id: 'Plumber',       emoji: '🔧', label: 'Plumber' },
  { id: 'Electrician',   emoji: '⚡', label: 'Electrician' },
  { id: 'Cleaner',       emoji: '🧹', label: 'Cleaner' },
  { id: 'Painter',       emoji: '🎨', label: 'Painter' },
  { id: 'Gardener',      emoji: '🌿', label: 'Gardener' },
  { id: 'IT Support',    emoji: '💻', label: 'IT Support' },
  { id: 'Handyman',      emoji: '🛠️', label: 'Handyman' },
  { id: 'Tutor',         emoji: '📚', label: 'Tutor' },
  { id: 'Carpenter',     emoji: '🪚', label: 'Carpenter' },
  { id: 'Barber',        emoji: '✂️', label: 'Barber' },
  { id: 'AC Technician', emoji: '❄️', label: 'AC Technician' },
  { id: 'Driver',        emoji: '🚗', label: 'Driver' },
];

const ID_TYPES = ['Aadhaar', 'PAN', 'Passport'] as const;
type IdType = typeof ID_TYPES[number];

export default function RegisterScreen() {
  const { user, completeRegistration, loading } = useAuthStore();
  const params = useLocalSearchParams<{ role?: UserRole }>();

  // Common fields
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(params.role || user?.role || 'client');
  const [address, setAddress] = useState('');
  const [idType, setIdType] = useState<IdType>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');

  // Provider-only fields
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [yearsExperience, setYearsExperience] = useState('');

  // ── Toggle category multi-select ─────────────────────────────────────────
  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter your full name.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Missing Field', 'Please enter your address.');
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert('Missing Field', `Please enter your ${idType} number.`);
      return;
    }
    if (role === 'provider' && selectedCategories.length === 0) {
      Alert.alert('Missing Field', 'Please select at least one service category.');
      return;
    }
    if (role === 'provider' && !yearsExperience.trim()) {
      Alert.alert('Missing Field', 'Please enter your years of experience.');
      return;
    }

    try {
      await completeRegistration({
        name: name.trim(),
        role,
        address: address.trim(),
        idProof: `${idType}: ${idNumber.trim()}`,
        categories: role === 'provider' ? selectedCategories : undefined,
        yearsExperience: role === 'provider' ? yearsExperience.trim() : undefined,
      });

      Alert.alert(
        'Welcome to ConnectGiG! 🎉',
        role === 'provider'
          ? 'Your expert profile is created. You can start accepting jobs once verified.'
          : 'Your profile is ready. Start booking services!',
        [
          {
            text: 'Let\'s Go →',
            onPress: () => {
              if (role === 'provider') {
                router.replace('/(worker)/dashboard');
              } else {
                router.replace('/(client)/home');
              }
            },
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Registration Failed', e?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>Complete your Profile</Text>
        <Text style={styles.subtitle}>
          {user?.phoneNumber
            ? `Setting up account for ${user.phoneNumber}`
            : 'Just a few more details to get started'}
        </Text>

        {/* ── Role Toggle ───────────────────────────────────────────────── */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionLabel}>I AM A</Text>
          <View style={styles.roleToggle}>
            {(['client', 'provider'] as UserRole[]).map(r => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleOption, role === r && styles.roleOptionActive]}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r === 'client' ? '👤 Client' : '🔧 Service Provider'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {/* ── Personal Info ──────────────────────────────────────────────── */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Priya Sharma"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{role === 'provider' ? 'BUSINESS / HOME ADDRESS' : 'HOME ADDRESS'}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Flat 12, Sunrise Apartments, Mumbai"
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* ID Proof */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID PROOF TYPE</Text>
            <View style={styles.segmentedRow}>
              {ID_TYPES.map(t => (
                <Pressable
                  key={t}
                  onPress={() => setIdType(t)}
                  style={[styles.segmentBtn, idType === t && styles.segmentBtnActive]}
                >
                  <Text style={[styles.segmentText, idType === t && styles.segmentTextActive]}>
                    {t}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{idType.toUpperCase()} NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder={`Enter your ${idType} number`}
              placeholderTextColor={Colors.textMuted}
              value={idNumber}
              onChangeText={setIdNumber}
              autoCapitalize="characters"
            />
          </View>
        </Card>

        {/* ── Provider-only: Categories + Experience ─────────────────────── */}
        {role === 'provider' && (
          <>
            <Card variant="elevated" style={styles.section}>
              <Text style={styles.sectionLabel}>SERVICE CATEGORIES</Text>
              <Text style={styles.sectionHint}>Select all skills you offer</Text>
              <View style={styles.categoriesGrid}>
                {PROVIDER_CATEGORIES.map(cat => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => toggleCategory(cat.id)}
                      style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
                    >
                      <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                      <Text style={[styles.categoryLabel, isSelected && styles.categoryLabelActive]}>
                        {cat.label}
                      </Text>
                      {isSelected
                        ? <CheckCircle2 size={14} color={Colors.primary} strokeWidth={2} />
                        : <Circle size={14} color={Colors.textMuted} strokeWidth={2} />
                      }
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <Card variant="elevated" style={styles.section}>
              <Text style={styles.sectionLabel}>EXPERIENCE</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>YEARS OF EXPERIENCE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5"
                  placeholderTextColor={Colors.textMuted}
                  value={yearsExperience}
                  onChangeText={setYearsExperience}
                  keyboardType="numeric"
                />
              </View>
            </Card>
          </>
        )}

        {/* ── Submit Button ──────────────────────────────────────────────── */}
        <View style={styles.buttonWrapper}>
          <Button
            title={role === 'provider' ? 'Create Expert Profile →' : 'Create Client Profile →'}
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />
          <Text style={styles.disclaimer}>
            By registering, you confirm that the information provided is accurate.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl, paddingBottom: 60 },

  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.xxl },

  section: { marginBottom: Spacing.xl, gap: Spacing.lg },
  sectionLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1.5 },
  sectionHint: { ...Typography.caption, color: Colors.textMuted, marginTop: -Spacing.xs },

  // Role toggle
  roleToggle: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    borderRadius: Radii.button,
    backgroundColor: Colors.background,
  },
  roleOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  roleText: { ...Typography.body2SemiBold, color: Colors.textSecondary },
  roleTextActive: { color: Colors.primary },

  // Inputs
  inputGroup: { gap: Spacing.xs },
  label: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5 },
  input: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.lg,
    color: Colors.textPrimary,
    ...Typography.body2,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  textArea: {
    height: 80,
    paddingTop: Spacing.md,
    textAlignVertical: 'top',
  },

  // Segmented control (ID type)
  segmentedRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  segmentBtn: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: Radii.sm,
  },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: Colors.textWhite },

  // Category multi-select grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.background,
  },
  categoryChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  categoryEmoji: { fontSize: 14 },
  categoryLabel: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  categoryLabelActive: { color: Colors.primary },

  // Submit
  buttonWrapper: { gap: Spacing.md },
  disclaimer: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
