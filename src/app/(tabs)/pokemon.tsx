import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTrainer } from '@/shared/context/trainer-context';
import { CaughtPokemon } from '@/shared/types';
import { TypeBadge, NicknameModal } from '@/features/pokemon';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import { capitalizePokemonName, formatPokemonId } from '@/shared/constants/kanto-pokemon';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export type CaughtListState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'ready'; pokemon: CaughtPokemon[] };

export default function PokemonScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const headerBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const headerBorder = isDark ? '#262626' : '#E1E4E8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 720 ? 4 : 2;

  const { caughtPokemon, isLoading, toggleFavorite, releasePokemon, renamePokemon } =
    useTrainer();

  const [selectedPokemonForRename, setSelectedPokemonForRename] =
    useState<CaughtPokemon | null>(null);

  const handleRelease = (pokemon: CaughtPokemon) => {
    const displayName = pokemon.nickname || capitalizePokemonName(pokemon.name);

    Alert.alert(
      'Release Pokémon',
      `Are you sure you want to release ${displayName}? You will receive 1 Candy.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release',
          style: 'destructive',
          onPress: () => releasePokemon(pokemon.instanceId),
        },
      ]
    );
  };

  const renderPokemonCard = ({ item }: { item: CaughtPokemon }) => {
    const primaryType = item.types[0] || 'normal';
    const typeColor = PokemonTypeColors[primaryType] || PokemonTypeColors.normal;
    const displayName = item.nickname || capitalizePokemonName(item.name);

    return (
      <View className="p-1.5" style={{ width: `${100 / numColumns}%`, padding: 6 }}>
        <View
          className="w-full bg-white dark:bg-[#1E1E1E] rounded-2xl border-[1.5px] p-2.5 shadow-sm"
          style={{
            backgroundColor: cardBg,
            borderColor: `${typeColor.primary}50`,
            borderWidth: 1.5,
            borderRadius: 16,
            padding: 10,
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 3,
          }}
        >
          {/* Top Card Bar: CP & Favorite */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
            className="flex-row justify-between items-center"
          >
            <View
              style={{
                backgroundColor: isDark ? 'rgba(10, 126, 164, 0.25)' : 'rgba(10, 126, 164, 0.1)',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 8,
              }}
              className="bg-[#0A7EA4]/10 px-1.5 py-0.5 rounded-lg"
            >
              <Text
                style={{ color: '#0A7EA4', fontSize: 11, fontWeight: '800' }}
                className="text-[#0A7EA4] text-[11px] font-extrabold"
              >
                CP {item.cp}
              </Text>
            </View>

            <TouchableOpacity
              style={{ padding: 2 }}
              className="p-0.5"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={
                item.favorite
                  ? `Remove ${displayName} from favorites`
                  : `Add ${displayName} to favorites`
              }
              onPress={() => toggleFavorite(item.instanceId)}
            >
              <Ionicons
                name={item.favorite ? 'star' : 'star-outline'}
                size={18}
                color={item.favorite ? '#F7D02C' : '#9BA1A6'}
              />
            </TouchableOpacity>
          </View>

          {/* Artwork Image */}
          <View
            style={{ width: '100%', height: 90, alignItems: 'center', justifyContent: 'center', marginVertical: 4 }}
            className="w-full h-[90px] items-center justify-center my-1"
          >
            <Image
              source={{ uri: item.artwork }}
              className="w-20 h-20"
              style={{ width: 80, height: 80 }}
              contentFit="contain"
              transition={200}
            />
          </View>

          {/* Pokemon Info */}
          <View style={{ alignItems: 'center' }} className="items-center">
            <Text
              style={{ color: subTextColor, fontSize: 10, fontWeight: '700' }}
              className="text-[10px] font-bold text-[#8E8E93]"
            >
              {formatPokemonId(item.pokemonId)}
            </Text>
            <TouchableOpacity
              onPress={() => setSelectedPokemonForRename(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Rename ${displayName}`}
              accessibilityHint="Opens modal to change nickname"
            >
              <Text
                style={{ color: textColor, fontSize: 14, fontWeight: '800', marginTop: 2, marginBottom: 6, textAlign: 'center' }}
                className="text-sm font-extrabold text-[#11181C] dark:text-[#ECEDEE] mt-0.5 mb-1.5 text-center"
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </TouchableOpacity>

            {/* Types Row */}
            <View style={{ flexDirection: 'row', gap: 4 }} className="flex-row gap-1">
              {item.types.map((t) => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </View>
          </View>

          {/* Card Footer: Action button */}
          <View
            style={{ borderTopWidth: 1, borderTopColor: isDark ? '#262626' : '#F4F6F8', marginTop: 8, paddingTop: 6, alignItems: 'center' }}
            className="border-t border-[#F4F6F8] dark:border-neutral-800 mt-2 pt-1.5 items-center"
          >
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 2 }}
              className="flex-row items-center gap-1 py-0.5"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => handleRelease(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Transfer ${displayName}`}
              accessibilityHint="Releases Pokémon for 1 Candy"
            >
              <Ionicons name="trash-outline" size={14} color="#FF3B30" />
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#FF3B30' }} className="text-[11px] font-bold text-[#FF3B30]">
                Transfer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#F4F6F8] dark:bg-[#121212]"
      style={{ flex: 1, backgroundColor: screenBg }}
      edges={['top']}
    >
      {/* Top Header */}
      <View
        style={{
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: headerBorder,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
        }}
        className="px-4 pt-2 pb-3 bg-white dark:bg-[#1E1E1E] border-b border-[#E1E4E8] dark:border-neutral-800"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} className="flex-row items-center gap-2">
          <Text
            style={{ fontSize: 24, fontWeight: '800', color: textColor }}
            className="text-2xl font-extrabold text-[#11181C] dark:text-[#ECEDEE]"
          >
            Pokémon
          </Text>
          <View
            style={{
              backgroundColor: isDark ? 'rgba(10, 126, 164, 0.25)' : 'rgba(10, 126, 164, 0.1)',
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
            }}
            className="bg-[#0A7EA4]/10 px-2 py-0.5 rounded-xl"
          >
            <Text
              style={{ color: '#0A7EA4', fontSize: 14, fontWeight: '800' }}
              className="text-[#0A7EA4] text-sm font-extrabold"
            >
              {caughtPokemon.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="flex-1">
        {isLoading ? (
          <View className="flex-1 items-center justify-center gap-3">
            <ActivityIndicator size="large" color="#0A7EA4" />
            <Text className="text-sm text-[#687076] font-semibold">Loading caught Pokémon...</Text>
          </View>
        ) : (
          <FlatList
            key={`caught-grid-${numColumns}`}
            data={caughtPokemon}
            keyExtractor={(item) => item.instanceId}
            renderItem={renderPokemonCard}
            numColumns={numColumns}
            contentContainerStyle={
              caughtPokemon.length === 0
                ? { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }
                : { paddingHorizontal: 6, paddingTop: 8, paddingBottom: 24 }
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center">
                <Ionicons name="disc-outline" size={64} color="#687076" />
                <Text className="text-lg font-extrabold text-[#11181C] dark:text-[#ECEDEE] mt-3">
                  No Pokémon Caught Yet
                </Text>
                <Text className="text-[13px] text-[#687076] text-center mt-1.5 mb-5 leading-[18px]">
                  Go to the Map Radar to encounter and catch wild Pokémon!
                </Text>
                <TouchableOpacity
                  className="flex-row items-center bg-[#0A7EA4] px-5 py-2.5 rounded-2xl gap-1.5"
                  onPress={() => router.push('/(tabs)' as any)}
                  accessibilityRole="button"
                  accessibilityLabel="Go to Radar"
                >
                  <Ionicons name="map" size={16} color="#FFFFFF" />
                  <Text className="text-white text-sm font-bold">Go to Radar</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>

      {/* Nickname Rename Modal */}
      {selectedPokemonForRename && (
        <NicknameModal
          visible={!!selectedPokemonForRename}
          pokemonName={selectedPokemonForRename.name}
          currentNickname={selectedPokemonForRename.nickname}
          onSave={async (newNickname) => {
            await renamePokemon(selectedPokemonForRename.instanceId, newNickname);
            setSelectedPokemonForRename(null);
          }}
          onCancel={() => setSelectedPokemonForRename(null)}
        />
      )}
    </SafeAreaView>
  );
}
