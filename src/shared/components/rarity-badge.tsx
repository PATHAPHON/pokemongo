import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { PokemonRarity } from '@/shared/types';
import { PokemonRarityColors } from '@/shared/constants/pokemon-theme';
import { getRarityLabel } from '@/shared/constants/kanto-pokemon';

interface RarityBadgeProps {
  rarity: PokemonRarity;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function RarityBadge({
  rarity = 'common',
  style,
  textStyle,
}: RarityBadgeProps) {
  const colorInfo = PokemonRarityColors[rarity] ?? PokemonRarityColors.common;
  const label = getRarityLabel(rarity).toUpperCase();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colorInfo.badgeBg,
          borderColor: colorInfo.primary,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: colorInfo.text },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
