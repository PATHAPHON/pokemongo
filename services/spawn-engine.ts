import {
  KANTO_POKEMON_LIST,
  KantoPokemonMeta,
} from '@/constants/kanto-pokemon';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type SpawnStatus = 'PENDING' | 'ACTIVE';

export interface WildPokemon {
  instanceId: string;
  id: number;
  name: string;
  cp: number;
  latitude: number;
  longitude: number;
  types: string[];
  status: SpawnStatus;
  spawnedAt: number; // When spot turns ACTIVE
  expiresAt: number; // When ACTIVE spot despawns (spawnedAt + 60_000)
  createdAt: number;
}

// Fallback coordinate: Siam Paragon, Bangkok
export const DEFAULT_COORDINATES: Coordinates = {
  latitude: 13.7466,
  longitude: 100.5349,
};

// Radius within which player can tap and catch a pokemon
export const INTERACTION_RADIUS_METERS = 50;

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula (in meters).
 */
export function getDistanceInMeters(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371e3; // Earth radius in meters
  const lat1Rad = (coord1.latitude * Math.PI) / 180;
  const lat2Rad = (coord2.latitude * Math.PI) / 180;
  const deltaLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const deltaLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Offsets a coordinate randomly within the visible screen area at zoom 18.5
 * (Screen width ~ 120-140m across, screen height ~ 180-220m across).
 */
/**
 * Offsets a coordinate randomly within the visible screen area at zoom 18.5
 * (Screen width ~ 120-140m across, screen height ~ 180-220m across).
 */
export function getRandomNearbyCoordinate(
  center: Coordinates,
  minDistMeters: number = 14,
  maxDistMeters: number = 78
): Coordinates {
  const angle = Math.random() * Math.PI * 2;
  const distance = minDistMeters + Math.random() * (maxDistMeters - minDistMeters);

  // Scaled for rectangular screen bounds at zoom 18.5
  const dx = Math.cos(angle) * Math.min(distance, 62);
  const dy = Math.sin(angle) * Math.min(distance, 88);

  const deltaLat = dy / 111320;
  const deltaLng = dx / (111320 * Math.cos((center.latitude * Math.PI) / 180));

  return {
    latitude: center.latitude + deltaLat,
    longitude: center.longitude + deltaLng,
  };
}

/**
 * Generates a scattered coordinate ensuring minimum distance from player and other spawns.
 */
export function getScatteredCoordinate(
  center: Coordinates,
  existingCoords: Coordinates[] = [],
  minSeparationMeters: number = 14
): Coordinates {
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = getRandomNearbyCoordinate(center, 12, 80);
    const isOverlapping = existingCoords.some(
      (c) => getDistanceInMeters(c, candidate) < minSeparationMeters
    );
    if (!isOverlapping) return candidate;
  }
  return getRandomNearbyCoordinate(center, 12, 80);
}

/**
 * Creates a single wild Pokemon near the given center coordinates.
 */
export function createWildPokemon(
  center: Coordinates,
  trainerLevel: number = 1,
  minDist = 12,
  maxDist = 80
): WildPokemon {
  const randomIndex = Math.floor(Math.random() * KANTO_POKEMON_LIST.length);
  const meta: KantoPokemonMeta = KANTO_POKEMON_LIST[randomIndex];
  const spawnCoord = getRandomNearbyCoordinate(center, minDist, maxDist);

  const minCP = 10;
  const maxCP = Math.max(100, trainerLevel * 75);
  const cp = Math.floor(minCP + Math.random() * (maxCP - minCP));

  const now = Date.now();
  const lifespanMs = 60 * 1000; // 60 seconds lifespan

  return {
    instanceId: `${meta.id}-${now}-${Math.random().toString(36).substring(2, 7)}`,
    id: meta.id,
    name: meta.name,
    cp,
    latitude: spawnCoord.latitude,
    longitude: spawnCoord.longitude,
    types: meta.types,
    status: 'ACTIVE',
    spawnedAt: now,
    expiresAt: now + lifespanMs,
    createdAt: now,
  };
}

