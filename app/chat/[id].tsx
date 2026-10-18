/**
 * ConnectGig — Real-Time Chat Screen (§3.9, Addendum C)
 * Real-time message stream with photo attachments, live Firestore sync,
 * image picker integration, delivered/read receipts, and smooth keyboard navigation.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Modal,
  Image as RNImage,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image as ExpoImage } from 'expo-image';
import { safeGoBack } from '../../utils/navigation';
import {
  ChevronLeft,
  Send,
  Image as ImageIcon,
  Camera,
  Check,
  CheckCheck,
  Clock,
  X,
} from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Radii, Shadows } from '../../constants/spacing';
import { Typography } from '../../constants/typography';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/authStore';
import { chatService } from '../../services/chat';
import type { ChatMessage } from '../../types/chat';

export default function ChatScreen() {
  const { id: rawConvId, name: recipientName, providerId } = useLocalSearchParams<{
    id: string;
    name?: string;
    providerId?: string;
  }>();

  const conversationId = rawConvId || 'conv_1';
  const displayName = recipientName || 'Service Provider';
  const otherUserId = providerId || 'prov_david';

  const { user } = useAuthStore();
  const currentUserId = user?.uid || 'mock-client-uid';
  const currentUserName = user?.displayName || 'Alex Morgan';
  const userRole = user?.role || 'client';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Subscribe to live messages
  useEffect(() => {
    const unsubscribe = chatService.subscribeToMessages(conversationId, (loaded) => {
      setMessages(loaded);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    });

    // Mark as read when opening conversation
    chatService.markConversationAsRead(conversationId, userRole);

    return () => {
      unsubscribe();
    };
  }, [conversationId, userRole]);

  // Handle Pick from Library
  const handlePickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please enable photo library access to share images in chat.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('[Chat] Image picker error:', e);
    }
  };

  // Handle Camera Capture
  const handleCapturePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please enable camera access to take and share photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        setSelectedImageUri(result.assets[0].uri);
      }
    } catch (e) {
      console.warn('[Chat] Camera error:', e);
    }
  };

  // Handle Send Message (text and/or image)
  const handleSend = async () => {
    const textToSend = inputText.trim();
    const imageToSend = selectedImageUri;

    if (!textToSend && !imageToSend) return;

    setInputText('');
    setSelectedImageUri(null);

    let finalImageUrl: string | null = null;

    if (imageToSend) {
      setUploadingImage(true);
      try {
        finalImageUrl = await chatService.uploadChatImage(conversationId, imageToSend);
      } catch (err) {
        console.warn('[Chat] Failed to upload chat image:', err);
        Alert.alert('Upload Failed', 'Could not upload image. Please try again.');
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    try {
      await chatService.sendMessage({
        conversationId,
        senderId: currentUserId,
        senderName: currentUserName,
        text: textToSend,
        imageUrl: finalImageUrl,
        recipientId: otherUserId,
        recipientName: displayName,
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      console.warn('[Chat] Send message error:', err);
      Alert.alert('Message Failed', 'Could not send message. Please check your connection.');
    }
  };

  const formatMessageTime = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  const renderMessageItem = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === currentUserId;
    const formattedTime = formatMessageTime(item.createdAt);

    return (
      <View style={[styles.messageRow, isMe ? styles.messageRowRight : styles.messageRowLeft]}>
        {!isMe && <Avatar name={displayName} size="sm" style={styles.chatAvatar} />}
        <View style={[styles.bubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          {item.imageUrl && (
            <Pressable
              onPress={() => setPreviewModalUrl(item.imageUrl || null)}
              style={styles.imageBubbleContainer}
            >
              <ExpoImage
                source={{ uri: item.imageUrl }}
                style={styles.bubbleImage}
                contentFit="cover"
                transition={200}
              />
            </Pressable>
          )}

          {item.text ? (
            <Text
              style={[
                styles.messageText,
                isMe ? styles.messageTextRight : styles.messageTextLeft,
                item.imageUrl ? { marginTop: Spacing.xs } : null,
              ]}
            >
              {item.text}
            </Text>
          ) : null}

          {/* Timestamp & Status Metadata */}
          <View style={[styles.metaRow, isMe ? styles.metaRowRight : styles.metaRowLeft]}>
            <Text style={[styles.metaTime, isMe ? styles.metaTimeRight : styles.metaTimeLeft]}>
              {formattedTime}
            </Text>
            {isMe && (
              <View style={styles.receiptIcon}>
                {item.pending ? (
                  <Clock size={11} color="rgba(255,255,255,0.7)" />
                ) : item.isRead ? (
                  <CheckCheck size={13} color="#93C5FD" strokeWidth={2.5} />
                ) : (
                  <Check size={13} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.textPrimary} strokeWidth={2} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Avatar name={displayName} size="md" showOnline={true} />
          <View>
            <Text style={styles.headerTitle}>{displayName}</Text>
            <Text style={styles.headerSubtitle}>Online · In Service</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Avatar name={displayName} size="xl" />
              <Text style={styles.emptyTitle}>Chat with {displayName}</Text>
              <Text style={styles.emptyDesc}>
                Coordinate service instructions, clarify address details, or share photos directly.
              </Text>
            </View>
          }
        />

        {/* Selected Image Thumbnail preview before sending */}
        {selectedImageUri && (
          <View style={styles.thumbnailPreviewBar}>
            <RNImage source={{ uri: selectedImageUri }} style={styles.thumbnailImg} />
            <Text style={styles.thumbnailText} numberOfLines={1}>
              Photo attached ready to send
            </Text>
            <Pressable onPress={() => setSelectedImageUri(null)} style={styles.thumbnailRemove}>
              <X size={16} color={Colors.textWhite} />
            </Pressable>
          </View>
        )}

        {/* Uploading progress indicator */}
        {uploadingImage && (
          <View style={styles.uploadingBar}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.uploadingText}>Uploading photo...</Text>
          </View>
        )}

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <Pressable onPress={handleCapturePhoto} style={styles.mediaButton}>
            <Camera size={20} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>

          <Pressable onPress={handlePickImage} style={styles.mediaButton}>
            <ImageIcon size={20} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            multiline
          />

          <Pressable
            onPress={handleSend}
            disabled={(!inputText.trim() && !selectedImageUri) || uploadingImage}
            style={[
              styles.sendButton,
              (!inputText.trim() && !selectedImageUri) && styles.sendButtonDisabled,
            ]}
          >
            <Send size={18} color={Colors.textWhite} strokeWidth={2} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Full Screen Image Preview Modal */}
      <Modal
        visible={!!previewModalUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewModalUrl(null)}
      >
        <SafeAreaView style={styles.modalBackdrop}>
          <Pressable style={styles.modalCloseBtn} onPress={() => setPreviewModalUrl(null)}>
            <X size={26} color={Colors.textWhite} />
          </Pressable>
          {previewModalUrl && (
            <ExpoImage
              source={{ uri: previewModalUrl }}
              style={styles.modalImage}
              contentFit="contain"
            />
          )}
        </SafeAreaView>
      </Modal>
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
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    backgroundColor: Colors.surface,
  },
  backButton: { width: 40, height: 40, borderRadius: Radii.full, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  headerTitle: { ...Typography.body2SemiBold, color: Colors.textPrimary },
  headerSubtitle: { ...Typography.caption, color: Colors.success, marginTop: 1 },

  keyboardContainer: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.screenPadding, paddingTop: Spacing.md, paddingBottom: Spacing.xl },

  messageRow: { flexDirection: 'row', marginBottom: Spacing.md, alignItems: 'flex-end', maxWidth: '82%' },
  messageRowLeft: { alignSelf: 'flex-start' },
  messageRowRight: { alignSelf: 'flex-end', justifyContent: 'flex-end' },

  chatAvatar: { marginRight: Spacing.xs, marginBottom: 2 },
  bubble: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radii.card, maxWidth: '100%' },
  bubbleLeft: { backgroundColor: Colors.card, borderBottomLeftRadius: 4, ...Shadows.card },
  bubbleRight: { backgroundColor: Colors.primary, borderBottomRightRadius: 4 },

  imageBubbleContainer: {
    borderRadius: Radii.sm,
    overflow: 'hidden',
    marginBottom: 4,
  },
  bubbleImage: {
    width: 220,
    height: 160,
    borderRadius: Radii.sm,
  },

  messageText: { ...Typography.body2, lineHeight: 20 },
  messageTextLeft: { color: Colors.textPrimary },
  messageTextRight: { color: Colors.textWhite },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaRowLeft: { alignSelf: 'flex-start' },
  metaRowRight: { alignSelf: 'flex-end' },
  metaTime: { ...Typography.caption, fontSize: 10 },
  metaTimeLeft: { color: Colors.textMuted },
  metaTimeRight: { color: 'rgba(255,255,255,0.75)' },
  receiptIcon: { marginLeft: 2 },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyTitle: { ...Typography.title3, color: Colors.textPrimary, marginTop: Spacing.sm },
  emptyDesc: { ...Typography.body2, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  thumbnailPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    gap: Spacing.sm,
  },
  thumbnailImg: { width: 44, height: 44, borderRadius: Radii.xs },
  thumbnailText: { ...Typography.caption, color: Colors.textPrimary, flex: 1 },
  thumbnailRemove: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.xs,
    gap: Spacing.sm,
  },
  uploadingText: { ...Typography.caption, color: Colors.textSecondary },

  inputBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mediaButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: Colors.inputBg,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    color: Colors.textPrimary,
    ...Typography.body2,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: Radii.full,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.floating,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
    opacity: 0.5,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: Spacing.sm,
  },
  modalImage: {
    width: '92%',
    height: '75%',
  },
});
