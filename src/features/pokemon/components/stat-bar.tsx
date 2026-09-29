import React, { useEffect } from 'react';
import { Text, View, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { PokemonStatName } from '@/shared/types';
import { StatColors } from '@/shared/constants/pokemon-theme';

export interface StatBarProps {
  statName: PokemonStatName;
  value: number;
  maxValue?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
  className?: string;
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
  className = '',
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
    <View className={`flex-row items-center my-1 ${className}`.trim()} style={style}>
      <Text className="w-[60px] text-xs font-bold text-[#8E8E93] tracking-wider">
        {label}
      </Text>
      <Text className="w-[38px] text-[13px] font-extrabold text-[#11181C] dark:text-[#ECEDEE] text-right mr-3">
        {value}
      </Text>
      <View className="flex-1 h-2 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
        <Animated.View
          className="h-full rounded-full"
          style={[
            { backgroundColor: statColor },
            animatedBarStyle,
          ]}
        />
      </View>
    </View>
  );
}
