/**
 * ConnectGig — Real-Time Chat Service
 * Supports live Firestore listeners, photo uploads to Firebase Storage,
 * conversation feeds with unread counters, and fallback simulated offline mode.
 */

import { db, storage, IS_FIREBASE_ENABLED } from './firebase';
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { ChatMessage, Conversation } from '../types/chat';

export interface SendMessageParams {
  conversationId: string;
  senderId: string;
  senderName?: string;
  text: string;
  imageUrl?: string | null;
  recipientId: string;
  recipientName?: string;
  requestId?: string;
}

// ── In-Memory Simulation State for Offline / Demo Mode ───────────────────────
const INITIAL_MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    clientId: 'mock-client-uid',
    providerId: 'prov_david',
    clientName: 'Alex Morgan',
    providerName: 'David Chen',
    lastMessage: "I'll be there in 10 minutes",
    lastMessageAt: Date.now() - 2 * 60 * 1000,
    lastSenderId: 'prov_david',
    unreadCountClient: 2,
    unreadCountProvider: 0,
    online: true,
  },
  {
    id: 'conv_2',
    clientId: 'mock-client-uid',
    providerId: 'prov_sarah',
    clientName: 'Alex Morgan',
    providerName: 'Sarah Jenkins',
    lastMessage: 'The cleaning is complete! Please check.',
    lastMessageAt: Date.now() - 60 * 60 * 1000,
    lastSenderId: 'prov_sarah',
    unreadCountClient: 0,
    unreadCountProvider: 0,
    online: true,
  },
  {
    id: 'conv_3',
    clientId: 'mock-client-uid',
    providerId: 'prov_marcus',
    clientName: 'Alex Morgan',
    providerName: 'Marcus Rivera',
    lastMessage: 'Sure, I can help with that tomorrow.',
    lastMessageAt: Date.now() - 24 * 60 * 60 * 1000,
    lastSenderId: 'prov_marcus',
    unreadCountClient: 0,
    unreadCountProvider: 0,
    online: false,
  },
];

const INITIAL_MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  conv_1: [
    {
      id: 'm1_1',
      conversationId: 'conv_1',
      senderId: 'prov_david',
      senderName: 'David Chen',
      text: 'Hello! I have accepted your Electrical Repair gig.',
      createdAt: Date.now() - 45 * 60 * 1000,
      isRead: true,
    },
    {
      id: 'm1_2',
      conversationId: 'conv_1',
      senderId: 'mock-client-uid',
      senderName: 'Alex Morgan',
      text: 'Great, the breaker panel is on the second floor hallway.',
      createdAt: Date.now() - 30 * 60 * 1000,
      isRead: true,
    },
    {
      id: 'm1_3',
      conversationId: 'conv_1',
      senderId: 'prov_david',
      senderName: 'David Chen',
      text: "Understood! I'll be there in 10 minutes",
      createdAt: Date.now() - 2 * 60 * 1000,
      isRead: false,
    },
  ],
};

let mockConversations = [...INITIAL_MOCK_CONVERSATIONS];
let mockMessagesMap: Record<string, ChatMessage[]> = { ...INITIAL_MOCK_MESSAGES };

const convListeners: ((convs: Conversation[]) => void)[] = [];
const messageListeners: Record<string, ((msgs: ChatMessage[]) => void)[]> = {};

