/**
 * ConnectGig — Worker Dashboard (§3.10)
 * greeting, online toggle status, today's earnings stats,
 * active job card with navigation & messaging, and quick incoming nearby request banners.
 */

import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Star, CheckCircle2, Award, MapPin, Navigation, MessageCircle, TrendingUp, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusDot } from '../../components/ui/StatusDot';
import { formatCurrency } from '../../utils/currency';
import { formatDistance } from '../../utils/distance';
import { useAuthStore } from '../../store/authStore';
import { useRequestStore } from '../../store/requestStore';
import { db, IS_FIREBASE_ENABLED } from '../../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export default function WorkerDashboardScreen() {
  const { user } = useAuthStore();
  const { activeRequest, subscribeToActiveRequest, unsubscribeFromActiveRequest, acceptRequest } = useRequestStore();
  
  const [isOnline, setIsOnline] = useState(true);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [dismissedRequests, setDismissedRequests] = useState<string[]>([]);

  const userName = user?.displayName || 'Alex Rivers';
  const userPhoto = user?.profilePhotoUrl;

  // Sync active request listener on mount
  useEffect(() => {
    if (user?.uid) {
      subscribeToActiveRequest(user.uid, 'worker');
    }
    return () => {
      unsubscribeFromActiveRequest();
    };
  }, [user?.uid]);

  // Sync searching request broadcasts
  useEffect(() => {
    if (IS_FIREBASE_ENABLED) {
      const q = query(
        collection(db, 'serviceRequests'),
        where('status', '==', 'searching')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: any[] = [];
        snapshot.forEach((doc) => {
          list.push({ ...doc.data(), requestId: doc.id });
        });
        setIncomingRequests(list);
      });
      return () => unsubscribe();
    } else {
      // Seed a mock request after 3s in mock mode
      const timer = setTimeout(() => {
        setIncomingRequests([{
          requestId: 'mock-incoming-123',
          category: 'Emergency Pipe Leak',
          description: 'Kitchen sink pipe burst, water spreading.',
          estimatedCost: 650.00,
          clientLocation: { lat: 12.971598, lng: 77.594562, address: 'Indiranagar' },
          distanceMiles: 0.8,
        }]);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNavigate = () => {
    const lat = activeRequest?.clientLocation?.lat || 37.78825;
    const lng = activeRequest?.clientLocation?.lng || -122.4324;
    const label = activeRequest?.category || "Client Location";
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => Alert.alert("Maps Redirect", "Could not launch native map app."));
    }
  };

  const handleMessage = () => {
    const targetId = activeRequest?.requestId || 'conv_1';
    const targetName = activeRequest?.clientId ? 'Client' : 'Sarah Jenkins';
    const recipientUid = activeRequest?.clientId || 'mock-client-uid';
    router.push({
      pathname: '/chat/[id]',
      params: { id: targetId, name: targetName, providerId: recipientUid }
    });
  };

  const handleAcceptJob = async (reqId: string) => {
    try {
      const workerId = user?.uid || 'mock-worker-uid';
      const workerName = user?.displayName || 'Alex Rivers';
      await acceptRequest(reqId, workerId, workerName, 4.9);
      router.replace('/job-tracking');
    } catch (e) {
      Alert.alert("Error", "Could not accept request.");
    }
  };

  const handleDismissRequest = (reqId: string) => {
    setDismissedRequests(prev => [...prev, reqId]);
  };

  // Filter out any dismissed requests
  const visibleRequests = incomingRequests.filter(
    (req) => !dismissedRequests.includes(req.requestId)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar name={userName} uri={userPhoto} size="md" />
            <View>
              <Text style={styles.greeting}>GOOD MORNING,</Text>
              <Text style={styles.userName}>{userName}</Text>
            </View>
          </View>
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineLabel, isOnline && styles.onlineLabelActive]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={setIsOnline}
              trackColor={{ false: Colors.inputBorder, true: Colors.primaryBg }}
              thumbColor={isOnline ? Colors.primary : Colors.textMuted}
            />
          </View>
        </View>

        {/* ── Stat Badges ─────────────────────────────── */}
        <View style={styles.statBadges}>
          <View style={styles.statBadge}>
            <Star size={14} color={Colors.star} fill={Colors.star} />
            <Text style={styles.statBadgeText}>4.9</Text>
          </View>
          <View style={styles.statBadge}>
            <CheckCircle2 size={14} color={Colors.primary} fill={Colors.primaryBg} />
            <Text style={styles.statBadgeText}>124 Jobs</Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: Colors.topProBg }]}>
            <Award size={14} color={Colors.topPro} />
            <Text style={[styles.statBadgeText, { color: Colors.topPro }]}>Top Pro</Text>
          </View>
        </View>

        {/* ── Today's Earnings ────────────────────────── */}
        <View style={styles.section}>
          <LinearGradient
            colors={[Colors.earningsGradientStart, Colors.earningsGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.earningsCard}
          >
            <View style={styles.earningsHeader}>
              <Text style={styles.earningsLabel}>Today&apos;s Earnings</Text>
              <View style={styles.earningsChange}>
                <TrendingUp size={12} color={Colors.successLight} />
                <Text style={styles.earningsChangeText}>12%</Text>
              </View>
            </View>
            <Text style={styles.earningsAmount}>{formatCurrency(1450)}</Text>
            <View style={styles.miniChart}>
              {[30, 50, 35, 65, 45, 70, 55].map((h, i) => (
                <View key={i} style={[styles.miniBar, { height: h, opacity: i === 6 ? 1 : 0.4 }]} />
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* ── Active Job ──────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Job</Text>
            <StatusDot status="online" size={8} />
          </View>

          <Card variant="default">
            <View style={styles.jobRow}>
              <Avatar name={activeRequest ? "Client" : "Sarah Jenkins"} size="md" />
              <View style={styles.jobInfo}>
                <View style={styles.jobTitleRow}>
                  <Text style={styles.jobTitle}>{activeRequest?.category || "Kitchen Sink Repair"}</Text>
                  <Text style={styles.jobRate}>{formatCurrency(activeRequest?.estimatedCost || 380)}</Text>
                </View>
                <View style={styles.jobMeta}>
                  <MapPin size={12} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.jobMetaText}>
                    {activeRequest ? "Active Client Request" : "Sarah Jenkins"}
                  </Text>
                </View>
                <View style={styles.jobMeta}>
                  <Navigation size={12} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.jobMetaText}>
                    {formatDistance(2.4, 'mi')} away · Downtown
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.jobActions}>
              <Pressable onPress={handleNavigate} style={styles.jobActionBtn}>
                <Navigation size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.jobActionText}>Navigate</Text>
              </Pressable>
              <Pressable onPress={handleMessage} style={styles.jobActionBtn}>
                <MessageCircle size={16} color={Colors.primary} strokeWidth={2} />
                <Text style={styles.jobActionText}>Message</Text>
              </Pressable>
            </View>
          </Card>
        </View>

        {/* ── New Request Banner ──────────────────────── */}
        {visibleRequests.length > 0 && (
          <View style={styles.section}>
            <Card variant="outlined" style={styles.requestBanner}>
              <View style={styles.requestHeader}>
                <Badge type="aiMatch" />
                <Text style={styles.requestNearby}>New Request Nearby!</Text>
                <Text style={styles.requestTimer}>Accept in 24s</Text>
              </View>
              <View style={styles.requestBody}>
                <Avatar name={visibleRequests[0].category[0]} size="md" />
                <View style={styles.requestInfo}>
                  <Text style={styles.requestTitle}>{visibleRequests[0].category}</Text>
                  <Text style={styles.requestMeta}>
                    {formatDistance(visibleRequests[0].distanceMiles || 0.8, 'mi')} away · {formatCurrency(visibleRequests[0].estimatedCost)} Est
                  </Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <Pressable onPress={() => handleDismissRequest(visibleRequests[0].requestId)} style={styles.dismissBtn}>
                  <X size={20} color={Colors.textMuted} strokeWidth={2} />
                </Pressable>
                <Button
                  title="Accept Job"
                  onPress={() => handleAcceptJob(visibleRequests[0].requestId)}
                  size="md"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.md, backgroundColor: Colors.background },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  greeting: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1 },
  userName: { ...Typography.title2, color: Colors.textPrimary },
  onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  onlineLabel: { ...Typography.overline, color: Colors.textMuted },
  onlineLabelActive: { color: Colors.primary },

  // Stat Badges
  statBadges: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.xl, backgroundColor: Colors.background },
  statBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radii.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.divider },
  statBadgeText: { ...Typography.caption, color: Colors.textPrimary, fontWeight: '600' },

  // Section
  section: { paddingHorizontal: Spacing.screenPadding, marginTop: Spacing.xl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  sectionTitle: { ...Typography.title3, color: Colors.textPrimary },

  // Earnings Card
  earningsCard: { borderRadius: Radii.xl, padding: Spacing.xl, overflow: 'hidden' },
  earningsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  earningsLabel: { ...Typography.body2, color: 'rgba(255,255,255,0.7)' },
  earningsChange: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radii.full, paddingVertical: 4, paddingHorizontal: 10 },
  earningsChangeText: { ...Typography.micro, color: Colors.successLight },
  earningsAmount: { ...Typography.statHero, color: Colors.textWhite, marginBottom: Spacing.md },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 70 },
  miniBar: { flex: 1, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 4 },

  // Active Job
  jobRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  jobInfo: { flex: 1, gap: 4 },
  jobTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  jobTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  jobRate: { ...Typography.body2SemiBold, color: Colors.primary },
  jobMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  jobMetaText: { ...Typography.caption, color: Colors.textMuted },
  jobActions: { flexDirection: 'row', gap: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: Spacing.md },
  jobActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, backgroundColor: Colors.primaryBg, borderRadius: Radii.button },
  jobActionText: { ...Typography.body2SemiBold, color: Colors.primary },

  // Request Banner
  requestBanner: { borderColor: Colors.primary, borderWidth: 1.5 },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.md },
  requestNearby: { ...Typography.body2SemiBold, color: Colors.textPrimary, flex: 1 },
  requestTimer: { ...Typography.caption, color: Colors.error, fontWeight: '700' },
  requestBody: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  requestInfo: { flex: 1, gap: 4 },
  requestTitle: { ...Typography.body2SemiBold, color: Colors.primary },
  requestMeta: { ...Typography.caption, color: Colors.textMuted },
  requestActions: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  dismissBtn: { width: 44, height: 44, borderRadius: Radii.button, borderWidth: 1, borderColor: Colors.inputBorder, justifyContent: 'center', alignItems: 'center' },
});
