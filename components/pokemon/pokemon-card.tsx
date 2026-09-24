import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Image } from 'expo-image';
import { CaughtPokemon, PokemonListItem, PokemonTypeName } from '@/types';
import { EnhancedPokemonListItem } from '@/hooks/use-pokemons';
import { PokemonTypeColors } from '@/constants/pokemon-theme';
import {
  formatPokemonId,
  capitalizePokemonName,
  getKantoPokemonById,
  getKantoArtworkUrl,
} from '@/constants/kanto-pokemon';
import { TypeBadge } from './type-badge';

export type PokemonCardVariant = 'catalog' | 'caught' | 'compact';

export interface PokemonCardProps {
  pokemon: PokemonListItem | EnhancedPokemonListItem | CaughtPokemon;
  variant?: PokemonCardVariant;
  onPress?: () => void;
  onToggleFavorite?: (instanceId: string) => void;
  style?: StyleProp<ViewStyle>;
}

export function PokemonCard({
  pokemon,
  variant = 'catalog',
  onPress,
  onToggleFavorite,
  style,
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
      style={[
        styles.card,
        { backgroundColor: typeColorInfo.background },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${displayName}, #${id}, ${types.join(', ')}`}
    >
      {/* Background Watermark Pokeball */}
      <View style={styles.watermarkPokeball}>
        <View style={styles.watermarkInnerCircle} />
      </View>

      {/* Top Header Row */}
      <View style={styles.headerRow}>
        {variant === 'caught' && caughtData ? (
          <>
            <View style={styles.cpBadge}>
              <Text style={styles.cpText}>CP {caughtData.cp}</Text>
            </View>
            {onToggleFavorite && (
              <TouchableOpacity
                onPress={handleFavoritePress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.favoriteButton}
                accessibilityRole="button"
                accessibilityLabel={caughtData.favorite ? 'Remove favorite' : 'Mark as favorite'}
              >
                <Text style={styles.favoriteStar}>
                  {caughtData.favorite ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.idText}>{formatPokemonId(id)}</Text>
        )}
      </View>

      {/* Pokemon Name */}
      <Text style={styles.nameText} numberOfLines={1}>
        {capitalizePokemonName(displayName)}
      </Text>

      {/* Content Area: Left side Types, Right side Artwork */}
      <View style={styles.contentRow}>
        <View style={styles.typesContainer}>
          {types.map((type) => (
            <TypeBadge
              key={type}
              type={type}
              size="sm"
              style={styles.typeBadgeMargin}
            />
          ))}
          {variant === 'caught' && caughtData && (
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv. {caughtData.level}</Text>
            </View>
          )}
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: artwork }}
            style={styles.pokemonImage}
            contentFit="contain"
            transition={300}
            cachePolicy="memory-disk"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 12,
    margin: 6,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 124,
    justifyContent: 'space-between',
  },
  watermarkPokeball: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 16,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkInnerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 10,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(0, 0, 0, 0.45)',
    letterSpacing: 0.5,
  },
  cpBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cpText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  favoriteButton: {
    padding: 2,
  },
  favoriteStar: {
    fontSize: 20,
    color: '#FFD700',
    lineHeight: 22,
  },
  nameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  typesContainer: {
    alignItems: 'flex-start',
    zIndex: 2,
  },
  typeBadgeMargin: {
    marginBottom: 4,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  levelText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#1E1E1E',
  },
  imageContainer: {
    width: 76,
    height: 76,
    position: 'absolute',
    right: 0,
    bottom: -6,
    zIndex: 1,
  },
  pokemonImage: {
    width: '100%',
    height: '100%',
  },
});
