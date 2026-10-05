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
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import {
  usePokedex,
  PokedexCard,
  PokedexFilterBar,
  PokedexEntry,
} from '@/features/pokedex';

export default function PokedexScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  const { width } = useWindowDimensions();
  const numColumns = width >= 768 ? 6 : width >= 480 ? 4 : 3;

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Pokédex
        </Text>
      </View>

      {/* Search & Filters */}
      <PokedexFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        isDark={isDark}
      />

      {/* Grid Content */}
      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#EF4444" />
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
                isDark={isDark}
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
                  ลองเปลี่ยนคำค้นหา หรือเลือกตัวกรองสถานะเป็น "ทั้งหมด"
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
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
    paddingBottom: 24,
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
});
