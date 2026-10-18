/**
 * ConnectGig — Client Messages Screen
 * Live conversation list with Firestore real-time sync, dynamic unread badges,
 * presence status indicators, and relative timestamp calculations.
 */

import React, { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { chatService } from '../../services/chat';
import type { Conversation } from '../../types/chat';

export default function MessagesScreen() {
  const { user } = useAuthStore();
  const currentUserId = user?.uid || 'mock-client-uid';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = chatService.subscribeToConversations(currentUserId, (data) => {
      setConversations(data);
    });

    return () => {
      unsubscribe();
    };
  }, [currentUserId]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return '';
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const totalUnreadCount = conversations.reduce(
    (sum, c) => sum + (c.unreadCountClient || 0),
    0
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={styles.title}>Messages</Text>
          {totalUnreadCount > 0 && (
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>{totalUnreadCount} new</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>Direct live communication with your service providers</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {conversations.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconCircle}>
              <MessageCircle size={44} color={Colors.primary} strokeWidth={1.75} />
            </View>
            <Text style={styles.emptyTitle}>No Conversations Yet</Text>
            <Text style={styles.emptyText}>
              When you book a service or an expert accepts your gig request, your live chats will appear here.
            </Text>
            <Pressable
              style={styles.browseButton}
              onPress={() => router.push('/(client)/home')}
            >
              <Search size={16} color={Colors.textWhite} />
              <Text style={styles.browseButtonText}>Explore Services</Text>
            </Pressable>
          </View>
        ) : (
          conversations.map((chat) => {
            const unread = chat.unreadCountClient || 0;
            const otherPartyName = chat.providerName || 'Service Provider';
            const timeText = formatRelativeTime(chat.lastMessageAt);

            return (
              <Pressable
                key={chat.id}
                onPress={() =>
                  router.push({
                    pathname: '/chat/[id]',
                    params: {
                      id: chat.id,
                      name: otherPartyName,
                      providerId: chat.providerId,
                    },
                  })
                }
                style={({ pressed }) => [styles.chatItem, pressed && styles.chatPressed]}
              >
                <Avatar name={otherPartyName} size="lg" showOnline={chat.online !== false} />
                <View style={styles.chatInfo}>
                  <View style={styles.chatNameRow}>
                    <Text style={[styles.chatName, unread > 0 && styles.chatNameUnread]}>
                      {otherPartyName}
                    </Text>
                    <Text style={[styles.chatTime, unread > 0 && styles.chatTimeUnread]}>
                      {timeText}
                    </Text>
                  </View>
                  <View style={styles.chatMessageRow}>
                    <Text
                      style={[styles.chatMessage, unread > 0 && styles.chatMessageUnread]}
                      numberOfLines={1}
                    >
                      {chat.lastMessage || 'Tap to start conversation'}
                    </Text>
                    {unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{unread}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { ...Typography.title1, color: Colors.textPrimary },
  subtitle: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  totalBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  totalBadgeText: { ...Typography.micro, color: Colors.primary, fontWeight: '700' },

  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.divider,
  },
  chatPressed: { backgroundColor: Colors.surface },
  chatInfo: { flex: 1, gap: 4 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { ...Typography.body2Medium, color: Colors.textPrimary },
  chatNameUnread: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  chatTime: { ...Typography.caption, color: Colors.textMuted },
  chatTimeUnread: { color: Colors.primary, fontWeight: '600' },

  chatMessageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { ...Typography.body2, color: Colors.textSecondary, flex: 1, marginRight: Spacing.sm },
  chatMessageUnread: { color: Colors.textPrimary, fontWeight: '600' },
  unreadBadge: {
    backgroundColor: Colors.primary,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: { ...Typography.micro, color: Colors.textWhite, fontWeight: '700' },

  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: Spacing.xl, gap: Spacing.md },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary },
  emptyText: { ...Typography.body2, color: Colors.textMuted, textAlign: 'center', lineHeight: 22 },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radii.full,
    marginTop: Spacing.sm,
  },
  browseButtonText: { ...Typography.body2SemiBold, color: Colors.textWhite },
});
