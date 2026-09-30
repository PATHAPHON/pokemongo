import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PokedexStats, PokedexGenFilter } from '../types';

interface PokedexHeaderProps {
  stats: PokedexStats;
  currentGen: PokedexGenFilter;
  isDark: boolean;
}

const GEN_TITLES: Record<PokedexGenFilter, string> = {
  all: 'All Regions (Gen 1 - 3)',
  gen1: 'Kanto Region (Gen 1)',
  gen2: 'Johto Region (Gen 2)',
  gen3: 'Hoenn Region (Gen 3)',
};

export function PokedexHeader({
  stats,
  currentGen,
  isDark,
}: PokedexHeaderProps) {
  const containerBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const progressTrackBg = isDark ? '#2D3748' : '#E2E8F0';

  const percentageClamped = Math.min(Math.max(stats.percentage, 0), 100);

  return (
    <View style={[styles.headerCard, { backgroundColor: containerBg }]}>
      <View style={styles.topRow}>
        <View style={styles.titleGroup}>
          <View style={styles.iconCircle}>
            <Ionicons name="book" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.title, { color: textColor }]}>Pokédex</Text>
            <Text style={[styles.subtitle, { color: subTextColor }]}>
              {GEN_TITLES[currentGen]}
            </Text>
          </View>
        </View>

        <View style={styles.counterGroup}>
          <Text style={[styles.counterText, { color: textColor }]}>
            <Text style={styles.caughtText}>{stats.caught}</Text> /{' '}
            {stats.total}
          </Text>
          <Text style={[styles.percentageText, { color: '#0A7EA4' }]}>
            {percentageClamped.toFixed(1)}%
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View
        style={[styles.progressTrack, { backgroundColor: progressTrackBg }]}
      >
        <View
          style={[styles.progressBar, { width: `${percentageClamped}%` }]}
        />
      </View>

      {/* Mini Stats Legend */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            Caught:{' '}
            <Text style={{ color: textColor, fontWeight: '700' }}>
              {stats.caught}
            </Text>
          </Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendDot,
              { backgroundColor: isDark ? '#64748B' : '#94A3B8' },
            ]}
          />
          <Text style={[styles.legendLabel, { color: subTextColor }]}>
            Uncaught:{' '}
            <Text style={{ color: textColor, fontWeight: '700' }}>
              {stats.uncaught}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    marginHorizontal: 10,
    marginTop: 6,
    marginBottom: 8,
    borderRadius: 16,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  counterGroup: {
    alignItems: 'flex-end',
  },
  counterText: {
    fontSize: 15,
    fontWeight: '800',
  },
  caughtText: {
    color: '#EF4444',
  },
  percentageText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
});
