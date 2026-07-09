/**
 * ConnectGig — GigCard / Service Category Card
 * Matches the 2x4 services grid from Client Home Dashboard
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import {
  Wrench, Zap, Sparkles, Paintbrush, Flower2,
  Monitor, Hammer, GraduationCap,
} from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Radii, Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';

const ICON_MAP: Record<string, React.ElementType> = {
  wrench: Wrench,
  zap: Zap,
  sparkles: Sparkles,
  paintbrush: Paintbrush,
  'flower-2': Flower2,
  monitor: Monitor,
  hammer: Hammer,
  'graduation-cap': GraduationCap,
};

interface GigCardProps {
  label: string;
  icon: string;
  color: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export function GigCard({ label, icon, color, onPress, style }: GigCardProps) {
  const IconComponent = ICON_MAP[icon] || Wrench;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        <IconComponent size={24} color={color} strokeWidth={2} />
      </View>
      <Text style={styles.label} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radii.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
