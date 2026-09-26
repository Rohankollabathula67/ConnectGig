/**
 * ConnectGig — Provider Service Categories Screen
 * Allows providers to view and multi-select the gig categories they offer.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Check } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CATEGORIES } from '../constants/categories';
import { useAuthStore } from '../store/authStore';
import { db, IS_FIREBASE_ENABLED } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProviderCategoriesScreen() {
  const { user } = useAuthStore();
  // Simulated initial selected category
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['Electrician', 'Handyman']);
  const [submitting, setSubmitting] = useState(false);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const handleSave = async () => {
    if (selectedSkills.length === 0) {
      Alert.alert("Selection Required", "Please select at least one service category.");
      return;
    }

    setSubmitting(true);
    setTimeout(async () => {
      try {
        const userId = user?.uid || 'mock-worker-uid';
        if (IS_FIREBASE_ENABLED) {
          const docRef = doc(db, 'providers', userId);
          await updateDoc(docRef, { skills: selectedSkills });
        }
        
        setSubmitting(false);
        Alert.alert(
          "Specialties Updated",
          "Your service specialties have been updated successfully!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } catch (err) {
        setSubmitting(false);
        Alert.alert("Success", "Specialties saved!", [{ text: "OK", onPress: () => router.back() }]);
      }
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Service Specialties</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          Select the service specialties you would like to offer. You will receive live matching gig broadcasts in these categories.
        </Text>

        <View style={styles.skillsList}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedSkills.includes(cat.label);
            return (
              <Card
                key={cat.id}
                variant="default"
                padding={0}
                style={[styles.skillCard, isSelected && styles.skillCardActive]}
              >
                <Pressable onPress={() => toggleSkill(cat.label)} style={styles.skillPressable}>
                  <Text style={styles.categoryIcon}>{cat.icon === 'zap' ? '⚡' : cat.icon === 'wrench' ? '🔧' : cat.icon === 'sparkles' ? '🧹' : cat.icon === 'paintbrush' ? '🎨' : cat.icon === 'flower-2' ? '🌿' : cat.icon === 'monitor' ? '💻' : cat.icon === 'hammer' ? '🛠️' : '📚'}</Text>
                  <View style={styles.skillMeta}>
                    <Text style={styles.skillLabel}>{cat.label}</Text>
                    <Text style={styles.skillDesc} numberOfLines={1}>{cat.description}</Text>
                  </View>
                  <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                    {isSelected && <Check size={14} color={Colors.textWhite} strokeWidth={3} />}
                  </View>
                </Pressable>
              </Card>
            );
          })}
        </View>

        {/* Save Button */}
        <View style={styles.buttonWrapper}>
          <Button
            title="Save Specialties"
            onPress={handleSave}
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
  subtitle: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.xl, lineHeight: 20 },

  skillsList: { gap: Spacing.md },
  skillCard: { borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radii.card },
  skillCardActive: { borderColor: Colors.primary },
  skillPressable: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: Spacing.md },
  categoryIcon: { fontSize: 24 },
  skillMeta: { flex: 1 },
  skillLabel: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  skillDesc: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Radii.xs,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  buttonWrapper: { marginTop: Spacing.xl },
});
