/**
 * ConnectGig — Styled Map Wrapper Component (§2.1, §2.2)
 * Embeds react-native-maps with the custom mapStyle.ts JSON.
 * Fallback to a styled mock view on Web.
 */

import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { MAP_STYLE } from '../constants/mapStyle';
import { Colors } from '../constants/colors';
import { Avatar } from './ui/Avatar';
import { Radii } from '../constants/spacing';
import { Typography } from '../constants/typography';

// Types
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

const DEFAULT_REGION: Region = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.015,
  longitudeDelta: 0.0121,
};

// Replace with your real Google Maps API key when available
const GOOGLE_MAPS_API_KEY = '';

export default function CustomMapView({
  markers = [],
  showRoute = false,
  origin,
  destination,
  onMarkerPress,
  style,
  interactive = true,
}: MapViewProps) {
  const mapRef = useRef<MapView>(null);

  // Auto-fit to markers and route
  useEffect(() => {
    if (!mapRef.current || Platform.OS === 'web') return;

    const coordinatesToFit = [...markers];
    if (origin) coordinatesToFit.push({ id: 'origin', ...origin, title: 'Origin' });
    if (destination) coordinatesToFit.push({ id: 'destination', ...destination, title: 'Destination' });

    if (coordinatesToFit.length > 0) {
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinatesToFit, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 100);
    }
  }, [markers, origin, destination]);

  // Render Web Fallback
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, style]}>
        <Text style={styles.webText}>Map View (Mock Mode for Web)</Text>
        <Text style={styles.webSubtext}>
          Markers count: {markers.length} {showRoute ? '· Route active' : ''}
        </Text>
        {markers.map((m, idx) => (
          <Text key={m.id} style={styles.webMarkerItem}>
            📍 {m.title} ({m.latitude.toFixed(4)}, {m.longitude.toFixed(4)})
          </Text>
        ))}
      </View>
    );
  }

  // Determine bounds region
  const getInitialRegion = (): Region => {
    if (origin) {
      return {
        latitude: origin.latitude,
        longitude: origin.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    if (markers.length > 0) {
      return {
        latitude: markers[0].latitude,
        longitude: markers[0].longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }
    return DEFAULT_REGION;
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={StyleSheet.absoluteFill}
        customMapStyle={MAP_STYLE}
        initialRegion={getInitialRegion()}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        pitchEnabled={interactive}
        rotateEnabled={interactive}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            onPress={() => onMarkerPress?.(marker)}
            title={marker.title}
            description={marker.description}
          >
            {marker.initials ? (
              <View style={styles.avatarPin}>
                <Avatar name={marker.initials} size="sm" showOnline={marker.online} />
                <View style={styles.pinTriangle} />
              </View>
            ) : null}
          </Marker>
        ))}

        {/* Origin / Destination Markers */}
        {origin && (
          <Marker coordinate={origin} title="Your Location">
            <View style={styles.userPin}>
              <View style={styles.userPinDot} />
            </View>
          </Marker>
        )}

        {destination && (
          <Marker coordinate={destination} title="Worker Location">
            <View style={styles.providerPin}>
              <View style={styles.providerPinDot} />
            </View>
          </Marker>
        )}

        {/* Route directions */}
        {showRoute && origin && destination && (
          <>
            {GOOGLE_MAPS_API_KEY ? (
              <MapViewDirections
                origin={origin}
                destination={destination}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={4}
                strokeColor={Colors.primary}
                optimizeWaypoints={true}
              />
            ) : (
              // Simple straight line fallback if no API key is specified
              <Polyline
                coordinates={[origin, destination]}
                strokeWidth={4}
                strokeColor={Colors.primary}
                lineDashPattern={[5, 5]}
              />
            )}
          </>
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webFallback: {
    flex: 1,
    backgroundColor: '#C8E6C9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  webText: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
  },
  webSubtext: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  webMarkerItem: {
    ...Typography.caption,
    color: Colors.textPrimary,
  },
  avatarPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
    marginTop: -2,
  },
  userPin: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59,111,244,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userPinDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  providerPin: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(76,175,80,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerPinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
  },
});
