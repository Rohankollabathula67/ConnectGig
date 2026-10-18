/**
 * ConnectGig — useNotifications Hook (§6.4)
 * Manages device permissions, tokens, and notification response listeners.
 *
 * ⚠️  expo-notifications v57 added ExpoTopicSubscriptionModule which is a
 *     native-only module not shipped with Expo Go. We lazily resolve the
 *     module inside effects so that a missing native binding never crashes
 *     the JS bundle — it degrades gracefully with a console warning.
 */

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { db, IS_FIREBASE_ENABLED } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';

import Constants from 'expo-constants';

// Skip expo-notifications entirely in Expo Go — it throws on init because
// ExpoTopicSubscriptionModule is absent, causing cascading console noise.
const IS_EXPO_GO = Constants.appOwnership === 'expo';
let Notifications: typeof import('expo-notifications') | null = null;
if (!IS_EXPO_GO) {
  try {
    Notifications = require('expo-notifications');
  } catch {
    console.warn('[useNotifications] expo-notifications native module unavailable — notifications disabled.');
  }
}

// Pull the service lazily too so it benefits from the same guard above.
let pushNotificationsService: import('../services/notifications').PushNotificationsService | null = null;
try {
  const mod = require('../services/notifications');
  pushNotificationsService = mod.pushNotificationsService ?? null;
} catch {
  console.warn('[useNotifications] pushNotificationsService unavailable.');
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<any>(null);

  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  const user = useAuthStore((state) => state.user);
  const role = user?.role;

  useEffect(() => {
    if (!Notifications || !pushNotificationsService) return;

    // 1. Get Push Token and save to user profile doc
    pushNotificationsService.registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        if (user?.uid && IS_FIREBASE_ENABLED) {
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
      pushNotificationsService?.handleNotificationResponse(response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [user?.uid, role]);

  return {
    expoPushToken,
    notification,
  };
}
