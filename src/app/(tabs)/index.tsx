import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useEvents,
  EventCard,
  EventFilterBar,
  EventStatsHeader,
  EventEmptyState,
} from '@/features/events';
import { CampusEvent } from '@/shared/types';
import { useTrainer } from '@/shared/context/trainer-context';
import { isEventOrganizer } from '@/shared/utils/event-helpers';

export default function EventsScreen() {
  const router = useRouter();

  const screenBg = '#F8FAFC';
  const subTextColor = '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;

  const insets = useSafeAreaInsets();
  const fabBottom = (insets.bottom > 0 ? insets.bottom + 12 : 24) + 60 + 14;
  const floatingTabBottom =
    (insets.bottom > 0 ? insets.bottom + 12 : 24) + 60 + 12;

  const { trainer } = useTrainer();
  const {
    events,
    isLoading,
    isOffline,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    registeredEventIds,
    favoritesSet,
    refreshEvents,
    toggleFavorite,
  } = useEvents();

  const handleCardPress = (event: CampusEvent) => {
    router.push(`/events/${event.id}` as any);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: screenBg }]}
      edges={['top']}
    >
      {/* Overview Stats & Offline Banner Header */}
      <EventStatsHeader
        isOffline={isOffline}
        lastUpdated={lastUpdated}
      />

      {/* Search Input and Status Tabs */}
      <EventFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        isDark={false}
      />

      {/* Main Events List */}
      <View style={styles.content}>
        {isLoading && events.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#EE1515" />
            <Text style={[styles.loadingText, { color: subTextColor }]}>
              กำลังโหลดมีตอัปโปเกมอน...
            </Text>
          </View>
        ) : (
          <FlatList
            key={`events-list-${numColumns}`}
            data={events}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <View style={numColumns > 1 ? styles.gridCol : undefined}>
                <EventCard
                  event={item}
                  isFavorite={favoritesSet.has(item.id)}
                  isRegistered={registeredEventIds.has(item.id)}
                  isOrganizer={isEventOrganizer(item, trainer)}
                  isDark={false}
                  onPress={() => handleCardPress(item)}
                  onToggleFavorite={() => toggleFavorite(item.id)}
                />
              </View>
            )}
            contentContainerStyle={
              events.length === 0
                ? styles.emptyListContainer
                : styles.listContent
            }
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            refreshControl={
              <RefreshControl
                refreshing={isLoading}
                onRefresh={refreshEvents}
                tintColor="#EE1515"
                colors={['#EE1515']}
              />
            }
            ListEmptyComponent={
              <EventEmptyState
                title="ไม่พบมีตอัปที่ตรงกับเงื่อนไข"
                subtitle="ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหามีตอัปทั้งหมด"
                buttonText="ล้างตัวกรองทั้งหมด"
                onAction={handleResetFilters}
                isDark={false}
              />
            }
          />
        )}
      </View>

      {/* Floating 2-Icon Switcher above TabBar */}
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
            statusFilter === 'all' && styles.activeTabIconButton,
          ]}
          onPress={() => setStatusFilter('all')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: statusFilter === 'all' }}
          accessibilityLabel="มีตอัปทั้งหมด"
        >
          <Ionicons
            name={statusFilter === 'all' ? 'apps' : 'apps-outline'}
            size={22}
            color={statusFilter === 'all' ? '#FFFFFF' : subTextColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabIconButton,
            statusFilter === 'favorites' && styles.activeTabIconButton,
          ]}
          onPress={() => setStatusFilter('favorites')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: statusFilter === 'favorites' }}
          accessibilityLabel="รายการโปรด"
        >
          <Ionicons
            name={statusFilter === 'favorites' ? 'heart' : 'heart-outline'}
            size={22}
            color={statusFilter === 'favorites' ? '#FFFFFF' : subTextColor}
          />
        </TouchableOpacity>
      </View>

      {/* Floating Action Button for Organizers */}
      <TouchableOpacity
        style={[styles.fab, { bottom: fabBottom }]}
        onPress={() => router.push('/events/create' as any)}
        accessibilityRole="button"
        accessibilityLabel="สร้างมีตอัปใหม่"
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  gridCol: {
    flex: 1,
    marginHorizontal: 6,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
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
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EE1515',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
});
