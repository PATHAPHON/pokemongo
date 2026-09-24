import { CaughtPokemon, PokemonTypeName } from './pokemon';

export interface WildPokemon {
  spawnId: string;
  pokemonId: number;
  name: string;
  artwork: string;
  types: PokemonTypeName[];
  latitude: number;
  longitude: number;
  cp: number;
  spawnTime: number; // timestamp
  despawnTime: number; // timestamp
  baseCatchRate: number; // 0.0 - 1.0
  fleeRate: number; // 0.0 - 1.0
}

export type CatchStatus = 'success' | 'escaped' | 'fled' | 'missed';

export type ThrowRating = 'nice' | 'great' | 'excellent' | 'normal';

export interface CatchResult {
  status: CatchStatus;
  pokemon?: CaughtPokemon;
  earnedExp: number;
  earnedStardust: number;
  earnedCandy: number;
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
