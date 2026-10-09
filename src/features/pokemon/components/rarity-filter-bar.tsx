import {
  ScrollView,
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { PokemonRarity } from '@/shared/types';
import { PokemonRarityColors } from '@/shared/constants/pokemon-theme';
import { getRarityLabel } from '@/shared/constants/kanto-pokemon';

export type RarityFilterType = PokemonRarity | 'all';

export interface RarityFilterBarProps {
  selectedRarity: RarityFilterType;
  onSelectRarity: (rarity: RarityFilterType) => void;
  counts: Record<RarityFilterType, number>;
  isDark?: boolean;
}

const FILTER_ITEMS: { id: RarityFilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'common', label: getRarityLabel('common') },
  { id: 'rare', label: getRarityLabel('rare') },
  { id: 'ultra_rare', label: getRarityLabel('ultra_rare') },
];

export function RarityFilterBar({
  selectedRarity,
  onSelectRarity,
  counts,
}: RarityFilterBarProps) {
  const containerBg = '#FFFFFF';
  const borderBottomColor = '#FEE2E2';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: containerBg,
          borderBottomColor,
        },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_ITEMS.map((item) => {
          const isSelected = selectedRarity === item.id;
          const count = counts[item.id] ?? 0;

          let activeBorder = '#EE1515';
          let activeBg = '#FEF2F2';
          let activeTextColor = '#EE1515';
          let activeBadgeBg = '#EE1515';
          let activeBadgeText = '#FFFFFF';

          if (item.id !== 'all') {
            const colorInfo = PokemonRarityColors[item.id];
            activeBorder = colorInfo.primary;
            activeBg = colorInfo.background;
            activeTextColor = colorInfo.text;
            activeBadgeBg = colorInfo.primary;
          }

          const chipBg = isSelected ? activeBg : '#F8FAFC';
          const chipBorder = isSelected
            ? activeBorder
            : '#E2E8F0';
          const textColor = isSelected
            ? activeTextColor
            : '#64748B';
          const badgeBg = isSelected
            ? activeBadgeBg
            : '#E2E8F0';
          const badgeText = isSelected
            ? activeBadgeText
            : '#64748B';

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => {
                // Tapping active chip toggles back to 'all'
                if (isSelected && item.id !== 'all') {
                  onSelectRarity('all');
                } else {
                  onSelectRarity(item.id);
                }
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: chipBg,
                  borderColor: chipBorder,
                },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`${item.label} filter, ${count} Pokémon`}
            >
              <Text style={[styles.chipText, { color: textColor }]}>
                {item.label}
              </Text>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={[styles.badgeText, { color: badgeText }]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
});
