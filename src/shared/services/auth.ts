import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import {
  mockLoginApi,
  mockRegisterApi,
  isTokenExpired,
  parseMockToken,
  generateMockToken,
  AuthResponse,
} from './auth-api';
import { getDatabase } from './database/index';

const SESSION_ACCESS_TOKEN_KEY = 'session/access-token';
const SESSION_TOKEN_KEY = 'pokemon_go_session_token';
const TRAINER_ID_KEY = 'pokemon_go_trainer_id';
const LAST_USERNAME_KEY = 'pokemon_go_last_username';

// In-memory fallback for environments without SecureStore
const memoryStorage = new Map<string, string>();

/**
 * Expo SecureStore strictly requires keys containing only alphanumeric characters, '.', '-', and '_'.
 * Replaces invalid characters (e.g. '/') with '_' so syllabus key 'session/access-token' functions natively.
 */
function sanitizeSecureKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

async function setSecureItem(key: string, value: string): Promise<void> {
  memoryStorage.set(key, value);
  const secureKey = sanitizeSecureKey(key);
  try {
    await SecureStore.deleteItemAsync(secureKey).catch(() => {});
    await SecureStore.setItemAsync(secureKey, value);
  } catch (error) {
    console.warn(
      `[Auth] SecureStore setItem failed for key "${secureKey}", falling back to memory:`,
      error
    );
  }
}

async function getSecureItem(key: string): Promise<string | null> {
  if (memoryStorage.has(key)) {
    return memoryStorage.get(key) ?? null;
  }
  const secureKey = sanitizeSecureKey(key);
  try {
    const value = await SecureStore.getItemAsync(secureKey);
    if (value !== null) {
      memoryStorage.set(key, value);
      return value;
    }
    return null;
  } catch (error) {
    console.warn(
      `[Auth] SecureStore getItem failed for key "${secureKey}", checking memory:`,
      error
    );
    return null;
  }
}

async function deleteSecureItem(key: string): Promise<void> {
  memoryStorage.delete(key);
  const secureKey = sanitizeSecureKey(key);
  try {
    await SecureStore.deleteItemAsync(secureKey);
  } catch (error) {
    console.warn(
      `[Auth] SecureStore deleteItem failed for key "${secureKey}":`,
      error
    );
  }
}

// -------------------------------------------------------------
// Public Session API
// -------------------------------------------------------------

export async function saveSessionToken(token: string): Promise<void> {
  await setSecureItem(SESSION_ACCESS_TOKEN_KEY, token);
  await setSecureItem(SESSION_TOKEN_KEY, token);
}

export async function getSessionToken(): Promise<string | null> {
  const token = await getSecureItem(SESSION_ACCESS_TOKEN_KEY);
  if (token) return token;
  return await getSecureItem(SESSION_TOKEN_KEY);
}

export async function deleteSessionToken(): Promise<void> {
  await deleteSecureItem(SESSION_ACCESS_TOKEN_KEY);
  await deleteSecureItem(SESSION_TOKEN_KEY);
}

export async function saveActiveTrainerId(trainerId: string): Promise<void> {
  await setSecureItem(TRAINER_ID_KEY, trainerId);
}

export async function getActiveTrainerId(): Promise<string | null> {
  return await getSecureItem(TRAINER_ID_KEY);
}

export async function saveLastUsername(username: string): Promise<void> {
  await setSecureItem(LAST_USERNAME_KEY, username);
}

export async function getLastUsername(): Promise<string | null> {
  return await getSecureItem(LAST_USERNAME_KEY);
}

export async function clearAuthSession(): Promise<void> {
  await deleteSessionToken();
  await deleteSecureItem(TRAINER_ID_KEY);
  await deleteSecureItem(LAST_USERNAME_KEY);
}

// -------------------------------------------------------------
// Biometric Authentication Helpers
// -------------------------------------------------------------

export interface BiometricsAvailability {
  available: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes?: LocalAuthentication.AuthenticationType[];
  biometryType?: 'facial' | 'fingerprint' | 'iris' | 'none';
}

