import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export async function saveToken(token) {
  if (Platform.OS === 'web') {
    localStorage.setItem('userToken', token);
  } else {
    await SecureStore.setItemAsync('userToken', token);
  }
}

export async function getToken() {
  if (Platform.OS === 'web') {
    return localStorage.getItem('userToken');
  } else {
    return await SecureStore.getItemAsync('userToken');
  }
}

export async function removeToken() {
  if (Platform.OS === 'web') {
    localStorage.removeItem('userToken');
  } else {
    await SecureStore.deleteItemAsync('userToken');
  }
}
