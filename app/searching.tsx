import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { Star, ThumbsUp, ThumbsDown, Clock, Shield } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Badge } from '../components/ui/Badge';
import { RadialAnimation } from '../components/RadialAnimation';
import { useAuthStore } from '../store/authStore';
import { useRequestStore } from '../store/requestStore';

export default function SearchingScreen() {
  const [radius, setRadius] = useState(2);
  const [providerCount, setProviderCount] = useState(14);
  
  const user = useAuthStore((state) => state.user);
  const { 
    activeRequest, 
    subscribeToActiveRequest, 
    unsubscribeFromActiveRequest, 
    cancelRequest 
  } = useRequestStore();

  const clientId = user?.uid || 'mock-client-uid';

  useEffect(() => {
    // Subscribe to active booking requests
    subscribeToActiveRequest(clientId, 'client');

    // Simulate radius expansion
    const timer = setTimeout(() => setRadius(6), 5000);
    return () => {
      clearTimeout(timer);
      unsubscribeFromActiveRequest();
    };
  }, []);

  useEffect(() => {
    // When a worker accepts the job, navigate to live tracking screen
    if (activeRequest?.status === 'accepted') {
      router.replace('/job-tracking');
    }
  }, [activeRequest]);


  return (
    <View style={styles.container}>
      {/* Header with feedback icons */}
      <View style={styles.header}>
        <Badge type="aiMatch" label="AI MATCHMAKING" />
        <View style={styles.feedbackIcons}>
          <Star size={20} color={Colors.textMuted} strokeWidth={2} />
          <ThumbsUp size={20} color={Colors.textMuted} strokeWidth={2} />
          <ThumbsDown size={20} color={Colors.textMuted} strokeWidth={2} />
        </View>
      </View>

      {/* Radial Animation */}
      <View style={styles.animationContainer}>
        <RadialAnimation />
      </View>

      {/* Status text */}
      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>Looking for nearby workers...</Text>
        <Text style={styles.statusSubtitle}>
          Scanning a {radius}km radius around your location for the best AI-verified pros.
        </Text>

        {/* Info chips */}
        <View style={styles.infoChips}>
          <View style={styles.infoChip}>
            <Clock size={14} color={Colors.textMuted} strokeWidth={2} />
            <Text style={styles.infoChipText}>Avg. 4 min wait</Text>
          </View>
          <View style={styles.infoChip}>
            <Shield size={14} color={Colors.textMuted} strokeWidth={2} />
            <Text style={styles.infoChipText}>Top Rated Only</Text>
          </View>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.analyzingRow}>
          <View style={styles.loadingDots}>
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <Text style={styles.analyzingText}>
            ConnectGiG AI is analyzing {providerCount} available providers...
          </Text>
        </View>

        <Pressable
          onPress={async () => {
            if (activeRequest?.requestId) {
              await cancelRequest(activeRequest.requestId);
            }
            safeGoBack();
          }}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Cancel Search</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: Spacing.screenPadding, paddingTop: 60, paddingBottom: Spacing.lg },
  feedbackIcons: { flexDirection: 'row', gap: Spacing.lg },

  // Animation
  animationContainer: { width: 280, height: 280, justifyContent: 'center', alignItems: 'center', marginVertical: Spacing.xxxl },
  circle: { position: 'absolute', borderWidth: 1.5, borderRadius: 999 },
  circleOuter: { width: 280, height: 280, borderColor: Colors.primaryBg20 },
  circleMiddle: { width: 200, height: 200, borderColor: 'rgba(59,111,244,0.25)' },
  circleInner: { width: 120, height: 120, borderColor: 'rgba(59,111,244,0.35)', borderWidth: 2 },
  centerPin: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryBg, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.primary },
  pinDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  orbitAvatar: { position: 'absolute' },

  // Status
  statusSection: { alignItems: 'center', paddingHorizontal: Spacing.xxxl, gap: Spacing.md },
  statusTitle: { ...Typography.title2, color: Colors.textPrimary, textAlign: 'center' },
  statusSubtitle: { ...Typography.body2, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  infoChips: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md },
  infoChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 14, borderRadius: Radii.full, backgroundColor: Colors.surface },
  infoChipText: { ...Typography.caption, color: Colors.textMuted },

  // Bottom
  bottom: { position: 'absolute', bottom: 40, alignItems: 'center', gap: Spacing.xxl, width: '100%', paddingHorizontal: Spacing.screenPadding },
  analyzingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.surface, paddingVertical: 12, paddingHorizontal: 20, borderRadius: Radii.full },
  loadingDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.textMuted },
  analyzingText: { ...Typography.caption, color: Colors.textMuted },
  cancelButton: { paddingVertical: 12, paddingHorizontal: 24 },
  cancelText: { ...Typography.body2SemiBold, color: Colors.textSecondary },
});
