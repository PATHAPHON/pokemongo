import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PokemonTypeName } from '@/shared/types';
import { TypeBadge } from './type-badge';

const ALL_TYPES: PokemonTypeName[] = [
  'normal',
  'fire',
  'water',
  'grass',
  'electric',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'steel',
  'fairy',
  'dark',
];

export interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedType: PokemonTypeName | null;
  onTypeSelect: (type: PokemonTypeName | null) => void;
  placeholder?: string;
  style?: StyleProp<ViewStyle>;
  className?: string;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeSelect,
  placeholder = 'Search name or #number...',
  style,
  className = '',
}: SearchFilterBarProps) {
  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleTypePress = (type: PokemonTypeName) => {
    if (selectedType === type) {
      onTypeSelect(null); // Deselect to 'All'
    } else {
      onTypeSelect(type);
    }
  };

  return (
    <View className={`py-2 ${className}`.trim()} style={style}>
      {/* Search Input Box */}
      <View className="flex-row items-center bg-neutral-400/15 dark:bg-neutral-800/60 rounded-xl px-3 mx-4 h-11">
        <Text className="text-base mr-2 opacity-70">🔍</Text>
        <TextInput
          className="flex-1 h-full text-[15px] text-[#11181C] dark:text-[#ECEDEE] font-medium"
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="p-1"
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text className="text-sm text-[#8E8E93] font-bold">✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Type Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' }}
      >
        {/* All Types Pill */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTypeSelect(null)}
          className={`px-3.5 py-1 rounded-full mr-2 min-w-[54px] items-center justify-center border ${
            selectedType === null
              ? 'bg-[#11181C] dark:bg-[#ECEDEE] border-[#11181C] dark:border-[#ECEDEE]'
              : 'bg-transparent border-neutral-400/30'
          }`}
          accessibilityRole="button"
          accessibilityLabel="Show all types"
        >
          <Text
            className={`text-[11px] font-extrabold tracking-wider ${
              selectedType === null
                ? 'text-white dark:text-[#11181C]'
                : 'text-[#8E8E93]'
            }`}
          >
            ALL
          </Text>
        </TouchableOpacity>

        {/* 18 Type Badges */}
        {ALL_TYPES.map((type) => (
          <TypeBadge
            key={type}
            type={type}
            size="md"
            selected={selectedType === null || selectedType === type}
            outlined={selectedType !== null && selectedType !== type}
            onPress={() => handleTypePress(type)}
            className="mr-2"
          />
        ))}
      </ScrollView>
    </View>
  );
}
