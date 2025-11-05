import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import apiClient from '../api/apiClient';
import { getToken } from '../api/tokenService'; // ✅ ensures JWT is used

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let expoPushToken;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    Alert.alert('Device Required', 'Must use a physical device for Push Notifications.');
    return;
  }

  // ✅ Request permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    Alert.alert(
      'Permission Required',
      'To receive reminders, please enable push notifications for Aura in your device settings.'
    );
    return;
  }

  try {
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      "ae2e214e-f0e7-43c2-89b0-7a41e3920bdf"; // fallback ID

    // ✅ Get Expo push token
    expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log("Expo Push Token:", expoPushToken);

    // ✅ Get saved JWT token
    const jwt = await getToken();
    if (!jwt) {
      console.warn("⚠️ No JWT token found — user might not be logged in.");
      return;
    }

    // ✅ Send token to backend (auth header auto-added by apiClient)
    const response = await apiClient.put('/api/users/pushtoken', {
      pushToken: expoPushToken,
    });

    console.log("✅ Push token successfully sent to backend:", response.data);

  } catch (error) {
    console.error("❌ Failed to get or send push token:", error.message);
    Alert.alert('Error', 'An error occurred while setting up notifications.');
  }

  return expoPushToken;
}
