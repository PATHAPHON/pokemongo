import { View, StyleSheet } from 'react-native';
import { AiSearchBar } from '@/shared/components/ai-search-bar';
import { PokedexStatusFilter } from '../types';

interface PokedexFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  statusFilter?: PokedexStatusFilter;
  onStatusChange?: (status: PokedexStatusFilter) => void;
  isDark: boolean;
}

export function PokedexFilterBar({
  searchQuery,
  onSearchChange,
  isDark,
}: PokedexFilterBarProps) {
  return (
    <View style={styles.container}>
      <AiSearchBar
        value={searchQuery}
        onChangeText={onSearchChange}
        isDark={isDark}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
});
