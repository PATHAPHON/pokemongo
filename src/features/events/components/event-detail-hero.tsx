import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent } from '@/shared/types';
import { CategoryBadge } from './category-badge';

interface EventDetailHeroProps {
  event: CampusEvent;
  isFavorite: boolean;
  hasReminder: boolean;
  onBack: () => void;
  onToggleFavorite: () => void;
  onToggleReminder: () => void;
  isDark?: boolean;
}

export function EventDetailHero({
  event,
  isFavorite,
  hasReminder,
  onBack,
  onToggleFavorite,
  onToggleReminder,
  isDark = false,
}: EventDetailHeroProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  return (
    <View style={styles.container}>
      {/* Hero Image */}
      <View style={styles.imageWrapper}>
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.fallback, { backgroundColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}>
            <Ionicons name="calendar" size={64} color={subTextColor} />
          </View>
        )}

        {/* Top Control Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={onBack}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="ย้อนกลับ"
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.rightButtons}>
            <TouchableOpacity
              style={styles.circleButton}
              onPress={onToggleReminder}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={hasReminder ? 'ยกเลิกการแจ้งเตือน' : 'ตั้งการแจ้งเตือน'}
            >
              <Ionicons
                name={hasReminder ? 'notifications' : 'notifications-outline'}
                size={20}
                color={hasReminder ? '#FFCB05' : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.circleButton}
              onPress={onToggleFavorite}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={20}
                color={isFavorite ? '#EF4444' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Hero Titles */}
      <View style={styles.titleSection}>
        <CategoryBadge category={event.category} size="md" />

        <Text style={[styles.title, { color: textColor }]}>
          {event.title}
        </Text>

        {event.organizer && (
          <View style={styles.organizerRow}>
            <Ionicons name="people-outline" size={15} color={subTextColor} />
            <Text style={[styles.organizerText, { color: subTextColor }]}>
              จัดโดย: {event.organizer}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 240,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  circleButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 28,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  organizerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
