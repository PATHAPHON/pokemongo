import React from 'react';
import { Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/shared/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

const TYPE_CLASSES: Record<NonNullable<ThemedTextProps['type']>, string> = {
  default: 'text-base leading-6',
  defaultSemiBold: 'text-base leading-6 font-semibold',
  title: 'text-[32px] font-bold leading-8',
  subtitle: 'text-xl font-bold',
  link: 'text-base leading-[30px] text-[#0a7ea4]',
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className = '',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const typeClass = TYPE_CLASSES[type] ?? TYPE_CLASSES.default;
  const mergedClassName = `${typeClass} ${className}`.trim();

  return (
    <Text
      className={mergedClassName}
      style={[type !== 'link' ? { color } : undefined, style]}
      {...rest}
    />
  );
}
