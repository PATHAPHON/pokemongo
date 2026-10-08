import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- Simulation Logic Mirroring ProfileEditModal Form Draft & Avatar Selection ---

function createProfileEditDraftManager(initialTrainer = null) {
  let draft = {
    name: initialTrainer?.name || '',
    studentId: initialTrainer?.studentId || '',
    program: initialTrainer?.program || initialTrainer?.faculty || '',
    interestsText: (initialTrainer?.interests || ['Campus events', 'Mobile UX']).join(', '),
    avatarUri: initialTrainer?.avatarUrl,
  };

  return {
    getDraft: () => ({ ...draft }),
    setAvatarUri: (uri) => {
      draft.avatarUri = uri;
    },
    handlePickerResult: (result) => {
      if (!result.canceled && result.assets && result.assets.length > 0) {
        draft.avatarUri = result.assets[0].uri;
      }
      // If canceled, existing draft.avatarUri is preserved
    },
    removeAvatar: () => {
      draft.avatarUri = undefined;
    },
    resetFromTrainer: (trainer) => {
      draft = {
        name: trainer?.name || '',
        studentId: trainer?.studentId || '',
        program: trainer?.program || trainer?.faculty || '',
        interestsText: (trainer?.interests || ['Campus events', 'Mobile UX']).join(', '),
        avatarUri: trainer?.avatarUrl,
      };
    },
    buildSavePayload: () => {
      const trimmed = draft.name.trim();
      if (!trimmed) return null;
      const parsedInterests = draft.interestsText
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      return {
        name: trimmed,
        studentId: draft.studentId.trim() || undefined,
        faculty: draft.program.trim() || undefined,
        program: draft.program.trim() || undefined,
        interests: parsedInterests.length > 0 ? parsedInterests : ['Campus events', 'Mobile UX'],
        avatarUrl: draft.avatarUri,
      };
    },
  };
}

