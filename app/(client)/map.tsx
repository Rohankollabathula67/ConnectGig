/**
 * ConnectGig — Nearby Workers Map (§3.7, §2.1)
 * Real maps integration with custom styles, real-time GPS location,
 * category filters, interactive markers, and bottom sheet profile card.
 */

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MapPin, SlidersHorizontal, Clock, Award, Navigation } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { ChipGroup } from '../../components/ui/ChipGroup';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import CustomMapView, { MapMarker } from '../../components/MapView';
import { useLocation } from '../../hooks/useLocation';

const FILTERS = [
  { id: 'all', label: 'All Workers' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'repair', label: 'Repair' },
  { id: 'plumbing', label: 'Plumbing' },
];

interface WorkerDetail {
  id: string;
  name: string;
  latitudeOffset: number;
  longitudeOffset: number;
  initials: string;
  rate: number;
  rating: number;
  jobs: number;
  category: string;
  experience: string;
  distance: string;
  online: boolean;
}

const MOCK_MAP_WORKERS: WorkerDetail[] = [
  {
    id: '1',
    name: 'Elena Rodriguez',
    latitudeOffset: 0.003,
    longitudeOffset: 0.002,
    initials: 'ER',
    rate: 35,
    rating: 4.9,
    jobs: 124,
    category: 'cleaning',
    experience: '5+ Years',
    distance: '0.8 miles',
    online: true,
  },
  {
    id: '2',
    name: 'Marcus Rivera',
    latitudeOffset: -0.004,
    longitudeOffset: -0.003,
    initials: 'MR',
    rate: 45,
    rating: 4.8,
    jobs: 89,
    category: 'repair',
    experience: '3 Years',
    distance: '1.2 miles',
    online: true,
  },
  {
    id: '3',
    name: 'Sarah Jenkins',
    latitudeOffset: 0.002,
    longitudeOffset: -0.005,
    initials: 'SJ',
    rate: 30,
    rating: 5.0,
    jobs: 148,
    category: 'plumbing',
    experience: '8+ Years',
    distance: '0.6 miles',
    online: false,
  },
];

