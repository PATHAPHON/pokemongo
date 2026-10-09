import { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_POKEMON_REGISTRY_LIST } from '@/shared/constants/pokemon-registry-data';
import {
  capitalizePokemonName,
  getRarityLabel,
} from '@/shared/constants/kanto-pokemon';

export interface PokemonPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (pokemonId: number) => void;
  selectedId: number;
  caughtPokemonIds: Set<number>;
  isDark?: boolean;
}

type FilterTab = 'all' | 'caught';

export function PokemonPickerModal({
  visible,
  onClose,
  onSelect,
  selectedId,
  caughtPokemonIds,
}: PokemonPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('all');

  const bgColor = '#F8FAFC';
  const cardBg = '#FFFFFF';
  const textColor = '#11181C';
  const subTextColor = '#687076';
  const borderColor = '#E5E7EB';
  const inputBg = '#F3F4F6';

  const gen1List = useMemo(() => {
    return DEFAULT_POKEMON_REGISTRY_LIST.filter(
      (p) => p.id >= 1 && p.id <= 151
    );
  }, []);

  const caughtCount = useMemo(() => {
    let count = 0;
    for (const item of gen1List) {
      if (caughtPokemonIds.has(item.id)) {
        count++;
      }
    }
    return count;
  }, [gen1List, caughtPokemonIds]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^#/, '');
    return gen1List.filter((item) => {
      if (filterTab === 'caught' && !caughtPokemonIds.has(item.id)) {
        return false;
      }
      if (q.length > 0) {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesId =
          String(item.id).includes(q) ||
          String(item.id).padStart(3, '0').includes(q);
        const matchesType = item.types.some((t) =>
          t.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesId && !matchesType) {
          return false;
        }
      }
      return true;
    });
  }, [gen1List, filterTab, searchQuery, caughtPokemonIds]);

  const handleSelect = (id: number) => {
    onSelect(id);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="book-outline" size={20} color="#EF4444" />
              <Text style={[styles.headerTitle, { color: textColor }]}>
                เลือกโปเกมอนจาก Pokédex (151 ตัว)
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="ปิดหน้าต่างเลือกโปเกมอน"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          {/* Search Box */}
          <View style={styles.searchContainer}>
            <View
              style={[
                styles.searchBox,
                { backgroundColor: inputBg, borderColor },
              ]}
            >
              <Ionicons name="search" size={18} color={subTextColor} />
              <TextInput
                style={[styles.searchInput, { color: textColor }]}
                placeholder="ค้นหาชื่อ, หมายเลข เช่น Pikachu, 25..."
                placeholderTextColor={subTextColor}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="ล้างคำค้นหา"
                >
                  <Ionicons name="close-circle" size={16} color={subTextColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabsRow}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                filterTab === 'all'
                  ? styles.tabButtonActive
                  : { backgroundColor: cardBg, borderColor },
              ]}
              onPress={() => setFilterTab('all')}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityState={{ selected: filterTab === 'all' }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  filterTab === 'all'
                    ? styles.tabButtonTextActive
                    : { color: textColor },
                ]}
              >
                ทั้งหมด (151)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton,
                filterTab === 'caught'
                  ? styles.tabButtonActive
                  : { backgroundColor: cardBg, borderColor },
              ]}
              onPress={() => setFilterTab('caught')}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              accessibilityRole="button"
              accessibilityState={{ selected: filterTab === 'caught' }}
            >
              <Text
                style={[
                  styles.tabButtonText,
                  filterTab === 'caught'
                    ? styles.tabButtonTextActive
                    : { color: textColor },
                ]}
              >
                เฉพาะที่เคยจับได้ ({caughtCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Text-Based Pokemon List */}
          <FlatList
            data={filteredList}
            keyExtractor={(item) => `pkmn-pick-${item.id}`}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            maxToRenderPerBatch={25}
            renderItem={({ item }) => {
              const isSelected = selectedId === item.id;
              const isCaught = caughtPokemonIds.has(item.id);
              const formattedId = `#${String(item.id).padStart(3, '0')}`;

              return (
                <TouchableOpacity
                  style={[
                    styles.pokemonRow,
                    {
                      backgroundColor: cardBg,
                      borderColor: isSelected ? '#3B82F6' : borderColor,
                    },
                    isSelected && styles.selectedRowBorder,
                  ]}
                  onPress={() => handleSelect(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.rowMain}>
                    <Text style={[styles.pokemonId, { color: subTextColor }]}>
                      {formattedId}
                    </Text>
                    <Text style={[styles.pokemonName, { color: textColor }]}>
                      {capitalizePokemonName(item.name)}
                    </Text>
                    <Text style={[styles.pokemonTypes, { color: subTextColor }]}>
                      {item.types.join(' • ')}
                    </Text>
                  </View>

                  <View style={styles.rowRight}>
                    <View style={styles.badgeRow}>
                      <Text
                        style={[
                          styles.rarityText,
                          item.rarity === 'ultra_rare'
                            ? styles.ultraRareColor
                            : item.rarity === 'rare'
                            ? styles.rareColor
                            : { color: subTextColor },
                        ]}
                      >
                        {getRarityLabel(item.rarity)}
                      </Text>
                      {isCaught && (
                        <Text style={styles.caughtBadge}>✓ จับแล้ว</Text>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#3B82F6"
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="search-outline"
                  size={36}
                  color={subTextColor}
                />
                <Text style={[styles.emptyText, { color: textColor }]}>
                  ไม่พบโปเกมอนที่ตรงกับการค้นหา
                </Text>
              </View>
            }
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  filterTabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  tabButton: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: '#EE1515',
    borderColor: '#EE1515',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 8,
  },
  pokemonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  selectedRowBorder: {
    borderWidth: 1.5,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  rowMain: {
    flex: 1,
    gap: 2,
  },
  pokemonId: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pokemonName: {
    fontSize: 15,
    fontWeight: '700',
  },
  pokemonTypes: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rareColor: {
    color: '#F59E0B',
  },
  ultraRareColor: {
    color: '#8B5CF6',
  },
  caughtBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  checkIcon: {
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
