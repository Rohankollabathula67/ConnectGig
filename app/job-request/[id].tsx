/**
 * ConnectGig — Incoming Job Request (§3.11)
 * Countdown timer, client info, distance + pay cards, map preview, swipe-to-accept
 */

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { MapPin, Clock, Navigation } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SwipeSlider } from '../../components/ui/SwipeSlider';
import { useAuthStore } from '../../store/authStore';
import { useRequestStore } from '../../store/requestStore';

export default function JobRequestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { acceptRequest, activeRequest, subscribeToActiveRequest, unsubscribeFromActiveRequest } = useRequestStore();

  const workerId = user?.uid || 'mock-worker-uid';
  const workerName = user?.displayName || 'Marcus Rivera';

  const [countdown, setCountdown] = useState(18);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.back();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (id) {
      subscribeToActiveRequest(id, 'worker');
    }
    return () => {
      unsubscribeFromActiveRequest();
    };
  }, [id]);

  const handleAccept = async () => {
    const reqId = id || activeRequest?.requestId || 'mock-request-id';
    try {
      await acceptRequest(reqId, workerId, workerName, 4.9);
      router.replace('/job-tracking');
    } catch (e) {
      Alert.alert("Error", "Could not accept request.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.liveIndicator} />
          <Text style={styles.headerTitle}>NEW REQUEST FOUND</Text>
        </View>
        <View style={styles.timerBadge}>
          <Clock size={12} color={Colors.textWhite} strokeWidth={2.5} />
          <Text style={styles.timerText}>{countdown}s</Text>
        </View>
      </View>

      {/* Client Info */}
      <View style={styles.clientSection}>
        <Avatar name="Sarah Jenkins" size="xl" />
        <Text style={styles.clientName}>Sarah Jenkins</Text>
        <View style={styles.clientRating}>
          <Text style={styles.ratingText}>★ 4.9</Text>
          <Text style={styles.jobsText}>(124 jobs completed)</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>DISTANCE</Text>
          <Text style={styles.statValue}>1.2<Text style={styles.statUnit}>km</Text></Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>ESTIMATED PAY</Text>
          <Text style={styles.statValue}>$ <Text style={styles.statAmount}>45</Text></Text>
        </View>
      </View>

      {/* Job Details */}
      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Text style={styles.jobCategory}>Professional Plumbing</Text>
          <Badge type="paid" />
        </View>
        <Text style={styles.jobDescription}>Leaking faucet repair in kitchen</Text>
        <View style={styles.metaRow}>
          <Clock size={14} color={Colors.textMuted} strokeWidth={2} />
          <Text style={styles.metaText}>30-45 mins</Text>
          <MapPin size={14} color={Colors.textMuted} strokeWidth={2} />
          <Text style={styles.metaText}>Oakley District</Text>
        </View>
      </View>

      {/* Mini Map */}
      <View style={styles.mapPreview}>
        <View style={styles.mapPlaceholder}>
          <MapPin size={24} color={Colors.primary} strokeWidth={2} />
        </View>
      </View>

      {/* Swipe to Accept component */}
      <View style={styles.bottomSection}>
        <SwipeSlider onAccept={handleAccept} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md, paddingBottom: Spacing.lg },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  headerTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary, letterSpacing: 0.5 },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.textPrimary, borderRadius: Radii.full, paddingVertical: 6, paddingHorizontal: 12 },
  timerText: { ...Typography.body2SemiBold, color: Colors.textWhite },

  // Client
  clientSection: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  clientName: { ...Typography.title2, color: Colors.textPrimary },
  clientRating: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingText: { ...Typography.body2SemiBold, color: Colors.star },
  jobsText: { ...Typography.body2, color: Colors.textMuted },

  // Stats
  statsRow: { flexDirection: 'row', gap: Spacing.md, paddingHorizontal: Spacing.screenPadding, marginBottom: Spacing.xxl },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.xl, borderRadius: Radii.card, borderWidth: 1, borderColor: Colors.inputBorder, gap: 8 },
  statLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1 },
  statValue: { ...Typography.statLarge, color: Colors.textPrimary },
  statUnit: { ...Typography.body2Medium, color: Colors.textMuted },
  statAmount: { },

  // Details
  detailsSection: { paddingHorizontal: Spacing.screenPadding, marginBottom: Spacing.xl },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  jobCategory: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  jobDescription: { ...Typography.body2, color: Colors.textSecondary, marginBottom: Spacing.md },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...Typography.caption, color: Colors.textMuted, marginRight: 8 },

  // Map
  mapPreview: { marginHorizontal: Spacing.screenPadding, marginBottom: Spacing.xxl, height: 120, borderRadius: Radii.mapContainer, overflow: 'hidden' },
  mapPlaceholder: { flex: 1, backgroundColor: '#C8E6C9', justifyContent: 'center', alignItems: 'center' },

  // Swipe
  bottomSection: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.xxxl, alignItems: 'center', gap: Spacing.md },
  swipeTrack: { width: '100%', height: 56, backgroundColor: Colors.surface, borderRadius: 28, flexDirection: 'row', alignItems: 'center', paddingLeft: 4 },
  swipeThumb: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', ...Shadows.button },
  swipeText: { ...Typography.overline, color: Colors.textMuted, flex: 1, textAlign: 'center', letterSpacing: 2 },
});
