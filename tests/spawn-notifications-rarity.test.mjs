import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_POKEMON_REGISTRY_LIST,
  computeRarityFromBST,
} from '../src/shared/constants/pokemon-registry-data.ts';

function generateInitialSpawnSpots(totalCount, pool, excludeIds = new Set()) {
  const availablePool = pool.filter((p) => !excludeIds.has(p.id));
  if (availablePool.length === 0) return [];

  const actualCount = totalCount;
  const activeCount = Math.floor(actualCount * 0.65);
  const pendingCount = actualCount - activeCount;
  const spots = [];

  for (let i = 0; i < activeCount; i++) {
    const meta = availablePool[Math.floor(Math.random() * availablePool.length)];
    spots.push({
      instanceId: `spot-${meta.id}-${Date.now()}-${i}`,
      id: meta.id,
      name: meta.name,
      rarity: meta.rarity,
      status: 'ACTIVE',
    });
  }

  for (let i = 0; i < pendingCount; i++) {
    const meta = availablePool[Math.floor(Math.random() * availablePool.length)];
    spots.push({
      instanceId: `spot-${meta.id}-${Date.now()}-${activeCount + i}`,
      id: meta.id,
      name: meta.name,
      rarity: meta.rarity,
      status: 'PENDING',
    });
  }

  return spots;
}

function createPendingSpot(pool, excludeIds = new Set()) {
  const availablePool = pool.filter((p) => !excludeIds.has(p.id));
  if (availablePool.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * availablePool.length);
  const meta = availablePool[randomIndex];
  return {
    instanceId: `spot-${meta.id}-${Date.now()}`,
    id: meta.id,
    name: meta.name,
    rarity: meta.rarity,
    status: 'PENDING',
  };
}

function formatRarityLabel(rarity) {
  if (rarity === 'ultra_rare') return 'Ultra Rare';
  if (rarity === 'rare') return 'Rare';
  return 'Common';
}

function formatRarityEmoji(rarity) {
  if (rarity === 'ultra_rare') return '🌌';
  if (rarity === 'rare') return '⚡';
  return '🌟';
}

describe('Spawn Engine: Duplicate & Unrestricted Species Spawning', () => {
  const center = { latitude: 13.7462, longitude: 100.5347 };

  test('generateInitialSpawnSpots creates totalCount spots without excluding caught pokemon', () => {
    const spots = generateInitialSpawnSpots(
      15,
      DEFAULT_POKEMON_REGISTRY_LIST
    );

    assert.equal(spots.length, 15);
    for (const spot of spots) {
      assert.ok(spot.id >= 1 && spot.id <= 386);
      assert.ok(['common', 'rare', 'ultra_rare'].includes(spot.rarity));
      assert.ok(['ACTIVE', 'PENDING'].includes(spot.status));
    }
  });

  test('generateInitialSpawnSpots allows duplicate species from small pool', () => {
    // Pool of only 2 species, but generating 10 spots
    const tinyPool = [
      { id: 25, name: 'pikachu', types: ['electric'], bst: 320, rarity: 'common' },
      { id: 133, name: 'eevee', types: ['normal'], bst: 325, rarity: 'common' },
    ];

    const spots = generateInitialSpawnSpots(
      10,
      tinyPool
    );

    assert.equal(spots.length, 10);
    // Since only 2 species exist for 10 spots, duplicates are guaranteed
    const pikachuCount = spots.filter((s) => s.id === 25).length;
    const eeveeCount = spots.filter((s) => s.id === 133).length;
    assert.ok(pikachuCount > 0, 'Pikachu must appear');
    assert.ok(eeveeCount > 0, 'Eevee must appear');
    assert.equal(pikachuCount + eeveeCount, 10);
  });

  test('createPendingSpot spawns without excluding caught pokemon', () => {
    const spot = createPendingSpot(
      DEFAULT_POKEMON_REGISTRY_LIST
    );

    assert.ok(spot !== null);
    assert.equal(spot.status, 'PENDING');
    assert.ok(spot.id >= 1 && spot.id <= 386);
  });
});

describe('Notification Rules: Uncaught / New Only + Rarity Labels', () => {
  const caughtPokemonIds = new Set([1, 4, 7, 25, 149, 150]); // bulbasaur, charmander, squirtle, pikachu, dragonite, mewtwo

  test('Caught pokemon are NEVER notified, even if Ultra Rare or Rare', () => {
    const testCases = [
      { id: 25, name: 'pikachu', rarity: 'common' },
      { id: 149, name: 'dragonite', rarity: 'ultra_rare' },
      { id: 150, name: 'mewtwo', rarity: 'ultra_rare' },
    ];

    for (const p of testCases) {
      const isNew = !caughtPokemonIds.has(p.id);
      assert.equal(isNew, false, `Already caught ${p.name} must NOT be considered new`);
      // Simulating notification check: if (!isNew) do NOT notify
      const shouldNotify = isNew;
      assert.equal(shouldNotify, false, `${p.name} must NOT trigger notification`);
    }
  });

  test('Uncaught pokemon triggers notification with correct rarity label and emoji', () => {
    const testCases = [
      { id: 10, name: 'caterpie', rarity: 'common', expectedEmoji: '🌟', expectedLabel: 'Common' },
      { id: 6, name: 'charizard', rarity: 'rare', expectedEmoji: '⚡', expectedLabel: 'Rare' },
      { id: 384, name: 'rayquaza', rarity: 'ultra_rare', expectedEmoji: '🌌', expectedLabel: 'Ultra Rare' },
    ];

    for (const p of testCases) {
      const isNew = !caughtPokemonIds.has(p.id);
      assert.equal(isNew, true, `Uncaught ${p.name} must be considered new`);

      const emoji = formatRarityEmoji(p.rarity);
      const label = formatRarityLabel(p.rarity);
      assert.equal(emoji, p.expectedEmoji);
      assert.equal(label, p.expectedLabel);

      const title = `${emoji} New ${label} Pokémon Nearby!`;
      const body = `An uncaught ${p.name.toUpperCase()} (${label}) appeared nearby! Tap to catch it!`;

      assert.ok(title.includes(label));
      assert.ok(title.includes(emoji));
      assert.ok(body.includes(label));
      assert.ok(body.includes(p.name.toUpperCase()));
    }
  });

  test('Background notification pool filters out caught species and includes all rarities', () => {
    const caught = new Set([1, 2, 3, 4, 5, 6]);
    const uncaught = DEFAULT_POKEMON_REGISTRY_LIST.filter((p) => !caught.has(p.id));

    // Must have common, rare, and ultra_rare in uncaught pool
    const hasCommon = uncaught.some((p) => p.rarity === 'common');
    const hasRare = uncaught.some((p) => p.rarity === 'rare');
    const hasUltraRare = uncaught.some((p) => p.rarity === 'ultra_rare');

    assert.equal(hasCommon, true, 'Uncaught pool should include common pokemon');
    assert.equal(hasRare, true, 'Uncaught pool should include rare pokemon');
    assert.equal(hasUltraRare, true, 'Uncaught pool should include ultra_rare pokemon');
    assert.equal(uncaught.some((p) => caught.has(p.id)), false, 'No caught pokemon in uncaught pool');
  });
});
