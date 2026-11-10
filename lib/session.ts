import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const sessionTokenKey = 'trail-log-session-token';

export function getSessionToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(sessionTokenKey);
  }
  return SecureStore.getItemAsync(sessionTokenKey);
}

export function saveSessionToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    return AsyncStorage.setItem(sessionTokenKey, token);
  }
  return SecureStore.setItemAsync(sessionTokenKey, token);
}

export function clearSessionToken(): Promise<void> {
  if (Platform.OS === 'web') {
    return AsyncStorage.removeItem(sessionTokenKey);
  }
  return SecureStore.deleteItemAsync(sessionTokenKey);
}
