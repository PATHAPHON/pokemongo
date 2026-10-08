import type { PokemonMeta } from '@/shared/constants/pokemon-registry-data';
import { DEFAULT_POKEMON_REGISTRY_LIST } from '@/shared/constants/pokemon-registry-data';
import type { PokemonRarity } from '@/shared/types';

const getAllPokemonMeta = (): PokemonMeta[] => DEFAULT_POKEMON_REGISTRY_LIST;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationPreset {
  id: string;
  name: string;
  country: string;
  coords: Coordinates;
}

export const PRESET_LOCATIONS: LocationPreset[] = [
  {
    id: 'sydney',
    name: 'Sydney Opera House',
    country: '🇦🇺 Australia',
    coords: { latitude: -33.8568, longitude: 151.2153 },
  },
  {
    id: 'tokyo',
    name: 'Shibuya Crossing',
    country: '🇯🇵 Japan',
    coords: { latitude: 35.6595, longitude: 139.7005 },
  },
  {
    id: 'newyork',
    name: 'Central Park',
    country: '🇺🇸 USA',
    coords: { latitude: 40.7829, longitude: -73.9654 },
  },
  {
    id: 'bangkok',
    name: 'Siam Paragon',
    country: '🇹🇭 Thailand',
    coords: { latitude: 13.7462, longitude: 100.5347 },
  },
  {
    id: 'udon',
    name: 'สวนสาธารณะหนองประจักษ์ (อุดรธานี)',
    country: '🇹🇭 Udon Thani',
    coords: { latitude: 17.4138, longitude: 102.7872 },
  },
];

export const DEFAULT_PRESET: LocationPreset = PRESET_LOCATIONS[0];

export interface WildPokemon {
  instanceId: string;
  id: number;
  name: string;
  rarity: PokemonRarity;
  latitude: number;
  longitude: number;
  types: string[];
  status: 'PENDING' | 'ACTIVE';
  spawnedAt: number; // When spot turns ACTIVE
  expiresAt: number; // When ACTIVE spot despawns (spawnedAt + 60_000)
  createdAt: number;
}

/**
 * OOP Class managing procedural spawning and spatial mathematics
 */
export class PokemonSpawnEngine {
  private static instance: PokemonSpawnEngine | null = null;

  public static getInstance(): PokemonSpawnEngine {
    if (!PokemonSpawnEngine.instance) {
      PokemonSpawnEngine.instance = new PokemonSpawnEngine();
    }
    return PokemonSpawnEngine.instance;
  }

  /**
   * Calculates great-circle distance between two geographic coordinates using Haversine formula (in meters).
   */
  public calculateDistanceInMeters(
    coord1: Coordinates,
    coord2: Coordinates
  ): number {
    const R = 6371e3; // Earth radius in meters
    const lat1Rad = (coord1.latitude * Math.PI) / 180;
    const lat2Rad = (coord2.latitude * Math.PI) / 180;
    const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
    const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1Rad) *
        Math.cos(lat2Rad) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Offsets a coordinate randomly within the visible screen area at zoom 18.5
   */
  public getRandomNearbyCoordinate(
    center: Coordinates,
    minDistMeters: number = 14,
    maxDistMeters: number = 78
  ): Coordinates {
    const angle = Math.random() * Math.PI * 2;
    const distance =
      minDistMeters + Math.random() * (maxDistMeters - minDistMeters);

    // Scaled for rectangular screen bounds at zoom 18.5
    const dx = Math.cos(angle) * Math.min(distance, 62);
    const dy = Math.sin(angle) * Math.min(distance, 88);

    const deltaLat = dy / 111320;
    const deltaLng =
      dx / (111320 * Math.cos((center.latitude * Math.PI) / 180));

    return {
      latitude: center.latitude + deltaLat,
      longitude: center.longitude + deltaLng,
    };
  }

  /**
   * Creates an ACTIVE event-featured pokemon spot located right at the event venue.
   */
  public createEventPokemonSpot(
    center: Coordinates,
    pokemonId: number
  ): WildPokemon {
    const meta = getAllPokemonMeta().find((p) => p.id === pokemonId) || {
      id: pokemonId,
      name: 'pikachu',
      rarity: 'rare' as PokemonRarity,
      types: ['electric'],
      bst: 320,
    };

    const spawnCoord = this.getRandomNearbyCoordinate(center, 8, 25);
    const now = Date.now();
    const spawnedAt = now;
    const expiresAt = now + 600 * 1000; // 10 minutes at event venue

    return {
      instanceId: `evt-spot-${pokemonId}-${now}-${Math.random().toString(36).substring(2, 6)}`,
      id: meta.id,
      name: meta.name,
      rarity: meta.rarity,
      latitude: spawnCoord.latitude,
      longitude: spawnCoord.longitude,
      types: meta.types,
      status: 'ACTIVE',
      spawnedAt,
      expiresAt,
      createdAt: now,
    };
  }
}

// -------------------------------------------------------------
// Backwards-Compatible Facade Exports
// -------------------------------------------------------------

export function getDistanceInMeters(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  return PokemonSpawnEngine.getInstance().calculateDistanceInMeters(
    coord1,
    coord2
  );
}

export function createEventPokemonSpot(
  center: Coordinates,
  pokemonId: number
): WildPokemon {
  return PokemonSpawnEngine.getInstance().createEventPokemonSpot(
    center,
    pokemonId
  );
}
