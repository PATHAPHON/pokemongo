import { StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  capitalizePokemonName,
  getArtworkUrl,
  getPokemonRarity,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import {
  usePokemonDetail,
  PokemonDetailHero,
  PokemonDetailSpecs,
} from '@/features/pokemon';

export default function PokemonDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pokemonId = Number(id) || 1;
  const { pokemon, isLoading, error, reload } = usePokemonDetail(pokemonId);

  const screenBg = '#F8FAFC';
  const cardBg = '#FFFFFF';
  const textColor = '#0F172A';
  const subTextColor = '#64748B';

  const meta = getPokemonMetaById(pokemonId);
  const rarity = meta?.rarity || getPokemonRarity(pokemonId);
  const primaryType = pokemon?.types[0] || 'normal';
  const typeColorInfo =
    PokemonTypeColors[primaryType] || PokemonTypeColors.normal;

  const displayName = pokemon?.name
    ? capitalizePokemonName(pokemon.name)
    : `Pokémon #${pokemonId}`;

  return (
    <ScrollView style={[styles.container, { backgroundColor: screenBg }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: displayName,
          headerBackTitle: 'Back',
          headerStyle: { backgroundColor: cardBg },
          headerTintColor: textColor,
        }}
      />

      {/* Top Hero Banner */}
      <PokemonDetailHero
        pokemonId={pokemonId}
        displayName={displayName}
        rarity={rarity}
        types={pokemon?.types || ['normal']}
        artworkUrl={getArtworkUrl(pokemonId)}
        backgroundColor={typeColorInfo.background}
      />

      {/* Details Specs Card */}
      <PokemonDetailSpecs
        description={pokemon?.description}
        height={pokemon?.height}
        weight={pokemon?.weight}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        cardBg={cardBg}
        textColor={textColor}
        subTextColor={subTextColor}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
