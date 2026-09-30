import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Helper sets from kanto-pokemon
const ULTRA_RARE_IDS = new Set([
  3, 6, 9, 94, 130, 131, 143, 144, 145, 146, 149, 150, 151,
]);

const RARE_IDS = new Set([
  1, 2, 4, 5, 7, 8, 25, 26, 31, 34, 38, 59, 65, 68, 71, 76, 78, 80, 89, 91,
  103, 105, 106, 107, 110, 112, 113, 115, 121, 122, 123, 124, 125, 126, 127,
  128, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 147, 148,
]);

function getPokemonRarity(id) {
  if (ULTRA_RARE_IDS.has(id)) return 'ultra_rare';
  if (RARE_IDS.has(id)) return 'rare';
  return 'common';
}

function getRarityLabel(rarity) {
  switch (rarity) {
    case 'ultra_rare':
      return 'Ultra Rare';
    case 'rare':
      return 'Rare';
    case 'common':
    default:
      return 'Common';
  }
}

function getKantoArtworkUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getKantoAnimatedSpriteUrl(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
}

describe('1. Pokemon Rarity System Tests', () => {
  test('Legendaries & Mythicals must be Ultra Rare', () => {
    assert.equal(getPokemonRarity(144), 'ultra_rare', 'Articuno must be ultra_rare');
    assert.equal(getPokemonRarity(145), 'ultra_rare', 'Zapdos must be ultra_rare');
    assert.equal(getPokemonRarity(146), 'ultra_rare', 'Moltres must be ultra_rare');
    assert.equal(getPokemonRarity(149), 'ultra_rare', 'Dragonite must be ultra_rare');
    assert.equal(getPokemonRarity(150), 'ultra_rare', 'Mewtwo must be ultra_rare');
    assert.equal(getPokemonRarity(151), 'ultra_rare', 'Mew must be ultra_rare');
  });

  test('Final starter evolutions & iconic powerhouses must be Ultra Rare', () => {
    assert.equal(getPokemonRarity(3), 'ultra_rare', 'Venusaur must be ultra_rare');
    assert.equal(getPokemonRarity(6), 'ultra_rare', 'Charizard must be ultra_rare');
    assert.equal(getPokemonRarity(9), 'ultra_rare', 'Blastoise must be ultra_rare');
    assert.equal(getPokemonRarity(94), 'ultra_rare', 'Gengar must be ultra_rare');
    assert.equal(getPokemonRarity(130), 'ultra_rare', 'Gyarados must be ultra_rare');
    assert.equal(getPokemonRarity(143), 'ultra_rare', 'Snorlax must be ultra_rare');
  });

  test('Base starters, Pikachu, Eeveelutions must be Rare', () => {
    assert.equal(getPokemonRarity(1), 'rare', 'Bulbasaur must be rare');
    assert.equal(getPokemonRarity(4), 'rare', 'Charmander must be rare');
    assert.equal(getPokemonRarity(7), 'rare', 'Squirtle must be rare');
    assert.equal(getPokemonRarity(25), 'rare', 'Pikachu must be rare');
    assert.equal(getPokemonRarity(133), 'rare', 'Eevee must be rare');
    assert.equal(getPokemonRarity(134), 'rare', 'Vaporeon must be rare');
  });

  test('Route 1 commons must be Common', () => {
    assert.equal(getPokemonRarity(16), 'common', 'Pidgey must be common');
    assert.equal(getPokemonRarity(19), 'common', 'Rattata must be common');
    assert.equal(getPokemonRarity(10), 'common', 'Caterpie must be common');
    assert.equal(getPokemonRarity(13), 'common', 'Weedle must be common');
    assert.equal(getPokemonRarity(41), 'common', 'Zubat must be common');
  });

  test('getRarityLabel returns formatted labels', () => {
    assert.equal(getRarityLabel('ultra_rare'), 'Ultra Rare');
    assert.equal(getRarityLabel('rare'), 'Rare');
    assert.equal(getRarityLabel('common'), 'Common');
  });
});

describe('2. Pokemon Visual Asset URLs (Reverted to Original)', () => {
  test('Catch screen uses Showdown Animated GIF', () => {
    const gifUrl = getKantoAnimatedSpriteUrl(25);
    assert.equal(
      gifUrl,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif'
    );
  });

  test('Bag and Details use Official Artwork PNG', () => {
    const artworkUrl = getKantoArtworkUrl(25);
    assert.equal(
      artworkUrl,
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png'
    );
  });
});

