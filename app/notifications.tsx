/**
 * ConnectGig — Notifications Screen (Sprint 3 — §3.9)
 * Real-time notifications center connected to Zustand & Firestore.
 * Supports grouping by day, unread indicators, mark-all-read, and deep-link routing.
 */

import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeGoBack } from '../utils/navigation';
import { ChevronLeft, Bell, CheckCheck } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Typography } from '../constants/typography';
import { NotificationItem } from '../components/NotificationItem';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import type { AppNotification, NotificationType } from '../types/notification';

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'seed-1',
    type: 'worker_en_route',
    title: 'Worker on the way',
    body: 'Your assigned professional, Marcus Rivera, is en route to your location. Estimated arrival in 8 mins.',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: 'seed-2',
    type: 'payment_success',
    title: 'Payment Successful',
    body: "Your payment of ₹450 for 'Electrician Services' has been verified and settled via Razorpay.",
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: 'seed-3',
    type: 'feature_announcement',
    title: 'New Feature: AI Pro Matching',
    body: "We've upgraded our dispatch algorithm! You'll now be paired with the highest-rated verified pros near you.",
    isRead: true,
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000),
  },
  {
    id: 'seed-4',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    body: "Your service request has been broadcasted to certified local specialists.",
    isRead: true,
    createdAt: new Date(Date.now() - 28 * 60 * 60 * 1000),
  },
];

function getTimeLabel(date: Date): string {
  const diffMins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

function getGroupLabel(date: Date): 'TODAY' | 'YESTERDAY' | 'EARLIER' {
  const now = new Date();
  const d = new Date(date);
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (isToday) return 'TODAY';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return 'YESTERDAY';

  return 'EARLIER';
}

export default function NotificationsScreen() {
  const { user } = useAuthStore();
  const userId = user?.uid || 'mock-client-uid';

  const {
    notifications,
    unreadCount,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAllAsRead,
    markAsRead,
  } = useNotificationStore();

  useEffect(() => {
    subscribeToNotifications(userId);
    return () => unsubscribeFromNotifications();
  }, [userId]);

  const displayList = notifications.length > 0 ? notifications : SEED_NOTIFICATIONS;

  // Group notifications
  const groupedNotifications = displayList.reduce((acc, notif) => {
    const group = getGroupLabel(notif.createdAt);
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, AppNotification[]>);

  const handleNotificationPress = (notif: AppNotification) => {
    markAsRead(notif.id);

    switch (notif.type) {
      case 'worker_en_route':
        router.push('/job-tracking');
        break;
      case 'booking_confirmed':
      case 'payment_success':
        router.push('/(client)/bookings');
        break;
      case 'feature_announcement':
        router.push('/all-services');
        break;
      default:
        break;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
            <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
          </Pressable>
          <View>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={styles.unreadSubhead}>{unreadCount} unread updates</Text>
            )}
          </View>
        </View>
        <View style={styles.headerRight}>
          <Pressable onPress={markAllAsRead} style={styles.markAllBtn}>
            <CheckCheck size={16} color={Colors.primary} />
            <Text style={styles.markAllRead}>Mark all read</Text>
          </Pressable>
        </View>
      </View>

      {/* Notification List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {displayList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bell size={48} color={Colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyDesc}>
              You have no new notifications. Booking confirmations and dispatch updates will appear here.
            </Text>
          </View>
        ) : (
          (['TODAY', 'YESTERDAY', 'EARLIER'] as const).map((group) => {
            const list = groupedNotifications[group];
            if (!list || list.length === 0) return null;

            return (
              <View key={group}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{group}</Text>
                </View>
                {list.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    type={notif.type}
                    title={notif.title}
                    body={notif.body}
                    time={getTimeLabel(notif.createdAt)}
                    isRead={notif.isRead}
                    onPress={() => handleNotificationPress(notif)}
                  />
                ))}
              </View>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    ...Typography.title2,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  unreadSubhead: {
    ...Typography.micro,
    color: Colors.primary,
    fontWeight: '600',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  markAllRead: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  groupHeader: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  groupTitle: {
    ...Typography.overline,
    color: Colors.textMuted,
    letterSpacing: 1.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  emptyDesc: {
    ...Typography.body2,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
