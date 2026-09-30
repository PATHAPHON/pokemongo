import type { PokemonTypeName, PokemonRarity } from '../../shared/types';

export type PokedexStatusFilter = 'all' | 'caught' | 'uncaught';
export type PokedexGenFilter = 'all' | 'gen1' | 'gen2' | 'gen3';

export function isPokemonInGen(id: number, gen: PokedexGenFilter): boolean {
  if (gen === 'gen1') return id >= 1 && id <= 151;
  if (gen === 'gen2') return id >= 152 && id <= 251;
  if (gen === 'gen3') return id >= 252 && id <= 386;
  return true;
}

export interface PokedexEntry {
  id: number;
  name: string;
  types: PokemonTypeName[];
  rarity: PokemonRarity;
  bst: number;
  isCaught: boolean;
  caughtCount: number;
  firstCaughtAt?: string;
}

export interface PokedexStats {
  total: number;
  caught: number;
  uncaught: number;
  percentage: number;
}
