/**
 * ConnectGig — Client Messages Screen
 * Chat list with recent conversations
 */

import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { MessageCircle } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { StatusDot } from '../../components/ui/StatusDot';

const MOCK_CHATS = [
  { id: '1', name: 'David Chen', lastMessage: 'I\'ll be there in 10 minutes', time: '2m ago', unread: 2, online: true },
  { id: '2', name: 'Sarah Jenkins', lastMessage: 'The cleaning is complete! Please check.', time: '1h ago', unread: 0, online: true },
  { id: '3', name: 'Marcus Rivera', lastMessage: 'Sure, I can help with that', time: 'Yesterday', unread: 0, online: false },
];

export default function MessagesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {MOCK_CHATS.length === 0 ? (
          <View style={styles.empty}>
            <MessageCircle size={48} color={Colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        ) : (
          MOCK_CHATS.map((chat) => (
            <Pressable
              key={chat.id}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: chat.id, name: chat.name } })}
              style={({ pressed }) => [styles.chatItem, pressed && styles.chatPressed]}
            >
              <Avatar name={chat.name} size="lg" showOnline={chat.online} />
              <View style={styles.chatInfo}>
                <View style={styles.chatNameRow}>
                  <Text style={[styles.chatName, chat.unread > 0 && styles.chatNameUnread]}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                <View style={styles.chatMessageRow}>
                  <Text style={[styles.chatMessage, chat.unread > 0 && styles.chatMessageUnread]} numberOfLines={1}>
                    {chat.lastMessage}
                  </Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  title: { ...Typography.title1, color: Colors.textPrimary },
  chatItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingHorizontal: Spacing.screenPadding, paddingVertical: Spacing.md },
  chatPressed: { backgroundColor: Colors.surface },
  chatInfo: { flex: 1, gap: 4 },
  chatNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { ...Typography.body2Medium, color: Colors.textPrimary },
  chatNameUnread: { fontWeight: '700' },
  chatTime: { ...Typography.caption, color: Colors.textMuted },
  chatMessageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatMessage: { ...Typography.body2, color: Colors.textSecondary, flex: 1 },
  chatMessageUnread: { color: Colors.textPrimary, fontWeight: '500' },
  unreadBadge: { backgroundColor: Colors.primary, width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  unreadText: { ...Typography.micro, color: Colors.textWhite },
  empty: { alignItems: 'center', paddingTop: 80, gap: Spacing.lg },
  emptyText: { ...Typography.body, color: Colors.textMuted },
});
