import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'To receive task reminders, please enable push notifications for Aura in your device settings.'
      );
      return;
    }

    try {
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        "ae2e214e-f0e7-43c2-89b0-7a41e3920bdf"; // fallback project ID

      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log("Expo Push Token:", token);

      const userJson = await AsyncStorage.getItem('user');
      const user = JSON.parse(userJson);

      if (!user?._id) {
        console.warn("⚠️ No user ID found in storage, cannot send push token.");
        return;
      }

      await apiClient.post('/api/users/pushtoken', {
        userId: user._id,
        pushToken: token,
      });

      console.log("✅ Push token successfully sent to backend.");

    } catch (e) {
      console.error("❌ Failed to get or send push token:", e);
      Alert.alert('Error', 'An error occurred while setting up notifications.');
    }

  } else {
    Alert.alert('Device Required', 'Must use a physical device for Push Notifications.');
  }

  return token;
}
