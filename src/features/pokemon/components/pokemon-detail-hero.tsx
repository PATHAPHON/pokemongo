import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { PokemonRarity, PokemonTypeName } from '@/shared/types';
import { formatPokemonId } from '@/shared/constants/kanto-pokemon';
import { RarityBadge } from '@/shared/components/rarity-badge';
import { TypeBadge } from '@/shared/components/type-badge';

interface PokemonDetailHeroProps {
  pokemonId: number;
  displayName: string;
  rarity: PokemonRarity;
  types: PokemonTypeName[];
  artworkUrl: string;
  backgroundColor: string;
}

export function PokemonDetailHero({
  pokemonId,
  displayName,
  rarity,
  types,
  artworkUrl,
  backgroundColor,
}: PokemonDetailHeroProps) {
  return (
    <View style={[styles.heroCard, { backgroundColor }]}>
      <View style={styles.topInfoRow}>
        <Text style={styles.idText}>{formatPokemonId(pokemonId)}</Text>
        <RarityBadge rarity={rarity} />
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: artworkUrl }}
          style={styles.heroImage}
          contentFit="contain"
          transition={300}
        />
      </View>

      <Text style={styles.pokemonTitle}>{displayName}</Text>

      {/* Types */}
      <View style={styles.typesRow}>
        {types.map((t) => (
          <TypeBadge key={t} type={t} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    margin: 16,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  topInfoRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idText: {
    fontSize: 16,
    fontWeight: '900',
    color: 'rgba(0, 0, 0, 0.45)',
  },
  imageContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  pokemonTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
});
