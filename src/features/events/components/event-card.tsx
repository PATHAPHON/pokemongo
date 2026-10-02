import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent } from '@/shared/types';
import { CategoryBadge } from './category-badge';
import {
  formatEventDateThai,
  formatEventTimeThai,
  isEventFull,
} from '@/shared/utils/event-helpers';

interface EventCardProps {
  event: CampusEvent;
  isFavorite?: boolean;
  isRegistered?: boolean;
  isDark?: boolean;
  onPress: () => void;
  onToggleFavorite?: () => void;
}

export function EventCard({
  event,
  isFavorite = false,
  isRegistered = false,
  isDark = false,
  onPress,
  onToggleFavorite,
}: EventCardProps) {
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

  const isFull = isEventFull(event);
  const seatsRemaining =
    event.capacity !== undefined
      ? Math.max(0, event.capacity - event.registeredCount)
      : null;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardBg, borderColor }]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`กิจกรรม: ${event.title}, สถานที่ ${event.location.name}`}
    >
      {/* Top Banner Image with Overlay Tags */}
      <View style={styles.imageContainer}>
        {event.imageUrl ? (
          <Image
            source={{ uri: event.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.imageFallback,
              { backgroundColor: isDark ? '#2A2A2A' : '#E2E8F0' },
            ]}
          >
            <Ionicons name="calendar-outline" size={40} color={subTextColor} />
          </View>
        )}

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            accessibilityRole="button"
            accessibilityLabel={
              isFavorite ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'
            }
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        )}

        {/* Registered status indicator */}
        {isRegistered && (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
            <Text style={styles.registeredText}>ลงทะเบียนแล้ว</Text>
          </View>
        )}
      </View>

      {/* Card Details */}
      <View style={styles.body}>
        <View style={styles.categoryRow}>
          <CategoryBadge category={event.category} size="sm" />
          {seatsRemaining !== null && (
            <Text
              style={[
                styles.capacityText,
                { color: isFull ? '#EF4444' : '#10B981' },
              ]}
            >
              {isFull ? 'เต็มแล้ว' : `ว่าง ${seatsRemaining} ที่`}
            </Text>
          )}
        </View>

        <Text
          style={[styles.title, { color: textColor }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {event.title}
        </Text>

        {/* Date and Time */}
        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={15} color="#8B5CF6" />
          <Text style={[styles.metaText, { color: subTextColor }]}>
            {`${formatEventDateThai(event.startsAt)} • ${formatEventTimeThai(event.startsAt)}`}
          </Text>
        </View>

        {/* Venue Location */}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={15} color="#EF4444" />
          <Text
            style={[styles.metaText, { color: subTextColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {event.location.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registeredBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  registeredText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 14,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
