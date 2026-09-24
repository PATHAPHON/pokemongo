import React, { useEffect } from 'react';
import { StyleSheet, Text, View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { PokemonStatName } from '@/types';
import { StatColors } from '@/constants/pokemon-theme';

export interface StatBarProps {
  statName: PokemonStatName;
  value: number;
  maxValue?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

const STAT_LABELS: Record<PokemonStatName, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.ATK',
  'special-defense': 'SP.DEF',
  speed: 'SPD',
};

export function StatBar({
  statName,
  value,
  maxValue = 180,
  delay = 100,
  style,
}: StatBarProps) {
  const statColor = StatColors[statName] ?? '#48D0B0';
  const label = STAT_LABELS[statName] ?? statName.toUpperCase();
  const clampedRatio = Math.max(0, Math.min(1, value / maxValue));

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(clampedRatio, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [clampedRatio, delay, progress]);

  const animatedBarStyle = useAnimatedStyle(() => {
    return {
      width: `${Math.round(progress.value * 100)}%`,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: statColor },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    width: 60,
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  value: {
    width: 38,
    fontSize: 13,
    fontWeight: '800',
    color: '#11181C',
    textAlign: 'right',
    marginRight: 12,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 9999,
  },
});
