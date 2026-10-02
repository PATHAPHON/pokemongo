import { View, Text, StyleSheet } from 'react-native';

interface PokemonStatsHeaderProps {
  totalCount: number;
  isDark?: boolean;
}

export function PokemonStatsHeader({
  totalCount,
  isDark = false,
}: PokemonStatsHeaderProps) {
  const headerBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const headerBorder = isDark ? '#262626' : '#E1E4E8';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: headerBg,
          borderBottomColor: headerBorder,
        },
      ]}
    >
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: textColor }]}>Pokémon</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: isDark
                ? 'rgba(10, 126, 164, 0.25)'
                : 'rgba(10, 126, 164, 0.1)',
            },
          ]}
        >
          <Text style={styles.badgeText}>{totalCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    color: '#0A7EA4',
    fontSize: 14,
    fontWeight: '800',
  },
});
