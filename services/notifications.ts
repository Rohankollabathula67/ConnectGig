/**
 * ConnectGig — Push Notification Services (§6.4, §8.0)
 * Manages device tokens, incoming foreground payloads, and deep link routing.
 *
 * ⚠️  expo-notifications v57 ships ExpoTopicSubscriptionModule which is a
 *     native-only module absent from Expo Go. We guard the import so this
 *     service gracefully no-ops in Expo Go instead of crashing the bundle.
 */

import Constants from 'expo-constants';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// ── Lazy-load expo-notifications (native module unavailable in Expo Go) ──────
// Skip the require entirely in Expo Go — expo-notifications throws during init
// because ExpoTopicSubscriptionModule is absent. Avoids all cascading warnings.
const IS_EXPO_GO = Constants.appOwnership === 'expo';
let Notifications: typeof import('expo-notifications') | null = null;
if (!IS_EXPO_GO) {
  try {
    Notifications = require('expo-notifications');
    Notifications!.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    console.error('[Notifications] expo-notifications native module unavailable — running without push notifications.');
  }
}

export type PushNotificationsService = typeof pushNotificationsService;

export const pushNotificationsService = {
  /**
   * Register device for FCM/Expo Push Notifications.
   * Returns null in Expo Go (graceful degradation).
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (!Notifications) return null;

    if (Platform.OS === 'web') {
      console.log('[Notifications] Push notifications not supported on Web.');
      return null;
    }

    // Remote notifications were removed from Expo Go in SDK 53+
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      console.log('[Notifications] Running in Expo Go — remote notifications require a development build.');
      return 'ExponentPushToken[expo-go-dev-mock-token]';
    }

    try {
      // Check existing permissions status
      const existing: any = await Notifications.getPermissionsAsync();
      let isGranted = Boolean(existing?.granted ?? existing?.status === 'granted');

      if (!isGranted) {
        const requested: any = await Notifications.requestPermissionsAsync();
        isGranted = Boolean(requested?.granted ?? requested?.status === 'granted');
      }

      if (!isGranted) {
        console.warn('[Notifications] Failed to obtain notification permissions.');
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log(`[Notifications] Token acquired: ${tokenData.data}`);

      // Setup notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3B6FF4',
        });
      }

      return tokenData.data;
    } catch (error) {
      console.error('[Notifications] Registration failed:', error);
      return null;
    }
  },

  /**
   * Route deep links based on notification taps.
   */
  handleNotificationResponse(response: any) {
    const data = response?.notification?.request?.content?.data;
    console.log('[Notifications] Tapped response data:', data);

    const requestId = (data?.requestId ?? undefined) as string | undefined;
    const status = (data?.status ?? undefined) as string | undefined;

    if (!requestId) return;

    if (status === 'searching') {
      router.push('/searching');
    } else if (status && ['accepted', 'in_progress'].includes(status)) {
      router.push('/job-tracking');
    } else {
      router.push('/notifications');
    }
  },
};