export async function checkBiometricsAvailable(): Promise<BiometricsAvailability> {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    let biometryType: BiometricsAvailability['biometryType'] = 'none';
    if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
      )
    ) {
      biometryType = 'facial';
    } else if (
      supportedTypes.includes(
        LocalAuthentication.AuthenticationType.FINGERPRINT
      )
    ) {
      biometryType = 'fingerprint';
    } else if (
      supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)
    ) {
      biometryType = 'iris';
    }

    return {
      available: hasHardware && isEnrolled,
      hasHardware,
      isEnrolled,
      supportedTypes,
      biometryType,
    };
  } catch (error) {
    console.warn('[Auth] checkBiometricsAvailable error:', error);
    return {
      available: false,
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      biometryType: 'none',
    };
  }
}

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export async function authenticateWithBiometrics(
  promptMessage: string = 'ยืนยันตัวตนด้วย Touch ID / Face ID เพื่อเข้าสู่ระบบ'
): Promise<BiometricAuthResult> {
  try {
    const availability = await checkBiometricsAvailable();
    if (!availability.hasHardware) {
      return {
        success: false,
        error: 'อุปกรณ์นี้ไม่รองรับการตรวจสอบชีวมิติ (Touch ID / Face ID)',
      };
    }
    if (!availability.isEnrolled) {
      return {
        success: false,
        error: 'ยังไม่ได้ลงทะเบียนลายนิ้วมือหรือใบหน้าในอุปกรณ์นี้',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'ยกเลิก',
      fallbackLabel: 'ใช้รหัสผ่าน',
      disableDeviceFallback: false,
    });

    if (result.success) {
      return { success: true };
    }

    const errorMsg =
      result.error === 'user_cancel'
        ? 'ยกเลิกการยืนยันตัวตน'
        : result.error === 'user_fallback'
          ? 'เลือกใช้รหัสผ่าน'
          : result.error || 'การยืนยันตัวตนล้มเหลว';

    return {
      success: false,
      error: errorMsg,
      warning: result.warning,
    };
  } catch (error: any) {
    console.warn('[Auth] authenticateWithBiometrics failed:', error);
    return {
      success: false,
      error: error?.message || 'เกิดข้อผิดพลาดในการตรวจสอบชีวมิติ',
    };
  }
}

// -------------------------------------------------------------
// High-Level Authentication & Session Operations
// -------------------------------------------------------------

export interface User {
  id: string;
  username: string;
  name: string;
  studentId?: string;
  faculty?: string;
  program?: string;
  team?: 'valor' | 'mystic' | 'instinct' | 'none';
  level?: number;
  avatarUrl?: string;
}

export type SessionState =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | {
      status: 'authenticated';
      accessToken: string;
      token: string;
      trainerId: string;
      user: User;
    };

export async function getCurrentUser(token: string): Promise<User | null> {
  if (!token || isTokenExpired(token)) {
    return null;
  }
  const parsed = parseMockToken(token);
  if (!parsed) {
    return null;
  }

  try {
    const db = await getDatabase();
    const userRow = await db.getFirstAsync<{ id: string; username: string }>(
      'SELECT id, username FROM auth_users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [parsed.username]
    );

    if (userRow) {
      const profile = await db.getFirstAsync<any>(
        'SELECT * FROM trainer_profile WHERE id = ? OR LOWER(name) = LOWER(?) ORDER BY created_at DESC LIMIT 1',
        [userRow.id, userRow.username]
      );

      return {
        id: userRow.id,
        username: userRow.username,
        name: profile?.name || userRow.username,
        studentId: profile?.student_id ?? '65010001',
        faculty: profile?.faculty ?? 'Computer and Information Science',
        program: profile?.program ?? profile?.faculty ?? 'Computer and Information Science',
        team: profile?.team ?? 'valor',
        level: profile?.level ?? 1,
        avatarUrl: profile?.avatar_url ?? undefined,
      };
    }
  } catch (err) {
    console.warn('[Auth] getCurrentUser error:', err);
  }

  return {
    id: `trainer-${parsed.username.toLowerCase()}`,
    username: parsed.username,
    name: parsed.username,
    studentId: '65010001',
    faculty: 'Computer and Information Science',
    program: 'Computer and Information Science',
    team: 'valor',
    level: 1,
  };
}

