import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  StyleProp,
  ViewStyle,
  Platform,
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
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
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
      style={[styles.wrapper, disabled && styles.disabled, style]}
      accessibilityRole="button"
      accessibilityLabel={`Pokéball button ${ballType}${count !== undefined ? `, ${count} remaining` : ''}`}
    >
      <Animated.View
        style={[
          styles.ballContainer,
          { width: dimension, height: dimension, borderRadius: dimension / 2 },
          animatedStyle,
        ]}
      >
        {/* Top Half */}
        <View
          style={[
            styles.half,
            styles.topHalf,
            { backgroundColor: colors.top },
          ]}
        >
          {/* Accent stripes for Great / Ultra Ball */}
          {ballType === 'greatball' && (
            <View style={styles.greatAccents}>
              <View style={[styles.greatBar, { backgroundColor: colors.accent }]} />
              <View style={[styles.greatBar, { backgroundColor: colors.accent }]} />
            </View>
          )}
          {ballType === 'ultraball' && (
            <View style={[styles.ultraBar, { backgroundColor: colors.accent }]} />
          )}
          {ballType === 'masterball' && (
            <View style={styles.masterDots}>
              <View style={[styles.masterDot, { backgroundColor: colors.accent }]} />
              <View style={[styles.masterDot, { backgroundColor: colors.accent }]} />
            </View>
          )}
        </View>

        {/* Middle Band */}
        <View style={[styles.middleBand, { height: bandHeight }]} />

        {/* Bottom Half */}
        <View style={[styles.half, styles.bottomHalf]} />

        {/* Center Ring & Button */}
        <View
          style={[
            styles.centerRing,
            {
              width: centerSize,
              height: centerSize,
              borderRadius: centerSize / 2,
            },
          ]}
        >
          <View
            style={[
              styles.centerButton,
              {
                width: innerButtonSize,
                height: innerButtonSize,
                borderRadius: innerButtonSize / 2,
              },
            ]}
          />
        </View>
      </Animated.View>

      {/* Inventory Count Badge */}
      {count !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 999 ? '999+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
  ballContainer: {
    backgroundColor: '#000000',
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  half: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: '100%',
    height: '50%',
  },
  topHalf: {
    top: 0,
    overflow: 'hidden',
  },
  bottomHalf: {
    bottom: 0,
    backgroundColor: '#FFFFFF',
  },
  middleBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#232323',
  },
  centerRing: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#232323',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#7F8C8D',
  },
  greatAccents: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  greatBar: {
    width: 6,
    height: 12,
    borderRadius: 3,
  },
  ultraBar: {
    position: 'absolute',
    top: 4,
    left: '20%',
    right: '20%',
    height: 6,
    borderRadius: 3,
  },
  masterDots: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  masterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 20,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
});