describe('Profile Avatar Upload & Edit Modal Contract Tests', () => {
  const rootDir = process.cwd();
  const profileEditModalPath = path.join(
    rootDir,
    'src/features/profile/components/ProfileEditModal.tsx'
  );

  describe('1. Static Analysis Contract: ProfileEditModal.tsx', () => {
    test('ProfileEditModal.tsx exists and imports necessary libraries', () => {
      assert.ok(fs.existsSync(profileEditModalPath), 'ProfileEditModal.tsx must exist');
      const content = fs.readFileSync(profileEditModalPath, 'utf8');

      // 1. ImagePicker import
      assert.match(
        content,
        /import\s+\*\s+as\s+ImagePicker\s+from\s+['"]expo-image-picker['"]/,
        'Must import expo-image-picker'
      );

      // 2. Linking import from react-native
      assert.match(
        content,
        /import\s*\{[^}]*Linking[^}]*\}\s*from\s*['"]react-native['"]/,
        'Must import Linking from react-native'
      );

      // 3. Image import from react-native
      assert.match(
        content,
        /import\s*\{[^}]*Image[^}]*\}\s*from\s*['"]react-native['"]/,
        'Must import Image from react-native'
      );
    });

    test('Requests camera & gallery permissions and handles canAskAgain with openSettings', () => {
      const content = fs.readFileSync(profileEditModalPath, 'utf8');

      // Requests media library and camera permissions
      assert.ok(
        content.includes('requestMediaLibraryPermissionsAsync'),
        'Must request media library permissions'
      );
      assert.ok(
        content.includes('requestCameraPermissionsAsync'),
        'Must request camera permissions'
      );

      // Handles permanent denial with openSettings
      assert.ok(
        content.includes('permissionResult.canAskAgain'),
        'Must check permissionResult.canAskAgain'
      );
      const openSettingsMatches = content.match(/Linking\.openSettings\(\)/g);
      assert.ok(
        openSettingsMatches && openSettingsMatches.length >= 2,
        'Must call Linking.openSettings() for both camera and gallery permanent denials'
      );
    });

    test('Enforces 1:1 aspect ratio and allowsEditing on both camera and library pickers', () => {
      const content = fs.readFileSync(profileEditModalPath, 'utf8');

      const aspectMatches = content.match(/aspect:\s*\[1,\s*1\]/g);
      assert.ok(
        aspectMatches && aspectMatches.length >= 2,
        'Must configure aspect: [1, 1] for both camera and gallery'
      );

      const allowsEditingMatches = content.match(/allowsEditing:\s*true/g);
      assert.ok(
        allowsEditingMatches && allowsEditingMatches.length >= 2,
        'Must configure allowsEditing: true for both camera and gallery'
      );
    });

    test('Provides photo source options: Camera, Gallery, and Remove (reset to default)', () => {
      const content = fs.readFileSync(profileEditModalPath, 'utf8');

      assert.ok(
        content.includes('ถ่ายรูปใหม่ด้วยกล้อง'),
        'Must have Camera option'
      );
      assert.ok(
        content.includes('เลือกจากคลังรูปภาพ'),
        'Must have Gallery option'
      );
      assert.ok(
        content.includes('ลบรูปโปรไฟล์ (ใช้ค่าเริ่มต้น)'),
        'Must have Remove Avatar option'
      );
      assert.ok(
        content.includes('setAvatarUri(undefined)'),
        'Removing avatar must set avatarUri to undefined'
      );
    });

    test('Passes avatarUrl in onSave payload', () => {
      const content = fs.readFileSync(profileEditModalPath, 'utf8');

      assert.ok(
        content.includes('avatarUrl: avatarUri'),
        'Must include avatarUrl: avatarUri in onSave payload'
      );
    });
  });

  describe('2. Form Draft & Persistence Lifecycle Contract', () => {
    const mockTrainer = {
      id: 'trainer-ash-123',
      name: 'Ash Ketchum',
      studentId: '65010099',
      faculty: 'Computer and Information Science',
      program: 'Computer and Information Science',
      interests: ['Campus events', 'AR Catch'],
      avatarUrl: 'file:///data/user/0/cache/current_avatar.jpg',
      team: 'valor',
      level: 5,
      experience: 1500,
      nextLevelExperience: 2500,
      stardust: 5000,
      pokeCoins: 200,
      createdAt: '2026-10-01T00:00:00.000Z',
    };

    test('Initializes draft avatarUri with trainer.avatarUrl', () => {
      const manager = createProfileEditDraftManager(mockTrainer);
      assert.equal(manager.getDraft().avatarUri, 'file:///data/user/0/cache/current_avatar.jpg');
    });

    test('Selecting a new photo updates draft avatarUri', () => {
      const manager = createProfileEditDraftManager(mockTrainer);
      manager.handlePickerResult({
        canceled: false,
        assets: [{ uri: 'file:///data/user/0/cache/new_profile.jpg' }],
      });
      assert.equal(manager.getDraft().avatarUri, 'file:///data/user/0/cache/new_profile.jpg');
    });

    test('Canceling image picker retains existing draft avatarUri', () => {
      const manager = createProfileEditDraftManager(mockTrainer);
      manager.handlePickerResult({
        canceled: true,
        assets: null,
      });
      assert.equal(manager.getDraft().avatarUri, 'file:///data/user/0/cache/current_avatar.jpg');
    });

    test('Removing avatar resets draft avatarUri to undefined', () => {
      const manager = createProfileEditDraftManager(mockTrainer);
      manager.removeAvatar();
      assert.equal(manager.getDraft().avatarUri, undefined);
    });

    test('Modal dismiss/reset discards unsaved picked photo', () => {
      const manager = createProfileEditDraftManager(mockTrainer);

      // User picks a new photo
      manager.handlePickerResult({
        canceled: false,
        assets: [{ uri: 'file:///data/user/0/cache/temporary_unsaved.jpg' }],
      });
      assert.equal(manager.getDraft().avatarUri, 'file:///data/user/0/cache/temporary_unsaved.jpg');

      // User dismisses without saving -> modal reopened resets from current trainer
      manager.resetFromTrainer(mockTrainer);
      assert.equal(manager.getDraft().avatarUri, 'file:///data/user/0/cache/current_avatar.jpg');
    });

    test('Saving form outputs full payload with new avatarUrl', () => {
      const manager = createProfileEditDraftManager(mockTrainer);
      manager.handlePickerResult({
        canceled: false,
        assets: [{ uri: 'file:///data/user/0/cache/final_avatar.jpg' }],
      });

      const payload = manager.buildSavePayload();
      assert.ok(payload);
      assert.equal(payload.name, 'Ash Ketchum');
      assert.equal(payload.avatarUrl, 'file:///data/user/0/cache/final_avatar.jpg');
    });

    test('Saving form after removing avatar outputs payload with undefined avatarUrl', () => {
      const manager = createProfileEditDraftManager(mockTrainer);
      manager.removeAvatar();

      const payload = manager.buildSavePayload();
      assert.ok(payload);
      assert.equal(payload.avatarUrl, undefined);
    });
  });
});
