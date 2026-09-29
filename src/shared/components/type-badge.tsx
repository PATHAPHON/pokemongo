import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PokemonTypeName } from '@/shared/types';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';

export interface TypeBadgeProps {
  type: PokemonTypeName;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  outlined?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 min-w-[44px]',
  md: 'px-2.5 py-1 min-w-[60px]',
  lg: 'px-3.5 py-1.5 min-w-[76px]',
};

const TEXT_SIZE_CLASSES = {
  sm: 'text-[9px]',
  md: 'text-[11px]',
  lg: 'text-[13px]',
};

export function TypeBadge({
  type,
  size = 'md',
  selected = true,
  outlined = false,
  onPress,
  style,
  className = '',
}: TypeBadgeProps) {
  const typeColorInfo = PokemonTypeColors[type] ?? PokemonTypeColors.normal;

  const sizeClass = SIZE_CLASSES[size];
  const textSizeClass = TEXT_SIZE_CLASSES[size];

  const stateClass = selected
    ? outlined
      ? 'bg-transparent border-[1.5px]'
      : 'border-0'
    : 'bg-neutral-500/15 border border-neutral-500/30';

  const dynamicStyle: ViewStyle = selected
    ? {
        backgroundColor: outlined ? 'transparent' : typeColorInfo.primary,
        borderColor: typeColorInfo.primary,
      }
    : {};

  const textColor = selected
    ? outlined
      ? typeColorInfo.primary
      : typeColorInfo.text
    : '#8E8E93';

  const badgeClassName = `rounded-full items-center justify-center shadow-sm ${sizeClass} ${stateClass} ${className}`.trim();

  const content = (
    <View className={badgeClassName} style={[dynamicStyle, style]}>
      <Text
        className={`font-bold tracking-wider text-center ${textSizeClass}`}
        style={{ color: textColor }}
      >
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
