import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { capitalizePokemonName, getKantoArtworkUrl } from '@/shared/constants/kanto-pokemon';

export interface GotchaModalProps {
  pokemonId: number;
  pokemonName: string;
  onSetNickname: () => void;
  onDone: () => void;
}

export function GotchaModal({
  pokemonId,
  pokemonName,
  onSetNickname,
  onDone,
}: GotchaModalProps) {
  return (
    <View className="absolute inset-0 bg-black/65 items-center justify-center z-50 p-6">
      <View className="w-full max-w-[320px] bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 items-center shadow-2xl">
        <Ionicons name="sparkles" size={44} color="#F7D02C" />
        <Text className="text-2xl font-black text-[#11181C] dark:text-[#ECEDEE] mt-2">
          Gotcha!
        </Text>
        <Text className="text-sm text-[#687076] dark:text-[#9BA1A6] font-semibold text-center mt-1">
          {capitalizePokemonName(pokemonName)} was caught!
        </Text>

        <Image
          source={{ uri: getKantoArtworkUrl(pokemonId) }}
          className="w-[100px] h-[100px] my-3"
          contentFit="contain"
        />

        <View className="flex-row gap-3 mb-5">
          <View className="flex-row items-center bg-[#F4F6F8] dark:bg-neutral-800 px-3 py-1.5 rounded-xl gap-1.5">
            <Ionicons name="ribbon" size={16} color="#007AFF" />
            <Text className="text-[13px] font-bold text-[#11181C] dark:text-[#ECEDEE]">
              +120 XP
            </Text>
          </View>
          <View className="flex-row items-center bg-[#F4F6F8] dark:bg-neutral-800 px-3 py-1.5 rounded-xl gap-1.5">
            <Ionicons name="star" size={16} color="#F7D02C" />
            <Text className="text-[13px] font-bold text-[#11181C] dark:text-[#ECEDEE]">
              +100 Stardust
            </Text>
          </View>
        </View>

        <View className="w-full gap-2.5">
          <TouchableOpacity
            className="w-full h-11 rounded-xl bg-[#0A7EA4] items-center justify-center"
            activeOpacity={0.8}
            onPress={onSetNickname}
          >
            <Text className="text-white font-extrabold text-sm">Set Nickname</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full h-11 rounded-xl bg-[#F4F6F8] dark:bg-neutral-800 items-center justify-center"
            activeOpacity={0.8}
            onPress={onDone}
          >
            <Text className="text-[#11181C] dark:text-[#ECEDEE] font-bold text-sm">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
