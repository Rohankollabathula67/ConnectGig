/**
 * ConnectGig — Post-Job Rating Screen (§7.0, §5.2)
 * Allows clients and workers to rate each other after service completion.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Star, ArrowRight } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii, Shadows } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { firestoreService } from '../services/firestore';

export default function RatingScreen() {
  const { requestId, targetUserId, targetName, role } = useLocalSearchParams<{
    requestId: string;
    targetUserId: string;
    targetName: string;
    role: string;
  }>();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Mock ratings save logic
      await firestoreService.addMockNotification({
        userId: targetUserId || 'mock-worker-uid',
        type: 'feature_announcement',
        title: 'New Rating Received!',
        body: `You received a ${rating}-star review: "${comment || 'No comment'}"`,
      });

      Alert.alert(
        "Feedback Submitted",
        "Thank you for sharing your feedback with the ConnectGiG community!",
        [
          { 
            text: "Done", 
            onPress: () => {
              if (role === 'worker') {
                router.replace('/(worker)/dashboard');
              } else {
                router.replace('/(client)/home');
              }
            } 
          }
        ]
      );
    } catch (error) {
      Alert.alert("Submission Error", "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Share Your Feedback</Text>
        <Text style={styles.subtitle}>
          Your review is anonymous and helps us maintain a premium, safe network of professionals.
        </Text>

        {/* User Card */}
        <Card variant="elevated" style={styles.userCard}>
          <Avatar name={targetName || "Marcus Rivera"} size="xl" />
          <Text style={styles.userName}>{targetName || "Marcus Rivera"}</Text>
          <Text style={styles.userRole}>
            {role === 'worker' ? 'Client' : 'Service Expert'}
          </Text>
        </Card>

        {/* Star Selector */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>HOW WAS THE SERVICE?</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                onPress={() => setRating(star)}
                style={styles.starBtn}
              >
                <Star
                  size={38}
                  fill={star <= rating ? Colors.star : 'transparent'}
                  color={star <= rating ? Colors.star : Colors.textMuted}
                  strokeWidth={2}
                />
              </Pressable>
            ))}
          </View>
          <Text style={styles.ratingCaption}>
            {rating === 5 && "Outstanding — Perfect execution!"}
            {rating === 4 && "Great — Exceeded expectations."}
            {rating === 3 && "Good — Satisfactory service."}
            {rating === 2 && "Decent — Needs minor improvement."}
            {rating === 1 && "Poor — Unsatisfactory experience."}
          </Text>
        </View>

        {/* Comment input */}
        <View style={styles.commentSection}>
          <Text style={styles.commentLabel}>WRITE A REVIEW (OPTIONAL)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us what you liked or what could be improved..."
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={250}
          />
        </View>

        {/* Action Button */}
        <View style={styles.bottomBar}>
          <Button
            title="Submit Review  →"
            onPress={handleSubmit}
            loading={submitting}
            fullWidth
            size="lg"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl },
  title: { ...Typography.title1, color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
  subtitle: { ...Typography.body2, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.xxl, paddingHorizontal: Spacing.md },
  
  // User Card
  userCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.xxl },
  userName: { ...Typography.title3, color: Colors.textPrimary, marginTop: Spacing.md },
  userRole: { ...Typography.caption, color: Colors.textMuted, marginTop: 2, letterSpacing: 0.5, textTransform: 'uppercase' },

  // Stars
  ratingSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  ratingLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.md },
  starRow: { flexDirection: 'row', gap: Spacing.md, marginVertical: Spacing.sm },
  starBtn: { padding: 4 },
  ratingCaption: { ...Typography.caption, color: Colors.textSecondary, marginTop: Spacing.sm, fontWeight: '500' },

  // Comments
  commentSection: { flex: 1 },
  commentLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1, marginBottom: Spacing.sm },
  commentInput: {
    height: 110,
    backgroundColor: Colors.surface,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    color: Colors.textPrimary,
    ...Typography.body2,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    textAlignVertical: 'top',
  },

  // Bottom
  bottomBar: { paddingVertical: Spacing.xl },
});
