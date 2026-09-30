import * as SecureStore from 'expo-secure-store';
import {
  mockLoginApi,
  mockRegisterApi,
  AuthResponse,
} from './auth-api';

const SESSION_TOKEN_KEY = 'pokemon_go_session_token';
const TRAINER_ID_KEY = 'pokemon_go_trainer_id';

// In-memory fallback for environments without SecureStore
const memoryStorage = new Map<string, string>();

async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn(
      `[Auth] SecureStore setItem failed for key "${key}", falling back to memory:`,
      error
    );
    memoryStorage.set(key, value);
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;
    return memoryStorage.get(key) ?? null;
  } catch (error) {
    console.warn(
      `[Auth] SecureStore getItem failed for key "${key}", checking memory:`,
      error
    );
    return memoryStorage.get(key) ?? null;
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(
      `[Auth] SecureStore deleteItem failed for key "${key}":`,
      error
    );
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

// -------------------------------------------------------------
// High-Level Authentication & Session Operations
// -------------------------------------------------------------

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; token: string; trainerId: string };

export async function restoreSessionState(): Promise<SessionState> {
  const token = await getSessionToken();
  const trainerId = await getActiveTrainerId();

  if (!token || !trainerId) {
    return { status: 'anonymous' };
  }

  return {
    status: 'authenticated',
    token,
    trainerId,
  };
}

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<AuthResponse> {
  const result = await mockLoginApi(username, password);
  if (result.success && result.token && result.user) {
    await saveSessionToken(result.token);
    await saveActiveTrainerId(result.user.id);
  }
  return result;
}

export async function registerAccount(
  username: string,
  password: string
): Promise<AuthResponse> {
  const result = await mockRegisterApi(username, password);
  if (result.success && result.token && result.user) {
    await saveSessionToken(result.token);
    await saveActiveTrainerId(result.user.id);
  }
  return result;
}
