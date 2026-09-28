import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useUserLocation } from '@/hooks/use-user-location';
import { useTrainer } from '@/context/trainer-context';
import {
  Coordinates,
  WildPokemon,
  generateInitialSpawnSpots,
  createPendingSpot,
  getDistanceInMeters,
} from '@/services/spawn-engine';
import { LeafletMapView } from '@/components/map/LeafletMapView';
import { MapControls } from '@/components/map/MapControls';

export default function MapScreen() {
  const router = useRouter();
  const { trainer } = useTrainer();

  const { location, heading, permissionGranted } = useUserLocation();

  const [wildList, setWildList] = useState<WildPokemon[]>([]);
  const lastSpawnLocationRef = useRef<Coordinates | null>(null);

  // Initialize 15 spots staggered when GPS first locks or moves > 100m
  useEffect(() => {
    if (location.latitude === 0) return;

    const shouldRespawn =
      !lastSpawnLocationRef.current ||
      getDistanceInMeters(lastSpawnLocationRef.current, location) > 100;

    if (shouldRespawn) {
      lastSpawnLocationRef.current = location;
      const initialSpawns = generateInitialSpawnSpots(location, 15, trainer?.level || 1);
      setWildList(initialSpawns);
    }
  }, [location, trainer?.level]);

  // Master 1-second ticker: transition pending to active and replace expired active spots
  useEffect(() => {
    if (location.latitude === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setWildList((prev) => {
        if (prev.length === 0) return prev;
        let changed = false;

        // 1. Transition pending spots whose 10s wait has finished
        const updated = prev.map((spot) => {
          if (spot.status === 'PENDING' && now >= spot.spawnedAt) {
            changed = true;
            return {
              ...spot,
              status: 'ACTIVE' as const,
              spawnedAt: now,
              expiresAt: now + 60000,
            };
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

        // 3. Maintain exactly 15 spots: fill missing spots with new PENDING spots (10s countdown)
        const missing = 15 - alive.length;
        if (missing > 0) {
          changed = true;
          for (let i = 0; i < missing; i++) {
            const existingCoords = alive.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
            alive.push(createPendingSpot(location, trainer?.level || 1, 10000, existingCoords));
          }
        }

        return changed ? alive : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location, trainer?.level]);

  // Tapping active Pokemon triggers catch and immediately spawns a new pending replacement
  const handleCatch = useCallback(
    (pokemon: WildPokemon) => {
      setWildList((prev) => {
        const filtered = prev.filter((p) => p.instanceId !== pokemon.instanceId);
        const existingCoords = filtered.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
        const replacement = createPendingSpot(location, trainer?.level || 1, 10000, existingCoords);
        return [...filtered, replacement];
      });

      router.push({
        pathname: '/catch',
        params: {
          id: String(pokemon.id),
          name: pokemon.name,
          cp: String(pokemon.cp),
          types: JSON.stringify(pokemon.types),
        },
      });
    },
    [router, location, trainer?.level]
  );

  const handleExpired = useCallback(
    (instanceId: string) => {
      setWildList((prev) => {
        const exists = prev.some((p) => p.instanceId === instanceId);
        if (!exists) return prev;
        const filtered = prev.filter((p) => p.instanceId !== instanceId);
        const existingCoords = filtered.map((p) => ({ latitude: p.latitude, longitude: p.longitude }));
        const replacement = createPendingSpot(location, trainer?.level || 1, 10000, existingCoords);
        return [...filtered, replacement];
      });
    },
    [location, trainer?.level]
  );

  const handleSpawned = useCallback((instanceId: string) => {
    setWildList((prev) =>
      prev.map((p) =>
        p.instanceId === instanceId && p.status === 'PENDING'
          ? { ...p, status: 'ACTIVE' as const, spawnedAt: Date.now(), expiresAt: Date.now() + 60000 }
          : p
      )
    );
  }, []);

  const activeCount = wildList.filter((p) => p.status === 'ACTIVE').length;

  return (
    <View style={styles.container}>
      <LeafletMapView
        location={location}
        heading={heading}
        wildList={wildList}
        onCatch={handleCatch}
        onExpired={handleExpired}
        onSpawned={handleSpawned}
      />

      <MapControls
        nearbyCount={activeCount}
        permissionGranted={permissionGranted}
        distanceAlert={null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E5E3DF',
  },
});
