import React from 'react';
import { Animated } from 'react-native';

export interface TargetRingProps {
  visible: boolean;
  ringColor: string;
  ringScaleAnim: Animated.Value;
}

export function TargetRing({ visible, ringColor, ringScaleAnim }: TargetRingProps) {
  if (!visible) return null;

  return (
    <Animated.View
      className="absolute w-[170px] h-[170px] rounded-full border-[3px] z-10"
      style={[
        {
          borderColor: ringColor,
          transform: [{ scale: ringScaleAnim }],
        },
      ]}
    />
  );
}
