import {
  PokemonMeta,
  getAllPokemonMeta,
} from '@/shared/services/pokemon-registry';
import { PokemonRarity } from '@/shared/types';

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
];

export const DEFAULT_PRESET: LocationPreset = PRESET_LOCATIONS[0];

export type SpawnStatus = 'PENDING' | 'ACTIVE';

export interface WildPokemon {
  instanceId: string;
  id: number;
  name: string;
  rarity: PokemonRarity;
  latitude: number;
  longitude: number;
  types: string[];
  status: SpawnStatus;
  spawnedAt: number; // When spot turns ACTIVE
  expiresAt: number; // When ACTIVE spot despawns (spawnedAt + 60_000)
  createdAt: number;
}

/**
 * OOP Class managing procedural spawning and spatial mathematics
 */
class PokemonSpawnEngine {
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
   * Generates a scattered coordinate ensuring minimum distance from player and other spawns.
   */
  public getScatteredCoordinate(
    center: Coordinates,
    existingCoords: Coordinates[] = [],
    minSeparationMeters: number = 14
  ): Coordinates {
    for (let attempt = 0; attempt < 8; attempt++) {
      const candidate = this.getRandomNearbyCoordinate(center, 12, 80);
      const isOverlapping = existingCoords.some(
        (c) =>
          this.calculateDistanceInMeters(c, candidate) < minSeparationMeters
      );
      if (!isOverlapping) return candidate;
    }
    return this.getRandomNearbyCoordinate(center, 12, 80);
  }

  /**
   * Creates a new PENDING spot (countdown 10s) at a random new coordinate on screen.
   */
  public createPendingSpot(
    center: Coordinates,
    _trainerLevel: number = 1,
    delayMs: number = 10000,
    existingCoords: Coordinates[] = [],
    pool?: PokemonMeta[],
    excludeIds: Set<number> = new Set()
  ): WildPokemon | null {
    const availablePool = (pool || getAllPokemonMeta()).filter(
      (p) => !excludeIds.has(p.id)
    );
    if (availablePool.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availablePool.length);
    const meta: PokemonMeta = availablePool[randomIndex];
    const spawnCoord = this.getScatteredCoordinate(center, existingCoords, 14);

    const now = Date.now();
    const spawnedAt = now + delayMs;
    const expiresAt = spawnedAt + 60 * 1000;

    return {
      instanceId: `spot-${meta.id}-${now}-${Math.random().toString(36).substring(2, 7)}`,
      id: meta.id,
      name: meta.name,
      rarity: meta.rarity,
      latitude: spawnCoord.latitude,
      longitude: spawnCoord.longitude,
      types: meta.types,
      status: 'PENDING',
      spawnedAt,
      expiresAt,
      createdAt: now,
    };
  }

  /**
   * Generates initial spots staggered with mixed ACTIVE and PENDING states.
   * Ensures no duplicates among current spawns and excludes already caught species.
   */
  public generateInitialSpawnSpots(
    center: Coordinates,
    totalCount: number = 15,
    _trainerLevel: number = 1,
    pool?: PokemonMeta[],
    excludeIds: Set<number> = new Set()
  ): WildPokemon[] {
    const spots: WildPokemon[] = [];
    const coords: Coordinates[] = [];
    const now = Date.now();

    const availablePool = (pool || getAllPokemonMeta()).filter(
      (p) => !excludeIds.has(p.id)
    );
    if (availablePool.length === 0) return spots;

    const actualCount = totalCount;
    const activeCount = Math.floor(actualCount * 0.65);
    const pendingCount = actualCount - activeCount;

    // 1. Initial ACTIVE spots with staggered remaining lifetime (15s to 55s)
    for (let i = 0; i < activeCount; i++) {
      const meta: PokemonMeta =
        availablePool[Math.floor(Math.random() * availablePool.length)];
      const spawnCoord = this.getScatteredCoordinate(center, coords, 14);
      coords.push(spawnCoord);

      const remainingMs = Math.floor(15000 + Math.random() * 40000);
      const expiresAt = now + remainingMs;
      const spawnedAt = expiresAt - 60000;

      spots.push({
        instanceId: `spot-${meta.id}-${now}-${i}-${Math.random().toString(36).substring(2, 6)}`,
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
      });
    }

    // 2. Initial PENDING spots with staggered countdown (2s to 9s)
    for (let i = 0; i < pendingCount; i++) {
      const meta: PokemonMeta =
        availablePool[Math.floor(Math.random() * availablePool.length)];
      const spawnCoord = this.getScatteredCoordinate(center, coords, 14);
      coords.push(spawnCoord);

      const delayMs = Math.floor(2000 + Math.random() * 7000);
      const spawnedAt = now + delayMs;
      const expiresAt = spawnedAt + 60000;

      spots.push({
        instanceId: `spot-${meta.id}-${now}-${activeCount + i}-${Math.random().toString(36).substring(2, 6)}`,
        id: meta.id,
        name: meta.name,
        rarity: meta.rarity,
        latitude: spawnCoord.latitude,
        longitude: spawnCoord.longitude,
        types: meta.types,
        status: 'PENDING',
        spawnedAt,
        expiresAt,
        createdAt: now,
      });
    }

    return spots;
  }
}

export const defaultSpawnEngine = PokemonSpawnEngine.getInstance();

// -------------------------------------------------------------
// Backwards-Compatible Facade Exports
// -------------------------------------------------------------

export function getDistanceInMeters(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  return defaultSpawnEngine.calculateDistanceInMeters(coord1, coord2);
}

export function createPendingSpot(
  center: Coordinates,
  trainerLevel: number = 1,
  delayMs: number = 10000,
  existingCoords: Coordinates[] = [],
  pool?: PokemonMeta[],
  excludeIds?: Set<number>
): WildPokemon | null {
  return defaultSpawnEngine.createPendingSpot(
    center,
    trainerLevel,
    delayMs,
    existingCoords,
    pool,
    excludeIds
  );
}

export function generateInitialSpawnSpots(
  center: Coordinates,
  totalCount: number = 15,
  trainerLevel: number = 1,
  pool?: PokemonMeta[],
  excludeIds?: Set<number>
): WildPokemon[] {
  return defaultSpawnEngine.generateInitialSpawnSpots(
    center,
    totalCount,
    trainerLevel,
    pool,
    excludeIds
  );
}