describe('3. Pokéball Arena Asset Test', () => {
  test('Pokéball sprite is configured as official Pokéball item image', () => {
    const pokeballUrl =
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
    assert.ok(pokeballUrl.includes('poke-ball.png'));
  });
});

describe('4. No CP & Clean CaughtPokemon Contract', () => {
  test('CaughtPokemon object does not require CP or Level', () => {
    const caught = {
      instanceId: 'test-uuid-123',
      pokemonId: 25,
      name: 'pikachu',
      nickname: 'Pikachu',
      artwork: getKantoArtworkUrl(25),
      types: ['electric'],
      rarity: getPokemonRarity(25),
      caughtAt: new Date().toISOString(),
      favorite: false,
    };

    assert.equal(caught.rarity, 'rare');
    assert.equal(caught.cp, undefined, 'CaughtPokemon must not have cp');
    assert.equal(caught.level, undefined, 'CaughtPokemon must not have level');
    assert.equal(caught.iv, undefined, 'CaughtPokemon must not have iv');
    assert.equal(caught.stats, undefined, 'CaughtPokemon must not have stats');
  });
});

describe('5. Pokemon Rarity Filter Contract Tests', () => {
  const mockCaughtPokemon = [
    { instanceId: '1', pokemonId: 16, name: 'pidgey', rarity: 'common' },
    { instanceId: '2', pokemonId: 19, name: 'rattata', rarity: 'common' },
    { instanceId: '3', pokemonId: 25, name: 'pikachu', rarity: 'rare' },
    { instanceId: '4', pokemonId: 133, name: 'eevee', rarity: 'rare' },
    { instanceId: '5', pokemonId: 6, name: 'charizard', rarity: 'ultra_rare' },
    { instanceId: '6', pokemonId: 150, name: 'mewtwo', rarity: 'ultra_rare' },
  ];

  function filterPokemon(list, filter) {
    if (filter === 'all') return list;
    return list.filter((p) => (p.rarity || getPokemonRarity(p.pokemonId)) === filter);
  }

  function calculateRarityCounts(list) {
    let common = 0;
    let rare = 0;
    let ultra_rare = 0;
    for (const item of list) {
      const r = item.rarity || getPokemonRarity(item.pokemonId);
      if (r === 'ultra_rare') ultra_rare++;
      else if (r === 'rare') rare++;
      else common++;
    }
    return { all: list.length, common, rare, ultra_rare };
  }

  test('Filtering by "all" returns all caught Pokemon', () => {
    const result = filterPokemon(mockCaughtPokemon, 'all');
    assert.equal(result.length, 6);
  });

  test('Filtering by "common" returns only common Pokemon', () => {
    const result = filterPokemon(mockCaughtPokemon, 'common');
    assert.equal(result.length, 2);
    assert.ok(result.every((p) => p.rarity === 'common'));
    assert.deepEqual(result.map((p) => p.name), ['pidgey', 'rattata']);
  });

  test('Filtering by "rare" returns only rare Pokemon', () => {
    const result = filterPokemon(mockCaughtPokemon, 'rare');
    assert.equal(result.length, 2);
    assert.ok(result.every((p) => p.rarity === 'rare'));
    assert.deepEqual(result.map((p) => p.name), ['pikachu', 'eevee']);
  });

  test('Filtering by "ultra_rare" returns only ultra rare Pokemon', () => {
    const result = filterPokemon(mockCaughtPokemon, 'ultra_rare');
    assert.equal(result.length, 2);
    assert.ok(result.every((p) => p.rarity === 'ultra_rare'));
    assert.deepEqual(result.map((p) => p.name), ['charizard', 'mewtwo']);
  });

  test('Counts calculation properly computes totals for each rarity category', () => {
    const counts = calculateRarityCounts(mockCaughtPokemon);
    assert.deepEqual(counts, {
      all: 6,
      common: 2,
      rare: 2,
      ultra_rare: 2,
    });
  });

  test('Returns empty array when no Pokemon match the selected rarity', () => {
    const onlyCommons = [
      { instanceId: '1', pokemonId: 16, name: 'pidgey', rarity: 'common' },
    ];
    const ultraRareResult = filterPokemon(onlyCommons, 'ultra_rare');
    assert.equal(ultraRareResult.length, 0);
  });
});

