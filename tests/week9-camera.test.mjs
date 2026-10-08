import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// --- Simulation Logic Mirroring event-image-picker.tsx ---

function handlePermissionResponse(permissionResult, type = 'camera') {
  if (permissionResult.granted) {
    return { shouldProceed: true, promptedSettings: false };
  }

  const title =
    type === 'camera' ? 'ต้องการสิทธิ์เข้าถึงกล้อง' : 'ต้องการสิทธิ์เข้าถึงรูปภาพ';

  if (!permissionResult.canAskAgain) {
    return {
      shouldProceed: false,
      promptedSettings: true,
      title,
      buttons: [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'เปิดการตั้งค่า', action: 'openSettings' },
      ],
    };
  }

  return {
    shouldProceed: false,
    promptedSettings: false,
    title,
    buttons: undefined,
  };
}

function createDraftPhotoManager(initialUri = undefined) {
  let currentUri = initialUri;

  return {
    getUri: () => currentUri,
    selectPhoto: (newUri) => {
      currentUri = newUri;
    },
    handlePickerResult: (result) => {
      if (!result.canceled && result.assets && result.assets.length > 0) {
        currentUri = result.assets[0].uri;
      }
      // If canceled, retain currentUri
    },
    removePhoto: () => {
      currentUri = undefined;
    },
  };
}

function buildEventRegistrationSubmission(eventId, notes, photoUri, agreed) {
  if (!agreed) {
    return { success: false, error: 'กรุณายอมรับเงื่อนไขการเข้าร่วมกิจกรรม' };
  }
  return {
    success: true,
    data: {
      eventId,
      notes: notes?.trim() || undefined,
      photoUri: photoUri || undefined,
    },
  };
}

// --- Test Suite ---

