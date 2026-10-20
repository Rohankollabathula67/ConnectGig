/**
 * ConnectGig — Notification Store (§3.9)
 * Zustand store to manage real-time list of in-app notifications and unread badges.
 */

import { create } from 'zustand';
import { firestoreService } from '../services/firestore';
import type { AppNotification } from '../types/notification';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  activeListener: (() => void) | null;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  activeListener: null,

  subscribeToNotifications: (userId) => {
    // Unsubscribe existing
    get().unsubscribeFromNotifications();

    const unsubscribe = firestoreService.subscribeToNotifications(
      userId,
      (list) => {
        const sorted = [...list].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const unread = sorted.filter((n) => !n.isRead).length;
        set({ notifications: sorted, unreadCount: unread });
      }
    );

    set({ activeListener: unsubscribe });
  },

  unsubscribeFromNotifications: () => {
    const listener = get().activeListener;
    if (listener) {
      listener();
      set({ activeListener: null, notifications: [], unreadCount: 0 });
    }
  },

  markAllAsRead: () => {
    const updated = get().notifications.map((n) => ({ ...n, isRead: true }));
    set({ notifications: updated, unreadCount: 0 });
  },

  markAsRead: (id: string) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    const unread = updated.filter((n) => !n.isRead).length;
    set({ notifications: updated, unreadCount: unread });
  },
}));
