import React from 'react';
import {
  View,
  FlatList,
  Text,
  RefreshControl,
  useWindowDimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { CaughtPokemon, PokemonListItem } from '@/shared/types';
import { EnhancedPokemonListItem } from '@/features/pokemon/hooks/use-pokemons';
import { PokemonCard, PokemonCardVariant } from './pokemon-card';
import { SkeletonLoader } from '@/shared/components/ui/skeleton-loader';

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
  className?: string;
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
  className = '',
}: PokemonGridProps) {
  const { width } = useWindowDimensions();
  const numColumns = width > 768 ? 4 : 2;

  if (isLoading) {
    return (
      <View className={`flex-1 ${className}`.trim()}>
        {ListHeaderComponent}
        <View className="flex-row flex-wrap px-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} className="p-1.5" style={{ width: `${100 / numColumns}%` }}>
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
      <View className="items-center justify-center py-16 px-8">
        <Text className="text-5xl mb-4">🔍</Text>
        <Text className="text-lg font-bold text-[#11181C] dark:text-[#ECEDEE] mb-2">
          No Pokémon Found
        </Text>
        <Text className="text-sm text-[#8E8E93] text-center leading-5">
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
      contentContainerStyle={[{ paddingHorizontal: 8, paddingBottom: 24 }, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      className={className || undefined}
    />
  );
}
