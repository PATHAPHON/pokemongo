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
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed';

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

export interface PokemonListItem {
  id: number;
  name: string;
  url: string;
  artwork: string;
}

export interface IndividualValues {
  attack: number; // 0 - 15
  defense: number; // 0 - 15
  stamina: number; // 0 - 15
}

export interface CaughtPokemon {
  instanceId: string; // Unique UUID
  pokemonId: number;
  nickname?: string;
  name: string;
  artwork: string;
  types: PokemonTypeName[];
  cp: number;
  level: number;
  iv: IndividualValues;
  stats: PokemonStat[];
  height: number;
  weight: number;
  caughtAt: string; // ISO date string
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  favorite?: boolean;
}