describe('Week 9: Camera, Media Permissions & Photo Draft Contract Tests', () => {
  const rootDir = process.cwd();
  const imagePickerPath = path.join(
    rootDir,
    'src/features/events/components/event-image-picker.tsx'
  );
  const registerScreenPath = path.join(
    rootDir,
    'src/app/events/register.tsx'
  );

  describe('1. Permission Denial Lifecycle Contract', () => {
    test('canAskAgain: false prompts Alert with action button targeting settings', () => {
      const cameraDeniedPermanent = {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };

      const result = handlePermissionResponse(cameraDeniedPermanent, 'camera');
      assert.equal(result.shouldProceed, false);
      assert.equal(result.promptedSettings, true);
      assert.equal(result.title, 'ต้องการสิทธิ์เข้าถึงกล้อง');
      assert.ok(Array.isArray(result.buttons));

      const settingsBtn = result.buttons.find((b) => b.action === 'openSettings');
      assert.ok(settingsBtn, 'Must have action button linking to settings');
      assert.equal(settingsBtn.text, 'เปิดการตั้งค่า');
    });

    test('canAskAgain: true prompts standard Alert without openSettings action', () => {
      const galleryDeniedTemporary = {
        granted: false,
        canAskAgain: true,
        status: 'denied',
      };

      const result = handlePermissionResponse(galleryDeniedTemporary, 'gallery');
      assert.equal(result.shouldProceed, false);
      assert.equal(result.promptedSettings, false);
      assert.equal(result.buttons, undefined);
      assert.equal(result.title, 'ต้องการสิทธิ์เข้าถึงรูปภาพ');
    });

    test('Permission granted bypasses Alert and allows camera/gallery launch', () => {
      const cameraGranted = {
        granted: true,
        canAskAgain: true,
        status: 'granted',
      };

      const result = handlePermissionResponse(cameraGranted, 'camera');
      assert.equal(result.shouldProceed, true);
      assert.equal(result.promptedSettings, false);
    });

    test('Action button triggers Linking.openSettings() invocation', async () => {
      let openSettingsCalled = false;
      const mockLinking = {
        openSettings: async () => {
          openSettingsCalled = true;
        },
      };

      const alertConfig = {
        title: 'ต้องการสิทธิ์เข้าถึงกล้อง',
        buttons: [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'เปิดการตั้งค่า', onPress: () => mockLinking.openSettings() },
        ],
      };

      const settingsBtn = alertConfig.buttons.find((b) => b.text === 'เปิดการตั้งค่า');
      assert.ok(settingsBtn);
      await settingsBtn.onPress();
      assert.equal(openSettingsCalled, true, 'Calling onPress must invoke openSettings()');
    });

    test('Static Analysis: event-image-picker.tsx imports Linking and handles canAskAgain for both camera and gallery', () => {
      assert.ok(fs.existsSync(imagePickerPath), 'event-image-picker.tsx must exist');
      const content = fs.readFileSync(imagePickerPath, 'utf8');

      // 1. Linking import from 'react-native'
      assert.match(
        content,
        /import\s*\{[^}]*Linking[^}]*\}\s*from\s*['"]react-native['"]/,
        'Must import Linking from react-native'
      );

      // 2. Both pickImageFromGallery and takePhotoWithCamera check canAskAgain
      assert.ok(
        content.includes('permissionResult.canAskAgain'),
        'Must check permissionResult.canAskAgain'
      );

      // 3. Linking.openSettings() called in both handlers
      const openSettingsMatches = content.match(/Linking\.openSettings\(\)/g);
      assert.ok(
        openSettingsMatches && openSettingsMatches.length >= 2,
        'Linking.openSettings() must be called in both gallery and camera handlers'
      );

      // 4. Proper permission APIs requested
      assert.ok(
        content.includes('requestMediaLibraryPermissionsAsync'),
        'Must request media library permissions'
      );
      assert.ok(
        content.includes('requestCameraPermissionsAsync'),
        'Must request camera permissions'
      );
    });
  });

  describe('2. Preview and Draft URI Retention Contract', () => {
    test('Empty initial draft maintains undefined URI and renders empty state', () => {
      const manager = createDraftPhotoManager(undefined);
      assert.equal(manager.getUri(), undefined);
    });

    test('Preview displays existing draft photoUri', () => {
      const initialDraft = 'file:///data/user/0/cache/student_id_card.jpg';
      const manager = createDraftPhotoManager(initialDraft);
      assert.equal(manager.getUri(), initialDraft);
    });

    test('Selecting a new photo updates the draft photo URI (change action)', () => {
      const manager = createDraftPhotoManager('file:///first_shot.jpg');
      assert.equal(manager.getUri(), 'file:///first_shot.jpg');

      // Simulate new photo picked
      manager.handlePickerResult({
        canceled: false,
        assets: [{ uri: 'file:///second_shot.png' }],
      });
      assert.equal(manager.getUri(), 'file:///second_shot.png');
    });

    test('Canceling image picker retains existing draft photo URI', () => {
      const manager = createDraftPhotoManager('file:///existing_draft.jpg');

      manager.handlePickerResult({
        canceled: true,
        assets: null,
      });

      assert.equal(
        manager.getUri(),
        'file:///existing_draft.jpg',
        'Draft photo URI must NOT be cleared when picker is canceled'
      );
    });

    test('Removing photo resets draft URI to undefined (remove action)', () => {
      const manager = createDraftPhotoManager('file:///to_be_deleted.jpg');
      assert.equal(manager.getUri(), 'file:///to_be_deleted.jpg');

      manager.removePhoto();
      assert.equal(manager.getUri(), undefined);
    });

    test('Registration form retains photoUri across form inputs and submits successfully', () => {
      let draftNotes = '';
      let draftPhoto = 'file:///my_photo.jpg';
      let agreementChecked = true;

      // Update notes
      draftNotes = 'Allergies: None. Need front row seat.';

      // Submission payload retains photoUri
      const submission = buildEventRegistrationSubmission(
        'evt-001',
        draftNotes,
        draftPhoto,
        agreementChecked
      );

      assert.equal(submission.success, true);
      assert.equal(submission.data.eventId, 'evt-001');
      assert.equal(submission.data.notes, 'Allergies: None. Need front row seat.');
      assert.equal(submission.data.photoUri, 'file:///my_photo.jpg');
    });

    test('Static Analysis: event-image-picker.tsx renders photo preview with change and remove actions', () => {
      const content = fs.readFileSync(imagePickerPath, 'utf8');

      // Preview rendering
      assert.ok(
        content.includes('previewImage'),
        'Must render previewImage style'
      );
      assert.ok(
        content.includes('previewActions'),
        'Must render previewActions container'
      );

      // Change button calls handleSelectOptions
      assert.ok(
        content.includes('เปลี่ยนรูป'),
        'Must have Change Photo button ("เปลี่ยนรูป")'
      );
      assert.ok(
        content.includes('handleSelectOptions'),
        'Change button must trigger handleSelectOptions'
      );

      // Remove button calls onPhotoSelected(undefined)
      assert.ok(
        content.includes('ลบรูป'),
        'Must have Remove Photo button ("ลบรูป")'
      );
      assert.ok(
        content.includes('onPhotoSelected(undefined)'),
        'Remove button must clear photoUri with onPhotoSelected(undefined)'
      );
    });

    test('Static Analysis: register.tsx embeds EventImagePicker and passes photoUri to registerEvent', () => {
      assert.ok(fs.existsSync(registerScreenPath), 'register.tsx must exist');
      const content = fs.readFileSync(registerScreenPath, 'utf8');

      assert.ok(
        content.includes('EventImagePicker'),
        'register.tsx must import/render EventImagePicker'
      );
      assert.match(
        content,
        /useState<\s*string\s*\|\s*undefined\s*>\(\s*undefined\s*\)/,
        'register.tsx must maintain photoUri state'
      );
      assert.ok(
        content.includes('registerEvent(event.id, notes.trim() || undefined, photoUri)'),
        'register.tsx must pass photoUri to registerEvent'
      );
    });
  });
});
