import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTrainer } from '@/shared/context/trainer-context';
import { CaughtPokemon } from '@/shared/types';
import {
  PokemonStatsHeader,
  PokemonEmptyState,
  CaughtPokemonCard,
  RarityFilterBar,
  RarityFilterType,
  usePokemonActions,
} from '@/features/pokemon';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import {
  getPokemonRarity,
  getRarityLabel,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';

export default function PokemonScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 720 ? 4 : 2;

  const { caughtPokemon, isLoading, releasePokemon } = useTrainer();

  const { handleRelease } = usePokemonActions({
    releasePokemon,
  });

  const [selectedRarity, setSelectedRarity] = useState<RarityFilterType>('all');

  const rarityCounts = useMemo(() => {
    let common = 0;
    let rare = 0;
    let ultra_rare = 0;

    for (const item of caughtPokemon) {
      const r =
        item.rarity ||
        getPokemonMetaById(item.pokemonId)?.rarity ||
        getPokemonRarity(item.pokemonId);
      if (r === 'ultra_rare') ultra_rare++;
      else if (r === 'rare') rare++;
      else common++;
    }

    return {
      all: caughtPokemon.length,
      common,
      rare,
      ultra_rare,
    };
  }, [caughtPokemon]);

  const filteredPokemon = useMemo(() => {
    if (selectedRarity === 'all') return caughtPokemon;
    return caughtPokemon.filter((item) => {
      const r =
        item.rarity ||
        getPokemonMetaById(item.pokemonId)?.rarity ||
        getPokemonRarity(item.pokemonId);
      return r === selectedRarity;
    });
  }, [caughtPokemon, selectedRarity]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: screenBg }]}
      edges={['top']}
    >
      {/* Top Header Summary */}
      <PokemonStatsHeader totalCount={caughtPokemon.length} isDark={isDark} />

      {/* Rarity Filter Selector */}
      <RarityFilterBar
        selectedRarity={selectedRarity}
        onSelectRarity={setSelectedRarity}
        counts={rarityCounts}
        isDark={isDark}
      />

      {/* Main Content Grid */}
      <View style={styles.flex1}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A7EA4" />
            <Text style={styles.loadingText}>Loading caught Pokémon...</Text>
          </View>
        ) : (
          <FlatList
            key={`caught-grid-${numColumns}`}
            data={filteredPokemon}
            keyExtractor={(item) => item.instanceId}
            renderItem={({ item }: { item: CaughtPokemon }) => (
              <CaughtPokemonCard
                pokemon={item}
                numColumns={numColumns}
                isDark={isDark}
                onPress={() => router.push(`/pokemon/${item.pokemonId}` as any)}
                onRelease={handleRelease}
              />
            )}
            numColumns={numColumns}
            contentContainerStyle={
              filteredPokemon.length === 0
                ? styles.emptyListContent
                : styles.gridContent
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              caughtPokemon.length === 0 ? (
                <PokemonEmptyState
                  onGoToRadar={() => router.push('/(tabs)' as any)}
                  textColor={textColor}
                />
              ) : (
                <View style={styles.filterEmptyContainer}>
                  <Ionicons
                    name="filter-outline"
                    size={48}
                    color={subTextColor}
                  />
                  <Text style={[styles.filterEmptyTitle, { color: textColor }]}>
                    No {getRarityLabel(selectedRarity as any)} Pokémon
                  </Text>
                  <Text
                    style={[
                      styles.filterEmptySubtitle,
                      { color: subTextColor },
                    ]}
                  >
                    No Pokémon with this rarity found in your collection.
                  </Text>
                  <TouchableOpacity
                    style={styles.clearFilterButton}
                    onPress={() => setSelectedRarity('all')}
                    accessibilityRole="button"
                    accessibilityLabel="Show all Pokémon"
                  >
                    <Text style={styles.clearFilterButtonText}>
                      Show All Pokémon
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#687076',
    fontSize: 14,
    fontWeight: '600',
  },
  gridContent: {
    padding: 10,
    paddingBottom: 24,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  filterEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  filterEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  filterEmptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  clearFilterButton: {
    backgroundColor: '#0A7EA4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  clearFilterButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
