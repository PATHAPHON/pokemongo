import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Marker } from 'react-native-maps';
import { Image } from 'expo-image';
import { WildPokemon } from '@/services/spawn-engine';
import { getKantoArtworkUrl, capitalizePokemonName } from '@/constants/kanto-pokemon';
import { PokemonTypeColors } from '@/constants/pokemon-theme';
import { PokemonTypeName } from '@/types';

interface Props {
  pokemon: WildPokemon;
  isWithinRadius: boolean;
  onPress: () => void;
}

export const PokemonMapMarker = React.memo(function PokemonMapMarker({
  pokemon,
  isWithinRadius,
  onPress,
}: Props) {
  const primaryType = (pokemon.types[0] || 'normal') as PokemonTypeName;
  const badgeColor = PokemonTypeColors[primaryType]?.primary || '#A8A878';

  return (
    <Marker
      coordinate={{
        latitude: pokemon.latitude,
        longitude: pokemon.longitude,
      }}
      anchor={{ x: 0.5, y: 0.7 }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={styles.container}>
        {/* Glowing ring/aura */}
        <View
          style={[
            styles.glow,
            { backgroundColor: badgeColor },
            isWithinRadius && styles.inRadiusGlow,
          ]}
        />

        {/* Official artwork image */}
        <Image
          source={{ uri: getKantoArtworkUrl(pokemon.id) }}
          style={styles.image}
          contentFit="contain"
          transition={150}
        />

        {/* CP pill badge */}
        <View style={[styles.cpBadge, isWithinRadius && styles.inRadiusBadge]}>
          <Text style={styles.cpText}>CP {pokemon.cp}</Text>
        </View>

        {/* Pokemon name tag */}
        <View style={styles.nameTag}>
          <Text style={styles.nameText} numberOfLines={1}>
            {capitalizePokemonName(pokemon.name)}
          </Text>
        </View>
      </View>
    </Marker>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 80,
  },
  glow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.35,
    top: 6,
  },
  inRadiusGlow: {
    opacity: 0.75,
    borderWidth: 2,
    borderColor: '#34C759',
    transform: [{ scale: 1.15 }],
  },
  image: {
    width: 50,
    height: 50,
    zIndex: 2,
  },
  cpBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginTop: -4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 3,
  },
  inRadiusBadge: {
    backgroundColor: '#34C759',
    borderColor: '#FFFFFF',
  },
  cpText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  nameTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    marginTop: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    zIndex: 3,
  },
  nameText: {
    color: '#1A1A1A',
    fontSize: 9,
    fontWeight: '700',
  },
});
