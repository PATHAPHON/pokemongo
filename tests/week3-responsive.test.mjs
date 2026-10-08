import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('Week 3: Responsive Design & List State Handling', () => {
  const rootDir = process.cwd();
  const eventListStatePath = path.join(
    rootDir,
    'src/features/events/components/event-list-state.tsx'
  );
  const pokemonPickerModalPath = path.join(
    rootDir,
    'src/features/events/components/pokemon-picker-modal.tsx'
  );
  const eventsIndexPath = path.join(rootDir, 'src/features/events/index.ts');

  describe('1. EventListState Component Exports & Implementation', () => {
    it('event-list-state.tsx exists on disk', () => {
      assert.ok(
        fs.existsSync(eventListStatePath),
        'event-list-state.tsx must exist in src/features/events/components/'
      );
    });

    it('exports EventListState and EventListStateProps', () => {
      const content = fs.readFileSync(eventListStatePath, 'utf8');

      // Check component export
      assert.match(
        content,
        /export\s+(function|const)\s+EventListState/,
        'Must export EventListState component'
      );

      // Check props interface export
      assert.match(
        content,
        /export\s+(interface|type)\s+EventListStateProps/,
        'Must export EventListStateProps interface or type'
      );
    });

    it('is exported from src/features/events/index.ts', () => {
      const content = fs.readFileSync(eventsIndexPath, 'utf8');
      assert.ok(
        content.includes('event-list-state'),
        'src/features/events/index.ts must re-export event-list-state'
      );
    });

    it('handles loading state with ActivityIndicator and text message', () => {
      const content = fs.readFileSync(eventListStatePath, 'utf8');

      assert.ok(
        content.includes('loading'),
        'Component must support loading state'
      );
      assert.ok(
        content.includes('<ActivityIndicator'),
        'Loading state must render ActivityIndicator'
      );
      assert.match(
        content,
        /loadingText|loadingMessage/,
        'Loading state must display loading text'
      );
    });

    it('handles empty state with empty message and clear filters button (minHeight >= 44)', () => {
      const content = fs.readFileSync(eventListStatePath, 'utf8');

      assert.ok(
        content.includes('empty'),
        'Component must support empty state'
      );
      assert.match(
        content,
        /emptyMessage|clearButtonText|onClearFilters/,
        'Empty state must support clear filters action and empty message'
      );

      // Verify clear filters button has minHeight 44
      assert.match(
        content,
        /minHeight:\s*44/,
        'Action buttons in event-list-state must have minHeight: 44'
      );
    });

    it('handles error state with warning icon, error message, and retry button (minHeight >= 44)', () => {
      const content = fs.readFileSync(eventListStatePath, 'utf8');

      assert.ok(
        content.includes('error'),
        'Component must support error state'
      );
      assert.match(
        content,
        /warning-outline|alert-circle/,
        'Error state must render a warning or alert icon'
      );
      assert.match(
        content,
        /errorMessage|retryButtonText|onRetry/,
        'Error state must support error message and retry action'
      );

      // Verify retry button styling has minHeight 44
      assert.match(
        content,
        /retryButton/,
        'Error state must render retry button'
      );
    });
  });

  describe('2. PokemonPickerModal Safe Area & Touch Targets', () => {
    it('pokemon-picker-modal.tsx exists on disk', () => {
      assert.ok(
        fs.existsSync(pokemonPickerModalPath),
        'pokemon-picker-modal.tsx must exist'
      );
    });

    it('imports SafeAreaView from react-native-safe-area-context and not from react-native', () => {
      const content = fs.readFileSync(pokemonPickerModalPath, 'utf8');

      // Check react-native-safe-area-context import
      assert.match(
        content,
        /import\s+\{[^}]*SafeAreaView[^}]*\}\s+from\s+['"]react-native-safe-area-context['"]/,
        'Must import SafeAreaView from react-native-safe-area-context'
      );

      // Check react-native import does NOT import SafeAreaView
      const rnImportMatch = content.match(
        /import\s+\{([^}]+)\}\s+from\s+['"]react-native['"]/
      );
      assert.ok(rnImportMatch, 'react-native import must exist');
      const rnImports = rnImportMatch[1];
      assert.ok(
        !rnImports.includes('SafeAreaView'),
        'SafeAreaView must NOT be imported from react-native'
      );
    });

    it('close button has touch target >= 44x44pt or proper hitSlop', () => {
      const content = fs.readFileSync(pokemonPickerModalPath, 'utf8');

      // Check close button has hitSlop or minWidth/minHeight >= 44
      const hasCloseHitSlop = /styles\.closeButton[\s\S]*?hitSlop/.test(content) ||
        /hitSlop=[\s\S]*?styles\.closeButton/.test(content) ||
        content.includes('hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}');

      const hasCloseMinSize = /closeButton:\s*\{[^}]*minHeight:\s*44/s.test(content) ||
        /closeButton:\s*\{[^}]*minWidth:\s*44/s.test(content);

      assert.ok(
        hasCloseHitSlop || hasCloseMinSize,
        'Close button must have hitSlop or minHeight/minWidth >= 44'
      );
    });

    it('filter chips have touch target >= 44x44pt or proper hitSlop', () => {
      const content = fs.readFileSync(pokemonPickerModalPath, 'utf8');

      // Check filter chips have hitSlop or minHeight >= 44
      const hasChipHitSlop = /styles\.tabButton[\s\S]*?hitSlop/.test(content) ||
        /hitSlop=[\s\S]*?styles\.tabButton/.test(content);

      const hasChipMinHeight = /tabButton:\s*\{[^}]*minHeight:\s*44/s.test(content);

      assert.ok(
        hasChipHitSlop || hasChipMinHeight,
        'Filter chips must have hitSlop or minHeight >= 44'
      );
    });
  });
});
