import { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useEventContext } from '@/shared/context/event-context';
import { useTrainer } from '@/shared/context/trainer-context';
import { EventCard, EventEmptyState } from '@/features/events';
import { CampusEvent } from '@/shared/types';
import { isEventOrganizer } from '@/shared/utils/event-helpers';

type MyEventsTab = 'registered' | 'favorites' | 'hosting';

export default function MyEventsScreen() {
  const router = useRouter();

  const screenBg = '#F8FAFC';
  const subTextColor = '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;

  const insets = useSafeAreaInsets();
  const floatingTabBottom =
    (insets.bottom > 0 ? insets.bottom + 12 : 24) + 60 + 12;

  const { trainer } = useTrainer();
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

  const hostedEvents = useMemo(() => {
    return events.filter((e) => isEventOrganizer(e, trainer));
  }, [events, trainer]);

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
      {/* Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#EE1515" />
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
                  isOrganizer={isEventOrganizer(item.event, trainer)}
                  isDark={false}
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
                isDark={false}
              />
            }
          />
        ) : activeTab === 'favorites' ? (
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
                  isOrganizer={isEventOrganizer(item, trainer)}
                  isDark={false}
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
                isDark={false}
              />
            }
          />
        ) : (
          <FlatList
            key={`my-hosting-${numColumns}`}
            data={hostedEvents}
            keyExtractor={(item: CampusEvent) => `host-${item.id}`}
            numColumns={numColumns}
            renderItem={({ item }: { item: CampusEvent }) => (
              <View style={numColumns > 1 ? styles.gridCol : undefined}>
                <EventCard
                  event={item}
                  isFavorite={favoritesSet.has(item.id)}
                  isRegistered={activeRegistrationsSet.has(item.id)}
                  isOrganizer={true}
                  isDark={false}
                  onPress={() => router.push(`/events/${item.id}` as any)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              </View>
            )}
            contentContainerStyle={
              hostedEvents.length === 0
                ? styles.emptyListContainer
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <EventEmptyState
                title="คุณยังไม่ได้เป็นผู้จัดมีตอัป"
                subtitle="สามารถสร้างมีตอัปใหม่เพื่อเป็นโฮสต์จัดกิจกรรม และระดมเพื่อนๆ เทรนเนอร์มาร่วมสนุกได้!"
                buttonText="สร้างมีตอัปใหม่"
                iconName="add-circle-outline"
                onAction={() => router.push('/events/create' as any)}
                isDark={false}
              />
            }
          />
        )}
      </View>

      {/* Floating 3-Icon Switcher above TabBar */}
      <View
        style={[
          styles.floatingTabContainer,
          {
            bottom: floatingTabBottom,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: 'rgba(238, 21, 21, 0.15)',
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tabIconButton,
            activeTab === 'registered' && styles.activeTabIconButton,
          ]}
          onPress={() => setActiveTab('registered')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'registered' }}
          accessibilityLabel={`ลงทะเบียนแล้ว (${registeredEvents.length} รายการ)`}
        >
          <Ionicons
            name={
              activeTab === 'registered'
                ? 'checkmark-circle'
                : 'checkmark-circle-outline'
            }
            size={22}
            color={activeTab === 'registered' ? '#FFFFFF' : subTextColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabIconButton,
            activeTab === 'favorites' && styles.activeTabIconButton,
          ]}
          onPress={() => setActiveTab('favorites')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'favorites' }}
          accessibilityLabel={`รายการโปรด (${favoriteEvents.length} รายการ)`}
        >
          <Ionicons
            name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
            size={22}
            color={activeTab === 'favorites' ? '#FFFFFF' : subTextColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabIconButton,
            activeTab === 'hosting' && styles.activeTabIconButton,
          ]}
          onPress={() => setActiveTab('hosting')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: activeTab === 'hosting' }}
          accessibilityLabel={`ฉันเป็นผู้จัด (${hostedEvents.length} รายการ)`}
        >
          <Ionicons
            name={activeTab === 'hosting' ? 'ribbon' : 'ribbon-outline'}
            size={22}
            color={activeTab === 'hosting' ? '#FFFFFF' : subTextColor}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  floatingTabContainer: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 28,
    borderCurve: 'continuous',
    borderWidth: 1,
    padding: 4,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(25px)',
        WebkitBackdropFilter: 'blur(25px)',
      },
    }),
  },
  tabIconButton: {
    width: 48,
    height: 40,
    borderRadius: 20,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabIconButton: {
    backgroundColor: '#EE1515',
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
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
    paddingBottom: 180,
  },
  cardItemWrap: {
    marginBottom: 6,
  },
  gridCol: {
    flex: 1,
    marginHorizontal: 6,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
});
