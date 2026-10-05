import { useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useEventContext } from '@/shared/context/event-context';
import { useTrainer } from '@/shared/context/trainer-context';
import { getArtworkUrl, capitalizePokemonName } from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import { EventImagePicker } from '@/features/events';
import { Routes } from '@/shared/utils/routes';
import { consumePendingPick } from '@/shared/utils/pick-location-store';

const FEATURED_POKEMON_OPTIONS = [
  { id: 25, name: 'Pikachu', rarity: 'rare' },
  { id: 150, name: 'Mewtwo', rarity: 'ultra_rare' },
  { id: 6, name: 'Charizard', rarity: 'ultra_rare' },
  { id: 149, name: 'Dragonite', rarity: 'ultra_rare' },
  { id: 94, name: 'Gengar', rarity: 'rare' },
  { id: 133, name: 'Eevee', rarity: 'rare' },
  { id: 143, name: 'Snorlax', rarity: 'rare' },
  { id: 147, name: 'Dratini', rarity: 'rare' },
  { id: 131, name: 'Lapras', rarity: 'rare' },
  { id: 130, name: 'Gyarados', rarity: 'rare' },
];

export default function CreateEventScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const inputBg = isDark ? '#2A2A2A' : '#F1F3F5';
  const borderColor = isDark ? '#3A3A3C' : '#E5E7EB';

  const { createEvent } = useEventContext();
  const { trainer } = useTrainer();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('ลานกิจกรรมกลาง มหาวิทยาลัย');
  const [latitude, setLatitude] = useState('13.7462');
  const [longitude, setLongitude] = useState('100.5347');
  const [capacity, setCapacity] = useState('50');
  const [featuredPokemonId, setFeaturedPokemonId] = useState<number>(25);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Receive map pin back from events/pick-location (one-shot handoff)
  useFocusEffect(
    useCallback(() => {
      const pick = consumePendingPick();
      if (pick) {
        setLatitude(pick.latitude.toFixed(4));
        setLongitude(pick.longitude.toFixed(4));
        setVenueName(pick.venueName);
      }
    }, [])
  );

  const handleOpenMapPicker = () => {
    router.push(Routes.eventPickLocation(latitude, longitude) as any);
  };

  const handleUseCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'ต้องการสิทธิ์ GPS',
          'กรุณาอนุญาตสิทธิ์เข้าถึงพิกัดเพื่อดึงตำแหน่งจัดงานปัจจุบัน'
        );
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLatitude(loc.coords.latitude.toFixed(4));
      setLongitude(loc.coords.longitude.toFixed(4));
      setVenueName('พิกัดปัจจุบันของฉัน (GPS)');

      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถระบุพิกัดได้');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('กรุณาระบุชื่อมีตอัป');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('กรุณาระบุรายละเอียดมีตอัป');
      return;
    }
    if (!venueName.trim()) {
      setErrorMessage('กรุณาระบุชื่อสถานที่จัดงาน');
      return;
    }

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      setErrorMessage('พิกัดละติจูดและลองจิจูดต้องเป็นตัวเลข');
      return;
    }

    const capNum = parseInt(capacity, 10);
    const validCapacity = !isNaN(capNum) && capNum > 0 ? capNum : 50;

    if (!featuredPokemonId || featuredPokemonId <= 0) {
      setErrorMessage('กรุณาเลือกโปเกมอนประจำมีตอัป');
      return;
    }

    try {
      setIsSubmitting(true);

      const now = new Date();
      // Starts in 1 hour by default, ends in 4 hours
      const startsAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
      const endsAt = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();

      const res = await createEvent({
        title: title.trim(),
        description: description.trim(),
        startsAt,
        endsAt,
        imageUrl: photoUri || 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800',
        location: {
          name: venueName.trim(),
          latitude: latNum,
          longitude: lngNum,
        },
        capacity: validCapacity,
        organizer: trainer?.name ? `คุณ ${trainer.name}` : 'เทรนเนอร์นิสิต',
        organizerId: trainer?.id,
        featuredPokemonId,
      });

      if (res.success && res.event) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch {}

        Alert.alert(
          'สร้างมีตอัปสำเร็จ 🎉',
          `มีตอัป "${res.event.title}" ถูกบันทึกและปักหมุดบนแผนที่เรียบร้อยแล้ว`,
          [
            {
              text: 'ดูรายละเอียดมีตอัป',
              onPress: () => {
                router.replace(`/events/${res.event!.id}` as any);
              },
            },
          ]
        );
      } else {
        setErrorMessage(res.error || 'เกิดข้อผิดพลาดในการสร้างมีตอัป');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'ไม่สามารถสร้างมีตอัปได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPokemon =
    getPokemonMetaById(featuredPokemonId) ||
    FEATURED_POKEMON_OPTIONS.find((p) => p.id === featuredPokemonId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: screenBg }]}>
      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => router.back()}
          disabled={isSubmitting}
          accessibilityLabel="ปิดหน้าสร้างมีตอัป"
        >
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          สร้าง Pokémon Meetup ใหม่
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Organizer Info Header */}
          <View style={[styles.organizerCard, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.organizerIconCircle}>
              <Ionicons name="sparkles" size={20} color="#EE1515" />
            </View>
            <View style={styles.organizerInfo}>
              <Text style={[styles.organizerName, { color: textColor }]}>
                ผู้จัดมีตอัป: {trainer?.name || 'เทรนเนอร์นิสิต'}
              </Text>
              <Text style={[styles.organizerSub, { color: subTextColor }]}>
                มีตอัปที่สร้างจะถูกปักหมุดบนแผนที่และเปิดให้ผู้อื่นลงทะเบียน
              </Text>
            </View>
          </View>

          {/* Form Card: Basic Info */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <Text style={[styles.sectionHeading, { color: textColor }]}>
              ข้อมูลมีตอัป
            </Text>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                ชื่อมีตอัป *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="เช่น Mega Rayquaza Raid Day, ล่าไชนี่ริมหนองประจักษ์"
                placeholderTextColor={subTextColor}
                value={title}
                onChangeText={setTitle}
                editable={!isSubmitting}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                รายละเอียดมีตอัป *
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="อธิบายรายละเอียดมีตอัป กฎกติกา สิ่งที่ต้องเตรียมมา หรือของรางวัล..."
                placeholderTextColor={subTextColor}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                editable={!isSubmitting}
              />
            </View>

            {/* Capacity */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                จำนวนที่เปิดรับสมัคร (คน)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="เช่น 50"
                placeholderTextColor={subTextColor}
                keyboardType="numeric"
                value={capacity}
                onChangeText={setCapacity}
                editable={!isSubmitting}
              />
            </View>
          </View>

          {/* Form Card: Featured Pokémon */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="flash" size={18} color="#FFCB05" />
              <Text style={[styles.sectionHeading, { color: textColor }]}>
                โปเกมอนพิเศษประจำกิจกรรม (Featured Pokémon)
              </Text>
            </View>
            <Text style={[styles.sectionHint, { color: subTextColor }]}>
              ผู้เข้าร่วมกิจกรรมจะสามารถพบและจับโปเกมอนตัวนี้ได้ในบริเวณงาน!
            </Text>

            {/* Selected Pokémon Highlight */}
            {selectedPokemon && (
              <View style={styles.selectedPokemonBox}>
                <Image
                  source={{ uri: getArtworkUrl(featuredPokemonId) }}
                  style={styles.selectedPokemonImg}
                  resizeMode="contain"
                />
                <View style={styles.selectedPokemonInfo}>
                  <Text style={[styles.selectedPokemonName, { color: textColor }]}>
                    #{featuredPokemonId} {capitalizePokemonName(selectedPokemon.name)}
                  </Text>
                  <Text style={[styles.selectedPokemonMeta, { color: subTextColor }]}>
                    ระดับความหายาก: {selectedPokemon.rarity === 'ultra_rare' ? 'Ultra Rare 🌌' : 'Rare ⚡'}
                  </Text>
                </View>
              </View>
            )}

            {/* Horizontal Pokémon Selection Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pokemonChipsScroll}
            >
              {FEATURED_POKEMON_OPTIONS.map((pkmn) => {
                const isSelected = featuredPokemonId === pkmn.id;
                return (
                  <TouchableOpacity
                    key={pkmn.id}
                    style={[
                      styles.pokemonChip,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? '#3B82F6'
                            : '#EFF6FF'
                          : inputBg,
                        borderColor: isSelected ? '#3B82F6' : borderColor,
                      },
                    ]}
                    onPress={() => setFeaturedPokemonId(pkmn.id)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: getArtworkUrl(pkmn.id) }}
                      style={styles.chipPokemonImg}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.chipPokemonName,
                        { color: isSelected ? '#3B82F6' : textColor },
                      ]}
                    >
                      {pkmn.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Form Card: Location */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="location" size={18} color="#EF4444" />
              <Text style={[styles.sectionHeading, { color: textColor }]}>
                สถานที่จัดงานและพิกัดแผนที่
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                ชื่อสถานที่จัดงาน *
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, color: textColor, borderColor },
                ]}
                placeholder="เช่น สนามฟุตบอลกลาง, อาคารวิศวะ 4, ลานโพธิ์"
                placeholderTextColor={subTextColor}
                value={venueName}
                onChangeText={setVenueName}
                editable={!isSubmitting}
              />
            </View>

            {/* Picked Location Preview */}
            <View
              style={[
                styles.pickPreview,
                { backgroundColor: inputBg, borderColor },
              ]}
            >
              <Ionicons name="location-sharp" size={18} color="#EF4444" />
              <View style={styles.pickPreviewInfo}>
                <Text style={[styles.pickPreviewName, { color: textColor }]} numberOfLines={1}>
                  {venueName.trim() || 'ยังไม่ได้ระบุชื่อสถานที่'}
                </Text>
                <Text style={[styles.pickPreviewCoords, { color: subTextColor }]}>
                  {latitude || '–'}, {longitude || '–'}
                </Text>
              </View>
            </View>

            {/* Open Full-screen Map Picker */}
            <TouchableOpacity
              style={styles.mapButton}
              onPress={handleOpenMapPicker}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              <Ionicons name="map-outline" size={18} color="#FFFFFF" />
              <Text style={styles.mapButtonText}>
                เลือกบนแผนที่ (แตะปักหมุดจุดจัดงาน)
              </Text>
            </TouchableOpacity>

            {/* GPS Fetch Button */}
            <TouchableOpacity
              style={styles.gpsButton}
              onPress={handleUseCurrentLocation}
              disabled={isGettingLocation || isSubmitting}
              activeOpacity={0.8}
            >
              {isGettingLocation ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="navigate-circle-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.gpsButtonText}>
                    ดึงพิกัด GPS ปัจจุบันของฉันมาใช้
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.coordRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: subTextColor }]}>
                  Latitude
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, color: textColor, borderColor },
                  ]}
                  value={latitude}
                  onChangeText={setLatitude}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: subTextColor }]}>
                  Longitude
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, color: textColor, borderColor },
                  ]}
                  value={longitude}
                  onChangeText={setLongitude}
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
              </View>
            </View>
          </View>

          {/* Form Card: Image Banner */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <EventImagePicker
              photoUri={photoUri}
              onPhotoSelected={setPhotoUri}
              isDark={isDark}
            />
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                สร้างมีตอัปและปักหมุดบนแผนที่ 🚀
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  organizerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  organizerInfo: {
    flex: 1,
    gap: 2,
  },
  organizerName: {
    fontSize: 14,
    fontWeight: '800',
  },
  organizerSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: -4,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 14,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 76,
    textAlignVertical: 'top',
  },
  selectedPokemonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 203, 5, 0.15)',
    borderWidth: 1,
    borderColor: '#FFCB05',
    gap: 12,
  },
  selectedPokemonImg: {
    width: 60,
    height: 60,
  },
  selectedPokemonInfo: {
    flex: 1,
    gap: 2,
  },
  selectedPokemonName: {
    fontSize: 16,
    fontWeight: '800',
  },
  selectedPokemonMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  pokemonChipsScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  pokemonChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  chipPokemonImg: {
    width: 28,
    height: 28,
  },
  chipPokemonName: {
    fontSize: 12,
    fontWeight: '700',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    height: 42,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  gpsButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  coordRow: {
    flexDirection: 'row',
    gap: 10,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#8B5CF6',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  pickPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  pickPreviewInfo: {
    flex: 1,
    gap: 2,
  },
  pickPreviewName: {
    fontSize: 13,
    fontWeight: '700',
  },
  pickPreviewCoords: {
    fontSize: 12,
    fontWeight: '500',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    height: 46,
    borderRadius: 12,
    gap: 6,
    marginTop: 4,
  },
  mapButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
