import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EventStatsHeaderProps {
  isOffline?: boolean;
  lastUpdated?: string | null;
  isDark?: boolean;
}

export function EventStatsHeader({
  isOffline = false,
  lastUpdated,
}: EventStatsHeaderProps) {
  if (!isOffline) {
    return null;
  }

  const formatLastUpdated = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return ` (${hours}:${minutes} น.)`;
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.offlineBanner}>
        <Ionicons name="cloud-offline" size={14} color="#D97706" />
        <Text style={styles.offlineBannerText}>
          โหมดออฟไลน์: กำลังแสดงข้อมูลแคชจาก SQLite{formatLastUpdated(lastUpdated)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  offlineBannerText: {
    fontSize: 11,
    color: '#B45309',
    fontWeight: '600',
    flex: 1,
  },
});
