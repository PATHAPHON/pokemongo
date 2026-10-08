import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Set up mock window.localStorage so @react-native-async-storage/async-storage functions in Node
const memoryStorage = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => memoryStorage.get(key) ?? null,
    setItem: (key, value) => {
      memoryStorage.set(key, String(value));
    },
    removeItem: (key) => {
      memoryStorage.delete(key);
    },
    clear: () => {
      memoryStorage.clear();
    },
  },
};

import {
  safeParseFavorites,
  getFavoriteEventIds,
  toggleFavoriteEvent,
} from '../src/shared/services/event-favorites.ts';
import { safeParsePokemonTypes } from '../src/shared/constants/pokemon-registry-data.ts';
import { findLatestCachedAt } from '../src/shared/utils/event-helpers.ts';

describe('Week 7: Offline Storage & Data Resiliency Tests', () => {
  describe('1. AsyncStorage Safe Parse Contract', () => {
    test('returns empty array for null or empty input', () => {
      assert.deepEqual(safeParseFavorites(null), []);
      assert.deepEqual(safeParseFavorites(''), []);
    });

    test('handles corrupted JSON strings gracefully without throwing', () => {
      assert.deepEqual(safeParseFavorites('{bad: json'), []);
      assert.deepEqual(safeParseFavorites('[unclosed array'), []);
      assert.deepEqual(safeParseFavorites('undefined'), []);
      assert.deepEqual(safeParseFavorites('null'), []);
    });

    test('returns empty array when JSON is not an array', () => {
      assert.deepEqual(safeParseFavorites('12345'), []);
      assert.deepEqual(safeParseFavorites('true'), []);
      assert.deepEqual(safeParseFavorites('{"key": "value"}'), []);
      assert.deepEqual(safeParseFavorites('"just-a-string"'), []);
    });

    test('returns valid string array from JSON array', () => {
      const input = JSON.stringify(['event-001', 'event-002']);
      assert.deepEqual(safeParseFavorites(input), ['event-001', 'event-002']);
    });

    test('filters out non-string items within array', () => {
      const input = JSON.stringify(['event-001', 123, null, false, 'event-002']);
      assert.deepEqual(safeParseFavorites(input), ['event-001', 'event-002']);
    });
  });

  describe('2. Mutex Queue & Concurrent Favorite Toggles', () => {
    beforeEach(() => {
      memoryStorage.clear();
    });

    test('single toggle adds and removes event favorite correctly', async () => {
      const added = await toggleFavoriteEvent('event-single');
      assert.deepEqual(added, ['event-single']);
      assert.deepEqual(await getFavoriteEventIds(), ['event-single']);

      const removed = await toggleFavoriteEvent('event-single');
      assert.deepEqual(removed, []);
      assert.deepEqual(await getFavoriteEventIds(), []);
    });

    test('mutex queue serializes concurrent toggle operations without lost updates', async () => {
      const eventIds = [
        'event-concurrent-1',
        'event-concurrent-2',
        'event-concurrent-3',
        'event-concurrent-4',
        'event-concurrent-5',
      ];

      // Fire all toggles concurrently
      const results = await Promise.all(eventIds.map((id) => toggleFavoriteEvent(id)));

      // Final toggle should return all 5
      const finalFavorites = await getFavoriteEventIds();
      assert.equal(finalFavorites.length, 5, 'All 5 events must be persisted without lost updates');
      for (const id of eventIds) {
        assert.ok(finalFavorites.includes(id), `Expected ${id} to be in favorites`);
      }
    });

    test('concurrent add and remove operations maintain consistency', async () => {
      // Seed with initial favorites
      await toggleFavoriteEvent('event-keep-1');
      await toggleFavoriteEvent('event-to-remove');
      await toggleFavoriteEvent('event-keep-2');

      // Concurrently remove one and add another
      await Promise.all([
        toggleFavoriteEvent('event-to-remove'),
        toggleFavoriteEvent('event-to-add'),
      ]);

      const updated = await getFavoriteEventIds();
      assert.ok(!updated.includes('event-to-remove'), 'event-to-remove must be removed');
      assert.ok(updated.includes('event-to-add'), 'event-to-add must be added');
      assert.ok(updated.includes('event-keep-1'), 'event-keep-1 must remain');
      assert.ok(updated.includes('event-keep-2'), 'event-keep-2 must remain');
      assert.equal(updated.length, 3);
    });

    test('recovers gracefully when underlying storage contains corrupted JSON', async () => {
      // Corrupt the storage manually
      memoryStorage.set('campus_event_favorites', '<<not json>>');

      // Reading should not crash
      const readResult = await getFavoriteEventIds();
      assert.deepEqual(readResult, []);

      // Writing should repair and succeed
      const newFavorites = await toggleFavoriteEvent('event-after-corruption');
      assert.deepEqual(newFavorites, ['event-after-corruption']);
      assert.deepEqual(await getFavoriteEventIds(), ['event-after-corruption']);
    });
  });

  describe('3. Pokemon Types JSON Parse & Fallback Contract', () => {
    test('returns fallback ["normal"] on null, undefined, or empty string', () => {
      assert.deepEqual(safeParsePokemonTypes(null), ['normal']);
      assert.deepEqual(safeParsePokemonTypes(undefined), ['normal']);
      assert.deepEqual(safeParsePokemonTypes(''), ['normal']);
    });

    test('returns fallback ["normal"] on invalid or corrupted JSON', () => {
      assert.deepEqual(safeParsePokemonTypes('{invalid'), ['normal']);
      assert.deepEqual(safeParsePokemonTypes('["unclosed'), ['normal']);
      assert.deepEqual(safeParsePokemonTypes('not-json'), ['normal']);
    });

    test('returns fallback ["normal"] when JSON is not a non-empty array', () => {
      assert.deepEqual(safeParsePokemonTypes('{}'), ['normal']);
      assert.deepEqual(safeParsePokemonTypes('[]'), ['normal']);
      assert.deepEqual(safeParsePokemonTypes('123'), ['normal']);
      assert.deepEqual(safeParsePokemonTypes('"electric"'), ['normal']);
    });

    test('parses valid types JSON correctly', () => {
      assert.deepEqual(safeParsePokemonTypes('["electric"]'), ['electric']);
      assert.deepEqual(safeParsePokemonTypes('["grass", "poison"]'), ['grass', 'poison']);
      assert.deepEqual(safeParsePokemonTypes('["fire", "flying"]'), ['fire', 'flying']);
    });
  });

  describe('4. Event Cache Timestamp Contract (findLatestCachedAt)', () => {
    test('returns null for empty array or rows with null cached_at', () => {
      assert.equal(findLatestCachedAt([]), null);
      assert.equal(findLatestCachedAt([{ cached_at: null }, { cached_at: undefined }]), null);
    });

    test('finds the latest cached_at across rows regardless of ordering', () => {
      const rows = [
        { id: '1', starts_at: '2026-10-01T08:00:00Z', cached_at: '2026-10-01T00:00:00.000Z' },
        { id: '2', starts_at: '2026-10-02T08:00:00Z', cached_at: '2026-10-06T15:30:00.000Z' },
        { id: '3', starts_at: '2026-10-03T08:00:00Z', cached_at: '2026-10-04T12:00:00.000Z' },
      ];

      // Row 0 has earliest starts_at, but Row 1 has latest cached_at
      const latest = findLatestCachedAt(rows);
      assert.equal(latest, '2026-10-06T15:30:00.000Z');
    });

    test('handles mixed rows where some cached_at values are null', () => {
      const rows = [
        { id: '1', cached_at: null },
        { id: '2', cached_at: '2026-10-05T10:00:00.000Z' },
        { id: '3', cached_at: undefined },
        { id: '4', cached_at: '2026-10-02T10:00:00.000Z' },
      ];

      const latest = findLatestCachedAt(rows);
      assert.equal(latest, '2026-10-05T10:00:00.000Z');
    });
  });
});
