import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventEmptyStateProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onAction?: () => void;
  iconName?: string;
  isDark?: boolean;
}

export function EventEmptyState({
  title = 'ไม่พบกิจกรรมที่ค้นหา',
  subtitle = 'ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อดูกิจกรรมทั้งหมด',
  buttonText = 'ล้างตัวกรองทั้งหมด',
  onAction,
  iconName = 'calendar-outline',
  isDark = false,
}: EventEmptyStateProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  return (
    <View style={styles.container}>
      <View style={[styles.iconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
        <Ionicons name={iconName as any} size={44} color={subTextColor} />
      </View>

      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: subTextColor }]}>{subtitle}</Text>

      {onAction && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onAction}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={buttonText}
        >
          <Text style={styles.actionButtonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
    paddingHorizontal: 28,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
