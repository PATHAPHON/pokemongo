import { View, Text, StyleSheet } from 'react-native';
import { EventCategory } from '@/shared/types';
import {
  EventCategoryColors,
  getCategoryLabel,
} from '@/shared/constants/event-theme';

interface CategoryBadgeProps {
  category: EventCategory;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const theme = EventCategoryColors[category] || {
    primary: '#64748B',
    background: '#F1F5F9',
    badgeBg: 'rgba(100, 116, 139, 0.2)',
    text: '#334155',
  };

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.badgeBg },
        isSmall ? styles.badgeSm : styles.badgeMd,
      ]}
      accessibilityRole="text"
      accessibilityLabel={`หมวดหมู่: ${getCategoryLabel(category)}`}
    >
      <View style={[styles.dot, { backgroundColor: theme.primary }]} />
      <Text
        style={[
          styles.text,
          { color: theme.text },
          isSmall ? styles.textSm : styles.textMd,
        ]}
      >
        {getCategoryLabel(category)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 5,
  },
  badgeMd: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '700',
  },
  textSm: {
    fontSize: 11,
  },
  textMd: {
    fontSize: 13,
  },
});
