import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_POKEMON_REGISTRY_LIST,
  computeRarityFromBST,
} from '../src/shared/constants/pokemon-registry-data.ts';

// Mirror of the spawn engine sampling logic to test contract
function generateInitialSpawnSpots(totalCount, pool, excludeIds = new Set()) {
  const availablePool = pool.filter((p) => !excludeIds.has(p.id));
  if (availablePool.length === 0) return [];

  const shuffled = [...availablePool].sort(() => Math.random() - 0.5);
  const actualCount = Math.min(totalCount, shuffled.length);
  const spots = [];

  for (let i = 0; i < actualCount; i++) {
    const meta = shuffled[i];
    spots.push({
      instanceId: `spot-${meta.id}-${Date.now()}-${i}`,
      id: meta.id,
      name: meta.name,
      rarity: meta.rarity,
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
  };
}

describe('Gen 1 - Gen 3 Pokemon Registry Tests', () => {
  test('Registry contains exactly 386 Pokemon without gaps', () => {
    assert.equal(DEFAULT_POKEMON_REGISTRY_LIST.length, 386);

    const ids = DEFAULT_POKEMON_REGISTRY_LIST.map((p) => p.id);
    for (let i = 1; i <= 386; i++) {
      assert.equal(ids[i - 1], i, `Expected Pokemon ID ${i} at index ${i - 1}`);
    }
  });

  test('Generation boundaries and iconic species', () => {
    // Gen 1
    const p1 = DEFAULT_POKEMON_REGISTRY_LIST[0];
    assert.equal(p1.id, 1);
    assert.equal(p1.name, 'bulbasaur');

    const p151 = DEFAULT_POKEMON_REGISTRY_LIST[150];
    assert.equal(p151.id, 151);
    assert.equal(p151.name, 'mew');

    // Gen 2
    const p152 = DEFAULT_POKEMON_REGISTRY_LIST[151];
    assert.equal(p152.id, 152);
    assert.equal(p152.name, 'chikorita');

    const p251 = DEFAULT_POKEMON_REGISTRY_LIST[250];
    assert.equal(p251.id, 251);
    assert.equal(p251.name, 'celebi');

    // Gen 3
    const p252 = DEFAULT_POKEMON_REGISTRY_LIST[251];
    assert.equal(p252.id, 252);
    assert.equal(p252.name, 'treecko');

    const p386 = DEFAULT_POKEMON_REGISTRY_LIST[385];
    assert.equal(p386.id, 386);
    assert.equal(p386.name, 'deoxys-normal');
  });

  test('BST-based rarity calculation', () => {
    // Ultra Rare (BST >= 580)
    assert.equal(computeRarityFromBST(680), 'ultra_rare'); // Mewtwo / Rayquaza
    assert.equal(computeRarityFromBST(600), 'ultra_rare'); // Dragonite / Tyranitar / Salamence
    assert.equal(computeRarityFromBST(580), 'ultra_rare'); // Legendary birds / beasts / golems

    // Rare (400 <= BST < 580)
    assert.equal(computeRarityFromBST(530), 'rare'); // Blastoise / Sceptile
    assert.equal(computeRarityFromBST(405), 'rare'); // Starters 2nd stage
    assert.equal(computeRarityFromBST(400), 'rare'); // Boundary

    // Common (BST < 400)
    assert.equal(computeRarityFromBST(399), 'common');
    assert.equal(computeRarityFromBST(318), 'common'); // Bulbasaur
    assert.equal(computeRarityFromBST(195), 'common'); // Caterpie
  });

  test('Iconic Gen 2 and Gen 3 Pokémon have correct assigned rarities', () => {
    const byId = new Map(DEFAULT_POKEMON_REGISTRY_LIST.map((p) => [p.id, p]));

    // Gen 2 Powerhouses
    assert.equal(byId.get(248)?.rarity, 'ultra_rare'); // Tyranitar
    assert.equal(byId.get(249)?.rarity, 'ultra_rare'); // Lugia
    assert.equal(byId.get(250)?.rarity, 'ultra_rare'); // Ho-Oh
    assert.equal(byId.get(160)?.rarity, 'rare'); // Feraligatr
    assert.equal(byId.get(152)?.rarity, 'common'); // Chikorita

    // Gen 3 Powerhouses
    assert.equal(byId.get(373)?.rarity, 'ultra_rare'); // Salamence
    assert.equal(byId.get(376)?.rarity, 'ultra_rare'); // Metagross
    assert.equal(byId.get(382)?.rarity, 'ultra_rare'); // Kyogre
    assert.equal(byId.get(384)?.rarity, 'ultra_rare'); // Rayquaza
    assert.equal(byId.get(254)?.rarity, 'rare'); // Sceptile
    assert.equal(byId.get(257)?.rarity, 'rare'); // Blaziken
    assert.equal(byId.get(260)?.rarity, 'rare'); // Swampert
    assert.equal(byId.get(252)?.rarity, 'common'); // Treecko
  });
});

describe('Spawn Engine Unique & Non-Duplicate Mechanics', () => {
  test('Initial spawns do NOT duplicate species among themselves', () => {
    const spawns = generateInitialSpawnSpots(
      15,
      DEFAULT_POKEMON_REGISTRY_LIST,
      new Set()
    );

    assert.equal(spawns.length, 15);
    const spawnedSpeciesIds = spawns.map((s) => s.id);
    const uniqueSpeciesIds = new Set(spawnedSpeciesIds);

    assert.equal(
      uniqueSpeciesIds.size,
      15,
      'Every initial spawn on map must be a distinct Pokemon species'
    );
  });

  test('Already caught Pokemon NEVER spawn again', () => {
    // Trainer has caught species including Bulbasaur, Pikachu, Treecko, Kyogre
    const caught = new Set([1, 4, 7, 25, 150, 152, 248, 252, 382, 384]);

    for (let testRun = 0; testRun < 20; testRun++) {
      const spawns = generateInitialSpawnSpots(
        15,
        DEFAULT_POKEMON_REGISTRY_LIST,
        caught
      );

      for (const spawn of spawns) {
        assert.equal(
          caught.has(spawn.id),
          false,
          `Pokemon ID ${spawn.id} (${spawn.name}) was caught and must NOT spawn!`
        );
      }
    }
  });

  test('When remaining uncaught pool is small (< 15), spawns only up to uncaught count without duplicates', () => {
    // Only 4 uncaught Pokemon left
    const uncaughtIds = [152, 252, 382, 384];
    const allExcept4 = new Set();
    for (let id = 1; id <= 386; id++) {
      if (!uncaughtIds.includes(id)) {
        allExcept4.add(id);
      }
    }

    const spawns = generateInitialSpawnSpots(
      15,
      DEFAULT_POKEMON_REGISTRY_LIST,
      allExcept4
    );

    assert.equal(spawns.length, 4, 'Should spawn exactly 4 spots');
    const spawnedIds = new Set(spawns.map((s) => s.id));
    assert.deepEqual(
      Array.from(spawnedIds).sort((a, b) => a - b),
      [152, 252, 382, 384]
    );
  });

  test('When ALL 386 species are caught, 0 spawns are created', () => {
    const allCaught = new Set();
    for (let id = 1; id <= 386; id++) {
      allCaught.add(id);
    }

    const spawns = generateInitialSpawnSpots(
      15,
      DEFAULT_POKEMON_REGISTRY_LIST,
      allCaught
    );

    assert.equal(spawns.length, 0, 'No spots should spawn when all are caught');

    const singleSpot = createPendingSpot(
      DEFAULT_POKEMON_REGISTRY_LIST,
      allCaught
    );
    assert.equal(singleSpot, null, 'createPendingSpot must return null when pool is exhausted');
  });

  test('createPendingSpot respects excludeIds including currently active spawns', () => {
    const exclude = new Set([1, 2, 3, 4, 5]);
    const spot = createPendingSpot(
      DEFAULT_POKEMON_REGISTRY_LIST,
      exclude
    );

    assert.ok(spot !== null);
    assert.equal(exclude.has(spot.id), false);
  });
});
