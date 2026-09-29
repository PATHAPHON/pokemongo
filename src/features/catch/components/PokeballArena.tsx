import React from 'react';
import { View, Text, TouchableOpacity, Animated, GestureResponderHandlers } from 'react-native';

export interface PokeballArenaProps {
  ballCount: number;
  isAiming: boolean;
  panHandlers: GestureResponderHandlers;
  ballX: Animated.Value;
  ballY: Animated.Value;
  ballScale: Animated.Value;
  ballRotation: Animated.AnimatedInterpolation<string | number>;
  onOutOfBallsPress: () => void;
}

export function PokeballArena({
  ballCount,
  isAiming,
  panHandlers,
  ballX,
  ballY,
  ballScale,
  ballRotation,
  onOutOfBallsPress,
}: PokeballArenaProps) {
  return (
    <View className="h-[180px] items-center justify-center z-20">
      {ballCount <= 0 && isAiming ? (
        <View className="items-center bg-black/60 px-5 py-3 rounded-2xl">
          <Text className="text-[#FF3B30] font-extrabold text-[15px]">Out of Pokéballs!</Text>
          <TouchableOpacity
            className="mt-2 bg-white px-3.5 py-1.5 rounded-xl"
            onPress={onOutOfBallsPress}
          >
            <Text className="text-[#11181C] font-bold text-[13px]">Return to Map</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="items-center justify-center w-[120px] h-[120px]" {...panHandlers}>
          <Animated.View
            className="w-[68px] h-[68px] rounded-full border-[3px] border-[#11181C] bg-white overflow-hidden relative shadow-xl"
            style={[
              {
                transform: [
                  { translateX: ballX },
                  { translateY: ballY },
                  { scale: ballScale },
                  { rotate: ballRotation },
                ],
              },
            ]}
          >
            <View className="h-1/2 bg-[#FF3B30]" />
            <View className="absolute top-[44%] left-0 right-0 h-2 bg-[#11181C] items-center justify-center z-10">
              <View className="w-[18px] h-[18px] rounded-full bg-white border-[3px] border-[#11181C]" />
            </View>
            <View className="h-1/2 bg-white" />
          </Animated.View>
          {isAiming && (
            <Text
              className="text-white text-xs font-bold mt-2"
              style={{
                textShadowColor: 'rgba(0, 0, 0, 0.6)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 3,
              }}
            >
              Swipe up to throw
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