const notifyConvListeners = () => {
  const sorted = [...mockConversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  convListeners.forEach((fn) => fn(sorted));
};

const notifyMsgListeners = (convId: string) => {
  const list = mockMessagesMap[convId] || [];
  const listeners = messageListeners[convId] || [];
  listeners.forEach((fn) => fn([...list]));
};

export const chatService = {
  /**
   * Subscribe to real-time conversation feed for a user (Client or Worker)
   */
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    if (!IS_FIREBASE_ENABLED) {
      convListeners.push(callback);
      // Emit immediately
      callback([...mockConversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt));
      return () => {
        const idx = convListeners.indexOf(callback);
        if (idx !== -1) convListeners.splice(idx, 1);
      };
    }

    // Real Firebase: Query conversations where user is a participant
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const convs: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          convs.push({
            id: docSnap.id,
            clientId: data.clientId,
            providerId: data.providerId,
            clientName: data.clientName || 'Client',
            providerName: data.providerName || 'Provider',
            clientAvatar: data.clientAvatar,
            providerAvatar: data.providerAvatar,
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt?.toMillis ? data.lastMessageAt.toMillis() : Date.now(),
            lastSenderId: data.lastSenderId,
            unreadCountClient: data.unreadCountClient || 0,
            unreadCountProvider: data.unreadCountProvider || 0,
            requestId: data.requestId,
            online: true,
          });
        });
        callback(convs);
      },
      (err) => {
        console.warn('[ConnectGig Chat] Conversations subscription error:', err);
      }
    );
  },

  /**
   * Subscribe to messages inside a specific conversation
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: ChatMessage[]) => void
  ): () => void {
    if (!IS_FIREBASE_ENABLED) {
      if (!messageListeners[conversationId]) {
        messageListeners[conversationId] = [];
      }
      messageListeners[conversationId].push(callback);
      callback(mockMessagesMap[conversationId] || []);
      return () => {
        messageListeners[conversationId] = (messageListeners[conversationId] || []).filter(
          (l) => l !== callback
        );
      };
    }

    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          msgs.push({
            id: docSnap.id,
            conversationId,
            senderId: data.senderId,
            senderName: data.senderName,
            text: data.text || '',
            imageUrl: data.imageUrl || null,
            createdAt: data.createdAt?.toMillis ? data.createdAt.toMillis() : Date.now(),
            isRead: data.isRead ?? false,
          });
        });
        callback(msgs);
      },
      (err) => {
        console.warn('[ConnectGig Chat] Messages subscription error:', err);
      }
    );
  },

  /**
   * Send a chat message (text or image)
   */
  async sendMessage(params: SendMessageParams): Promise<string> {
    const {
      conversationId,
      senderId,
      senderName,
      text,
      imageUrl,
      recipientId,
      recipientName,
      requestId,
    } = params;

    const displaySummary = imageUrl && !text.trim() ? '📷 Photo' : text.trim();

    if (!IS_FIREBASE_ENABLED) {
      const msgId = `mock_msg_${Date.now()}`;
      const newMsg: ChatMessage = {
        id: msgId,
        conversationId,
        senderId,
        senderName: senderName || 'You',
        text: text.trim(),
        imageUrl: imageUrl || null,
        createdAt: Date.now(),
        isRead: false,
      };

      if (!mockMessagesMap[conversationId]) {
        mockMessagesMap[conversationId] = [];
      }
      mockMessagesMap[conversationId].push(newMsg);
      notifyMsgListeners(conversationId);

      // Update or create mock conversation
      let conv = mockConversations.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = displaySummary;
        conv.lastMessageAt = Date.now();
        conv.lastSenderId = senderId;
      } else {
        conv = {
          id: conversationId,
          clientId: senderId,
          providerId: recipientId,
          clientName: senderName || 'Client',
          providerName: recipientName || 'Provider',
          lastMessage: displaySummary,
          lastMessageAt: Date.now(),
          lastSenderId: senderId,
          unreadCountClient: 0,
          unreadCountProvider: 1,
          online: true,
          requestId,
        };
        mockConversations.unshift(conv);
      }
      notifyConvListeners();

      // Trigger automatic realistic reply in simulated mode after 1.8s
      setTimeout(() => {
        const replyId = `mock_reply_${Date.now()}`;
        const autoReply: ChatMessage = {
          id: replyId,
          conversationId,
          senderId: recipientId,
          senderName: recipientName || 'Provider',
          text: imageUrl
            ? 'Thanks for the photo! That gives me a clear picture of what is needed.'
            : 'Got your message! On it right away.',
          imageUrl: null,
          createdAt: Date.now(),
          isRead: true,
        };
        mockMessagesMap[conversationId]?.push(autoReply);
        notifyMsgListeners(conversationId);

        if (conv) {
          conv.lastMessage = autoReply.text;
          conv.lastMessageAt = Date.now();
          conv.lastSenderId = recipientId;
          conv.unreadCountClient = (conv.unreadCountClient || 0) + 1;
          notifyConvListeners();
        }
      }, 1800);

      return msgId;
    }

    // Real Firebase write
    const messagesCol = collection(db, 'conversations', conversationId, 'messages');
    const msgDoc = await addDoc(messagesCol, {
      conversationId,
      senderId,
      senderName: senderName || '',
      text: text.trim(),
      imageUrl: imageUrl || null,
      createdAt: serverTimestamp(),
      isRead: false,
    });

    // Update conversation metadata
    const convRef = doc(db, 'conversations', conversationId);
    await setDoc(
      convRef,
      {
        conversationId,
        participantIds: [senderId, recipientId],
        clientId: senderId,
        providerId: recipientId,
        clientName: senderName || 'Client',
        providerName: recipientName || 'Provider',
        lastMessage: displaySummary,
        lastMessageAt: serverTimestamp(),
        lastSenderId: senderId,
        unreadCountProvider: increment(1),
        requestId: requestId || null,
      },
      { merge: true }
    );

    return msgDoc.id;
  },

  /**
   * Mark conversation as read for the current user
   */
  async markConversationAsRead(
    conversationId: string,
    role: 'client' | 'provider' | 'worker'
  ): Promise<void> {
    if (!IS_FIREBASE_ENABLED) {
      const conv = mockConversations.find((c) => c.id === conversationId);
      if (conv) {
        if (role === 'client') conv.unreadCountClient = 0;
        else conv.unreadCountProvider = 0;
        notifyConvListeners();
      }
      return;
    }

    try {
      const convRef = doc(db, 'conversations', conversationId);
      const updateData =
        role === 'client' ? { unreadCountClient: 0 } : { unreadCountProvider: 0 };
      await updateDoc(convRef, updateData);
    } catch (e) {
      console.warn('[ConnectGig Chat] Error marking conversation read:', e);
    }
  },

  /**
   * Upload an image attachment to Firebase Storage
   */
  async uploadChatImage(conversationId: string, localUri: string): Promise<string> {
    if (!IS_FIREBASE_ENABLED) {
      // Return local URI for immediate preview in offline / mock mode
      return localUri;
    }

    const response = await fetch(localUri);
    const blob = await response.blob();
    const filename = `chat_${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const storageRef = ref(storage, `chats/${conversationId}/${filename}`);

    const uploadTask = uploadBytesResumable(storageRef, blob, {
      contentType: 'image/jpeg',
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (err) => reject(err),
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  },
};
