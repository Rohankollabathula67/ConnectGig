/**
 * ConnectGig — useNotifications Hook (§6.4)
 * Manages device permissions, tokens, and notification response listeners.
 */

import { useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { pushNotificationsService } from '../services/notifications';
import { useAuthStore } from '../store/authStore';
import { db, IS_FIREBASE_ENABLED } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  
  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  useEffect(() => {
    // 1. Get Push Token and save to user profile doc
    pushNotificationsService.registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        if (user?.uid && IS_FIREBASE_ENABLED) {
          // Write FCM token to database
          const collectionName = role === 'provider' ? 'providers' : 'users';
          const docRef = doc(db, collectionName, user.uid);
          updateDoc(docRef, { fcmToken: token }).catch((err) => {
            console.warn('[useNotifications] Failed to save token to database:', err);
          });
        }
      }
    });

    // 2. Listener for incoming foreground notification payloads
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[useNotifications] Notification received in foreground:', notification);
      setNotification(notification);
    });

    // 3. Listener for user tapping/interacting with notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      pushNotificationsService.handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user?.uid, role]);

  return {
    expoPushToken,
    notification,
  };
}
