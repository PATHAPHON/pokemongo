import {
  getDatabase,
  saveStoredTrainerProfile,
  insertCaughtPokemon,
} from './database/index';
import { TrainerProfile, CaughtPokemon } from '@/shared/types';
import { getArtworkUrl } from '@/shared/constants/kanto-pokemon';

interface AuthUser {
  id: string;
  username: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const DEFAULT_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateMockToken(username: string): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `mock_jwt_${username}_${timestamp}_${randomPart}`;
}

export function parseMockToken(
  token: string
): { username: string; timestamp: number } | null {
  if (!token || typeof token !== 'string' || !token.startsWith('mock_jwt_')) {
    return null;
  }
  const parts = token.slice('mock_jwt_'.length).split('_');
  if (parts.length >= 2) {
    const last = parts[parts.length - 1];
    const secondLast = parts[parts.length - 2];
    if (/^\d+$/.test(secondLast)) {
      const username = parts.slice(0, parts.length - 2).join('_');
      if (username) {
        return { username, timestamp: parseInt(secondLast, 10) };
      }
    }
    if (/^\d+$/.test(last)) {
      const username = parts.slice(0, parts.length - 1).join('_');
      if (username) {
        return { username, timestamp: parseInt(last, 10) };
      }
    }
  }
  return null;
}

/**
 * Checks whether a mock auth token has expired based on TTL (default 7 days).
 */
export function isTokenExpired(
  token: string,
  maxAgeMs: number = DEFAULT_TOKEN_TTL_MS
): boolean {
  const parsed = parseMockToken(token);
  if (!parsed) {
    return true;
  }
  const now = Date.now();
  return now - parsed.timestamp > maxAgeMs;
}

/**
 * Mock Auth API: Validate token endpoint
 * Simulates POST /api/auth/validate
 */
export async function mockValidateTokenApi(
  token: string
): Promise<{ valid: boolean; user?: any; error?: string }> {
  await delay(100);

  if (!token || typeof token !== 'string') {
    return {
      valid: false,
      error: 'กรุณาระบุโทเค็น',
    };
  }

  const parsed = parseMockToken(token);
  if (!parsed) {
    return {
      valid: false,
      error: 'รูปแบบโทเค็นไม่ถูกต้อง',
    };
  }

  if (isTokenExpired(token)) {
    return {
      valid: false,
      error: 'โทเค็นหมดอายุแล้ว',
    };
  }

  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      id: string;
      username: string;
    }>(
      'SELECT id, username FROM auth_users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [parsed.username]
    );

    if (row) {
      return {
        valid: true,
        user: {
          id: row.id,
          username: row.username,
          name: row.username,
        },
      };
    }
  } catch {
    // Database query failed or unavailable, fallback to parsed user
  }

  return {
    valid: true,
    user: {
      id: `trainer-${parsed.username.toLowerCase()}`,
      username: parsed.username,
      name: parsed.username,
    },
  };
}

/**
 * Mock Auth API: Login endpoint
 * Simulates POST /api/auth/login with 500ms network delay
 */
export async function mockLoginApi(
  username: string,
  password: string
): Promise<AuthResponse> {
  await delay(500);

  const cleanUser = username.trim();
  const cleanPass = password.trim();

  if (!cleanUser || !cleanPass) {
    return {
      success: false,
      error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน',
    };
  }

  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      id: string;
      username: string;
      password: string;
    }>('SELECT * FROM auth_users WHERE LOWER(username) = LOWER(?) LIMIT 1', [
      cleanUser,
    ]);

    if (!row || row.password !== cleanPass) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
      };
    }

    const token = generateMockToken(row.username);
    return {
      success: true,
      token,
      user: {
        id: row.id,
        username: row.username,
        name: row.username,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ',
    };
  }
}

/**
 * Mock Auth API: Register endpoint
 * Simulates POST /api/auth/register with 500ms network delay
 */
export async function mockRegisterApi(
  username: string,
  password: string,
  studentId?: string,
  faculty?: string
): Promise<AuthResponse> {
  await delay(500);

  const cleanUser = username.trim();
  const cleanPass = password.trim();

  if (cleanUser.length < 3) {
    return {
      success: false,
      error: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร',
    };
  }

  if (cleanPass.length < 4) {
    return {
      success: false,
      error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร',
    };
  }

  try {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ id: string }>(
      'SELECT id FROM auth_users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [cleanUser]
    );

    if (existing) {
      return {
        success: false,
        error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว',
      };
    }

    const userId = `trainer-${cleanUser.toLowerCase()}-${Date.now().toString(36)}`;
    const nowIso = new Date().toISOString();

    // 1. Insert user
    await db.runAsync(
      'INSERT INTO auth_users (id, username, password, created_at) VALUES (?, ?, ?, ?)',
      [userId, cleanUser, cleanPass, nowIso]
    );

    // 2. Initialize Trainer Profile for this user
    const newProfile: TrainerProfile = {
      id: userId,
      name: cleanUser,
      team: 'valor',
      level: 1,
      experience: 0,
      nextLevelExperience: 1000,
      stardust: 1000,
      pokeCoins: 100,
      starterPokemonId: 25,
      studentId: studentId?.trim() || '65010001',
      faculty: faculty?.trim() || 'Computer and Information Science',
      program: faculty?.trim() || 'Computer and Information Science',
      interests: ['Campus events', 'Mobile UX', 'Pokémon GO'],
      createdAt: nowIso,
    };
    await saveStoredTrainerProfile(newProfile);

    // 3. Grant Starter Pikachu
    const starterPikachu: CaughtPokemon = {
      instanceId: `starter-pikachu-${userId}`,
      pokemonId: 25,
      nickname: 'Pikachu',
      name: 'pikachu',
      artwork: getArtworkUrl(25),
      types: ['electric'],
      rarity: 'rare',
      height: 4,
      weight: 60,
      caughtAt: nowIso,
      location: {
        latitude: 13.7563,
        longitude: 100.5018,
        name: 'Pallet Town',
      },
      favorite: true,
    };
    try {
      await db.runAsync('DELETE FROM caught_pokemon WHERE user_id IS NULL;');
    } catch {}
    await insertCaughtPokemon(starterPikachu, userId);

    const token = generateMockToken(cleanUser);
    return {
      success: true,
      token,
      user: {
        id: userId,
        username: cleanUser,
        name: cleanUser,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'เกิดข้อผิดพลาดในการลงทะเบียน',
    };
  }
}
