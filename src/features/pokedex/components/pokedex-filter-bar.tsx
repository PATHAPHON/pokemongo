import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PokedexStatusFilter } from '../types';

interface PokedexFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  statusFilter: PokedexStatusFilter;
  onStatusChange: (status: PokedexStatusFilter) => void;
  isDark: boolean;
}

const STATUS_OPTIONS: {
  id: PokedexStatusFilter;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'all', label: 'ทั้งหมด', icon: 'apps-outline' },
  { id: 'caught', label: 'จับแล้ว', icon: 'checkmark-circle-outline' },
  { id: 'uncaught', label: 'ยังไม่จับ', icon: 'help-circle-outline' },
];

export function PokedexFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isDark,
}: PokedexFilterBarProps) {
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const placeholderColor = isDark ? '#64748B' : '#94A3B8';
  const chipBg = isDark ? '#1E1E1E' : '#E2E8F0';
  const chipBorder = isDark ? '#2D3748' : '#CBD5E1';

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: inputBg, borderColor: chipBorder },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={placeholderColor}
          style={styles.searchIcon}
        />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="ค้นหาชื่อ หรือเลข ID (#025, pikachu)..."
          placeholderTextColor={placeholderColor}
          style={[styles.input, { color: textColor }]}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Chips */}
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((opt) => {
          const isActive = statusFilter === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              activeOpacity={0.7}
              onPress={() => onStatusChange(opt.id)}
              style={[
                styles.statusChip,
                {
                  backgroundColor: isActive ? '#EF4444' : chipBg,
                  borderColor: isActive ? '#EF4444' : chipBorder,
                },
              ]}
            >
              <Ionicons
                name={opt.icon}
                size={14}
                color={isActive ? '#FFFFFF' : isDark ? '#94A3B8' : '#475569'}
              />
              <Text
                style={[
                  styles.statusChipText,
                  {
                    color: isActive
                      ? '#FFFFFF'
                      : isDark
                        ? '#E2E8F0'
                        : '#334155',
                    fontWeight: isActive ? '700' : '600',
                  },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    marginBottom: 6,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 40,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 13,
    height: '100%',
    paddingVertical: 0,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statusChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 12,
  },
});
