import {
  View,
  Text,
  FlatList,
  useWindowDimensions,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import {
  useEvents,
  EventCard,
  EventFilterBar,
  EventStatsHeader,
  EventEmptyState,
} from '@/features/events';
import { CampusEvent } from '@/shared/types';

export default function EventsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 2 : 1;

  const {
    events,
    stats,
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
        stats={stats}
        isOffline={isOffline}
        lastUpdated={lastUpdated}
        isDark={isDark}
      />

      {/* Search Input and Status Tabs */}
      <EventFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        isDark={isDark}
      />

      {/* Main Events List */}
      <View style={styles.content}>
        {isLoading && events.length === 0 ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
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
                  isDark={isDark}
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
                tintColor="#8B5CF6"
                colors={['#8B5CF6']}
              />
            }
            ListEmptyComponent={
              <EventEmptyState
                title="ไม่พบมีตอัปที่ตรงกับเงื่อนไข"
                subtitle="ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหามีตอัปทั้งหมด"
                buttonText="ล้างตัวกรองทั้งหมด"
                onAction={handleResetFilters}
                isDark={isDark}
              />
            }
          />
        )}
      </View>

      {/* Floating Action Button for Organizers */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/events/create' as any)}
        accessibilityRole="button"
        accessibilityLabel="สร้างมีตอัปใหม่"
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>➕</Text>
        <Text style={styles.fabText}>สร้างมีตอัป</Text>
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
    paddingBottom: 28,
  },
  gridCol: {
    flex: 1,
    marginHorizontal: 6,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    gap: 6,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
