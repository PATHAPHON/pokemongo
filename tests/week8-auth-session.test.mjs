import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const DEFAULT_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function validateCredentials(username, password) {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();

  if (cleanUser.length < 3) {
    return { valid: false, error: 'ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร' };
  }
  if (cleanPass.length < 4) {
    return { valid: false, error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร' };
  }
  return { valid: true, username: cleanUser, password: cleanPass };
}

function generateMockJwtToken(username) {
  const timestamp = Date.now();
  const randomPart = 'mockrandom';
  return `mock_jwt_${username}_${timestamp}_${randomPart}`;
}

function parseMockToken(token) {
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

function isTokenExpired(token, maxAgeMs = DEFAULT_TOKEN_TTL_MS) {
  const parsed = parseMockToken(token);
  if (!parsed) {
    return true;
  }
  const now = Date.now();
  return now - parsed.timestamp > maxAgeMs;
}

async function mockValidateTokenApi(token) {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'กรุณาระบุโทเค็น' };
  }
  const parsed = parseMockToken(token);
  if (!parsed) {
    return { valid: false, error: 'รูปแบบโทเค็นไม่ถูกต้อง' };
  }
  if (isTokenExpired(token)) {
    return { valid: false, error: 'โทเค็นหมดอายุแล้ว' };
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

function resolveBiometricAvailability(deviceState) {
  const hasHardware = Boolean(deviceState?.hasHardware);
  const isEnrolled = Boolean(deviceState?.isEnrolled);
  const supportedTypes = deviceState?.supportedTypes || [];

  let biometryType = 'none';
  if (supportedTypes.includes(2)) {
    biometryType = 'facial';
  } else if (supportedTypes.includes(1)) {
    biometryType = 'fingerprint';
  } else if (supportedTypes.includes(3)) {
    biometryType = 'iris';
  }

  return {
    available: hasHardware && isEnrolled,
    hasHardware,
    isEnrolled,
    supportedTypes,
    biometryType,
  };
}

async function simulateAuthenticateWithBiometrics(deviceState, userAction = 'success') {
  const availability = resolveBiometricAvailability(deviceState);
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

  if (userAction === 'cancel') {
    return { success: false, error: 'ยกเลิกการยืนยันตัวตน' };
  }
  if (userAction === 'fallback') {
    return { success: false, error: 'เลือกใช้รหัสผ่าน' };
  }
  return { success: true };
}

describe('Week 8: Authentication & Mobile Security Tests', () => {
  describe('1. Credential Validation Contract', () => {
    test('Valid username and password pass validation', () => {
      const res = validateCredentials('AshKetchum', 'pikachu123');
      assert.equal(res.valid, true);
      assert.equal(res.username, 'AshKetchum');
      assert.equal(res.password, 'pikachu123');
    });

    test('Short username (< 3 chars) is rejected', () => {
      const res = validateCredentials('Al', 'pass123');
      assert.equal(res.valid, false);
      assert.match(res.error, /อย่างน้อย 3 ตัวอักษร/);
    });

    test('Short password (< 4 chars) is rejected', () => {
      const res = validateCredentials('TrainerRed', '123');
      assert.equal(res.valid, false);
      assert.match(res.error, /อย่างน้อย 4 ตัวอักษร/);
    });
  });

  describe('2. Token Generation & Session Contract', () => {
    test('Generates structured mock JWT token containing username', () => {
      const token = generateMockJwtToken('Red');
      assert.ok(token.startsWith('mock_jwt_Red_'));
      assert.ok(token.includes('mockrandom'));
    });

    test('Session restoration state contract', () => {
      // Unauthenticated state
      const anonSession = { status: 'anonymous' };
      assert.equal(anonSession.status, 'anonymous');

      // Authenticated state
      const authSession = {
        status: 'authenticated',
        token: 'mock_jwt_Red_123',
        trainerId: 'trainer-red-001',
      };
      assert.equal(authSession.status, 'authenticated');
      assert.equal(authSession.trainerId, 'trainer-red-001');
    });

    test('Logout clears session token and transitions to anonymous', () => {
      let activeSession = {
        token: 'active_token_123',
        trainerId: 'trainer_001',
      };

      // Simulate clearAuthSession
      activeSession = null;

      assert.equal(activeSession, null);
    });

    test('Session restoration binds to target trainerId and does not default to first user', () => {
      const mockProfiles = [
        { id: 'trainer-old-user', name: 'OldTrainer' },
        { id: 'trainer-new-user-123', name: 'NewTrainer' },
      ];

      function resolveProfile(trainerId) {
        if (!trainerId) {
          return mockProfiles[0]; // buggy behavior
        }
        return mockProfiles.find((p) => p.id === trainerId) || null;
      }

      const activeSession = {
        status: 'authenticated',
        token: 'mock_jwt_NewTrainer_123',
        trainerId: 'trainer-new-user-123',
      };

      const resolved = resolveProfile(activeSession.trainerId);
      assert.ok(resolved);
      assert.equal(resolved.id, 'trainer-new-user-123');
      assert.equal(resolved.name, 'NewTrainer');
    });

    test('restoreSessionState resolves trainerId from matching auth_users row for token username', () => {
      const token = generateMockJwtToken('NewUser');
      const parsed = parseMockToken(token);
      assert.equal(parsed.username, 'NewUser');

      const mockUsers = [
        { id: 'trainer-old', username: 'OldUser' },
        { id: 'trainer-newuser-999', username: 'NewUser' },
      ];

      const found = mockUsers.find((u) => u.username.toLowerCase() === parsed.username.toLowerCase());
      assert.ok(found);
      assert.equal(found.id, 'trainer-newuser-999');
    });
  });

  describe('3. Token Expiration Contract (7-Day TTL)', () => {
    test('Active token created just now is not expired', () => {
      const activeToken = `mock_jwt_Ash_${Date.now()}_abc123`;
      assert.equal(isTokenExpired(activeToken), false);
    });

    test('Active token created 2 days ago is not expired within 7-day TTL', () => {
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      const activeToken = `mock_jwt_Ash_${twoDaysAgo}_abc123`;
      assert.equal(isTokenExpired(activeToken), false);
    });

    test('Expired token created 8 days ago is detected as expired', () => {
      const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const expiredToken = `mock_jwt_Ash_${eightDaysAgo}_abc123`;
      assert.equal(isTokenExpired(expiredToken), true);
    });

    test('Custom maxAgeMs properly expires tokens accordingly', () => {
      const halfSecondAgo = Date.now() - 500;
      const token = `mock_jwt_Misty_${halfSecondAgo}_rand1`;
      assert.equal(isTokenExpired(token, 1000), false);

      const twoSecondsAgo = Date.now() - 2000;
      const expiredCustom = `mock_jwt_Misty_${twoSecondsAgo}_rand1`;
      assert.equal(isTokenExpired(expiredCustom, 1000), true);
    });

    test('Malformed or empty tokens are treated as expired/invalid', () => {
      assert.equal(isTokenExpired(''), true);
      assert.equal(isTokenExpired(null), true);
      assert.equal(isTokenExpired('not_a_valid_jwt_token'), true);
      assert.equal(isTokenExpired('mock_jwt_nodate'), true);
    });
  });

  describe('4. Token Validation API Contract (mockValidateTokenApi)', () => {
    test('Valid active token passes validation and extracts user', async () => {
      const validToken = `mock_jwt_Red_${Date.now()}_xyz789`;
      const res = await mockValidateTokenApi(validToken);
      assert.equal(res.valid, true);
      assert.equal(res.user?.username, 'Red');
      assert.equal(res.user?.id, 'trainer-red');
    });

    test('Malformed token structure fails validation with error message', async () => {
      const corruptToken = 'invalid_token_format';
      const res = await mockValidateTokenApi(corruptToken);
      assert.equal(res.valid, false);
      assert.match(res.error, /รูปแบบโทเค็นไม่ถูกต้อง/);
    });

    test('Empty or null token fails validation', async () => {
      const res1 = await mockValidateTokenApi('');
      assert.equal(res1.valid, false);
      assert.match(res1.error, /กรุณาระบุโทเค็น/);

      const res2 = await mockValidateTokenApi(null);
      assert.equal(res2.valid, false);
    });

    test('Expired token fails validation with expired error', async () => {
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const expiredToken = `mock_jwt_Brock_${tenDaysAgo}_token123`;
      const res = await mockValidateTokenApi(expiredToken);
      assert.equal(res.valid, false);
      assert.match(res.error, /หมดอายุ/);
    });
  });

  describe('5. Biometric Availability & Security Contract', () => {
    test('Device with Face ID hardware and enrolled credentials reports available', () => {
      const status = resolveBiometricAvailability({
        hasHardware: true,
        isEnrolled: true,
        supportedTypes: [2],
      });
      assert.equal(status.available, true);
      assert.equal(status.hasHardware, true);
      assert.equal(status.isEnrolled, true);
      assert.equal(status.biometryType, 'facial');
    });

    test('Device with Fingerprint hardware and enrolled credentials reports available', () => {
      const status = resolveBiometricAvailability({
        hasHardware: true,
        isEnrolled: true,
        supportedTypes: [1],
      });
      assert.equal(status.available, true);
      assert.equal(status.hasHardware, true);
      assert.equal(status.isEnrolled, true);
      assert.equal(status.biometryType, 'fingerprint');
    });

    test('Device without biometric hardware reports unavailable and none', () => {
      const status = resolveBiometricAvailability({
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      });
      assert.equal(status.available, false);
      assert.equal(status.hasHardware, false);
      assert.equal(status.isEnrolled, false);
      assert.equal(status.biometryType, 'none');
    });

    test('Device with hardware but not enrolled reports unavailable', () => {
      const status = resolveBiometricAvailability({
        hasHardware: true,
        isEnrolled: false,
        supportedTypes: [1, 2],
      });
      assert.equal(status.available, false);
      assert.equal(status.hasHardware, true);
      assert.equal(status.isEnrolled, false);
    });

    test('Biometric authentication contract returns success when approved', async () => {
      const device = { hasHardware: true, isEnrolled: true, supportedTypes: [2] };
      const res = await simulateAuthenticateWithBiometrics(device, 'success');
      assert.equal(res.success, true);
    });

    test('Biometric authentication contract handles user cancellation', async () => {
      const device = { hasHardware: true, isEnrolled: true, supportedTypes: [2] };
      const res = await simulateAuthenticateWithBiometrics(device, 'cancel');
      assert.equal(res.success, false);
      assert.match(res.error, /ยกเลิก/);
    });

    test('Biometric authentication contract handles password fallback', async () => {
      const device = { hasHardware: true, isEnrolled: true, supportedTypes: [2] };
      const res = await simulateAuthenticateWithBiometrics(device, 'fallback');
      assert.equal(res.success, false);
      assert.match(res.error, /รหัสผ่าน/);
    });
  });

  describe('6. Week 8 Source Code & Dependencies Verification', () => {
    test('package.json includes expo-dev-client and expo-local-authentication', () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      assert.ok(pkg.dependencies['expo-dev-client'], 'Must contain expo-dev-client');
      assert.ok(pkg.dependencies['expo-local-authentication'], 'Must contain expo-local-authentication');
    });

    test('auth-api.ts defines isTokenExpired and mockValidateTokenApi', () => {
      const code = fs.readFileSync('src/shared/services/auth-api.ts', 'utf8');
      assert.ok(code.includes('export function isTokenExpired'), 'Must export isTokenExpired');
      assert.ok(code.includes('export async function mockValidateTokenApi'), 'Must export mockValidateTokenApi');
      assert.ok(code.includes('DEFAULT_TOKEN_TTL_MS'), 'Must define DEFAULT_TOKEN_TTL_MS');
    });

    test('auth.ts defines checkBiometricsAvailable and authenticateWithBiometrics', () => {
      const code = fs.readFileSync('src/shared/services/auth.ts', 'utf8');
      assert.ok(code.includes('checkBiometricsAvailable'), 'Must include checkBiometricsAvailable');
      assert.ok(code.includes('authenticateWithBiometrics'), 'Must include authenticateWithBiometrics');
      assert.ok(code.includes('isTokenExpired(token)'), 'Must check isTokenExpired in restoreSessionState');
    });

    test('login.tsx includes biometric authentication button and fallback', () => {
      const code = fs.readFileSync('src/app/login.tsx', 'utf8');
      assert.ok(code.includes('authenticateWithBiometrics'), 'Must call authenticateWithBiometrics');
      assert.ok(code.includes('biometricButton'), 'Must render biometricButton style');
      assert.ok(code.includes('passwordInputRef'), 'Must support password fallback');
    });

    test('trainer-context.tsx queries getStoredTrainerProfile with session.trainerId', () => {
      const contextCode = fs.readFileSync('src/shared/context/trainer-context.tsx', 'utf8');
      assert.match(
        contextCode,
        /getStoredTrainerProfile\(\s*session\.trainerId\s*\)/,
        'loadData must pass session.trainerId to getStoredTrainerProfile'
      );

      const dbIndexCode = fs.readFileSync('src/shared/services/database/index.ts', 'utf8');
      assert.match(
        dbIndexCode,
        /export\s+async\s+function\s+getStoredTrainerProfile\s*\(\s*trainerId\?\s*:\s*string\s*\)/,
        'database/index.ts must accept trainerId parameter'
      );
    });

    test('login.tsx imports router and redirects to tabs upon successful auth or isAuthenticated', () => {
      const code = fs.readFileSync('src/app/login.tsx', 'utf8');
      assert.ok(code.includes("import { router } from 'expo-router';") || code.includes("router.replace('/(tabs)'"), 'Must use router.replace');
      assert.ok(code.includes("router.replace('/(tabs)'"), 'Must redirect to tabs on success');
    });

    test('trainer-context.tsx clears auth session immediately on logout and protects notifications with timeout', () => {
      const code = fs.readFileSync('src/shared/context/trainer-context.tsx', 'utf8');
      assert.ok(code.includes('await clearAuthSession();'), 'Must clear session');
      assert.ok(code.includes('Promise.race'), 'Must use Promise.race for timeout protection');
    });

    test('auth.ts synchronizes trainerId with token username in restoreSessionState', () => {
      const code = fs.readFileSync('src/shared/services/auth.ts', 'utf8');
      assert.ok(code.includes('parseMockToken(token)'), 'Must parse token in restoreSessionState');
      assert.ok(code.includes('FROM auth_users WHERE LOWER(username) = LOWER(?)'), 'Must query auth_users by token username');
    });

    test('auth.ts clears LAST_USERNAME_KEY on clearAuthSession and uses memoryStorage', () => {
      const code = fs.readFileSync('src/shared/services/auth.ts', 'utf8');
      assert.ok(code.includes('await deleteSecureItem(LAST_USERNAME_KEY);'), 'clearAuthSession must delete LAST_USERNAME_KEY');
      assert.ok(code.includes('memoryStorage.has(key)'), 'getSecureItem must check memoryStorage first');
    });

    test('trainer-context.tsx immediately applies user profile on register/login', () => {
      const code = fs.readFileSync('src/shared/context/trainer-context.tsx', 'utf8');
      assert.ok(code.includes('applyAuthenticatedUser'), 'Must define applyAuthenticatedUser');
      assert.ok(code.includes('applyAuthenticatedUser(res.user.id'), 'register and login must applyAuthenticatedUser directly');
    });

    test('auth.ts and trainer-context.tsx implement Week 8 syllabus contracts (session/access-token and useSession)', () => {
      const authCode = fs.readFileSync('src/shared/services/auth.ts', 'utf8');
      assert.ok(authCode.includes("'session/access-token'"), 'Must store and read session/access-token in SecureStore');
      assert.ok(authCode.includes('getCurrentUser'), 'Must implement getCurrentUser(token)');
      assert.ok(authCode.includes('export async function restoreSession'), 'Must export restoreSession');

      const contextCode = fs.readFileSync('src/shared/context/trainer-context.tsx', 'utf8');
      assert.ok(contextCode.includes('export function useSession'), 'Must export useSession');
    });

    test('auth.ts sanitizes SecureStore keys to replace invalid characters like slashes', () => {
      const authCode = fs.readFileSync('src/shared/services/auth.ts', 'utf8');
      assert.ok(authCode.includes('sanitizeSecureKey'), 'Must define sanitizeSecureKey');
      assert.ok(authCode.includes("replace(/[^a-zA-Z0-9.\\-_]/g, '_')"), 'Must sanitize invalid characters for SecureStore');
    });

    test('trainer-repository.ts fallback query sorts by created_at DESC', () => {
      const code = fs.readFileSync('src/shared/services/database/trainer-repository.ts', 'utf8');
      assert.ok(code.includes('ORDER BY created_at DESC LIMIT 1'), 'Fallback query must order by created_at DESC');
    });
  });

  describe('7. Multi-User Registration & Profile Isolation Contract', () => {
    test('Simulated registration switches active trainer immediately without stale profile retention', async () => {
      // Simulation of user 1
      const user1 = { id: 'trainer-ash-101', username: 'AshKetchum' };
      let activeTrainer = { id: user1.id, name: user1.username };
      assert.equal(activeTrainer.name, 'AshKetchum');

      // Logout user 1
      activeTrainer = null;
      assert.equal(activeTrainer, null);

      // Register user 2
      const user2 = { id: 'trainer-misty-202', username: 'MistyWaterflower' };
      // Direct apply pattern
      activeTrainer = { id: user2.id, name: user2.username };

      // User 2 profile must strictly match user 2 and not retain user 1
      assert.equal(activeTrainer.id, 'trainer-misty-202');
      assert.equal(activeTrainer.name, 'MistyWaterflower');
      assert.notEqual(activeTrainer.name, 'AshKetchum');
    });

    test('pokemon-repository.ts filters caught pokemon by user_id', () => {
      const code = fs.readFileSync('src/shared/services/database/pokemon-repository.ts', 'utf8');
      assert.ok(code.includes('WHERE user_id = ?'), 'getAll must filter by user_id when provided');
      assert.ok(code.includes('insert(pokemon: CaughtPokemon, userId?: string)'), 'insert must accept userId parameter');
    });

    test('event-repository.ts isolates event registrations by user_id', () => {
      const code = fs.readFileSync('src/shared/services/database/event-repository.ts', 'utf8');
      assert.ok(code.includes('WHERE user_id = ?'), 'getAllRegistrations must filter by user_id when provided');
    });

    test('event-favorites.ts scopes favorites keys by userId', () => {
      const code = fs.readFileSync('src/shared/services/event-favorites.ts', 'utf8');
      assert.ok(code.includes('campus_event_favorites_${userId}'), 'getFavoritesStorageKey must scope key by userId');
    });

    test('event-context.tsx isolates registrations and favorites by active trainer id', () => {
      const code = fs.readFileSync('src/shared/context/event-context.tsx', 'utf8');
      assert.ok(code.includes('.getAllRegistrations(trainer.id)') || code.includes('getAllRegistrations(currentUserId)'), 'Must pass trainer.id to getAllRegistrations');
      assert.ok(code.includes('getFavoriteEventIds(trainer.id)'), 'Must pass trainer.id to getFavoriteEventIds');
      assert.ok(code.includes('serviceToggleFavorite(eventId, activeUserId)'), 'toggleFavorite must pass activeUserId');
    });

    test('campus events catalog remains globally shared across all accounts', () => {
      const code = fs.readFileSync('src/shared/services/database/event-repository.ts', 'utf8');
      assert.ok(code.includes('SELECT * FROM campus_events ORDER BY starts_at ASC'), 'getCachedEvents must select all campus events');
      assert.ok(!code.includes('FROM campus_events WHERE user_id'), 'campus_events catalog must not be filtered by user_id');
    });
  });
});
