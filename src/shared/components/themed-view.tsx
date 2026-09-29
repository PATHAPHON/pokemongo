import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  className = '',
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View
      className={className || undefined}
      style={[{ backgroundColor }, style]}
      {...otherProps}
    />
  );
}
