/**
 * ConnectGig — WorkerCard Component
 * Worker preview card matching the "AI Recommended" list from Client Home Dashboard
 * Shows: photo, name, subtitle, badges, rating, distance, hourly rate
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { MapPin, Star } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Radii, Shadows, Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { Avatar } from './ui/Avatar';
import { Badge } from './ui/Badge';
import { StatusDot } from './ui/StatusDot';
import { formatCurrency } from '../utils/currency';

interface WorkerCardProps {
  name: string;
  subtitle: string;
  photoUrl?: string;
  rating: number;
  distance: string;
  hourlyRate: number;
  isVerified?: boolean;
  isTopPro?: boolean;
  isOnline?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function WorkerCard({
  name,
  subtitle,
  photoUrl,
  rating,
  distance,
  hourlyRate,
  isVerified,
  isTopPro,
  isOnline,
  onPress,
  style,
}: WorkerCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        Shadows.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Left: Avatar */}
      <Avatar uri={photoUrl} name={name} size="lg" showOnline={isOnline} />

      {/* Middle: Info */}
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          {isVerified && <Badge type="verified" />}
          {isTopPro && <Badge type="topPro" />}
        </View>
        <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>
        <View style={styles.metaRow}>
          {isOnline && <StatusDot status="online" size={6} />}
          <Star size={12} color={Colors.star} fill={Colors.star} />
          <Text style={styles.rating}>{rating.toFixed(1)}</Text>
          <MapPin size={12} color={Colors.textMuted} />
          <Text style={styles.distance}>{distance}</Text>
        </View>
      </View>

      {/* Right: Rate */}
      <View style={styles.rateContainer}>
        <Text style={styles.rate}>{formatCurrency(hourlyRate)}</Text>
        <Text style={styles.rateLabel}>/hr</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...Typography.body2SemiBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginRight: 4,
  },
  distance: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  rateContainer: {
    alignItems: 'flex-end',
  },
  rate: {
    ...Typography.title3,
    color: Colors.primary,
  },
  rateLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
