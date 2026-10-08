import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventStatusFilter } from '../types';

interface EventFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: EventStatusFilter;
  onStatusChange: (status: EventStatusFilter) => void;
  isDark?: boolean;
}

const STATUSES: { key: EventStatusFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'ทั้งหมด', icon: 'apps-outline' },
  { key: 'favorites', label: 'รายการโปรด', icon: 'heart-outline' },
];

export function EventFilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  isDark = false,
}: EventFilterBarProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const chipBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const chipActiveBg = '#EE1515';

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View
        style={[
          styles.searchBox,
          { backgroundColor: inputBg, borderColor },
        ]}
      >
        <Ionicons name="search" size={18} color={subTextColor} />
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="ค้นหามีตอัปโปเกมอน, สถานที่จัด, หรือกลุ่มเทรนเนอร์..."
          placeholderTextColor={subTextColor}
          value={searchQuery}
          onChangeText={onSearchChange}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          accessibilityLabel="ค้นหามีตอัปโปเกมอน"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="ล้างคำค้นหา"
          >
            <Ionicons name="close-circle" size={18} color={subTextColor} />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Segment Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsScroll}
      >
        {STATUSES.map((item) => {
          const isActive = statusFilter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.statusChip,
                {
                  backgroundColor: isActive ? chipActiveBg : chipBg,
                  borderColor: isActive ? chipActiveBg : borderColor,
                },
              ]}
              onPress={() => onStatusChange(item.key)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`กรองสถานะ ${item.label}`}
            >
              <Ionicons
                name={item.icon as any}
                size={14}
                color={isActive ? '#FFFFFF' : subTextColor}
              />
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#FFFFFF' : textColor },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  chipsScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
