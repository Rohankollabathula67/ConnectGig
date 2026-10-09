/**
 * ConnectGig — Styled Map Wrapper Component (Web Fallback)
 * Pure React Native web-safe fallback when react-native-maps is unavailable on web.
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Radii } from '../constants/spacing';
import { MapPin } from 'lucide-react-native';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  initials?: string;
  online?: boolean;
}

interface MapViewProps {
  markers?: MapMarker[];
  showRoute?: boolean;
  origin?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  onMarkerPress?: (marker: MapMarker) => void;
  style?: object;
  interactive?: boolean;
}

export default function CustomMapView({
  markers = [],
  showRoute = false,
  origin,
  destination,
  style,
}: MapViewProps) {
  return (
    <View style={[styles.webFallback, style]}>
      <View style={styles.headerRow}>
        <MapPin size={24} color={Colors.primary} />
        <Text style={styles.webTitle}>Interactive Map View</Text>
      </View>
      <Text style={styles.webSubtext}>
        {markers.length > 0
          ? `${markers.length} worker${markers.length > 1 ? 's' : ''} in your area`
          : 'Live map tracking active'}
        {showRoute ? ' · Direct Route Active' : ''}
      </Text>
      {markers.slice(0, 4).map((m) => (
        <View key={m.id} style={styles.markerRow}>
          <Text style={styles.markerBadge}>📍</Text>
          <Text style={styles.markerText} numberOfLines={1}>
            {m.title} {m.description ? `— ${m.description}` : ''}
          </Text>
        </View>
      ))}
      {origin && (
        <View style={styles.markerRow}>
          <Text style={styles.markerBadge}>🟢</Text>
          <Text style={styles.markerText}>Pickup / Service Location</Text>
        </View>
      )}
      {destination && (
        <View style={styles.markerRow}>
          <Text style={styles.markerBadge}>🏁</Text>
          <Text style={styles.markerText}>Worker Destination</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  webFallback: {
    backgroundColor: '#1E293B',
    borderRadius: Radii.card,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 220,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  webTitle: {
    ...Typography.bodyMedium,
    color: Colors.textWhite,
    fontWeight: '700',
  },
  webSubtext: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 12,
  },
  markerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
    maxWidth: '90%',
  },
  markerBadge: {
    fontSize: 14,
  },
  markerText: {
    ...Typography.caption,
    color: '#94A3B8',
  },
});
