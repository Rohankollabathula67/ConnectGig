/**
 * ConnectGig — My Reviews Screen
 * Displays list of reviews and feedback given or received by the user.
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Star } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';

const REVIEWS = [
  { id: '1', name: 'Marcus Rivera', role: 'Electrician', rating: 5, date: 'Oct 24, 2025', comment: 'Excellent client! Explained the AC setup requirements clearly and processed payments instantly.' },
  { id: '2', name: 'David Chen', role: 'Plumber', rating: 4, date: 'Oct 22, 2025', comment: 'Very pleasant interaction. The leakage issue description was spot-on.' },
  { id: '3', name: 'Sarah Jenkins', role: 'Cleaner', rating: 5, date: 'Oct 19, 2025', comment: 'Prompt responses, helpful guidance on location directions, and generous feedback tip.' },
];

export default function MyReviewsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>My Reviews</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Rating Summary Card */}
        <Card variant="elevated" style={styles.summaryCard} padding="xl">
          <Text style={styles.summaryScore}>4.9</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={18} color={Colors.star} fill={Colors.star} />
            ))}
          </View>
          <Text style={styles.summaryCaption}>Average rating across 14 job feedbacks</Text>
        </Card>

        {/* Reviews List */}
        <Text style={styles.listTitle}>Recent Reviews</Text>
        <View style={styles.reviewsList}>
          {REVIEWS.map((r) => (
            <Card key={r.id} variant="default" style={styles.reviewCard} padding="lg">
              <View style={styles.reviewHeader}>
                <Avatar name={r.name} size="sm" />
                <View style={styles.reviewMeta}>
                  <Text style={styles.reviewName}>{r.name}</Text>
                  <Text style={styles.reviewRole}>{r.role}</Text>
                </View>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>★ {r.rating.toFixed(1)}</Text>
                </View>
              </View>
              <Text style={styles.reviewDate}>{r.date}</Text>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </Card>
          ))}
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
  
  summaryCard: { alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.xl },
  summaryScore: { ...Typography.title1, fontSize: 44, color: Colors.textPrimary },
  starsRow: { flexDirection: 'row', gap: 4, marginVertical: Spacing.xs },
  summaryCaption: { ...Typography.caption, color: Colors.textMuted },

  listTitle: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 0.5, marginBottom: Spacing.sm },
  reviewsList: { gap: Spacing.md },
  reviewCard: { gap: Spacing.sm },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  reviewMeta: { flex: 1 },
  reviewName: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  reviewRole: { ...Typography.micro, color: Colors.textMuted },
  ratingBadge: { backgroundColor: Colors.primaryBg, paddingVertical: 4, paddingHorizontal: 8, borderRadius: Radii.sm },
  ratingText: { ...Typography.caption, color: Colors.primary, fontWeight: '700' },
  reviewDate: { ...Typography.micro, color: Colors.textMuted },
  reviewComment: { ...Typography.body2, color: Colors.textSecondary, lineHeight: 18 },
});