export async function restoreSession(): Promise<SessionState> {
  const token = await getSessionToken();

  if (!token) {
    return { status: 'anonymous' };
  }

  // Validate token expiration (default 7-day TTL)
  if (isTokenExpired(token)) {
    console.warn('[Auth] Stored session token is expired, clearing session');
    await clearAuthSession();
    return { status: 'anonymous' };
  }

  const parsed = parseMockToken(token);
  if (!parsed) {
    console.warn('[Auth] Stored session token format is invalid, clearing session');
    await clearAuthSession();
    return { status: 'anonymous' };
  }

  const user = await getCurrentUser(token);
  if (!user) {
    console.warn('[Auth] Stored session token cannot resolve user, clearing session');
    await clearAuthSession();
    return { status: 'anonymous' };
  }

  // Authoritatively sync user state to storage
  await saveActiveTrainerId(user.id);
  await saveLastUsername(user.username);

  return {
    status: 'authenticated',
    accessToken: token,
    token,
    trainerId: user.id,
    user,
  };
}

export const restoreSessionState = restoreSession;

export async function loginWithCredentials(
  username: string,
  password: string
): Promise<AuthResponse> {
  const result = await mockLoginApi(username, password);
  if (result.success && result.token && result.user) {
    await saveSessionToken(result.token);
    await saveActiveTrainerId(result.user.id);
    await saveLastUsername(result.user.username);
  }
  return result;
}

export async function registerAccount(
  username: string,
  password: string,
  studentId?: string,
  faculty?: string
): Promise<AuthResponse> {
  const result = await mockRegisterApi(username, password, studentId, faculty);
  if (result.success && result.token && result.user) {
    await saveSessionToken(result.token);
    await saveActiveTrainerId(result.user.id);
    await saveLastUsername(result.user.username);
  }
  return result;
}

export async function loginWithBiometrics(
  targetUsername?: string
): Promise<AuthResponse> {
  const bioResult = await authenticateWithBiometrics();
  if (!bioResult.success) {
    return {
      success: false,
      error: bioResult.error || 'การยืนยันตัวตนด้วยชีวมิติไม่สำเร็จ',
    };
  }

  // Find user by specified username or last logged in user
  let username = targetUsername?.trim() || (await getLastUsername());
  const db = await getDatabase();

  let userRow: { id: string; username: string } | null = null;
  if (username) {
    userRow = await db.getFirstAsync<{ id: string; username: string }>(
      'SELECT id, username FROM auth_users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [username]
    );
  }

  if (!userRow) {
    // Fallback to most recently registered user
    userRow = await db.getFirstAsync<{ id: string; username: string }>(
      'SELECT id, username FROM auth_users ORDER BY created_at DESC LIMIT 1'
    );
  }

  if (!userRow) {
    // Fallback to profile in trainer_profile table if present
    const profile = await db.getFirstAsync<{ id: string; name: string }>(
      'SELECT id, name FROM trainer_profile ORDER BY created_at DESC LIMIT 1'
    );
    if (profile) {
      userRow = { id: profile.id, username: profile.name };
    }
  }

  if (!userRow) {
    return {
      success: false,
      error: 'ไม่พบบัญชีผู้ใช้ในระบบ กรุณาเข้าสู่ระบบด้วยรหัสผ่านก่อน',
    };
  }

  const token = generateMockToken(userRow.username);
  await saveSessionToken(token);
  await saveActiveTrainerId(userRow.id);
  await saveLastUsername(userRow.username);

  return {
    success: true,
    token,
    user: {
      id: userRow.id,
      username: userRow.username,
      name: userRow.username,
    },
  };
}