/**
 * Creates a new PENDING spot (countdown 10s) at a random new coordinate on screen.
 */
export function createPendingSpot(
  center: Coordinates,
  trainerLevel: number = 1,
  delayMs: number = 10000,
  existingCoords: Coordinates[] = []
): WildPokemon {
  const randomIndex = Math.floor(Math.random() * KANTO_POKEMON_LIST.length);
  const meta: KantoPokemonMeta = KANTO_POKEMON_LIST[randomIndex];
  const spawnCoord = getScatteredCoordinate(center, existingCoords, 14);

  const minCP = 10;
  const maxCP = Math.max(100, trainerLevel * 75);
  const cp = Math.floor(minCP + Math.random() * (maxCP - minCP));

  const now = Date.now();
  const spawnedAt = now + delayMs;
  const expiresAt = spawnedAt + 60 * 1000;

  return {
    instanceId: `spot-${meta.id}-${now}-${Math.random().toString(36).substring(2, 7)}`,
    id: meta.id,
    name: meta.name,
    cp,
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
 * Generates initial 15 spots staggered with mixed ACTIVE and PENDING states.
 */
export function generateInitialSpawnSpots(
  center: Coordinates,
  totalCount: number = 15,
  trainerLevel: number = 1
): WildPokemon[] {
  const spots: WildPokemon[] = [];
  const coords: Coordinates[] = [];
  const now = Date.now();

  const activeCount = Math.floor(totalCount * 0.65); // ~10 active
  const pendingCount = totalCount - activeCount; // ~5 pending

  // 1. Initial ACTIVE spots with staggered remaining lifetime (15s to 55s)
  for (let i = 0; i < activeCount; i++) {
    const randomIndex = Math.floor(Math.random() * KANTO_POKEMON_LIST.length);
    const meta: KantoPokemonMeta = KANTO_POKEMON_LIST[randomIndex];
    const spawnCoord = getScatteredCoordinate(center, coords, 14);
    coords.push(spawnCoord);

    const minCP = 10;
    const maxCP = Math.max(100, trainerLevel * 75);
    const cp = Math.floor(minCP + Math.random() * (maxCP - minCP));

    const remainingMs = Math.floor(15000 + Math.random() * 40000); // 15s to 55s left
    const expiresAt = now + remainingMs;
    const spawnedAt = expiresAt - 60000;

    spots.push({
      instanceId: `spot-${meta.id}-${now}-${i}-${Math.random().toString(36).substring(2, 6)}`,
      id: meta.id,
      name: meta.name,
      cp,
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
    const randomIndex = Math.floor(Math.random() * KANTO_POKEMON_LIST.length);
    const meta: KantoPokemonMeta = KANTO_POKEMON_LIST[randomIndex];
    const spawnCoord = getScatteredCoordinate(center, coords, 14);
    coords.push(spawnCoord);

    const minCP = 10;
    const maxCP = Math.max(100, trainerLevel * 75);
    const cp = Math.floor(minCP + Math.random() * (maxCP - minCP));

    const delayMs = Math.floor(2000 + Math.random() * 7000); // 2s to 9s countdown
    const spawnedAt = now + delayMs;
    const expiresAt = spawnedAt + 60000;

    spots.push({
      instanceId: `spot-${meta.id}-${now}-${activeCount + i}-${Math.random().toString(36).substring(2, 6)}`,
      id: meta.id,
      name: meta.name,
      cp,
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

/**
 * Generates an initial pool or batch of wild Pokemon around center coordinates.
 */
export function generateSpawns(
  center: Coordinates,
  count: number = 15,
  trainerLevel: number = 1
): WildPokemon[] {
  return generateInitialSpawnSpots(center, count, trainerLevel);
}

/**
 * Filters out expired spawns based on the current timestamp.
 */
export function filterExpiredSpawns(spawns: WildPokemon[], now: number = Date.now()): WildPokemon[] {
  return spawns.filter((pokemon) => pokemon.expiresAt > now);
}
