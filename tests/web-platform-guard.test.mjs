import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Cross-Platform & Location Requirements Tests (Week 10)', () => {
  const rootDir = process.cwd();

  test('LeafletMapView component supports Web platform via iframe', () => {
    const leafletPath = path.join(
      rootDir,
      'src/features/map/components/LeafletMapView.tsx'
    );
    const content = fs.readFileSync(leafletPath, 'utf-8');

    assert.ok(
      content.includes("Platform.OS === 'web'"),
      'LeafletMapView must check Platform.OS === web'
    );
    assert.ok(
      content.includes('<iframe'),
      'LeafletMapView must render iframe on web platform'
    );
  });

  test('Preset locations are properly exported with Sydney as default', () => {
    const enginePath = path.join(
      rootDir,
      'src/features/map/services/spawn-engine.ts'
    );
    const content = fs.readFileSync(enginePath, 'utf-8');

    assert.ok(
      content.includes('PRESET_LOCATIONS'),
      'spawn-engine must export PRESET_LOCATIONS'
    );
    assert.ok(
      content.includes('Sydney Opera House'),
      'PRESET_LOCATIONS must include Sydney Opera House'
    );
    assert.ok(
      content.includes('DEFAULT_PRESET'),
      'spawn-engine must export DEFAULT_PRESET'
    );
  });

  test('Platform location resolution logic simulation', () => {
    function resolveLocationSource(isRealGps, selectedPreset) {
      if (isRealGps) {
        return { type: 'DEVICE_GPS', name: 'Real GPS' };
      }
      return {
        type: 'PRESET',
        name: selectedPreset?.name ?? 'Sydney Opera House',
      };
    }

    assert.deepEqual(
      resolveLocationSource(false, { name: 'Sydney Opera House' }),
      { type: 'PRESET', name: 'Sydney Opera House' }
    );

    assert.deepEqual(
      resolveLocationSource(true, null),
      { type: 'DEVICE_GPS', name: 'Real GPS' }
    );
  });
});
