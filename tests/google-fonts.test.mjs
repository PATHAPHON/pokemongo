import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  Fonts,
  Typography,
  getFontFamily,
} from '../src/shared/constants/theme.ts';

describe('Google Fonts (Prompt) Integration & Contract Tests', () => {
  const rootDir = process.cwd();

  it('1. package.json contains @expo-google-fonts/prompt dependency', () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8')
    );
    assert.ok(
      pkg.dependencies['@expo-google-fonts/prompt'],
      'package.json must contain @expo-google-fonts/prompt'
    );
  });

  it('2. theme.ts exports Prompt font families and getFontFamily helper', () => {
    assert.equal(Fonts.regular, 'Prompt_400Regular');
    assert.equal(Fonts.medium, 'Prompt_500Medium');
    assert.equal(Fonts.semiBold, 'Prompt_600SemiBold');
    assert.equal(Fonts.bold, 'Prompt_700Bold');
    assert.equal(Fonts.extraBold, 'Prompt_800ExtraBold');
    assert.equal(Fonts.black, 'Prompt_900Black');

    assert.equal(getFontFamily('400'), 'Prompt_400Regular');
    assert.equal(getFontFamily('normal'), 'Prompt_400Regular');
    assert.equal(getFontFamily('500'), 'Prompt_500Medium');
    assert.equal(getFontFamily('600'), 'Prompt_600SemiBold');
    assert.equal(getFontFamily('700'), 'Prompt_700Bold');
    assert.equal(getFontFamily('bold'), 'Prompt_700Bold');
    assert.equal(getFontFamily('800'), 'Prompt_800ExtraBold');
    assert.equal(getFontFamily('900'), 'Prompt_900Black');
    assert.equal(getFontFamily(undefined), 'Prompt_400Regular');
  });

  it('3. theme.ts exports Typography tokens matching design.md', () => {
    assert.ok(Typography.display.fontFamily.includes('Prompt'));
    assert.ok(Typography.title.fontFamily.includes('Prompt'));
    assert.ok(Typography.subtitle.fontFamily.includes('Prompt'));
    assert.ok(Typography.body.fontFamily.includes('Prompt'));
    assert.ok(Typography.callout.fontFamily.includes('Prompt'));
    assert.ok(Typography.caption.fontFamily.includes('Prompt'));
    assert.ok(Typography.micro.fontFamily.includes('Prompt'));
  });

  it('4. _layout.tsx loads Prompt fonts with useFonts and applies global font', () => {
    const layoutContent = fs.readFileSync(
      path.join(rootDir, 'src/app/_layout.tsx'),
      'utf8'
    );

    assert.ok(
      layoutContent.includes('@expo-google-fonts/prompt'),
      '_layout.tsx must import @expo-google-fonts/prompt'
    );
    assert.ok(
      layoutContent.includes('useFonts'),
      '_layout.tsx must call useFonts'
    );
    assert.ok(
      layoutContent.includes('applyGlobalFont'),
      '_layout.tsx must call applyGlobalFont'
    );
    assert.ok(
      layoutContent.includes('SplashScreen'),
      '_layout.tsx must handle SplashScreen while fonts load'
    );
  });

  it('5. apply-global-font.ts provides global font fallbacks for Web and Mobile without breaking icon fonts', () => {
    const applyFontContent = fs.readFileSync(
      path.join(rootDir, 'src/shared/utils/apply-global-font.ts'),
      'utf8'
    );

    assert.ok(
      applyFontContent.includes('applyGlobalFont'),
      'apply-global-font.ts must export applyGlobalFont'
    );
    assert.ok(
      applyFontContent.includes('Prompt'),
      'apply-global-font.ts must target Prompt font'
    );
    assert.ok(
      applyFontContent.includes('flattened?.fontFamily'),
      'apply-global-font.ts must check and preserve existing custom fontFamily for icon sets'
    );
    assert.ok(
      !applyFontContent.includes('* {'),
      'apply-global-font.ts must not use wildcard * !important which overrides vector-icons'
    );
  });
});
