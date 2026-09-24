import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PokemonTypeName } from '@/types';
import { PokemonTypeColors } from '@/constants/pokemon-theme';

export interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  outlined?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function TypeBadge({
  type,
  size = 'md',
  selected = true,
  outlined = false,
  onPress,
  style,
}: TypeBadgeProps) {
  const typeColorInfo = PokemonTypeColors[type] ?? PokemonTypeColors.normal;

  const sizeStyles = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  const textSizeStyles = {
    sm: styles.textSm,
    md: styles.textMd,
    lg: styles.textLg,
  }[size];

  const containerStyle = [
    styles.badge,
    sizeStyles,
    selected
      ? {
          backgroundColor: outlined ? 'transparent' : typeColorInfo.primary,
          borderColor: typeColorInfo.primary,
          borderWidth: outlined ? 1.5 : 0,
        }
      : {
          backgroundColor: 'rgba(150, 150, 150, 0.15)',
          borderColor: 'rgba(150, 150, 150, 0.3)',
          borderWidth: 1,
        },
    style,
  ];

  const textColor = selected
    ? outlined
      ? typeColorInfo.primary
      : typeColorInfo.text
    : '#8E8E93';

  const content = (
    <View style={containerStyle}>
      <Text style={[styles.text, textSizeStyles, { color: textColor }]}>
        {type.toUpperCase()}
      </Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Filter by ${type} type`}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sizeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 44,
  },
  sizeMd: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 60,
  },
  sizeLg: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 76,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  textSm: {
    fontSize: 9,
  },
  textMd: {
    fontSize: 11,
  },
  textLg: {
    fontSize: 13,
  },
});
