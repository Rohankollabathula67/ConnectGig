/**
 * ConnectGig — Chat Types
 */

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  text: string;
  imageUrl?: string | null;
  createdAt: number;
  isRead: boolean;
  pending?: boolean;
}

export interface Conversation {
  id: string;
  clientId: string;
  providerId: string;
  clientName: string;
  providerName: string;
  clientAvatar?: string;
  providerAvatar?: string;
  lastMessage: string;
  lastMessageAt: number;
  lastSenderId?: string;
  unreadCountClient: number;
  unreadCountProvider: number;
  requestId?: string;
  online?: boolean;
}
