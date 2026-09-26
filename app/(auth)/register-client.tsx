/**
 * ConnectGig — Client Profile Registration Screen (§3.3)
 * Collects name, address, and ID proof for new Client users.
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
import { useAuthStore } from '../../store/authStore';

export default function RegisterClientScreen() {
  const { user } = useAuthStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [idType, setIdType] = useState<'Aadhaar' | 'PAN' | 'Passport'>('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Field", "Please enter your name.");
      return;
    }
    if (!address.trim()) {
      Alert.alert("Missing Field", "Please enter your full address.");
      return;
    }
    if (!idNumber.trim()) {
      Alert.alert("Missing Field", "Please enter your ID proof number.");
      return;
    }

    setSubmitting(true);
    // Simulate API registration lag (1.5 seconds)
    setTimeout(() => {
      setSubmitting(false);
      
      // Update store state directly
      const session = useAuthStore.getState().user;
      if (session) {
        session.displayName = name;
        session.isNewUser = false;
      }

      Alert.alert(
        "Registration Complete",
        "Your profile has been created successfully!",
        [
          { text: "Continue", onPress: () => router.replace('/(client)/home') }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Client Details</Text>
        <Text style={styles.subtitle}>
          Set up your client profile to start hiring certified service professionals.
        </Text>

        {/* Input Fields Card */}
        <Card variant="elevated" padding="xl" style={styles.card}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Address Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>FULL ADDRESS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="e.g. Apt 4B, 5th Avenue, Metro City"
              placeholderTextColor={Colors.textMuted}
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* ID Proof Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>ID PROOF TYPE</Text>
            <View style={styles.segmentedRow}>
              {(['Aadhaar', 'PAN', 'Passport'] as const).map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setIdType(type)}
                  style={[
                    styles.segmentBtn,
                    idType === type && styles.segmentBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      idType === type && styles.segmentTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ID Number Field */}
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

        {/* Action Button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Complete Registration  →"
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

  // Segmented control
  segmentedRow: { flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: Radii.card, padding: 4, borderWidth: 1, borderColor: Colors.inputBorder },
  segmentBtn: { flex: 1, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: Radii.sm },
  segmentBtnActive: { backgroundColor: Colors.primary },
  segmentText: { ...Typography.caption, color: Colors.textSecondary, fontWeight: '600' },
  segmentTextActive: { color: Colors.textWhite },

  buttonWrapper: { marginTop: Spacing.md },
});
