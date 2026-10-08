import { useCallback, useMemo, useState } from 'react';
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
import { EventImagePicker, PokemonPickerModal } from '@/features/events';
import { Routes } from '@/shared/utils/routes';
import { consumePendingPick } from '@/shared/utils/pick-location-store';
import { parseDateTimeInputs } from '@/shared/utils/event-helpers';



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
  const { trainer, caughtPokemon } = useTrainer();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('ลานกิจกรรมกลาง มหาวิทยาลัย');
  const [latitude, setLatitude] = useState('13.7462');
  const [longitude, setLongitude] = useState('100.5347');
  const [capacity, setCapacity] = useState('50');
  const [featuredPokemonId, setFeaturedPokemonId] = useState<number>(25);
  const [isPickerModalVisible, setIsPickerModalVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Date & Time states (TextInputs)
  const initialDate = useMemo(() => new Date(), []);
  const [dayInput, setDayInput] = useState(String(initialDate.getDate()));
  const [monthInput, setMonthInput] = useState(String(initialDate.getMonth() + 1));
  const [yearInput, setYearInput] = useState(String(initialDate.getFullYear()));
  const [startTimeInput, setStartTimeInput] = useState('09:00');
  const [endTimeInput, setEndTimeInput] = useState('12:00');

  const caughtPokemonIds = useMemo(
    () => new Set(caughtPokemon.map((p) => p.pokemonId)),
    [caughtPokemon]
  );

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

    const parsed = parseDateTimeInputs(
      dayInput,
      monthInput,
      yearInput,
      startTimeInput,
      endTimeInput
    );

    if (!parsed.success || !parsed.startsAt || !parsed.endsAt) {
      setErrorMessage(parsed.error || 'กรุณาระบุวันและเวลาจัดกิจกรรมให้ถูกต้อง');
      return;
    }

    try {
      setIsSubmitting(true);

      const startsAt = parsed.startsAt;
      const endsAt = parsed.endsAt;

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

        router.replace('/(tabs)' as any);
      } else {
        setErrorMessage(res.error || 'เกิดข้อผิดพลาดในการสร้างมีตอัป');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'ไม่สามารถสร้างมีตอัปได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPokemon = getPokemonMetaById(featuredPokemonId);

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

          {/* Form Card: Date & Time */}
          <View style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="calendar" size={18} color="#EF4444" />
              <Text style={[styles.sectionHeading, { color: textColor }]}>
                วันและเวลาจัดกิจกรรม
              </Text>
            </View>
            <Text style={[styles.sectionHint, { color: subTextColor }]}>
              ระบุวัน เดือน ปี และเวลาจัดมีตอัป
            </Text>

            {/* Date Inputs: 3 columns (Day / Month / Year) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                วันจัดกิจกรรม (วัน / เดือน / ปี) *
              </Text>
              <View style={styles.dateTripleRow}>
                {/* Day Input */}
                <View style={styles.dateFieldWrapper}>
                  <Text style={[styles.miniFieldLabel, { color: subTextColor }]}>วัน</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.compactInput,
                      { backgroundColor: inputBg, color: textColor, borderColor },
                    ]}
                    placeholder="1-31"
                    placeholderTextColor={subTextColor}
                    keyboardType="numeric"
                    maxLength={2}
                    value={dayInput}
                    onChangeText={setDayInput}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Month Input */}
                <View style={styles.dateFieldWrapper}>
                  <Text style={[styles.miniFieldLabel, { color: subTextColor }]}>เดือน</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.compactInput,
                      { backgroundColor: inputBg, color: textColor, borderColor },
                    ]}
                    placeholder="1-12"
                    placeholderTextColor={subTextColor}
                    keyboardType="numeric"
                    maxLength={2}
                    value={monthInput}
                    onChangeText={setMonthInput}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Year Input */}
                <View style={[styles.dateFieldWrapper, { flex: 1.3 }]}>
                  <Text style={[styles.miniFieldLabel, { color: subTextColor }]}>ปี (ค.ศ./พ.ศ.)</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.compactInput,
                      { backgroundColor: inputBg, color: textColor, borderColor },
                    ]}
                    placeholder="2026"
                    placeholderTextColor={subTextColor}
                    keyboardType="numeric"
                    maxLength={4}
                    value={yearInput}
                    onChangeText={setYearInput}
                    editable={!isSubmitting}
                  />
                </View>
              </View>
            </View>

            {/* Time Inputs: 2 columns (Start Time / End Time) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: textColor }]}>
                เวลาจัดกิจกรรม (เวลาเริ่ม - สิ้นสุด) *
              </Text>
              <View style={styles.timeDoubleRow}>
                {/* Start Time Input */}
                <View style={styles.timeFieldWrapper}>
                  <Text style={[styles.miniFieldLabel, { color: subTextColor }]}>เวลาเริ่ม</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.compactInput,
                      { backgroundColor: inputBg, color: textColor, borderColor },
                    ]}
                    placeholder="09:00"
                    placeholderTextColor={subTextColor}
                    value={startTimeInput}
                    onChangeText={setStartTimeInput}
                    editable={!isSubmitting}
                  />
                </View>

                {/* Separator */}
                <Text style={[styles.timeDash, { color: subTextColor }]}>–</Text>

                {/* End Time Input */}
                <View style={styles.timeFieldWrapper}>
                  <Text style={[styles.miniFieldLabel, { color: subTextColor }]}>เวลาสิ้นสุด</Text>
                  <TextInput
                    style={[
                      styles.input,
                      styles.compactInput,
                      { backgroundColor: inputBg, color: textColor, borderColor },
                    ]}
                    placeholder="12:00"
                    placeholderTextColor={subTextColor}
                    value={endTimeInput}
                    onChangeText={setEndTimeInput}
                    editable={!isSubmitting}
                  />
                </View>
              </View>
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
              <TouchableOpacity
                style={styles.selectedPokemonBox}
                onPress={() => setIsPickerModalVisible(true)}
                activeOpacity={0.85}
                accessibilityLabel="เปลี่ยนโปเกมอนพิเศษประจำกิจกรรม"
              >
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
                <Ionicons name="swap-horizontal" size={20} color="#FFCB05" />
              </TouchableOpacity>
            )}

            {/* Open Full Pokédex Picker Button */}
            <TouchableOpacity
              style={[
                styles.openPickerButton,
                { backgroundColor: inputBg, borderColor },
              ]}
              onPress={() => setIsPickerModalVisible(true)}
              activeOpacity={0.8}
              accessibilityLabel="เลือกจาก Pokédex ทั้งหมด 151 ตัว"
            >
              <Ionicons name="book-outline" size={18} color="#EF4444" />
              <Text style={[styles.openPickerButtonText, { color: textColor }]}>
                เลือกจาก Pokédex ทั้งหมด (151 ตัว)
              </Text>
              <Ionicons name="chevron-forward" size={16} color={subTextColor} />
            </TouchableOpacity>

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

      {/* Pokédex Selection Modal */}
      <PokemonPickerModal
        visible={isPickerModalVisible}
        onClose={() => setIsPickerModalVisible(false)}
        onSelect={(id) => setFeaturedPokemonId(id)}
        selectedId={featuredPokemonId}
        caughtPokemonIds={caughtPokemonIds}
        isDark={isDark}
      />
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
  openPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
  },
  openPickerButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
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
  dateTripleRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  dateFieldWrapper: {
    flex: 1,
    gap: 4,
  },
  timeDoubleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeFieldWrapper: {
    flex: 1,
    gap: 4,
  },
  timeDash: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 18,
  },
  miniFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  compactInput: {
    textAlign: 'center',
    fontWeight: '600',
  },
});
