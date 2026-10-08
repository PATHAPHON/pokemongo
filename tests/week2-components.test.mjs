import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Week 2: Components, Props, State & EventCard Contract Tests', () => {
  const rootDir = process.cwd();
  const typesPath = path.join(rootDir, 'src/features/events/types.ts');
  const eventCardPath = path.join(
    rootDir,
    'src/features/events/components/event-card.tsx'
  );
  const eventsIndexPath = path.join(rootDir, 'src/features/events/index.ts');

  describe('1. CampusEvent & Types Re-export Contract', () => {
    test('src/features/events/types.ts exists and re-exports CampusEvent from @/shared/types', () => {
      assert.ok(fs.existsSync(typesPath), 'src/features/events/types.ts must exist');
      const content = fs.readFileSync(typesPath, 'utf-8');

      assert.match(
        content,
        /export\s+(?:type\s+)?\{[^}]*CampusEvent[^}]*\}\s+from\s+['"]@\/shared\/types['"]/,
        'CampusEvent must be re-exported from @/shared/types'
      );
    });

    test('src/features/events/types.ts re-exports required domain types', () => {
      const content = fs.readFileSync(typesPath, 'utf-8');

      assert.match(
        content,
        /CampusEvent/,
        'Must include CampusEvent'
      );
      assert.match(
        content,
        /EventRegistration/,
        'Must include EventRegistration'
      );
      assert.match(
        content,
        /EventRegistrationStatus/,
        'Must include EventRegistrationStatus'
      );
      assert.match(
        content,
        /EventFilterStatus/,
        'Must include EventFilterStatus'
      );
    });

    test('src/features/events/index.ts re-exports from ./types and ./components/event-card', () => {
      assert.ok(fs.existsSync(eventsIndexPath), 'src/features/events/index.ts must exist');
      const content = fs.readFileSync(eventsIndexPath, 'utf-8');

      assert.ok(
        content.includes("export * from './types'"),
        "Must re-export all from './types'"
      );
      assert.ok(
        content.includes("export * from './components/event-card'"),
        "Must re-export all from './components/event-card'"
      );
    });
  });

  describe('2. EventCardProps Contract & Press Handling Logic', () => {
    test('src/features/events/components/event-card.tsx exports EventCardProps', () => {
      assert.ok(fs.existsSync(eventCardPath), 'event-card.tsx must exist');
      const content = fs.readFileSync(eventCardPath, 'utf-8');

      assert.match(
        content,
        /export\s+interface\s+EventCardProps/,
        'Must export EventCardProps interface'
      );
    });

    test('EventCardProps interface supports both onOpen and onPress optional handlers', () => {
      const content = fs.readFileSync(eventCardPath, 'utf-8');

      assert.match(
        content,
        /onPress\?:\s*\(\)\s*=>\s*void/,
        'EventCardProps must declare optional onPress'
      );
      assert.match(
        content,
        /onOpen\?:\s*\(\)\s*=>\s*void/,
        'EventCardProps must declare optional onOpen'
      );
    });

    test('Press handling logic prioritizes onOpen, falls back to onPress, then no-op', () => {
      const resolvePressHandler = (props) => {
        return props.onOpen ?? props.onPress ?? (() => {});
      };

      let openCalled = false;
      let pressCalled = false;

      // Case A: Both provided -> onOpen wins
      const handlerBoth = resolvePressHandler({
        onOpen: () => {
          openCalled = true;
        },
        onPress: () => {
          pressCalled = true;
        },
      });
      handlerBoth();
      assert.equal(openCalled, true, 'onOpen must be called');
      assert.equal(pressCalled, false, 'onPress must NOT be called when onOpen is present');

      // Case B: Only onPress provided -> onPress called
      let onlyPressCalled = false;
      const handlerOnlyPress = resolvePressHandler({
        onPress: () => {
          onlyPressCalled = true;
        },
      });
      handlerOnlyPress();
      assert.equal(onlyPressCalled, true, 'onPress must be called when onOpen is undefined');

      // Case C: Neither provided -> safe fallback function
      const handlerNone = resolvePressHandler({});
      assert.doesNotThrow(() => {
        handlerNone();
      }, 'Fallback function must not throw');
    });

    test('event-card.tsx implementation uses onOpen ?? onPress ?? (() => {})', () => {
      const content = fs.readFileSync(eventCardPath, 'utf-8');

      assert.match(
        content,
        /const\s+handlePress\s*=\s*onOpen\s*\?\?\s*onPress\s*\?\?\s*\(\(\)\s*=>\s*\{\}\)/,
        'Must implement handlePress with onOpen ?? onPress ?? (() => {})'
      );
    });
  });

  describe('3. Accessibility Compliance Contract', () => {
    test('Root TouchableOpacity has accessibilityRole="button"', () => {
      const content = fs.readFileSync(eventCardPath, 'utf-8');

      assert.match(
        content,
        /<TouchableOpacity[^>]*accessibilityRole=["']button["']/,
        'Root TouchableOpacity must have accessibilityRole="button"'
      );
    });

    test('All Image elements define accessibilityRole="image" and accessibilityLabel', () => {
      const content = fs.readFileSync(eventCardPath, 'utf-8');

      // Find all <Image ... /> tags
      const imageMatches = [...content.matchAll(/<Image\b([^>]*)\/>/gs)];
      assert.ok(
        imageMatches.length >= 3,
        `Expected at least 3 Image elements, found ${imageMatches.length}`
      );

      for (const match of imageMatches) {
        const imageProps = match[1];
        assert.ok(
          imageProps.includes('accessibilityRole="image"') ||
            imageProps.includes("accessibilityRole='image'"),
          `Image element must include accessibilityRole="image": ${match[0]}`
        );
        assert.ok(
          imageProps.includes('accessibilityLabel='),
          `Image element must include accessibilityLabel: ${match[0]}`
        );
      }
    });

    test('Favorite button has accessibilityRole="button" and descriptive label', () => {
      const content = fs.readFileSync(eventCardPath, 'utf-8');

      assert.ok(
        content.includes('style={styles.favoriteButton}'),
        'Must have favoriteButton style'
      );
      assert.match(
        content,
        /accessibilityLabel=\{[^}]*isFavorite\s*\?\s*['"]นำออกจากรายการโปรด['"]\s*:\s*['"]บันทึกเป็นรายการโปรด['"][^}]*\}/,
        'Favorite button must have accessible label reflecting favorite state'
      );
    });
  });
});
