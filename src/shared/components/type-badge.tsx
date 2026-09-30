import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PokemonTypeName } from '@/shared/types';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';

interface TypeBadgeProps {
  type: PokemonTypeName;
  style?: StyleProp<ViewStyle>;
}

export function TypeBadge({ type, style }: TypeBadgeProps) {
  const typeColorInfo = PokemonTypeColors[type] ?? PokemonTypeColors.normal;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: typeColorInfo.primary },
        style,
      ]}
    >
      <Text style={[styles.text, { color: typeColorInfo.text }]}>
        {type.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 10,
    letterSpacing: 0.5,
  },
});
