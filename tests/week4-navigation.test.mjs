import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Week 4: Navigation & Deep Linking', () => {
  const rootDir = process.cwd();

  test('src/app/index.tsx exists and exports redirect to /(tabs)', () => {
    const indexPath = path.join(rootDir, 'src/app/index.tsx');
    assert.ok(fs.existsSync(indexPath), 'src/app/index.tsx must exist');

    const content = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(
      content.includes("from 'expo-router'") || content.includes('from "expo-router"'),
      'Must import from expo-router'
    );
    assert.ok(
      content.includes('Redirect'),
      'Must import and use Redirect'
    );
    assert.ok(
      content.includes('href="/(tabs)"') || content.includes("href='/(tabs)'"),
      'Must redirect to /(tabs)'
    );
    assert.ok(
      content.includes('export default function'),
      'Must have default export function'
    );
  });

  test('src/app/+not-found.tsx exists and exports not-found screen', () => {
    const notFoundPath = path.join(rootDir, 'src/app/+not-found.tsx');
    assert.ok(fs.existsSync(notFoundPath), 'src/app/+not-found.tsx must exist');

    const content = fs.readFileSync(notFoundPath, 'utf-8');
    assert.ok(
      content.includes('Stack'),
      'Must use Stack from expo-router'
    );
    assert.ok(
      content.includes("title: 'Oops!'") || content.includes('title: "Oops!"'),
      'Must set Stack.Screen options with title Oops!'
    );
    assert.ok(
      content.includes('Link'),
      'Must use Link from expo-router'
    );
    assert.ok(
      content.includes('href="/(tabs)"') || content.includes("href='/(tabs)'"),
      'Must link to /(tabs)'
    );
    assert.ok(
      content.includes('export default function'),
      'Must have default export function'
    );
  });

  test('app.json has campusevents scheme registered', () => {
    const appJsonPath = path.join(rootDir, 'app.json');
    assert.ok(fs.existsSync(appJsonPath), 'app.json must exist');

    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
    const scheme = appJson.expo?.scheme;

    assert.ok(scheme, 'expo.scheme must be configured');
    if (Array.isArray(scheme)) {
      assert.ok(
        scheme.includes('campusevents'),
        'expo.scheme must include campusevents'
      );
      assert.ok(
        scheme.includes('pokemongo'),
        'expo.scheme must include pokemongo'
      );
    } else {
      assert.equal(scheme, 'campusevents');
    }
  });

  test('src/app/_layout.tsx registers +not-found screen', () => {
    const layoutPath = path.join(rootDir, 'src/app/_layout.tsx');
    assert.ok(fs.existsSync(layoutPath), 'src/app/_layout.tsx must exist');

    const content = fs.readFileSync(layoutPath, 'utf-8');
    assert.ok(
      content.includes('name="+not-found"'),
      'Must register +not-found screen in root Stack'
    );
  });

  test('src/app/events/[id].tsx validates dynamic ID param and guards against empty or invalid IDs', () => {
    const detailPath = path.join(rootDir, 'src/app/events/[id].tsx');
    assert.ok(fs.existsSync(detailPath), 'src/app/events/[id].tsx must exist');

    const content = fs.readFileSync(detailPath, 'utf-8');
    assert.ok(
      content.includes('useLocalSearchParams'),
      'Must use useLocalSearchParams'
    );
    assert.ok(
      content.includes('isValidId') || content.includes('Array.isArray'),
      'Must validate dynamic ID array or string safety'
    );
    assert.ok(
      content.includes('รหัสมีตอัปไม่ถูกต้อง'),
      'Must display invalid ID error state'
    );
  });
});

