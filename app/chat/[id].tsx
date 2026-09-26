/**
 * ConnectGig — Individual Chat Screen (§3.9, Addendum C)
 * Displays scrollable message bubbles, text input bar, real-time Firestore listeners,
 * and optimistic message dispatch with auto-simulated mock responses.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, FlatList, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { db, IS_FIREBASE_ENABLED } from '../../services/firebase';
import { collection, doc, query, orderBy, onSnapshot, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export default function ChatScreen() {
  const { id: conversationId, name: recipientName } = useLocalSearchParams<{ id: string; name: string }>();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  
  const currentUserId = user?.uid || 'mock-client-uid';

  useEffect(() => {
    if (IS_FIREBASE_ENABLED) {
      // Live Firestore subcollection listener
      const msgsQuery = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
      );
      
      const unsubscribe = onSnapshot(msgsQuery, (snapshot) => {
        const loadedMsgs: Message[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedMsgs.push({
            id: doc.id,
            senderId: data.senderId,
            text: data.text,
            createdAt: data.createdAt?.seconds * 1000 || Date.now(),
          });
        });
        setMessages(loadedMsgs);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      });

      return () => unsubscribe();
    } else {
      // Mock seed messages for simulation
      const mockSeeds: Message[] = [
        { id: 'm1', senderId: 'other', text: `Hi there! I am ready to help you with the service request.`, createdAt: Date.now() - 3600000 },
        { id: 'm2', senderId: currentUserId, text: `Great! Are you en route now?`, createdAt: Date.now() - 1800000 },
        { id: 'm3', senderId: 'other', text: `Yes, packing tools and leaving shortly!`, createdAt: Date.now() - 60000 },
      ];
      setMessages(mockSeeds);
    }
  }, [conversationId]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const newMsgText = inputText.trim();
    setInputText('');

    const tempMsg: Message = {
      id: `temp-${Date.now()}`,
      senderId: currentUserId,
      text: newMsgText,
      createdAt: Date.now(),
    };

    // Optimistic update
    setMessages((prev) => [...prev, tempMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    if (IS_FIREBASE_ENABLED) {
      try {
        const msgRef = collection(db, 'conversations', conversationId, 'messages');
        await addDoc(msgRef, {
          senderId: currentUserId,
          text: newMsgText,
          createdAt: serverTimestamp(),
          isRead: false,
        });

        // Update conversation metadata
        await setDoc(doc(db, 'conversations', conversationId), {
          conversationId,
          lastMessage: newMsgText,
          lastMessageAt: serverTimestamp(),
          participantIds: [currentUserId, 'other-uid'],
        }, { merge: true });
      } catch (err) {
        console.warn("[Chat] Error sending message:", err);
      }
    } else {
      // Mock delayed response simulation (1.5 seconds)
      setTimeout(() => {
        const mockReply: Message = {
          id: `reply-${Date.now()}`,
          senderId: 'other',
          text: `Got it! I am reviewing your request instructions now.`,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, mockReply]);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      }, 1500);
    }
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUserId;
    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        {!isMe && <Avatar name={recipientName} size="sm" style={styles.chatAvatar} />}
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          <Text style={[styles.messageText, isMe ? styles.messageTextRight : styles.messageTextLeft]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Avatar name={recipientName} size="md" />
          <Text style={styles.headerTitle}>{recipientName || "Provider"}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

        <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <Pressable onPress={handleSend} style={styles.sendButton}>
            <Send size={18} color={Colors.textWhite} strokeWidth={2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  backButton: { width: 40, height: 40, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  
  keyboardContainer: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.lg, paddingBottom: Spacing.xl },
  
  messageRow: { flexDirection: 'row', marginBottom: Spacing.lg, alignItems: 'flex-end', maxWidth: '80%' },
  messageRowLeft: { alignSelf: 'flex-start' },
  messageRowRight: { alignSelf: 'flex-end', justifyContent: 'flex-end', maxWidth: '80%' },
  
  chatAvatar: { marginRight: Spacing.sm },
  bubble: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderRadius: Radii.card },
  bubbleLeft: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, ...Shadows.card },
  bubbleRight: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },
  
  messageText: { ...Typography.body2, lineHeight: 18 },
  messageTextLeft: { color: Colors.textPrimary },
  messageTextRight: { color: Colors.textWhite },
  
  inputBar: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    alignItems: 'center',
    gap: Spacing.md,
  },
  textInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.inputBg,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.xl,
    color: Colors.textPrimary,
    ...Typography.body2,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.floating,
  },
});
