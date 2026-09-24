import React from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { PokemonTypeName } from '@/types';
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
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeSelect,
  placeholder = 'Search name or #number...',
  style,
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
    <View style={[styles.container, style]}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
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
            style={styles.clearButton}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Horizontal Type Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeScrollContainer}
      >
        {/* All Types Pill */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onTypeSelect(null)}
          style={[
            styles.allPill,
            selectedType === null ? styles.allPillActive : styles.allPillInactive,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Show all types"
        >
          <Text
            style={[
              styles.allPillText,
              selectedType === null ? styles.allPillTextActive : styles.allPillTextInactive,
            ]}
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
            style={styles.typePillMargin}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    opacity: 0.7,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#11181C',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '700',
  },
  typeScrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  allPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 9999,
    marginRight: 8,
    borderWidth: 1,
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allPillActive: {
    backgroundColor: '#11181C',
    borderColor: '#11181C',
  },
  allPillInactive: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(142, 142, 147, 0.3)',
  },
  allPillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  allPillTextActive: {
    color: '#FFFFFF',
  },
  allPillTextInactive: {
    color: '#8E8E93',
  },
  typePillMargin: {
    marginRight: 8,
  },
});
