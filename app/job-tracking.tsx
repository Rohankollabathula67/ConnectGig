/**
 * ConnectGig — Live Job Tracking Screen (§3.8, §2.1)
 * Integrates CustomMapView showing real-time GPS user position,
 * worker position, and the routing polyline connecting them.
 */

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, Alert, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { ChevronLeft, Phone, MessageCircle, Languages, HelpCircle, Clock } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing, Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Avatar } from '../components/ui/Avatar';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import CustomMapView from '../components/MapView';
import { useLocation } from '../hooks/useLocation';
import { useAuthStore } from '../store/authStore';
import { useRequestStore } from '../store/requestStore';
import { useLocationStore } from '../store/locationStore';

export default function JobTrackingScreen() {
  const { location } = useLocation();
  const user = useAuthStore((state) => state.user);
  const { 
    activeRequest, 
    subscribeToActiveRequest, 
    unsubscribeFromActiveRequest, 
    completeRequest 
  } = useRequestStore();
  const { 
    userLocation, 
    setUserLocation, 
    workerLocation, 
    startSimulatedTracking, 
    stopTracking 
  } = useLocationStore();

  const clientId = user?.uid || 'mock-client-uid';

  const providerName = activeRequest?.acceptedProviderId ? 'Marcus Rivera' : 'Marcus J.';
  const providerRating = 4.9;
  const estimatedArrivalMins = 8;


  useEffect(() => {
    if (location) {
      setUserLocation(location);
    }
  }, [location]);

  useEffect(() => {
    subscribeToActiveRequest(clientId, 'client');
    return () => {
      unsubscribeFromActiveRequest();
      stopTracking();
    };
  }, []);

  useEffect(() => {
    if (activeRequest?.status === 'accepted' && location) {
      // Start moving the worker pin closer to client's GPS coordinate
      const startCoords = {
        latitude: location.latitude + 0.005,
        longitude: location.longitude + 0.004,
      };
      const stopSim = startSimulatedTracking(startCoords);
      return () => stopSim();
    }
  }, [activeRequest?.status, location]);

  const handleSimulateComplete = () => {
    if (activeRequest) {
      Alert.alert(
        "Job Completion",
        "Would you like to simulate completing this service request?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Complete Job", 
            onPress: async () => {
              await completeRequest(activeRequest.requestId);
              router.replace({
                pathname: '/rating',
                params: {
                  requestId: activeRequest.requestId,
                  targetUserId: activeRequest.acceptedProviderId || 'mock-worker-uid',
                  targetName: providerName,
                  role: 'client'
                }
              });
            } 
          }
        ]
      );
    }
  };


  return (
    <View style={styles.container}>
      {/* Top bar */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => safeGoBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.jobStatusLabel}>JOB STATUS</Text>
          </View>
          <Pressable onPress={() => router.push('/help-support')}>
            <HelpCircle size={22} color={Colors.textMuted} strokeWidth={2} />
          </Pressable>
        </View>

        {/* ETA Banner */}
        <Pressable onPress={handleSimulateComplete} style={styles.etaBanner}>
          <Clock size={14} color={Colors.textWhite} strokeWidth={2} />
          <Text style={styles.etaText}>
            {activeRequest?.status === 'accepted' 
              ? `Arriving in ${estimatedArrivalMins} mins (Tap to Complete)`
              : 'Tap to Complete Job'}
          </Text>
        </Pressable>
      </SafeAreaView>

      {/* Real-time Map with Polyline Route */}
      <View style={styles.mapArea}>
        <CustomMapView
          origin={userLocation || undefined}
          destination={workerLocation || undefined}
          showRoute={true}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Worker Card */}
      <View style={styles.bottomSection}>
        <Card variant="elevated" padding="xl">
          <View style={styles.workerRow}>
            <Avatar name={providerName} size="lg" />
            <View style={styles.workerInfo}>
              <Text style={styles.workerName}>{providerName}</Text>
              <View style={styles.workerMeta}>
                <Badge type="verified" label="Certified Electrician" />
              </View>
              <Text style={styles.vehicleInfo}>White E-Scooter</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>★ {providerRating}</Text>
                <Text style={styles.jobsCount}>(148 jobs)</Text>
              </View>
            </View>
          </View>

          {activeRequest?.problemImageUrl && (
            <View style={styles.problemPreviewRow}>
              <Text style={styles.problemPreviewLabel}>Attached Issue Photo:</Text>
              <Image source={{ uri: activeRequest.problemImageUrl }} style={styles.problemPreviewThumb} />
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => Linking.openURL('tel:+919876543210').catch(() => Alert.alert('Call', 'Unable to initiate call.'))}
            >
              <Phone size={18} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.actionText}>Call</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: {
                    id: activeRequest?.requestId || 'mock-request-id',
                    name: providerName,
                    providerId: activeRequest?.acceptedProviderId || 'mock-worker-uid',
                  },
                })
              }
            >
              <MessageCircle size={18} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.actionText}>Message</Text>
            </Pressable>
          </View>

          {/* AI Translation */}
          <View style={styles.translationRow}>
            <Languages size={16} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.translationText}>AI LIVE TRANSLATION ACTIVE</Text>
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  problemPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  problemPreviewLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  problemPreviewThumb: {
    width: 50,
    height: 50,
    borderRadius: Radii.sm,
    resizeMode: 'cover',
    backgroundColor: Colors.inputBg,
  },
  topBar: { backgroundColor: Colors.background, zIndex: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.sm },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  jobStatusLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1.5 },
  etaBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.success, paddingVertical: 10, marginHorizontal: Spacing.screenPadding, borderRadius: Radii.sm, marginBottom: Spacing.md },
  etaText: { ...Typography.body2SemiBold, color: Colors.textWhite },
  mapArea: { flex: 1 },
  bottomSection: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.xxxl },
  workerRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  workerInfo: { flex: 1, gap: 4 },
  workerName: { ...Typography.title3, color: Colors.textPrimary },
  workerMeta: { flexDirection: 'row' },
  vehicleInfo: { ...Typography.caption, color: Colors.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...Typography.caption, color: Colors.star, fontWeight: '700' },
  jobsCount: { ...Typography.caption, color: Colors.textMuted },
  actionRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: Radii.button, borderWidth: 1, borderColor: Colors.inputBorder },
  actionText: { ...Typography.body2SemiBold, color: Colors.primary },
  translationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, backgroundColor: Colors.primaryBg10, borderRadius: Radii.button },
  translationText: { ...Typography.overline, color: Colors.primary, letterSpacing: 1 },
});