export default function NearbyMapScreen() {
  const [activeFilter, setActiveFilter] = useState('all');
  const { location } = useLocation();
  const [selectedWorker, setSelectedWorker] = useState<WorkerDetail>(MOCK_MAP_WORKERS[0]);

  // Compute absolute coordinates based on user GPS location
  const baseLat = location?.latitude ?? 37.78825;
  const baseLng = location?.longitude ?? -122.4324;

  const workers = MOCK_MAP_WORKERS.map((w) => ({
    ...w,
    latitude: baseLat + w.latitudeOffset,
    longitude: baseLng + w.longitudeOffset,
  }));

  // Filter markers based on chip group
  const filteredWorkers = workers.filter(
    (w) => activeFilter === 'all' || w.category === activeFilter
  );

  // Map to MapMarker prop structure
  const mapMarkers: MapMarker[] = filteredWorkers.map((w) => ({
    id: w.id,
    latitude: w.latitude,
    longitude: w.longitude,
    title: w.name,
    initials: w.initials,
    online: w.online,
  }));

  const handleMarkerPress = (marker: MapMarker) => {
    const worker = workers.find((w) => w.id === marker.id);
    if (worker) {
      setSelectedWorker(worker);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top location bar & category filter chips */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <View style={styles.locationRow}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>YOUR LOCATION</Text>
            <View style={styles.locationValue}>
              <MapPin size={14} color={Colors.primary} strokeWidth={2} />
              <Text style={styles.locationText}>
                {location ? 'Downtown, GPS Active' : 'Downtown, SF (Mock)'}
              </Text>
            </View>
          </View>
          <Pressable style={styles.filterButton}>
            <SlidersHorizontal size={20} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
        </View>

        <ChipGroup
          items={FILTERS}
          selectedId={activeFilter}
          onSelect={setActiveFilter}
        />
      </SafeAreaView>

      {/* Styled Interactive Map */}
      <View style={styles.mapArea}>
        <CustomMapView
          markers={mapMarkers}
          origin={location || undefined}
          onMarkerPress={handleMarkerPress}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      {/* Selected Worker bottom detail sheet */}
      <View style={styles.bottomCard}>
        <Card variant="elevated" padding="xl">
          <View style={styles.workerRow}>
            <Avatar name={selectedWorker.name} size="lg" showOnline={selectedWorker.online} />
            <View style={styles.workerInfo}>
              <View style={styles.workerNameRow}>
                <Text style={styles.workerName}>{selectedWorker.name}</Text>
                <Text style={styles.workerRate}>
                  ${selectedWorker.rate}
                  <Text style={styles.rateUnit}>/hr</Text>
                </Text>
              </View>
              <View style={styles.workerMeta}>
                <Text style={styles.ratingText}>★ {selectedWorker.rating.toFixed(1)}</Text>
                <Text style={styles.jobsText}>({selectedWorker.jobs} jobs)</Text>
              </View>
              <View style={styles.badgeRow}>
                <Badge
                  label={selectedWorker.category.toUpperCase()}
                  color={Colors.primary}
                  bgColor={Colors.primaryBg}
                />
                {selectedWorker.online && <Badge type="online" />}
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Clock size={14} color={Colors.textMuted} strokeWidth={2} />
              <Text style={styles.statLabel}>RESPONSE</Text>
              <Text style={styles.statValue}>{"< 15 mins"}</Text>
            </View>
            <View style={styles.statItem}>
              <Award size={14} color={Colors.textMuted} strokeWidth={2} />
              <Text style={styles.statLabel}>EXPERIENCE</Text>
              <Text style={styles.statValue}>{selectedWorker.experience}</Text>
            </View>
            <View style={styles.statItem}>
              <Navigation size={14} color={Colors.textMuted} strokeWidth={2} />
              <Text style={styles.statLabel}>DISTANCE</Text>
              <Text style={styles.statValue}>{selectedWorker.distance}</Text>
            </View>
          </View>

          {/* Trust badge */}
          <View style={styles.trustRow}>
            <Badge type="verified" label="Trust Badge Verified" />
            <Text style={styles.trustText}>Background check & ID verification completed.</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionRow}>
            <Pressable style={styles.iconBtn}>
              <MapPin size={20} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Navigation size={20} color={Colors.textSecondary} strokeWidth={2} />
            </Pressable>
            <Button
              title="CONNECT"
              onPress={() => router.push('/service-request')}
              size="md"
              style={{ flex: 1 }}
            />
          </View>
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  topBar: { backgroundColor: Colors.background, paddingBottom: Spacing.md, zIndex: 10 },
  locationRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.sm, paddingBottom: Spacing.md },
  locationInfo: { gap: 2 },
  locationLabel: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1 },
  locationValue: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  filterButton: { width: 40, height: 40, borderRadius: Radii.sm, borderWidth: 1, borderColor: Colors.inputBorder, justifyContent: 'center', alignItems: 'center' },
  mapArea: { flex: 1 },
  bottomCard: { paddingHorizontal: Spacing.screenPadding, paddingBottom: Spacing.xxl },
  workerRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg },
  workerInfo: { flex: 1, gap: 4 },
  workerNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  workerName: { ...Typography.title3, color: Colors.textPrimary },
  workerRate: { ...Typography.title3, color: Colors.primary },
  rateUnit: { ...Typography.caption, color: Colors.textMuted },
  workerMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...Typography.caption, color: Colors.star, fontWeight: '700' },
  jobsText: { ...Typography.caption, color: Colors.textMuted },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.divider, marginBottom: Spacing.md },
  statItem: { alignItems: 'center', gap: 4 },
  statLabel: { ...Typography.micro, color: Colors.textMuted, letterSpacing: 0.5 },
  statValue: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.lg, flexWrap: 'wrap' },
  trustText: { ...Typography.caption, color: Colors.textMuted, flex: 1 },
  actionRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: Radii.button, borderWidth: 1, borderColor: Colors.inputBorder, justifyContent: 'center', alignItems: 'center' },
});
