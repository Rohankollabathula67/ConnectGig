/**
 * ConnectGig — Notifications Screen (§3.9)
 * Grouped by day, colored type icons, mark all read
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft, Star, ThumbsUp, ThumbsDown } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { NotificationItem } from '../components/NotificationItem';
import type { NotificationType } from '../types/notification';

interface MockNotification {
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  group: string;
}

const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    group: 'TODAY',
    type: 'worker_en_route',
    title: 'Worker on the way',
    body: 'Your assigned professional, David S., is currently en route to your location. Estimated arrival in 12 mins.',
    time: '5m ago',
    isRead: false,
  },
  {
    group: 'TODAY',
    type: 'payment_success',
    title: 'Payment Successful',
    body: "Your payment of $45.00 for 'Kitchen Repair' has been processed successfully. View receipt.",
    time: '2h ago',
    isRead: true,
  },
  {
    group: 'YESTERDAY',
    type: 'feature_announcement',
    title: 'New Feature: AI Matchmaking',
    body: "We've upgraded our system! You'll now get matched with workers based on your history and speed preferences.",
    time: 'Yesterday',
    isRead: true,
  },
  {
    group: 'YESTERDAY',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    body: "Your booking for 'House Cleaning' on Friday, Oct 25 has been confirmed by the professional.",
    time: 'Yesterday',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const groups = [...new Set(MOCK_NOTIFICATIONS.map((n) => n.group))];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
        </View>
        <View style={styles.headerRight}>
          <Pressable>
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
        </View>
      </View>

      {/* Notification List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {groups.map((group) => (
          <View key={group}>
            <View style={styles.groupHeader}>
              <Text style={styles.groupTitle}>{group}</Text>
            </View>
            {MOCK_NOTIFICATIONS.filter((n) => n.group === group).map((notif, index) => (
              <NotificationItem
                key={index}
                type={notif.type}
                title={notif.title}
                body={notif.body}
                time={notif.time}
                isRead={notif.isRead}
              />
            ))}
          </View>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { ...Typography.title2, color: Colors.textPrimary },
  markAllRead: { ...Typography.body2SemiBold, color: Colors.primary },
  groupHeader: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  groupTitle: { ...Typography.overline, color: Colors.textMuted, letterSpacing: 1.5 },
});
