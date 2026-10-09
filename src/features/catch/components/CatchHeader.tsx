import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { capitalizePokemonName } from '@/shared/constants/kanto-pokemon';
import { PokemonRarity } from '@/shared/types';
import { RarityBadge } from '@/shared/components/rarity-badge';
interface CatchHeaderProps {
  pokemonName: string;
  rarity: PokemonRarity;
  onRunPress: () => void;
}

export function CatchHeader({
  pokemonName,
  rarity,
  onRunPress,
}: CatchHeaderProps) {
  const pillBg = 'rgba(255, 255, 255, 0.95)';
  const textColor = '#0F172A';

  return (
    <View style={styles.container}>
      {/* Run Button */}
      <TouchableOpacity
        style={styles.runButton}
        activeOpacity={0.7}
        onPress={onRunPress}
        accessibilityRole="button"
        accessibilityLabel="Run from encounter"
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        <Text style={styles.runText}>Run</Text>
      </TouchableOpacity>

      {/* Center Target Info Pill */}
      <View style={[styles.targetPill, { backgroundColor: pillBg }]}>
        <Text style={[styles.targetName, { color: textColor }]}>
          {capitalizePokemonName(pokemonName)}
        </Text>
        <RarityBadge
          rarity={rarity}
          style={styles.rarityBadgeMargin}
        />
      </View>

      {/* Right Infinite Pokeball Pill */}
      <View style={styles.rightGroup}>
        <View style={[styles.countPill, { backgroundColor: pillBg }]}>
          <Ionicons name="disc" size={16} color="#EE1515" />
          <Text style={[styles.countText, { color: textColor }]}>∞</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 30,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EE1515',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  runText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  targetPill: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    elevation: 2,
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  targetName: {
    fontSize: 16,
    fontWeight: '800',
  },
  rarityBadgeMargin: {
    marginTop: 3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    gap: 6,
    elevation: 2,
  },
  countText: {
    fontWeight: '900',
    fontSize: 15,
  },
});
