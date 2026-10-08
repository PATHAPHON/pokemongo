import type { PokemonTypeName, PokemonRarity } from '../../shared/types';

export type PokedexStatusFilter = 'all' | 'caught' | 'uncaught';

export interface PokedexEntry {
  id: number;
  name: string;
  types: PokemonTypeName[];
  rarity: PokemonRarity;
  isCaught: boolean;
  caughtCount: number;
}

export interface PokedexStats {
  total: number;
  caught: number;
  uncaught: number;
  percentage: number;
}
