import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { useTrainer } from '@/shared/context/trainer-context';
import {
  ensureNotificationPermission,
  isNotificationsEnabled,
  setNotificationsEnabled,
  sendSpawnNotification,
  isRareOrUncaughtPokemon,
} from '@/shared/services/notifications';
import {
  useUserLocation,
  LeafletMapView,
  MapControls,
  Coordinates,
  WildPokemon,
  generateInitialSpawnSpots,
  createPendingSpot,
  getDistanceInMeters,
} from '@/features/map';

export default function MapScreen() {
  const router = useRouter();
  const { trainer, caughtPokemon } = useTrainer();
  const caughtPokemonIds = useMemo(
    () => new Set(caughtPokemon.map((p) => p.pokemonId)),
    [caughtPokemon]
  );

  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(false);
  const notifiedSpawnsRef = useRef<Set<string>>(new Set());
  const lastNotificationTimeRef = useRef<number>(0);

  useEffect(() => {
    isNotificationsEnabled().then(setNotificationsEnabledState);
  }, []);

  const handleToggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const granted = await ensureNotificationPermission();
      if (granted) {
        setNotificationsEnabledState(true);
      } else {
        Alert.alert(
          'Notification Permission',
          'Please enable notifications in your device settings to receive wild Pokémon alerts.'
        );
      }
    } else {
      await setNotificationsEnabled(false);
      setNotificationsEnabledState(false);
    }
  }, [notificationsEnabled]);

  const checkAndNotifySpawn = useCallback(
    (pokemon: WildPokemon) => {
      if (!notificationsEnabled) return;
      if (notifiedSpawnsRef.current.has(pokemon.instanceId)) return;

      const now = Date.now();
      // Cooldown: at least 25 seconds between notifications
      if (now - lastNotificationTimeRef.current < 25000) return;

      const isNew = !caughtPokemonIds.has(pokemon.id);
      const isRare = isRareOrUncaughtPokemon(pokemon.id, caughtPokemonIds);

      if (isRare || isNew) {
        notifiedSpawnsRef.current.add(pokemon.instanceId);
        lastNotificationTimeRef.current = now;
        sendSpawnNotification(pokemon.name, pokemon.id, isNew, pokemon.instanceId);
      }
    },
    [notificationsEnabled, caughtPokemonIds]
  );

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
            const activeSpot = {
              ...spot,
              status: 'ACTIVE' as const,
              spawnedAt: now,
              expiresAt: now + 60000,
            };
            checkAndNotifySpawn(activeSpot);
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
  }, [location, trainer?.level, checkAndNotifySpawn]);

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
        pathname: '/catch' as any,
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

  const handleSpawned = useCallback(
    (instanceId: string) => {
      setWildList((prev) =>
        prev.map((p) => {
          if (p.instanceId === instanceId && p.status === 'PENDING') {
            const activeSpot = {
              ...p,
              status: 'ACTIVE' as const,
              spawnedAt: Date.now(),
              expiresAt: Date.now() + 60000,
            };
            checkAndNotifySpawn(activeSpot);
            return activeSpot;
          }
          return p;
        })
      );
    },
    [checkAndNotifySpawn]
  );

  const activeCount = wildList.filter((p) => p.status === 'ACTIVE').length;

  return (
    <View className="flex-1 bg-[#E5E3DF]" style={{ flex: 1 }}>
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
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={handleToggleNotifications}
      />
    </View>
  );
}
