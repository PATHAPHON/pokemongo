import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  EventCategoryFilter,
  EventStatusFilter,
} from '../types';
import { getCategoryLabel } from '@/shared/constants/event-theme';

interface EventFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: EventCategoryFilter;
  onCategoryChange: (cat: EventCategoryFilter) => void;
  statusFilter: EventStatusFilter;
  onStatusChange: (status: EventStatusFilter) => void;
  isDark?: boolean;
}

const CATEGORIES: EventCategoryFilter[] = [
  'all',
  'workshop',
  'academic',
  'sports',
  'social',
  'career',
];

const STATUSES: { key: EventStatusFilter; label: string; icon: string }[] = [
  { key: 'all', label: 'ทั้งหมด', icon: 'apps-outline' },
  { key: 'upcoming', label: 'เร็วๆ นี้', icon: 'time-outline' },
  { key: 'registered', label: 'ลงทะเบียนแล้ว', icon: 'checkmark-circle-outline' },
  { key: 'favorites', label: 'รายการโปรด', icon: 'heart-outline' },
];

export function EventFilterBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  isDark = false,
}: EventFilterBarProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const inputBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';
  const chipBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const chipActiveBg = '#8B5CF6';

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
          placeholder="ค้นหามีตอัป, สถานที่จัด, หรือกลุ่มเทรนเนอร์..."
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

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScroll}
      >
        {CATEGORIES.map((cat) => {
          const isActive = categoryFilter === cat;
          const label = cat === 'all' ? 'ทุกหมวดหมู่' : getCategoryLabel(cat);
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: isActive
                    ? isDark
                      ? '#3A3A3C'
                      : '#374151'
                    : 'transparent',
                  borderColor: isActive ? 'transparent' : borderColor,
                },
              ]}
              onPress={() => onCategoryChange(cat)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={`หมวดหมู่ ${label}`}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: isActive ? '#FFFFFF' : subTextColor,
                    fontWeight: isActive ? '700' : '500',
                  },
                ]}
              >
                {label}
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
  categoryScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
  },
});
