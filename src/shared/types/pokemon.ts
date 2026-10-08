export type PokemonTypeName =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'fairy'
  | 'dark';

export type PokemonStatName =
  'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';

export interface PokemonStat {
  name: PokemonStatName;
  baseStat: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonTypeName[];
  sprite: string;
  artwork: string;
  height: number; // decimeters
  weight: number; // hectograms
  stats: PokemonStat[];
  description?: string;
}

export type PokemonRarity = 'common' | 'rare' | 'ultra_rare';

export interface CaughtPokemon {
  instanceId: string; // Unique UUID
  pokemonId: number;
  nickname?: string;
  name: string;
  artwork: string;
  types: PokemonTypeName[];
  rarity: PokemonRarity;
  height?: number;
  weight?: number;
  caughtAt: string; // ISO date string
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  favorite?: boolean;
}
