import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  RefreshControl,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CaughtPokemon, PokemonListItem } from '@/types';
import { EnhancedPokemonListItem } from '@/hooks/use-pokemons';
import { PokemonCard, PokemonCardVariant } from './pokemon-card';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';

export interface PokemonGridProps {
  data: (PokemonListItem | EnhancedPokemonListItem | CaughtPokemon)[];
  variant?: PokemonCardVariant;
  isLoading?: boolean;
  onCardPress?: (pokemon: any) => void;
  onToggleFavorite?: (instanceId: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function PokemonGrid({
  data,
  variant = 'catalog',
  isLoading = false,
  onCardPress,
  onToggleFavorite,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerStyle,
}: PokemonGridProps) {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 4 : 2;

  if (isLoading) {
    return (
      <View style={styles.container}>
        {ListHeaderComponent}
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={[styles.skeletonCard, { width: `${100 / numColumns}%` }]}>
              <SkeletonLoader height={124} borderRadius={16} />
            </View>
          ))}
        </View>
      </View>
    );
  }

  const renderEmpty = () => {
    if (ListEmptyComponent) return ListEmptyComponent;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No Pokémon Found</Text>
        <Text style={styles.emptySubtitle}>
          Try searching with a different name, number, or reset type filters.
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      key={`grid-${numColumns}`}
      data={data}
      numColumns={numColumns}
      keyExtractor={(item, index) =>
        'instanceId' in item
          ? (item as CaughtPokemon).instanceId
          : `${item.id}-${index}`
      }
      renderItem={({ item }) => (
        <View style={{ width: `${100 / numColumns}%` }}>
          <PokemonCard
            pokemon={item}
            variant={variant}
            onPress={() => onCardPress?.(item)}
            onToggleFavorite={onToggleFavorite}
          />
        </View>
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0A7EA4"
          />
        ) : undefined
      }
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  skeletonCard: {
    padding: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#11181C',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
});
