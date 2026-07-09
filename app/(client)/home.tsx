/**
 * ConnectGig — Client Home Dashboard (§3.4)
 * Greeting + bell, search bar, quick-filter chips, services grid,
 * "Workers near you" map preview, "AI Recommended" worker list
 */

import { router } from 'expo-router';
import { Bell, Info } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GigCard } from '../../components/GigCard';
import CustomMapView from '../../components/MapView';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { SearchBar } from '../../components/ui/SearchBar';
import { WorkerCard } from '../../components/WorkerCard';
import { CATEGORIES, QUICK_FILTERS } from '../../constants/categories';
import { Colors } from '../../constants/colors';
import { Radii, Shadows, Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { useLocation } from '../../hooks/useLocation';
import { useAuthStore } from '../../store/authStore';
import { useRequestStore } from '../../store/requestStore';



const { width } = Dimensions.get('window');

// Mock data for AI recommended workers
const MOCK_WORKERS = [
  {
    name: 'Marcus Rivera',
    subtitle: 'Expert Electrician',
    rating: 4.9,
    distance: '0.8 mi',
    hourlyRate: 45,
    isVerified: true,
    isOnline: true,
  },
  {
    name: 'Sarah Jenkins',
    subtitle: 'Professional Cleaner',
    rating: 5.0,
    distance: '1.2 mi',
    hourlyRate: 30,
    isTopPro: true,
    isOnline: true,
  },
  {
    name: 'David Chen',
    subtitle: 'Master Plumber',
    rating: 4.8,
    distance: '2.5 mi',
    hourlyRate: 55,
    isVerified: true,
    isOnline: false,
  },
];

export default function ClientHomeScreen() {
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();
  const { location } = useLocation();
  const { user } = useAuthStore();
  const { activeRequest, subscribeToActiveRequest, unsubscribeFromActiveRequest } = useRequestStore();

  const clientId = user?.uid || 'mock-client-uid';

  useEffect(() => {
    subscribeToActiveRequest(clientId, 'client');
    return () => {
      unsubscribeFromActiveRequest();
    };
  }, []);

  const chipItems = QUICK_FILTERS.map((f) => ({ id: f, label: f }));

  const nearbyMarkers = location
    ? [
      { id: '1', latitude: location.latitude + 0.003, longitude: location.longitude + 0.002, title: 'Marcus Rivera', initials: 'MR', online: true },
      { id: '2', latitude: location.latitude - 0.004, longitude: location.longitude - 0.003, title: 'Sarah Jenkins', initials: 'SJ', online: true },
      { id: '3', latitude: location.latitude + 0.001, longitude: location.longitude - 0.005, title: 'David Chen', initials: 'DC', online: false },
    ]
    : [];


  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ── Header ──────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.userName}>Kollabathula Rohan</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications')}
            style={styles.bellButton}
          >
            <Bell size={22} color={Colors.primary} strokeWidth={2} />
          </Pressable>
        </View>

        {/* ── Search Bar ──────────────────────────────── */}
        <View style={styles.searchSection}>
          <SearchBar editable={false} onFocus={() => { }} />
        </View>

        {/* ── Quick Filters ───────────────────────────── */}
        <View style={styles.chipsSection}>
          <ChipGroup
            items={chipItems}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </View>

        {/* ── Services Grid ───────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <Pressable>
              <Text style={styles.viewAll}>View All</Text>
            </Pressable>
          </View>

          <View style={styles.servicesGrid}>
            {CATEGORIES.map((cat) => (
              <View key={cat.id} style={styles.serviceItem}>
                <GigCard
                  label={cat.label}
                  icon={cat.icon}
                  color={cat.color}
                  onPress={() => router.push('/service-request')}
                />
              </View>
            ))}
          </View>
        </View>

        {/* ── Workers Near You ────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Workers near you</Text>
            <Badge type="online" label="12 Active Now" />
          </View>

          <Card variant="elevated" style={styles.mapCard} padding={0}>
            <Pressable onPress={() => router.push('/map' as any)}>
              <View style={styles.mapContainer}>
                <CustomMapView
                  markers={nearbyMarkers}
                  origin={location || undefined}
                  interactive={false}
                />
              </View>
              <View style={styles.viewMapButton}>
                <Text style={styles.viewMapText}>View Full Map</Text>
              </View>
            </Pressable>
          </Card>
        </View>

        {/* ── AI Recommended ──────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.aiHeader}>
              <Text style={styles.sectionTitle}>AI Recommended</Text>
              <Info size={16} color={Colors.textMuted} strokeWidth={2} />
            </View>
          </View>

          <View style={styles.workersList}>
            {MOCK_WORKERS.map((worker, index) => (
              <WorkerCard
                key={index}
                {...worker}
                onPress={() => { }}
              />
            ))}
          </View>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {activeRequest && (
        <Pressable
          onPress={() => {
            if (activeRequest.status === 'searching') {
              router.push('/searching');
            } else if (['accepted', 'in_progress', 'arrived'].includes(activeRequest.status)) {
              router.push('/job-tracking');
            }
          }}
          style={styles.floatingActiveBanner}
        >
          <View style={styles.bannerRow}>
            <View style={styles.statusDotWrapper}>
              <View style={styles.pulsingDot} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Active Request: {activeRequest.category}</Text>
              <Text style={styles.bannerSubtitle}>
                {activeRequest.status === 'searching' ? 'AI Search Active...' : 'Provider En Route'}
              </Text>
            </View>
            <Text style={styles.bannerAction}>TRACK  →</Text>
          </View>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  greeting: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.title2,
    color: Colors.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchSection: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: Spacing.lg,
    backgroundColor: Colors.background,
  },

  // Chips
  chipsSection: {
    paddingLeft: Spacing.screenPadding,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.background,
    borderBottomLeftRadius: Radii.xxl,
    borderBottomRightRadius: Radii.xxl,
  },

  // Section
  section: {
    marginTop: Spacing.xxl,
    paddingHorizontal: Spacing.screenPadding,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.textPrimary,
  },
  viewAll: {
    ...Typography.body2SemiBold,
    color: Colors.primary,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  // Services Grid
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  serviceItem: {
    width: (width - Spacing.screenPadding * 2) / 4,
    alignItems: 'center',
  },

  // Map Card
  mapCard: {
    overflow: 'hidden',
  },
  mapContainer: {
    height: 150,
    borderRadius: Radii.mapContainer,
    overflow: 'hidden',
  },
  viewMapButton: {
    alignSelf: 'center',
    marginTop: Spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: Radii.full,
    backgroundColor: Colors.surface,
  },
  viewMapText: {
    ...Typography.body2SemiBold,
    color: Colors.textSecondary,
  },

  // Workers List
  workersList: {
    gap: Spacing.md,
  },
  floatingActiveBanner: {
    position: 'absolute',
    bottom: Spacing.xxl,
    left: Spacing.screenPadding,
    right: Spacing.screenPadding,
    backgroundColor: Colors.primary,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    ...Shadows.floating,
    zIndex: 100,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  statusDotWrapper: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textWhite,
  },
  bannerTitle: {
    ...Typography.body2SemiBold,
    color: Colors.textWhite,
  },
  bannerSubtitle: {
    ...Typography.micro,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  bannerAction: {
    ...Typography.body2SemiBold,
    color: Colors.textWhite,
    fontWeight: '700',
  },
});
