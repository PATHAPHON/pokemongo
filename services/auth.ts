import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_TOKEN_KEY = 'pokemon_go_session_token';
const TRAINER_ID_KEY = 'pokemon_go_trainer_id';

// In-memory fallback for environments without SecureStore (e.g. Server-Side or Web without localStorage)
const memoryStorage = new Map<string, string>();

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Fallback to memory
    }
    memoryStorage.set(key, value);
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn(`[Auth] SecureStore setItem failed for key "${key}", falling back to memory:`, error);
    memoryStorage.set(key, value);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Fallback to memory
    }
    return memoryStorage.get(key) ?? null;
  }

  try {
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;
    return memoryStorage.get(key) ?? null;
  } catch (error) {
    console.warn(`[Auth] SecureStore getItem failed for key "${key}", checking memory:`, error);
    return memoryStorage.get(key) ?? null;
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Ignore
    }
    memoryStorage.delete(key);
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[Auth] SecureStore deleteItem failed for key "${key}":`, error);
  }
  memoryStorage.delete(key);
}

// -------------------------------------------------------------
// Public Session API
// -------------------------------------------------------------

export async function saveSessionToken(token: string): Promise<void> {
  await setSecureItem(SESSION_TOKEN_KEY, token);
}

export async function getSessionToken(): Promise<string | null> {
  return await getSecureItem(SESSION_TOKEN_KEY);
}

export async function deleteSessionToken(): Promise<void> {
  await deleteSecureItem(SESSION_TOKEN_KEY);
}

export async function saveActiveTrainerId(trainerId: string): Promise<void> {
  await setSecureItem(TRAINER_ID_KEY, trainerId);
}

export async function getActiveTrainerId(): Promise<string | null> {
  return await getSecureItem(TRAINER_ID_KEY);
}

export async function clearAuthSession(): Promise<void> {
  await deleteSessionToken();
  await deleteSecureItem(TRAINER_ID_KEY);
}
