/**
 * ConnectGig — Service Request Form (§3.5)
 * Description, date chips, time selector, budget tiers, estimated cost, confirm button
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Check, Edit3, Info } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../store/authStore';
import { useRequestStore } from '../store/requestStore';
import { useLocationStore } from '../store/locationStore';


const DATES = [
  { day: 'MON', date: '12' },
  { day: 'TUE', date: '13' },
  { day: 'WED', date: '14' },
  { day: 'THU', date: '15' },
  { day: 'FRI', date: '16' },
];

const TIMES = ['Morning', 'Afternoon', 'Evening'];

const BUDGETS = [
  { id: 'standard', label: 'STANDARD', price: 45, recommended: true },
  { id: 'quick_fix', label: 'QUICK FIX', price: 30 },
  { id: 'premium', label: 'PREMIUM', price: 60 },
  { id: 'custom', label: 'Custom', price: 0, isCustom: true },
];

export default function ServiceRequestScreen() {
  const [description, setDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [selectedBudget, setSelectedBudget] = useState('standard');

  const { user } = useAuthStore();
  const { createRequest, loading } = useRequestStore();
  const { userLocation } = useLocationStore();

  const activeBudget = BUDGETS.find((b) => b.id === selectedBudget);

  const handleConfirm = async () => {
    if (!description) {
      Alert.alert("Required Field", "Please describe what you need help with.");
      return;
    }
    const finalBudget = activeBudget?.price || 45;
    const clientId = user?.uid || 'mock-client-uid';
    const clientName = user?.displayName || 'Alex Johnson';
    const loc = userLocation || { latitude: 37.78825, longitude: -122.4324 };
    
    try {
      await createRequest(
        clientId,
        clientName,
        'Plumber',
        description,
        finalBudget,
        loc
      );
      router.push('/searching');
    } catch (err) {
      console.warn("Error creating request", err);
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Book Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Service Description */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.sectionLabel}>Service Description</Text>
            <Text style={styles.required}>Required</Text>
          </View>
          <TextInput
            style={styles.textArea}
            placeholder="Describe what you need help with (e.g., Leaking faucet in the kitchen needs repair)..."
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* When */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>When should we arrive?</Text>
          {/* Date chips */}
          <View style={styles.dateRow}>
            {DATES.map((d, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedDate(i)}
                style={[styles.dateChip, i === selectedDate && styles.dateChipActive]}
              >
                <Text style={[styles.dateDay, i === selectedDate && styles.dateDayActive]}>{d.day}</Text>
                <Text style={[styles.dateNum, i === selectedDate && styles.dateNumActive]}>{d.date}</Text>
              </Pressable>
            ))}
          </View>
          {/* Time segments */}
          <View style={styles.timeRow}>
            {TIMES.map((t, i) => (
              <Pressable
                key={i}
                onPress={() => setSelectedTime(i)}
                style={[styles.timeChip, i === selectedTime && styles.timeChipActive]}
              >
                <Text style={[styles.timeText, i === selectedTime && styles.timeTextActive]}>{t}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Budget */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Set your budget</Text>
          <View style={styles.budgetGrid}>
            {BUDGETS.map((b) => (
              <Pressable
                key={b.id}
                onPress={() => setSelectedBudget(b.id)}
                style={[styles.budgetCard, selectedBudget === b.id && styles.budgetCardActive]}
              >
                {b.isCustom ? (
                  <>
                    <Edit3 size={20} color={selectedBudget === b.id ? Colors.primary : Colors.textMuted} strokeWidth={2} />
                    <Text style={[styles.budgetLabel, selectedBudget === b.id && styles.budgetLabelActive]}>{b.label}</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.budgetLabel, selectedBudget === b.id && styles.budgetLabelActive]}>{b.label}</Text>
                    {selectedBudget === b.id && b.recommended && (
                      <Check size={14} color={Colors.primary} strokeWidth={3} />
                    )}
                    <Text style={[styles.budgetPrice, selectedBudget === b.id && styles.budgetPriceActive]}>${b.price}</Text>
                  </>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Pro Tip */}
        <View style={styles.tipBanner}>
          <Info size={16} color={Colors.primary} strokeWidth={2} />
          <Text style={styles.tipText}>
            Pro-tip: Clear descriptions help experts provide better quotes. We'll match you with available pros in your area immediately.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom: Cost + Confirm */}
      <View style={styles.bottomBar}>
        <View style={styles.costRow}>
          <View>
            <Text style={styles.costLabel}>ESTIMATED COST</Text>
            <Text style={styles.costAmount}>${activeBudget?.price || 0}.00</Text>
          </View>
          <View style={styles.costRight}>
            <Text style={styles.feeLabel}>PROCESSING FEE</Text>
            <Text style={styles.feeText}>Included</Text>
          </View>
        </View>
        <Button
          title="Confirm Request  →"
          onPress={handleConfirm}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { ...Typography.title3, color: Colors.textPrimary },
  scrollContent: { paddingHorizontal: Spacing.screenPadding, paddingBottom: 20 },
  section: { marginBottom: Spacing.xxl },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm },
  sectionLabel: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  required: { ...Typography.caption, color: Colors.primary },
  sectionTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary, marginBottom: Spacing.lg },
  textArea: { borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radii.input, padding: Spacing.lg, minHeight: 120, ...Typography.body2, color: Colors.textPrimary, backgroundColor: Colors.inputBg },

  // Dates
  dateRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  dateChip: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, borderRadius: Radii.button, borderWidth: 1, borderColor: Colors.inputBorder, backgroundColor: Colors.background, gap: 4 },
  dateChipActive: { backgroundColor: Colors.dateChipActive, borderColor: Colors.dateChipActive },
  dateDay: { ...Typography.micro, color: Colors.textMuted },
  dateDayActive: { color: Colors.textWhite },
  dateNum: { ...Typography.title3, color: Colors.textPrimary },
  dateNumActive: { color: Colors.textWhite },

  // Time
  timeRow: { flexDirection: 'row', gap: Spacing.sm },
  timeChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radii.chip, borderWidth: 1, borderColor: Colors.inputBorder },
  timeChipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  timeText: { ...Typography.body2Medium, color: Colors.textSecondary },
  timeTextActive: { color: Colors.primary },

  // Budget
  budgetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  budgetCard: { width: '47%', paddingVertical: Spacing.xl, paddingHorizontal: Spacing.lg, borderRadius: Radii.card, borderWidth: 1, borderColor: Colors.inputBorder, alignItems: 'center', gap: 4, backgroundColor: Colors.background },
  budgetCardActive: { borderColor: Colors.primary, borderWidth: 2, backgroundColor: Colors.primaryBg10 },
  budgetLabel: { ...Typography.overline, color: Colors.textMuted },
  budgetLabelActive: { color: Colors.primary },
  budgetPrice: { ...Typography.title2, color: Colors.textPrimary },
  budgetPriceActive: { color: Colors.primary },

  // Tip
  tipBanner: { flexDirection: 'row', gap: Spacing.md, backgroundColor: Colors.primaryBg10, borderRadius: Radii.card, padding: Spacing.lg, marginBottom: Spacing.xl },
  tipText: { ...Typography.body2, color: Colors.textSecondary, flex: 1, lineHeight: 20 },

  // Bottom
  bottomBar: { paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.background },
  costRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.lg },
  costLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1 },
  costAmount: { ...Typography.title1, color: Colors.textPrimary },
  costRight: { alignItems: 'flex-end' },
  feeLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1 },
  feeText: { ...Typography.body2Medium, color: Colors.textSecondary },
});
