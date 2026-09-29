import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { capitalizePokemonName } from '@/shared/constants/kanto-pokemon';

export interface CatchHeaderProps {
  pokemonName: string;
  pokemonCp: number;
  ballCount: number;
  onRunPress: () => void;
}

export function CatchHeader({
  pokemonName,
  pokemonCp,
  ballCount,
  onRunPress,
}: CatchHeaderProps) {
  return (
    <View className="flex-row justify-between items-center px-4 pt-2 z-30">
      <TouchableOpacity
        className="flex-row items-center bg-black/45 px-3 py-1.5 rounded-full gap-1"
        activeOpacity={0.7}
        onPress={onRunPress}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        <Text className="text-white font-bold text-[13px]">Run</Text>
      </TouchableOpacity>

      <View className="items-center bg-white/90 dark:bg-black/90 px-4 py-1.5 rounded-full shadow-sm">
        <Text className="text-base font-extrabold text-[#11181C] dark:text-[#ECEDEE]">
          {capitalizePokemonName(pokemonName)}
        </Text>
        <View className="bg-[#11181C] px-2 py-0.5 rounded-lg mt-0.5">
          <Text className="text-white text-[11px] font-extrabold">CP {pokemonCp}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-row items-center bg-white/90 dark:bg-black/90 px-3 py-1.5 rounded-full gap-1.5">
          <Ionicons name="disc" size={16} color="#FF3B30" />
          <Text className="text-[#11181C] dark:text-[#ECEDEE] font-extrabold text-[13px]">
            {ballCount}
          </Text>
        </View>
      </View>
    </View>
  );
}
