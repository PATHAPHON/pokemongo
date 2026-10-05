import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEventContext } from '@/shared/context/event-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { EventCard, EventEmptyState } from '@/features/events';
import { CampusEvent } from '@/shared/types';

type MyEventsTab = 'registered' | 'favorites';

export default function MyEventsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;

  const { events, registrations, favorites, isLoading, toggleFavorite } =
    useEventContext();



  const [activeTab, setActiveTab] = useState<MyEventsTab>('registered');

  const registeredEvents = useMemo(() => {
    const regEventMap = new Map(
      registrations
        .filter((r) => r.status === 'registered' || r.status === 'attended')
        .map((r) => [r.eventId, r])
    );

    return events
      .filter((e) => regEventMap.has(e.id))
      .map((e) => ({
        event: e,
        registration: regEventMap.get(e.id)!,
      }));
  }, [events, registrations]);

  const favoriteEvents = useMemo(() => {
    const favSet = new Set(favorites);
    return events.filter((e) => favSet.has(e.id));
  }, [events, favorites]);

  const activeRegistrationsSet = useMemo(() => {
    return new Set(
      registrations
        .filter((r) => r.status === 'registered')
        .map((r) => r.eventId)
    );
  }, [registrations]);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: screenBg }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: textColor }]}>
            มีตอัปของฉัน
          </Text>
        </View>

        {/* Tab Switcher */}
        <View
          style={[
            styles.tabContainer,
            { backgroundColor: isDark ? '#1E1E1E' : '#E5E7EB' },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'registered' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('registered')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'registered' }}
            accessibilityLabel={`ลงทะเบียนแล้ว (${registeredEvents.length} รายการ)`}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={activeTab === 'registered' ? '#FFFFFF' : subTextColor}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'registered'
                  ? styles.activeTabText
                  : { color: subTextColor },
              ]}
            >
              ลงทะเบียนแล้ว ({registeredEvents.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === 'favorites' && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab('favorites')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: activeTab === 'favorites' }}
            accessibilityLabel={`รายการโปรด (${favoriteEvents.length} รายการ)`}
          >
            <Ionicons
              name="heart-outline"
              size={16}
              color={activeTab === 'favorites' ? '#FFFFFF' : subTextColor}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'favorites'
                  ? styles.activeTabText
                  : { color: subTextColor },
              ]}
            >
              รายการโปรด ({favoriteEvents.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={[styles.loadingText, { color: subTextColor }]}>
              กำลังโหลดข้อมูลของคุณ...
            </Text>
          </View>
        ) : activeTab === 'registered' ? (
          <FlatList
            key={`my-registered-${numColumns}`}
            data={registeredEvents}
            keyExtractor={(item) => `reg-${item.registration.id}`}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <View
                style={[styles.cardItemWrap, numColumns > 1 && styles.gridCol]}
              >
              <EventCard
                  event={item.event}
                  isFavorite={favoritesSet.has(item.event.id)}
                  isRegistered={true}
                  isDark={isDark}
                  onPress={() => router.push(`/events/${item.event.id}` as any)}
                  onToggleFavorite={() => toggleFavorite(item.event.id)}
                />

              </View>
            )}
            contentContainerStyle={
              registeredEvents.length === 0
                ? styles.emptyListContainer
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EventEmptyState
                title="ยังไม่มีมีตอัปที่ลงทะเบียน"
                subtitle="คุณยังไม่ได้ลงทะเบียนเข้าร่วมมีตอัปโปเกมอนใดๆ ไปที่แท็บ Meetups เพื่อดูรายการและสมัครได้เลย!"
                buttonText="ไปค้นหามีตอัป"
                iconName="ticket-outline"
                onAction={() => router.push('/(tabs)' as any)}
                isDark={isDark}
              />
            }
          />
        ) : (
          <FlatList
            key={`my-favorites-${numColumns}`}
            data={favoriteEvents}
            keyExtractor={(item: CampusEvent) => `fav-${item.id}`}
            numColumns={numColumns}
            renderItem={({ item }: { item: CampusEvent }) => (
              <View style={numColumns > 1 ? styles.gridCol : undefined}>
                <EventCard
                  event={item}
                  isFavorite={true}
                  isRegistered={activeRegistrationsSet.has(item.id)}
                  isDark={isDark}
                  onPress={() => router.push(`/events/${item.id}` as any)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              </View>
            )}
            contentContainerStyle={
              favoriteEvents.length === 0
                ? styles.emptyListContainer
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EventEmptyState
                title="ยังไม่มีรายการโปรด"
                subtitle="แตะรูปหัวใจที่มีตอัปที่คุณสนใจเพื่อบันทึกไว้ในหน้านี้ เพื่อติดตามและดูย้อนหลังได้สะดวก"
                buttonText="สำรวจมีตอัปทั้งหมด"
                iconName="heart-outline"
                onAction={() => router.push('/(tabs)' as any)}
                isDark={isDark}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    marginTop: 6,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
  cardItemWrap: {
    marginBottom: 6,
  },
  gridCol: {
    flex: 1,
    marginHorizontal: 6,
  },
  regActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: -8,
    marginBottom: 14,
  },
  regInfo: {
    flex: 1,
  },
  regLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    gap: 4,
  },
  cancelButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EF4444',
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
