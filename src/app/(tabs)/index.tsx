import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useTrainer } from '@/shared/context/trainer-context';
import {
  useUserLocation,
  useMapSpawns,
  useSpawnNotifications,
  LeafletMapView,
  LeafletMapViewRef,
  MapControls,
  LocationPickerModal,
  NotificationPermissionModal,
  WildPokemon,
} from '@/features/map';

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<LeafletMapViewRef>(null);
  const { trainer, caughtPokemon } = useTrainer();
  const isNavigatingToCatchRef = useRef(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      isNavigatingToCatchRef.current = false;
    }, [])
  );

  const caughtPokemonIds = useMemo(
    () => new Set(caughtPokemon.map((p) => p.pokemonId)),
    [caughtPokemon]
  );

  const {
    notificationsEnabled,
    showPermissionModal,
    canAskAgain,
    toggleNotifications,
    handleAllowPermission,
    handleDismissPermissionModal,
    handleOpenSettings,
    checkAndNotifySpawn,
  } = useSpawnNotifications(caughtPokemonIds);

  const {
    location,
    selectedPreset,
    locationName,
    isRealGps,
    isLoading: isLocationLoading,
    errorMsg: locationErrorMsg,
    selectPreset,
    switchToRealGps,
  } = useUserLocation();

  const {
    wildList,
    consumeSpotForCatch,
    despawnSpot,
    isAllCaught,
    totalSpeciesCount,
  } = useMapSpawns({
    location,
    trainerLevel: trainer?.level || 1,
    caughtPokemonIds,
    onPokemonSpawned: checkAndNotifySpawn,
  });

  const handleCatch = useCallback(
    (pokemon: WildPokemon) => {
      if (!location || isNavigatingToCatchRef.current) return;
      isNavigatingToCatchRef.current = true;

      consumeSpotForCatch(pokemon);

      router.push({
        pathname: '/catch' as any,
        params: {
          id: String(pokemon.id),
          name: pokemon.name,
          rarity: pokemon.rarity,
          types: JSON.stringify(pokemon.types),
        },
      });
    },
    [router, location, consumeSpotForCatch]
  );

  const handleRecenter = useCallback(() => {
    if (location && mapRef.current) {
      mapRef.current.recenter(location);
    }
  }, [location]);

  const activeSpawnsCount = wildList.filter((s) => s.status === 'ACTIVE').length;

  return (
    <View style={styles.container}>
      <LeafletMapView
        ref={mapRef}
        location={location}
        wildList={wildList}
        onCatch={handleCatch}
        onExpired={despawnSpot}
      />

      <MapControls
        locationName={locationName}
        isRealGps={isRealGps}
        nearbyCount={activeSpawnsCount}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        onRecenter={handleRecenter}
        notificationsEnabled={notificationsEnabled}
        onToggleNotifications={toggleNotifications}
      />

      <LocationPickerModal
        visible={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        selectedPreset={selectedPreset}
        isRealGps={isRealGps}
        isLoading={isLocationLoading}
        errorMsg={locationErrorMsg}
        onSelectPreset={selectPreset}
        onUseRealGps={switchToRealGps}
      />

      <NotificationPermissionModal
        visible={showPermissionModal}
        canAskAgain={canAskAgain}
        onAllow={handleAllowPermission}
        onDismiss={handleDismissPermissionModal}
        onOpenSettings={handleOpenSettings}
      />

      {isAllCaught && (
        <View style={styles.completionBanner}>
          <Text style={styles.completionEmoji}>🏆</Text>
          <Text style={styles.completionTitle}>
            จับครบทุกตัวแล้ว!
          </Text>
          <Text style={styles.completionSubtitle}>
            คุณได้จับโปเกมอนครบทั้ง {totalSpeciesCount} สายพันธุ์แล้ว (Gen 1 - Gen 3)
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  completionBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(24, 28, 36, 0.95)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  completionEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  completionTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  completionSubtitle: {
    color: '#E0E0E0',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
