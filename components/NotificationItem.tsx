/**
 * ConnectGig — NotificationItem Component
 * Matches the grouped notification list from Notifications screen mockup
 */

import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Navigation, CreditCard, Cpu, CalendarCheck } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import type { NotificationType } from '../types/notification';

interface NotificationItemProps {
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  worker_en_route: { icon: Navigation, color: Colors.notifWorkerEnRoute, bg: Colors.primaryBg },
  payment_success: { icon: CreditCard, color: Colors.notifPayment, bg: Colors.successBg },
  feature_announcement: { icon: Cpu, color: Colors.notifAiFeature, bg: Colors.aiMatchBg },
  booking_confirmed: { icon: CalendarCheck, color: Colors.notifBooking, bg: Colors.primaryBg },
};

export function NotificationItem({
  type,
  title,
  body,
  time,
  isRead,
  onPress,
  style,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: config.bg }]}>
        <Icon size={20} color={config.color} strokeWidth={2} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !isRead && styles.titleUnread]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.time}>{time}</Text>
          {!isRead && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.body} numberOfLines={2}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    backgroundColor: Colors.background,
  },
  pressed: {
    backgroundColor: Colors.surface,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...Typography.body2Medium,
    color: Colors.textPrimary,
    flex: 1,
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  body: {
    ...Typography.body2,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
