import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTrainer } from '@/context/trainer-context';
import { CaughtPokemon } from '@/types';
import { TypeBadge } from '@/components/pokemon/type-badge';
import { NicknameModal } from '@/components/pokemon/nickname-modal';
import { PokemonTypeColors } from '@/constants/pokemon-theme';
import { capitalizePokemonName, formatPokemonId } from '@/constants/kanto-pokemon';

type SortOption = 'CP' | 'RECENT' | 'NAME' | 'FAVORITE';

export default function BagScreen() {
  const router = useRouter();
  const { caughtPokemon, inventory, toggleFavorite, releasePokemon, renamePokemon } =
    useTrainer();

  const [activeTab, setActiveTab] = useState<'pokemon' | 'items'>('pokemon');
  const [sortBy, setSortBy] = useState<SortOption>('CP');
  const [selectedPokemonForRename, setSelectedPokemonForRename] =
    useState<CaughtPokemon | null>(null);

  // Sorted caught Pokemon
  const sortedPokemon = useMemo(() => {
    const list = [...caughtPokemon];
    switch (sortBy) {
      case 'CP':
        return list.sort((a, b) => b.cp - a.cp);
      case 'RECENT':
        return list.sort(
          (a, b) => new Date(b.caughtAt).getTime() - new Date(a.caughtAt).getTime()
        );
      case 'NAME':
        return list.sort((a, b) =>
          (a.nickname || a.name).localeCompare(b.nickname || b.name)
        );
      case 'FAVORITE':
        return list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
      default:
        return list;
    }
  }, [caughtPokemon, sortBy]);

  const handleRelease = (pokemon: CaughtPokemon) => {
    const displayName = pokemon.nickname || capitalizePokemonName(pokemon.name);

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to release ${displayName}?`)) {
        releasePokemon(pokemon.instanceId);
      }
    } else {
      Alert.alert(
        'Release Pokémon',
        `Are you sure you want to release ${displayName}? You will receive 1 Candy.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Release',
            style: 'destructive',
            onPress: () => releasePokemon(pokemon.instanceId),
          },
        ]
      );
    }
  };

  const renderPokemonCard = ({ item }: { item: CaughtPokemon }) => {
    const primaryType = item.types[0] || 'normal';
    const typeColor = PokemonTypeColors[primaryType] || PokemonTypeColors.normal;

    return (
      <View style={[styles.card, { borderColor: `${typeColor.primary}40` }]}>
        {/* Top Card Bar: CP & Favorite */}
        <View style={styles.cardHeader}>
          <View style={styles.cpBadge}>
            <Text style={styles.cpText}>CP {item.cp}</Text>
          </View>

          <TouchableOpacity
            style={styles.favButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => toggleFavorite(item.instanceId)}
          >
            <Ionicons
              name={item.favorite ? 'star' : 'star-outline'}
              size={18}
              color={item.favorite ? '#F7D02C' : '#9BA1A6'}
            />
          </TouchableOpacity>
        </View>

        {/* Artwork Image */}
        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: item.artwork }}
            style={styles.pokemonImg}
            contentFit="contain"
            transition={200}
          />
        </View>

        {/* Pokemon Info */}
        <View style={styles.cardBody}>
          <Text style={styles.idNumber}>{formatPokemonId(item.pokemonId)}</Text>
          <TouchableOpacity
            onPress={() => setSelectedPokemonForRename(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.pokemonName} numberOfLines={1}>
              {item.nickname || capitalizePokemonName(item.name)}
            </Text>
          </TouchableOpacity>

          {/* Types Row */}
          <View style={styles.typesRow}>
            {item.types.map((t) => (
              <TypeBadge key={t} type={t} size="sm" />
            ))}
          </View>
        </View>

        {/* Card Footer: Action button */}
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.releaseBtn}
            onPress={() => handleRelease(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={14} color="#FF3B30" />
            <Text style={styles.releaseText}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bag & Storage</Text>

        {/* Segmented Control */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'pokemon' && styles.segmentBtnActive,
            ]}
            onPress={() => setActiveTab('pokemon')}
          >
            <Ionicons
              name="paw"
              size={15}
              color={activeTab === 'pokemon' ? '#FFFFFF' : '#687076'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'pokemon' && styles.segmentTextActive,
              ]}
            >
              Pokémon ({caughtPokemon.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === 'items' && styles.segmentBtnActive,
            ]}
            onPress={() => setActiveTab('items')}
          >
            <Ionicons
              name="cube"
              size={15}
              color={activeTab === 'items' ? '#FFFFFF' : '#687076'}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'items' && styles.segmentTextActive,
              ]}
            >
              Items
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {activeTab === 'pokemon' ? (
        <View style={styles.tabContent}>
          {/* Sorting Bar */}
          <View style={styles.sortingBar}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            {(['CP', 'RECENT', 'NAME', 'FAVORITE'] as SortOption[]).map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[
                  styles.sortPill,
                  sortBy === opt && styles.sortPillActive,
                ]}
                onPress={() => setSortBy(opt)}
              >
                <Text
                  style={[
                    styles.sortPillText,
                    sortBy === opt && styles.sortPillTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Caught Pokémon Grid */}
          {sortedPokemon.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="disc-outline" size={64} color="#687076" />
              <Text style={styles.emptyTitle}>No Pokémon Caught Yet</Text>
              <Text style={styles.emptySubtitle}>
                Go to the Map Radar to encounter and catch wild Pokémon!
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => router.push('/(tabs)')}
              >
                <Ionicons name="map" size={16} color="#FFFFFF" />
                <Text style={styles.exploreBtnText}>Go to Radar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={sortedPokemon}
              keyExtractor={(item) => item.instanceId}
              renderItem={renderPokemonCard}
              numColumns={2}
              columnWrapperStyle={styles.rowWrapper}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      ) : (
        /* Items Tab View */
        <View style={styles.itemsContainer}>
          <View style={styles.itemCategoryBox}>
            <Text style={styles.categoryTitle}>Pokéballs</Text>
            <View style={styles.itemsGrid}>
              <View style={styles.itemCard}>
                <Ionicons name="disc" size={32} color="#FF3B30" />
                <Text style={styles.itemName}>Pokéball</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{inventory.pokeballs}</Text>
                </View>
              </View>

              <View style={styles.itemCard}>
                <Ionicons name="disc" size={32} color="#007AFF" />
                <Text style={styles.itemName}>Great Ball</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{inventory.greatballs}</Text>
                </View>
              </View>

              <View style={styles.itemCard}>
                <Ionicons name="disc" size={32} color="#F7D02C" />
                <Text style={styles.itemName}>Ultra Ball</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{inventory.ultraballs}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.itemCategoryBox}>
            <Text style={styles.categoryTitle}>Berries & Healing</Text>
            <View style={styles.itemsGrid}>
              <View style={styles.itemCard}>
                <Ionicons name="nutrition" size={32} color="#FF2D55" />
                <Text style={styles.itemName}>Razz Berry</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{inventory.razzberries}</Text>
                </View>
              </View>

              <View style={styles.itemCard}>
                <Ionicons name="medkit" size={32} color="#34C759" />
                <Text style={styles.itemName}>Potion</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{inventory.potions}</Text>
                </View>
              </View>

              <View style={styles.itemCard}>
                <Ionicons name="heart" size={32} color="#FF9500" />
                <Text style={styles.itemName}>Revive</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{inventory.revives}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Nickname Rename Modal */}
      {selectedPokemonForRename && (
        <NicknameModal
          visible={!!selectedPokemonForRename}
          pokemonName={selectedPokemonForRename.name}
          currentNickname={selectedPokemonForRename.nickname}
          onSave={async (newNickname) => {
            await renamePokemon(selectedPokemonForRename.instanceId, newNickname);
            setSelectedPokemonForRename(null);
          }}
          onCancel={() => setSelectedPokemonForRename(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#11181C',
    marginBottom: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F6F8',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: '#0A7EA4',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#687076',
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  tabContent: {
    flex: 1,
  },
  sortingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#687076',
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E4E8',
  },
  sortPillActive: {
    backgroundColor: '#11181C',
    borderColor: '#11181C',
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#687076',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cpBadge: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cpText: {
    color: '#0A7EA4',
    fontSize: 11,
    fontWeight: '800',
  },
  favButton: {
    padding: 2,
  },
  imageWrapper: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  pokemonImg: {
    width: 80,
    height: 80,
  },
  cardBody: {
    alignItems: 'center',
  },
  idNumber: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  pokemonName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#11181C',
    marginTop: 2,
    marginBottom: 6,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 4,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F4F6F8',
    marginTop: 8,
    paddingTop: 6,
    alignItems: 'center',
  },
  releaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  releaseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#11181C',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#687076',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A7EA4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    gap: 6,
  },
  exploreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  itemsContainer: {
    padding: 16,
    gap: 16,
  },
  itemCategoryBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#11181C',
    marginBottom: 12,
  },
  itemsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  itemCard: {
    alignItems: 'center',
    width: 80,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#11181C',
    marginTop: 6,
  },
  countBadge: {
    backgroundColor: '#11181C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
