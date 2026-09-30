import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import {
  capitalizePokemonName,
  getArtworkUrl,
  getPokemonRarity,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import { PokemonRarity } from '@/shared/types';
import { RarityBadge } from '@/shared/components/rarity-badge';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

interface GotchaModalProps {
  pokemonId: number;
  pokemonName: string;
  rarity?: PokemonRarity;
  onDone: () => void;
}

export function GotchaModal({
  pokemonId,
  pokemonName,
  rarity,
  onDone,
}: GotchaModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const doneBtnBg = isDark ? '#2A2A2E' : '#F4F6F8';
  const doneTextColor = isDark ? '#ECEDEE' : '#11181C';

  const pokemonRarity: PokemonRarity =
    rarity ||
    getPokemonMetaById(pokemonId)?.rarity ||
    getPokemonRarity(pokemonId);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Ionicons name="sparkles" size={44} color="#F7D02C" />
          <Text style={[styles.title, { color: textColor }]}>Gotcha!</Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            {capitalizePokemonName(pokemonName)} was caught!
          </Text>

          <Image
            source={{ uri: getArtworkUrl(pokemonId) }}
            style={styles.pokemonImage}
            contentFit="contain"
            transition={200}
          />

          <View style={styles.badgeContainer}>
            <RarityBadge rarity={pokemonRarity} />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: doneBtnBg }]}
              activeOpacity={0.8}
              onPress={onDone}
            >
              <Text
                style={[styles.secondaryButtonText, { color: doneTextColor }]}
              >
                Returning to Map...
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  pokemonImage: {
    width: 140,
    height: 140,
    marginVertical: 12,
  },
  badgeContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  secondaryButton: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontWeight: '700',
    fontSize: 15,
  },
});
