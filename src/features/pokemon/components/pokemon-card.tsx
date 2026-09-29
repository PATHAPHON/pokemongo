import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { CaughtPokemon, PokemonListItem, PokemonTypeName } from '@/shared/types';
import { EnhancedPokemonListItem } from '@/features/pokemon/hooks/use-pokemons';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import {
  formatPokemonId,
  capitalizePokemonName,
  getKantoPokemonById,
  getKantoArtworkUrl,
} from '@/shared/constants/kanto-pokemon';
import { TypeBadge } from './type-badge';

export type PokemonCardVariant = 'catalog' | 'caught' | 'compact';

export interface PokemonCardProps {
  pokemon: PokemonListItem | EnhancedPokemonListItem | CaughtPokemon;
  variant?: PokemonCardVariant;
  onPress?: () => void;
  onToggleFavorite?: (instanceId: string) => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function PokemonCard({
  pokemon,
  variant = 'catalog',
  onPress,
  onToggleFavorite,
  style,
  className = '',
}: PokemonCardProps) {
  const isCaught = 'instanceId' in pokemon;
  const caughtData = isCaught ? (pokemon as CaughtPokemon) : null;

  const id = 'pokemonId' in pokemon ? (pokemon as CaughtPokemon).pokemonId : pokemon.id;
  const displayName = caughtData?.nickname || pokemon.name;
  const artwork = pokemon.artwork || getKantoArtworkUrl(id);

  // Extract types
  let types: PokemonTypeName[] = ['normal'];
  if ('types' in pokemon && Array.isArray((pokemon as any).types)) {
    types = (pokemon as any).types;
  } else {
    const meta = getKantoPokemonById(id);
    if (meta) types = meta.types;
  }

  const primaryType = types[0] ?? 'normal';
  const typeColorInfo = PokemonTypeColors[primaryType] ?? PokemonTypeColors.normal;

  const handleFavoritePress = (e: any) => {
    e.stopPropagation?.();
    if (caughtData && onToggleFavorite) {
      onToggleFavorite(caughtData.instanceId);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className={`rounded-2xl p-3 m-1.5 overflow-hidden relative shadow-md min-h-[124px] justify-between ${className}`.trim()}
      style={[
        { backgroundColor: typeColorInfo.background },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, #${id}, ${types.join(', ')}`}
    >
      {/* Background Watermark Pokeball */}
      <View className="absolute -right-5 -bottom-5 w-[110px] h-[110px] rounded-full border-[16px] border-white/20 items-center justify-center">
        <View className="w-8 h-8 rounded-full border-[10px] border-white/20" />
      </View>

      {/* Top Header Row */}
      <View className="flex-row justify-between items-center">
        {variant === 'caught' && caughtData ? (
          <>
            <View className="bg-black/55 px-2 py-0.5 rounded-lg">
              <Text className="text-white text-[11px] font-extrabold tracking-wider">
                CP {caughtData.cp}
              </Text>
            </View>
            {onToggleFavorite && (
              <TouchableOpacity
                onPress={handleFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                className="p-0.5"
                accessibilityRole="button"
                accessibilityLabel={caughtData.favorite ? 'Remove favorite' : 'Mark as favorite'}
              >
                <Text className="text-xl text-[#FFD700] leading-[22px]">
                  {caughtData.favorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text className="text-xs font-extrabold text-black/45 tracking-wider">
            {formatPokemonId(id)}
          </Text>
        )}
      </View>

      {/* Pokemon Name */}
      <Text
        className="text-base font-extrabold text-white mt-0.5 mb-1.5"
        numberOfLines={1}
        style={{
          textShadowColor: 'rgba(0, 0, 0, 0.25)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {capitalizePokemonName(displayName)}
      </Text>

      {/* Content Area: Left side Types, Right side Artwork */}
      <View className="flex-row items-end justify-between">
        <View className="items-start z-10">
          {types.map((type) => (
            <TypeBadge
              key={type}
              type={type}
              size="sm"
              className="mb-1"
            />
          ))}
          {variant === 'caught' && caughtData && (
            <View className="bg-white/30 rounded-md px-1.5 py-0.5 mt-0.5">
              <Text className="text-[9px] font-bold text-[#1E1E1E]">
                Lv. {caughtData.level}
              </Text>
            </View>
          )}
        </View>

        <View className="w-[76px] h-[76px] absolute right-0 -bottom-1.5 z-0">
          <Image
            source={{ uri: artwork }}
            className="w-full h-full"
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}
