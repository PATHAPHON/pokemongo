import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Coordinates,
  WildPokemon,
  generateInitialSpawnSpots,
  createPendingSpot,
  getDistanceInMeters,
} from '../services/spawn-engine';
import {
  getAllPokemonMeta,
  getTotalPokemonCount,
} from '@/shared/services/pokemon-registry';

interface UseMapSpawnsOptions {
  location: Coordinates | null;
  trainerLevel?: number;
  caughtPokemonIds?: Set<number>;
  onPokemonSpawned?: (pokemon: WildPokemon) => void;
}

export function useMapSpawns({
  location,
  trainerLevel = 1,
  caughtPokemonIds = new Set<number>(),
  onPokemonSpawned,
}: UseMapSpawnsOptions) {
  const [wildList, setWildList] = useState<WildPokemon[]>([]);
  const lastSpawnLocationRef = useRef<Coordinates | null>(null);

  const allPokemonMeta = useMemo(() => getAllPokemonMeta(), []);
  const totalSpeciesCount = useMemo(
    () => getTotalPokemonCount() || allPokemonMeta.length,
    [allPokemonMeta]
  );

  const uncaughtCount = useMemo(() => {
    const caughtCount = caughtPokemonIds.size;
    return Math.max(0, totalSpeciesCount - caughtCount);
  }, [totalSpeciesCount, caughtPokemonIds]);

  const isAllCaught = uncaughtCount === 0;

  // Initialize spots staggered when GPS first locks or moves > 100m
  useEffect(() => {
    if (!location) return;

    const shouldRespawn =
      !lastSpawnLocationRef.current ||
      getDistanceInMeters(lastSpawnLocationRef.current, location) > 100;

    if (shouldRespawn) {
      lastSpawnLocationRef.current = location;
      const initialSpawns = generateInitialSpawnSpots(
        location,
        15,
        trainerLevel,
        allPokemonMeta
      );
      setWildList(initialSpawns);
    }
  }, [location, trainerLevel, allPokemonMeta]);

  // Master 1-second ticker: transition pending to active and replace expired active spots
  useEffect(() => {
    if (!location) return;
    const currentLocation = location;

    const interval = setInterval(() => {
      const now = Date.now();
      setWildList((prev) => {
        let changed = false;

        // 1. Transition pending spots whose 10s wait has finished
        const updated = prev.map((spot) => {
          if (spot.status === 'PENDING' && now >= spot.spawnedAt) {
            changed = true;
            const activeSpot = {
              ...spot,
              status: 'ACTIVE' as const,
              spawnedAt: now,
              expiresAt: now + 60000,
            };
            onPokemonSpawned?.(activeSpot);
            return activeSpot;
          }
          return spot;
        });

        // 2. Remove active spots that exceeded 60s
        const alive = updated.filter((spot) => {
          if (spot.status === 'ACTIVE' && now >= spot.expiresAt) {
            changed = true;
            return false;
          }
          return true;
        });

        // 3. Maintain up to 15 spots
        const targetCount = 15;
        const missing = targetCount - alive.length;

        if (missing > 0) {
          changed = true;
          for (let i = 0; i < missing; i++) {
            const existingCoords = alive.map((p) => ({
              latitude: p.latitude,
              longitude: p.longitude,
            }));

            const newSpot = createPendingSpot(
              currentLocation,
              trainerLevel,
              10000,
              existingCoords,
              allPokemonMeta
            );

            if (newSpot) {
              alive.push(newSpot);
            }
          }
        }

        return changed ? alive : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location, trainerLevel, onPokemonSpawned, allPokemonMeta]);

  const consumeSpotForCatch = useCallback(
    (pokemon: WildPokemon) => {
      if (!location) return;
      const currentLocation = location;

      setWildList((prev) => {
        const filtered = prev.filter(
          (p) => p.instanceId !== pokemon.instanceId
        );
        const existingCoords = filtered.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
        }));
        const replacement = createPendingSpot(
          currentLocation,
          trainerLevel,
          10000,
          existingCoords,
          allPokemonMeta
        );
        return replacement ? [...filtered, replacement] : filtered;
      });
    },
    [location, trainerLevel, allPokemonMeta]
  );

  const despawnSpot = useCallback(
    (instanceId: string) => {
      if (!location) return;
      const currentLocation = location;

      setWildList((prev) => {
        const exists = prev.some((p) => p.instanceId === instanceId);
        if (!exists) return prev;
        const filtered = prev.filter((p) => p.instanceId !== instanceId);
        const existingCoords = filtered.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
        }));

        const replacement = createPendingSpot(
          currentLocation,
          trainerLevel,
          10000,
          existingCoords,
          allPokemonMeta
        );
        return replacement ? [...filtered, replacement] : filtered;
      });
    },
    [location, trainerLevel, allPokemonMeta]
  );

  return {
    wildList,
    consumeSpotForCatch,
    despawnSpot,
    isAllCaught,
    totalSpeciesCount,
  };
}
