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
import {
  usePokedex,
  PokedexCard,
  PokedexFilterBar,
  PokedexEntry,
} from '@/features/pokedex';

export default function PokedexScreen() {
  const router = useRouter();

  const screenBg = '#F8FAFC';
  const textColor = '#11181C';
  const subTextColor = '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 6 : width >= 480 ? 4 : 3;

  const insets = useSafeAreaInsets();
  const floatingTabBottom =
    (insets.bottom > 0 ? insets.bottom + 12 : 24) + 60 + 12;

  const {
    entries,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  } = usePokedex();

  const handleCardPress = (entry: PokedexEntry) => {
    router.push(`/pokemon/${entry.id}` as any);
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
      {/* Search */}
      <PokedexFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isDark={false}
      />

      {/* Grid Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#EE1515" />
            <Text style={[styles.loadingText, { color: subTextColor }]}>
              กำลังโหลดข้อมูลสมุดภาพ Pokédex...
            </Text>
          </View>
        ) : (
          <FlatList
            key={`pokedex-grid-${numColumns}`}
            data={entries}
            keyExtractor={(item) => `pokedex-${item.id}`}
            numColumns={numColumns}
            renderItem={({ item }) => (
              <PokedexCard
                entry={item}
                numColumns={numColumns}
                onPress={handleCardPress}
              />
            )}
            contentContainerStyle={
              entries.length === 0
                ? styles.emptyListContainer
                : styles.gridContent
            }
            showsVerticalScrollIndicator={false}
            initialNumToRender={15}
            maxToRenderPerBatch={18}
            windowSize={7}
            removeClippedSubviews={true}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={48}
                  color={subTextColor}
                />
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  ไม่พบโปเกมอนที่ตรงกับเงื่อนไข
                </Text>
                <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
                  ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะเป็น &quot;ทั้งหมด&quot;
                </Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={handleResetFilters}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetButtonText}>ล้างตัวกรองทั้งหมด</Text>
                </TouchableOpacity>
              </View>
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
            statusFilter === 'all' && styles.activeTabIconButton,
          ]}
          onPress={() => setStatusFilter('all')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: statusFilter === 'all' }}
          accessibilityLabel={`ทั้งหมด (${stats.total} ตัว)`}
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
            statusFilter === 'caught' && styles.activeTabIconButton,
          ]}
          onPress={() => setStatusFilter('caught')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: statusFilter === 'caught' }}
          accessibilityLabel={`จับแล้ว (${stats.caught} ตัว)`}
        >
          <Ionicons
            name={
              statusFilter === 'caught'
                ? 'checkmark-circle'
                : 'checkmark-circle-outline'
            }
            size={22}
            color={statusFilter === 'caught' ? '#FFFFFF' : subTextColor}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabIconButton,
            statusFilter === 'uncaught' && styles.activeTabIconButton,
          ]}
          onPress={() => setStatusFilter('uncaught')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityState={{ selected: statusFilter === 'uncaught' }}
          accessibilityLabel={`ยังไม่จับ (${stats.uncaught} ตัว)`}
        >
          <Ionicons
            name={
              statusFilter === 'uncaught'
                ? 'help-circle'
                : 'help-circle-outline'
            }
            size={22}
            color={statusFilter === 'uncaught' ? '#FFFFFF' : subTextColor}
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
  gridContent: {
    paddingHorizontal: 6,
    paddingBottom: 180,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
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
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
});
