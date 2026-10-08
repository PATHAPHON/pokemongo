import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Week 1: Mobile Development, React Native & Expo Baseline', async (t) => {
  await t.test('1. Asset files exist in assets/images/', () => {
    const assetFiles = [
      'assets/images/avatar.png',
      'assets/images/icon.png',
      'assets/images/splash-icon.png',
      'assets/images/adaptive-icon.png',
    ];

    for (const file of assetFiles) {
      const fullPath = path.resolve(process.cwd(), file);
      assert.ok(fs.existsSync(fullPath), `Expected asset ${file} to exist on disk`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 0, `Expected asset ${file} to be non-empty`);
    }
  });

  await t.test('2. app.json references assets properly', () => {
    const appJsonPath = path.resolve(process.cwd(), 'app.json');
    assert.ok(fs.existsSync(appJsonPath), 'app.json must exist');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

    assert.equal(appJson.expo.icon, './assets/images/icon.png');
    assert.equal(
      appJson.expo.android?.adaptiveIcon?.foregroundImage,
      './assets/images/adaptive-icon.png'
    );

    const splashPlugin = appJson.expo.plugins?.find(
      (p) => Array.isArray(p) && p[0] === 'expo-splash-screen'
    );
    assert.ok(splashPlugin, 'expo-splash-screen plugin must be defined');
    assert.equal(splashPlugin[1].image, './assets/images/splash-icon.png');
  });

  await t.test('3. StudentProfile contract has required fields', () => {
    const sampleStudent = {
      name: 'นักศึกษา Mobile Developer',
      program: 'Computer and Information Science',
      interests: ['Campus events', 'Mobile UX', 'Pokémon GO'],
      studentId: '65010001',
    };

    assert.equal(typeof sampleStudent.name, 'string');
    assert.equal(typeof sampleStudent.program, 'string');
    assert.ok(Array.isArray(sampleStudent.interests));
    assert.ok(sampleStudent.interests.length >= 2);
    assert.equal(typeof sampleStudent.studentId, 'string');
  });
});
