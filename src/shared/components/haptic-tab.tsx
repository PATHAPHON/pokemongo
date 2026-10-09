import { useState } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { PlatformPressable } from 'expo-router/react-navigation';
import * as Haptics from 'expo-haptics';
export function HapticTab(props: any) {
  const isSelected = Boolean(
    props['aria-selected'] ?? props.accessibilityState?.selected
  );
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = (ev: any) => {
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      useNativeDriver: true,
      speed: 35,
      bounciness: 6,
    }).start();

    if (process.env.EXPO_OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    props.onPressIn?.(ev);
  };

  const handlePressOut = (ev: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 25,
      bounciness: 8,
    }).start();

    props.onPressOut?.(ev);
  };

  return (
    <PlatformPressable
      {...props}
      style={[
        props.style,
        styles.tabButton,
        Platform.OS === 'web' && styles.webPressable,
      ]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.innerContainer,
          isSelected && styles.activePill,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {props.children}
      </Animated.View>
    </PlatformPressable>
  );
}

const styles = StyleSheet.create({
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '90%',
    height: '88%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 2,
    paddingHorizontal: 2,
  },
  activePill: {
    backgroundColor: 'rgba(238, 21, 21, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(238, 21, 21, 0.25)',
  },
  webPressable: {
    outlineStyle: 'none',
    outlineWidth: 0,
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  } as any,
});

