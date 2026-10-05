import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventStats } from '../types';

interface EventStatsHeaderProps {
  stats?: EventStats;
  isOffline?: boolean;
  lastUpdated?: string | null;
  isDark?: boolean;
}

export function EventStatsHeader({
  isOffline = false,
  lastUpdated,
  isDark = false,
}: EventStatsHeaderProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const formatLastUpdated = (iso?: string | null) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `อัปเดตล่าสุด ${hours}:${minutes} น.`;
    } catch {
      return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Title & Badge */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.titleRow}>
            <Ionicons name="sparkles" size={18} color="#EE1515" />
            <Text style={[styles.title, { color: textColor }]}>
              Pokémon Meetups
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            มีตอัปเทรนเนอร์ & กิจกรรมล่าโปเกมอน
          </Text>
        </View>

        {isOffline && (
          <View style={styles.offlineBadge}>
            <Ionicons name="cloud-offline" size={12} color="#D97706" />
            <Text style={styles.offlineText}>โหมดออฟไลน์ (Cache)</Text>
          </View>
        )}
      </View>

      {/* Offline banner note */}
      {isOffline && lastUpdated && (
        <View style={styles.offlineBanner}>
          <Ionicons name="information-circle" size={14} color="#D97706" />
          <Text style={styles.offlineBannerText}>
            กำลังแสดงข้อมูลแคชจาก SQLite ({formatLastUpdated(lastUpdated)})
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  offlineText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
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
