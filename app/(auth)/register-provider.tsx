/**
 * ConnectGig — Provider Onboarding Profile Screen (§3.3)
 * Collects name, experience, category tags, address, and ID proof for new Service Experts.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { useAuthStore } from '../../store/authStore';

const PROVIDER_CATEGORIES = [
  { id: 'Plumber', label: '🔧 Plumber' },
  { id: 'Electrician', label: '⚡ Electrician' },
  { id: 'Cleaner', label: '🧹 Cleaner' },
  { id: 'Painter', label: '🎨 Painter' },
  { id: 'Gardener', label: '🌿 Gardener' },
  { id: 'Handyman', label: '🛠️ Handyman' },
];

export default function RegisterProviderScreen() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [experience, setExperience] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>('Plumber');
  const [address, setAddress] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Field", "Please enter your name.");
      return;
    }
    if (!experience.trim()) {
      Alert.alert("Missing Field", "Please enter your years of experience.");
      return;
    }
    if (!selectedCategory) {
      Alert.alert("Missing Field", "Please select your primary skill category.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Missing Field", "Please enter your address.");
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert("Missing Field", "Please enter your ID proof number.");
      return;
    }

    setSubmitting(true);
    // Simulate API registration delay (1.5 seconds)
    setTimeout(() => {
      setSubmitting(false);

      // Update store state directly
      const session = useAuthStore.getState().user;
      if (session) {
        session.displayName = name;
        session.isNewUser = false;
      }

      Alert.alert(
        "Onboarding Complete",
        "Your expert profile has been created successfully!",
        [
          { text: "Enter Dashboard", onPress: () => router.replace('/(worker)/dashboard') }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Expert Onboarding</Text>
        <Text style={styles.subtitle}>
          Create your professional profile to start receiving matching gig requests.
        </Text>

        {/* Input Details Card */}
        <Card variant="elevated" padding="xl" style={styles.card}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Marcus Rivera"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Experience Years */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>YEARS OF EXPERIENCE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={Colors.textMuted}
              value={experience}
              onChangeText={setExperience}
              keyboardType="numeric"
            />
          </View>

          {/* Primary Skill Category Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PRIMARY SERVICE SPECIALTY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl }}>
              <ChipGroup
                items={PROVIDER_CATEGORIES}
                selectedId={selectedCategory}
                onSelect={(id) => setSelectedCategory(id)}
              />
            </ScrollView>
          </View>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>BUSINESS ADDRESS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Suite 201, Downtown Plaza"
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* ID Proof Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>AADHAAR / GOVT ID NUMBER</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your Govt ID number"
              placeholderTextColor={Colors.textMuted}
              value={idNumber}
              onChangeText={setIdNumber}
              autoCapitalize="characters"
            />
          </View>
        </Card>

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Complete Onboarding  →"
            onPress={handleRegister}
            loading={submitting}
            fullWidth
            size="lg"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl, paddingBottom: 40 },
  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.xs },
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.xxl },

  card: { gap: Spacing.lg, marginBottom: Spacing.xl },
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

  buttonWrapper: { marginTop: Spacing.md },
});
