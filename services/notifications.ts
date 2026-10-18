/**
 * ConnectGig — Push Notification Services (§6.4, §8.0)
 * Manages device tokens, incoming foreground payloads, and deep link routing.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { router } from 'expo-router';

// Configure default notification handler for foreground reception
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const pushNotificationsService = {
  /**
   * Register device for FCM/Expo Push Notifications
   */
  async registerForPushNotificationsAsync(): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('[Notifications] Push notifications not supported on Web.');
      return null;
    }

    // Verify physical device / dev build status
    // Remote notifications were removed from Expo Go in SDK 53+
    const isExpoGo = Constants.appOwnership === 'expo';
    if (isExpoGo) {
      console.log('[Notifications] Running in Expo Go — remote notifications require a development build. Using development token.');
      return 'ExponentPushToken[expo-go-dev-mock-token]';
    }

    try {
      // Check existing permissions status
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Ask for permission if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Notifications] Failed to obtain notification permissions.');
        return null;
      }

      // Fetch expo token
      const tokenData = await Notifications.getExpoPushTokenAsync();
      console.log(`[Notifications] Token acquired: ${tokenData.data}`);

      // Setup platform-specific channels for Android
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
   * Route deep links based on notification taps
   */
  handleNotificationResponse(response: Notifications.NotificationResponse) {
    const data = response.notification.request.content.data;
    console.log('[Notifications] Tapped response data:', data);

    const requestId = data.requestId as string | undefined;
    const status = data.status as string | undefined;

    if (!requestId) return;

    // Navigate to appropriate tracking / details panel
    if (status === 'searching') {
      router.push('/searching');
    } else if (status && ['accepted', 'in_progress'].includes(status)) {
      router.push('/job-tracking');
    } else {
      router.push('/notifications');
    }
  }
};
