import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export type PokeballType = 'pokeball' | 'greatball' | 'ultraball' | 'masterball';

export interface PokeballButtonProps {
  ballType?: PokeballType;
  size?: 'sm' | 'md' | 'lg';
  count?: number;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

const BALL_COLORS: Record<PokeballType, { top: string; accent?: string }> = {
  pokeball: { top: '#EE1515' },
  greatball: { top: '#0075BE', accent: '#EE1515' },
  ultraball: { top: '#2B292C', accent: '#F6C700' },
  masterball: { top: '#7B2FBE', accent: '#E03A84' },
};

export function PokeballButton({
  ballType = 'pokeball',
  size = 'md',
  count,
  disabled = false,
  onPress,
  style,
  className = '',
}: PokeballButtonProps) {
  const scale = useSharedValue(1);

  const dimension = {
    sm: 38,
    md: 52,
    lg: 68,
  }[size];

  const centerSize = dimension * 0.32;
  const innerButtonSize = centerSize * 0.52;
  const bandHeight = Math.max(3, dimension * 0.08);

  const colors = BALL_COLORS[ballType] ?? BALL_COLORS.pokeball;

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withTiming(0.92, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 12, stiffness: 220 });
  };

  const handlePress = async () => {
    if (disabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Graceful fallback when haptics unavailable
    }
    onPress?.();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled}
      className={`items-center justify-center ${disabled ? 'opacity-45' : ''} ${className}`.trim()}
      style={style}
      accessibilityRole="button"
      accessibilityLabel={`Pokéball button ${ballType}${count !== undefined ? `, ${count} remaining` : ''}`}
    >
      <Animated.View
        className="bg-black overflow-hidden border-[2.5px] border-[#232323] items-center justify-center shadow-lg"
        style={[
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          animatedStyle,
        ]}
      >
        {/* Top Half */}
        <View
          className="absolute left-0 right-0 w-full h-1/2 top-0 overflow-hidden"
          style={{ backgroundColor: colors.top }}
        >
          {/* Accent stripes for Great / Ultra Ball */}
          {ballType === 'greatball' && (
            <View className="flex-row justify-between px-1.5 mt-1">
              <View className="w-1.5 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
              <View className="w-1.5 h-3 rounded-full" style={{ backgroundColor: colors.accent }} />
            </View>
          )}
          {ballType === 'ultraball' && (
            <View
              className="absolute top-1 left-[20%] right-[20%] h-1.5 rounded-full"
              style={{ backgroundColor: colors.accent }}
            />
          )}
          {ballType === 'masterball' && (
            <View className="flex-row justify-around mt-1">
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
              <View className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.accent }} />
            </View>
          )}
        </View>

        {/* Middle Band */}
        <View
          className="absolute left-0 right-0 bg-[#232323]"
          style={{ height: bandHeight }}
        />

        {/* Bottom Half */}
        <View className="absolute left-0 right-0 w-full h-1/2 bottom-0 bg-white" />

        {/* Center Ring & Button */}
        <View
          className="bg-white border-[2.5px] border-[#232323] items-center justify-center z-10"
          style={{
            width: centerSize,
            height: centerSize,
            borderRadius: centerSize / 2,
          }}
        >
          <View
            className="bg-white border-[1.5px] border-[#7F8C8D]"
            style={{
              width: innerButtonSize,
              height: innerButtonSize,
              borderRadius: innerButtonSize / 2,
            }}
          />
        </View>
      </Animated.View>

      {/* Inventory Count Badge */}
      {count !== undefined && (
        <View className="absolute -top-1 -right-1 bg-[#FF3B30] min-w-[20px] h-5 rounded-full items-center justify-center px-1 border-[1.5px] border-white z-20">
          <Text className="text-white text-[10px] font-extrabold">
            {count > 999 ? '999+' : count}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
