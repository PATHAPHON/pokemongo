import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { DEFAULT_POKEMON_REGISTRY_LIST } from '../src/shared/constants/pokemon-registry-data.ts';
import { isPokemonInGen } from '../src/features/pokedex/types.ts';

describe('Pokédex System & Logic Tests', () => {
  test('Generation filtering boundary checks', () => {
    // Gen 1 boundaries (1 to 151)
    assert.equal(isPokemonInGen(1, 'gen1'), true, 'Bulbasaur (#1) is Gen 1');
    assert.equal(isPokemonInGen(151, 'gen1'), true, 'Mew (#151) is Gen 1');
    assert.equal(isPokemonInGen(152, 'gen1'), false, 'Chikorita (#152) is NOT Gen 1');

    // Gen 2 boundaries (152 to 251)
    assert.equal(isPokemonInGen(151, 'gen2'), false, 'Mew (#151) is NOT Gen 2');
    assert.equal(isPokemonInGen(152, 'gen2'), true, 'Chikorita (#152) is Gen 2');
    assert.equal(isPokemonInGen(251, 'gen2'), true, 'Celebi (#251) is Gen 2');
    assert.equal(isPokemonInGen(252, 'gen2'), false, 'Treecko (#252) is NOT Gen 2');

    // Gen 3 boundaries (252 to 386)
    assert.equal(isPokemonInGen(251, 'gen3'), false, 'Celebi (#251) is NOT Gen 3');
    assert.equal(isPokemonInGen(252, 'gen3'), true, 'Treecko (#252) is Gen 3');
    assert.equal(isPokemonInGen(386, 'gen3'), true, 'Deoxys (#386) is Gen 3');
    assert.equal(isPokemonInGen(387, 'gen3'), false, 'Turtwig (#387) is out of range');

    // All generations
    assert.equal(isPokemonInGen(1, 'all'), true);
    assert.equal(isPokemonInGen(200, 'all'), true);
    assert.equal(isPokemonInGen(386, 'all'), true);
  });

  test('Generation count verification', () => {
    const gen1List = DEFAULT_POKEMON_REGISTRY_LIST.filter((p) => isPokemonInGen(p.id, 'gen1'));
    const gen2List = DEFAULT_POKEMON_REGISTRY_LIST.filter((p) => isPokemonInGen(p.id, 'gen2'));
    const gen3List = DEFAULT_POKEMON_REGISTRY_LIST.filter((p) => isPokemonInGen(p.id, 'gen3'));

    assert.equal(gen1List.length, 151, 'Gen 1 must have exactly 151 Pokemon');
    assert.equal(gen2List.length, 100, 'Gen 2 must have exactly 100 Pokemon (152-251)');
    assert.equal(gen3List.length, 135, 'Gen 3 must have exactly 135 Pokemon (252-386)');
    assert.equal(
      gen1List.length + gen2List.length + gen3List.length,
      386,
      'Total must be 386 Pokemon'
    );
  });

  test('Caught vs Uncaught mapping and stats calculation', () => {
    const mockCaughtPokemon = [
      { instanceId: 'c1', pokemonId: 1, name: 'bulbasaur', caughtAt: '2026-09-01T10:00:00Z' },
      { instanceId: 'c2', pokemonId: 25, name: 'pikachu', caughtAt: '2026-09-02T12:00:00Z' },
      { instanceId: 'c3', pokemonId: 25, name: 'pikachu', caughtAt: '2026-09-03T14:00:00Z' },
      { instanceId: 'c4', pokemonId: 384, name: 'rayquaza', caughtAt: '2026-09-04T16:00:00Z' },
    ];

    // Compute caught species map
    const caughtMap = new Map();
    for (const item of mockCaughtPokemon) {
      const existing = caughtMap.get(item.pokemonId);
      if (existing) {
        existing.count += 1;
      } else {
        caughtMap.set(item.pokemonId, { count: 1, firstCaughtAt: item.caughtAt });
      }
    }

    // Build Pokedex entries
    const entries = DEFAULT_POKEMON_REGISTRY_LIST.map((meta) => {
      const stat = caughtMap.get(meta.id);
      return {
        id: meta.id,
        name: meta.name,
        types: meta.types,
        isCaught: Boolean(stat && stat.count > 0),
        caughtCount: stat ? stat.count : 0,
      };
    });

    const caughtEntries = entries.filter((e) => e.isCaught);
    const uncaughtEntries = entries.filter((e) => !e.isCaught);

    assert.equal(entries.length, 386);
    assert.equal(caughtEntries.length, 3, 'Exactly 3 distinct species caught');
    assert.equal(uncaughtEntries.length, 383, '383 species uncaught');

    // Pikachu check: caught 2 times
    const pikachuEntry = entries.find((e) => e.id === 25);
    assert.equal(pikachuEntry.isCaught, true);
    assert.equal(pikachuEntry.caughtCount, 2);

    // Charmander check: not caught
    const charmanderEntry = entries.find((e) => e.id === 4);
    assert.equal(charmanderEntry.isCaught, false);
    assert.equal(charmanderEntry.caughtCount, 0);

    // Rayquaza check: Gen 3 legendary caught
    const rayquazaEntry = entries.find((e) => e.id === 384);
    assert.equal(rayquazaEntry.isCaught, true);
    assert.equal(rayquazaEntry.caughtCount, 1);

    // Percentage calculation
    const percentage = (caughtEntries.length / entries.length) * 100;
    assert.equal(percentage.toFixed(2), '0.78');
  });

  test('Search and filter behavior', () => {
    const mockEntries = [
      { id: 1, name: 'bulbasaur', isCaught: true },
      { id: 4, name: 'charmander', isCaught: false },
      { id: 7, name: 'squirtle', isCaught: false },
      { id: 25, name: 'pikachu', isCaught: true },
      { id: 152, name: 'chikorita', isCaught: false },
      { id: 384, name: 'rayquaza', isCaught: true },
    ];

    // Filter by search query (name)
    const pikaMatches = mockEntries.filter((e) =>
      e.name.toLowerCase().includes('pika')
    );
    assert.equal(pikaMatches.length, 1);
    assert.equal(pikaMatches[0].name, 'pikachu');

    // Filter by search query (id or #id)
    const idMatches = mockEntries.filter((e) => {
      const q = '#025'.replace(/^#/, '');
      return String(e.id).padStart(3, '0').includes(q);
    });
    assert.equal(idMatches.length, 1);
    assert.equal(idMatches[0].id, 25);

    // Filter caught only
    const caughtOnly = mockEntries.filter((e) => e.isCaught);
    assert.equal(caughtOnly.length, 3);
    assert.deepEqual(
      caughtOnly.map((e) => e.name),
      ['bulbasaur', 'pikachu', 'rayquaza']
    );

    // Filter uncaught only
    const uncaughtOnly = mockEntries.filter((e) => !e.isCaught);
    assert.equal(uncaughtOnly.length, 3);
    assert.deepEqual(
      uncaughtOnly.map((e) => e.name),
      ['charmander', 'squirtle', 'chikorita']
    );

    // Combined: Gen 1 + Caught only
    const gen1Caught = mockEntries.filter(
      (e) => isPokemonInGen(e.id, 'gen1') && e.isCaught
    );
    assert.equal(gen1Caught.length, 2);
    assert.deepEqual(
      gen1Caught.map((e) => e.name),
      ['bulbasaur', 'pikachu']
    );
  });
});
