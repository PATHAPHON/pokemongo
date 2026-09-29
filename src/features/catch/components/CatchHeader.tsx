import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { capitalizePokemonName } from '@/shared/constants/kanto-pokemon';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';

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
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const pillBg = isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.9)';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        zIndex: 30,
      }}
      className="flex-row justify-between items-center px-4 pt-2 z-30"
    >
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 20,
          gap: 4,
        }}
        className="flex-row items-center bg-black/45 px-3 py-1.5 rounded-full gap-1"
        activeOpacity={0.7}
        onPress={onRunPress}
      >
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }} className="text-white font-bold text-[13px]">
          Run
        </Text>
      </TouchableOpacity>

      <View
        style={{
          alignItems: 'center',
          backgroundColor: pillBg,
          paddingHorizontal: 16,
          paddingVertical: 6,
          borderRadius: 20,
          elevation: 2,
        }}
        className="items-center bg-white/90 dark:bg-black/90 px-4 py-1.5 rounded-full shadow-sm"
      >
        <Text
          style={{ fontSize: 16, fontWeight: '800', color: textColor }}
          className="text-base font-extrabold text-[#11181C] dark:text-[#ECEDEE]"
        >
          {capitalizePokemonName(pokemonName)}
        </Text>
        <View
          style={{
            backgroundColor: '#11181C',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            marginTop: 2,
          }}
          className="bg-[#11181C] px-2 py-0.5 rounded-lg mt-0.5"
        >
          <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }} className="text-white text-[11px] font-extrabold">
            CP {pokemonCp}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} className="flex-row items-center gap-2">
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pillBg,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
            gap: 6,
          }}
          className="flex-row items-center bg-white/90 dark:bg-black/90 px-3 py-1.5 rounded-full gap-1.5"
        >
          <Ionicons name="disc" size={16} color="#FF3B30" />
          <Text
            style={{ color: textColor, fontWeight: '800', fontSize: 13 }}
            className="text-[#11181C] dark:text-[#ECEDEE] font-extrabold text-[13px]"
          >
            {ballCount}
          </Text>
        </View>
      </View>
    </View>
  );
}

