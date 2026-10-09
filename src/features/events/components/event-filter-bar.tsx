import { View, StyleSheet } from 'react-native';
import { AiSearchBar } from '@/shared/components/ai-search-bar';
import { EventStatusFilter } from '../types';

interface EventFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter?: EventStatusFilter;
  onStatusChange?: (status: EventStatusFilter) => void;
  isDark?: boolean;
}

export function EventFilterBar({
  searchQuery,
  onSearchChange,
  isDark = false,
}: EventFilterBarProps) {
  return (
    <View style={styles.container}>
      {/* AI Glow Search Bar */}
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
