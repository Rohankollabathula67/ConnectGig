/**
 * ConnectGig — Badge Component
 * Small pill badges: "VERIFIED", "TOP PRO", "ONLINE", "PAID", "URGENT", "AI MATCH"
 */

import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';

type BadgeType = 'verified' | 'topPro' | 'online' | 'paid' | 'urgent' | 'aiMatch' | 'custom';

interface BadgeProps {
  type?: BadgeType;
  label?: string;
  color?: string;
  bgColor?: string;
  showDot?: boolean;
  style?: ViewStyle;
}

const BADGE_CONFIG: Record<Exclude<BadgeType, 'custom'>, { label: string; color: string; bg: string; dot?: boolean }> = {
  verified: { label: 'VERIFIED', color: Colors.verified, bg: Colors.verifiedBg },
  topPro: { label: 'TOP PRO', color: Colors.topPro, bg: Colors.topProBg },
  online: { label: 'ONLINE', color: Colors.online, bg: Colors.successBg, dot: true },
  paid: { label: 'PAID', color: Colors.paid, bg: Colors.paidBg },
  urgent: { label: 'URGENT', color: Colors.urgent, bg: Colors.urgentBg },
  aiMatch: { label: 'AI MATCH', color: Colors.aiMatch, bg: Colors.aiMatchBg },
};

export function Badge({
  type = 'custom',
  label,
  color,
  bgColor,
  showDot,
  style,
}: BadgeProps) {
  const config = type !== 'custom' ? BADGE_CONFIG[type] : null;
  const displayLabel = label || config?.label || '';
  const displayColor = color || config?.color || Colors.primary;
  const displayBg = bgColor || config?.bg || Colors.primaryBg;
  const hasDot = showDot ?? config?.dot ?? false;

  return (
    <View style={[styles.badge, { backgroundColor: displayBg }, style]}>
      {hasDot && <View style={[styles.dot, { backgroundColor: displayColor }]} />}
      <Text style={[Typography.micro, { color: displayColor }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radii.full,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
