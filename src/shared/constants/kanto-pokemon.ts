import { PokemonRarity } from '@/shared/types';

export function getKantoArtworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function getKantoSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export function getKantoAnimatedSpriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/${id}.gif`;
}

export const getArtworkUrl = getKantoArtworkUrl;
export const getSpriteUrl = getKantoSpriteUrl;

export function formatPokemonId(id: number): string {
  return `#${String(id).padStart(3, '0')}`;
}

export function capitalizePokemonName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const ULTRA_RARE_IDS = new Set<number>([
  3, 6, 9, 94, 130, 131, 143, 144, 145, 146, 149, 150, 151,
]);

const RARE_IDS = new Set<number>([
  1, 2, 4, 5, 7, 8, 25, 26, 31, 34, 38, 59, 65, 68, 71, 76, 78, 80, 89, 91, 103,
  105, 106, 107, 110, 112, 113, 115, 121, 122, 123, 124, 125, 126, 127, 128,
  133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 147, 148,
]);

export function getPokemonRarity(id: number): PokemonRarity {
  if (ULTRA_RARE_IDS.has(id)) return 'ultra_rare';
  if (RARE_IDS.has(id)) return 'rare';
  return 'common';
}

export function getRarityLabel(rarity: PokemonRarity): string {
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
