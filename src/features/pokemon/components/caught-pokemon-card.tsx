import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { CaughtPokemon } from '@/shared/types';
import { TypeBadge } from '@/shared/components/type-badge';
import { RarityBadge } from '@/shared/components/rarity-badge';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import {
  capitalizePokemonName,
  formatPokemonId,
  getPokemonRarity,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';

interface CaughtPokemonCardProps {
  pokemon: CaughtPokemon;
  onPress: () => void;
  onRelease: (pokemon: CaughtPokemon) => void;
  numColumns?: number;
  isDark?: boolean;
}

export function CaughtPokemonCard({
  pokemon,
  onPress,
  onRelease,
  numColumns = 2,
  isDark = false,
}: CaughtPokemonCardProps) {
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const primaryType = pokemon.types[0] || 'normal';
  const typeColor = PokemonTypeColors[primaryType] || PokemonTypeColors.normal;
  const displayName = pokemon.nickname || capitalizePokemonName(pokemon.name);
  const rarity =
    pokemon.rarity ||
    getPokemonMetaById(pokemon.pokemonId)?.rarity ||
    getPokemonRarity(pokemon.pokemonId);

  return (
    <View style={{ width: `${100 / numColumns}%`, padding: 6 }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg,
            borderColor: `${typeColor.primary}50`,
            shadowOpacity: isDark ? 0.35 : 0.08,
          },
        ]}
      >
        {/* Top Card Bar: Rarity */}
        <View style={styles.topBar}>
          <RarityBadge rarity={rarity} />
        </View>

        {/* Artwork Image */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: pokemon.artwork }}
            style={styles.artworkImage}
            contentFit="contain"
            transition={200}
          />
        </View>

        {/* Pokemon Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.idText, { color: subTextColor }]}>
            {formatPokemonId(pokemon.pokemonId)}
          </Text>
          <Text
            style={[styles.nameText, { color: textColor }]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {/* Types Row */}
          <View style={styles.typesRow}>
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </View>
        </View>

        {/* Card Footer: Action button */}
        <View
          style={[
            styles.footer,
            { borderTopColor: isDark ? '#262626' : '#F4F6F8' },
          ]}
        >
          <TouchableOpacity
            style={styles.transferButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => onRelease(pokemon)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Transfer ${displayName}`}
            accessibilityHint="Releases Pokémon for 1 Candy"
          >
            <Ionicons name="trash-outline" size={14} color="#FF3B30" />
            <Text style={styles.transferText}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  artworkContainer: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  artworkImage: {
    width: 80,
    height: 80,
  },
  infoContainer: {
    alignItems: 'center',
  },
  idText: {
    fontSize: 10,
    fontWeight: '700',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: 6,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  footer: {
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 6,
    alignItems: 'center',
  },
  transferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  transferText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
  },
});
