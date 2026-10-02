import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PokedexEntry } from '../types';
import { TypeBadge } from '@/shared/components/type-badge';
import { PokemonTypeColors } from '@/shared/constants/pokemon-theme';
import {
  capitalizePokemonName,
  formatPokemonId,
  getArtworkUrl,
} from '@/shared/constants/kanto-pokemon';

interface PokedexCardProps {
  entry: PokedexEntry;
  numColumns?: number;
  isDark?: boolean;
  onPress: (entry: PokedexEntry) => void;
}

export function PokedexCard({
  entry,
  numColumns = 3,
  isDark = false,
  onPress,
}: PokedexCardProps) {
  const isCaught = entry.isCaught;
  const primaryType = entry.types[0] || 'normal';
  const typeColor = PokemonTypeColors[primaryType] || PokemonTypeColors.normal;

  const cardBg = isCaught
    ? isDark
      ? '#1E1E1E'
      : '#FFFFFF'
    : isDark
      ? '#181A1D'
      : '#ECEFF1';

  const textColor = isCaught
    ? isDark
      ? '#ECEDEE'
      : '#11181C'
    : isDark
      ? '#64748B'
      : '#94A3B8';

  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isCaught
    ? `${typeColor.primary}50`
    : isDark
      ? '#2D3748'
      : '#E2E8F0';

  const displayName = isCaught ? capitalizePokemonName(entry.name) : '???';

  const artworkUrl = getArtworkUrl(entry.id);

  const handleCardPress = () => {
    if (isCaught) {
      onPress(entry);
    } else {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {
        // Haptics fallback
      }
      Alert.alert(
        `${formatPokemonId(entry.id)} - ไม่พบข้อมูล`,
        'คุณยังไม่เคยจับโปเกมอนตัวนี้ในสมุดภาพ ออกเดินทางเพื่อค้นหาและจับโปเกมอนในแผนที่!',
        [{ text: 'ตกลง', style: 'default' }]
      );
    }
  };

  return (
    <View style={{ width: `${100 / numColumns}%`, padding: 5 }}>
      <TouchableOpacity
        activeOpacity={isCaught ? 0.8 : 0.6}
        onPress={handleCardPress}
        style={[
          styles.cardContainer,
          {
            backgroundColor: cardBg,
            borderColor,
            borderStyle: isCaught ? 'solid' : 'dashed',
            shadowOpacity: isDark
              ? isCaught
                ? 0.3
                : 0.1
              : isCaught
                ? 0.08
                : 0.02,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          isCaught
            ? `${displayName}, ${formatPokemonId(entry.id)}, caught`
            : `Uncaught Pokémon, ${formatPokemonId(entry.id)}`
        }
      >
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <Text
            style={[
              styles.idText,
              { color: isCaught ? subTextColor : '#94A3B8' },
            ]}
          >
            {formatPokemonId(entry.id)}
          </Text>
          {isCaught ? (
            <View style={styles.caughtBadge}>
              <Ionicons name="radio-button-on" size={12} color="#EF4444" />
              {entry.caughtCount > 1 && (
                <Text style={styles.caughtCountText}>x{entry.caughtCount}</Text>
              )}
            </View>
          ) : (
            <Ionicons name="lock-closed-outline" size={12} color="#94A3B8" />
          )}
        </View>

        {/* Artwork Image Container */}
        <View style={styles.artworkContainer}>
          <Image
            source={{ uri: artworkUrl }}
            style={[
              styles.artworkImage,
              !isCaught && {
                tintColor: isDark ? '#2D3748' : '#94A3B8',
                opacity: isDark ? 0.7 : 0.85,
              },
            ]}
            contentFit="contain"
            transition={150}
          />
        </View>

        {/* Name and Details */}
        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.nameText,
              { color: textColor, fontWeight: isCaught ? '800' : '600' },
            ]}
            numberOfLines={1}
          >
            {displayName}
          </Text>

          {/* Type Badges or Unknown placeholder */}
          <View style={styles.typesRow}>
            {isCaught ? (
              entry.types.slice(0, 2).map((t) => <TypeBadge key={t} type={t} />)
            ) : (
              <View
                style={[
                  styles.unknownBadge,
                  { backgroundColor: isDark ? '#262626' : '#E2E8F0' },
                ]}
              >
                <Text
                  style={[
                    styles.unknownText,
                    { color: isDark ? '#737373' : '#94A3B8' },
                  ]}
                >
                  ???
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
  },
  topRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idText: {
    fontSize: 10,
    fontWeight: '700',
  },
  caughtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 8,
  },
  caughtCountText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EF4444',
  },
  artworkContainer: {
    width: '100%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  artworkImage: {
    width: 64,
    height: 64,
  },
  infoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameText: {
    fontSize: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 3,
    minHeight: 18,
  },
  unknownBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  unknownText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
