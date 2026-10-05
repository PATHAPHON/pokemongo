import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useEventDetail } from '@/features/events';
import {
  LeafletMapView,
  LeafletMapViewRef,
  WildPokemon,
  EventVenuePin,
  createEventPokemonSpot,
} from '@/features/map';
import { formatRemainingLabel, buildCatchParams } from '@/shared/utils/event-helpers';
import {
  getArtworkUrl,
  formatPokemonId,
  capitalizePokemonName,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';

export default function EventCatchMapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const mapRef = useRef<LeafletMapViewRef>(null);
  const bannerAnim = useRef(new Animated.Value(-100)).current;
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { event, isLoading, error, registration, hasCaught, hasAttended } = useEventDetail(id || '');

  const [eventPokemon, setEventPokemon] = useState<WildPokemon | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasSpawned, setHasSpawned] = useState(false);
  const [now, setNow] = useState(Date.now());

  const isNotRegistered =
    !isLoading && !!event && (!registration || registration.status === 'cancelled');

  useEffect(() => {
    if (isNotRegistered) {
      Alert.alert(
        'ยังไม่ได้ลงทะเบียน',
        'คุณต้องลงทะเบียนเข้าร่วมกิจกรรมก่อนจึงจะสามารถเปิดแผนที่จัดงานได้',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              if (id) {
                router.replace(`/events/${id}` as any);
              } else {
                router.back();
              }
            },
          },
        ],
        {
          cancelable: false,
          onDismiss: () => {
            if (id) {
              router.replace(`/events/${id}` as any);
            } else {
              router.back();
            }
          },
        }
      );
    }
  }, [isNotRegistered, id, router]);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current) {
        clearTimeout(scanTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingLabel = useMemo(() => {
    return formatRemainingLabel(event?.endsAt, now);
  }, [event?.endsAt, now]);

  const pokemonId = event?.featuredPokemonId || 25;
  const pokemonMeta = useMemo(() => getPokemonMetaById(pokemonId), [pokemonId]);

  // Center coordinates for map
  const venueLocation = useMemo(() => {
    if (!event?.location) {
      return { latitude: 17.4138, longitude: 102.7872 }; // Default Udon Thani fallback
    }
    return {
      latitude: event.location.latitude,
      longitude: event.location.longitude,
    };
  }, [event]);

  // Event venue pin for Leaflet
  const eventPins: EventVenuePin[] = useMemo(() => {
    if (!event) return [];
    return [
      {
        id: event.id,
        title: event.title,
        categoryColor: '#EE1515',
        latitude: event.location.latitude,
        longitude: event.location.longitude,
        venueName: event.location.name,
        featuredPokemonId: event.featuredPokemonId,
      },
    ];
  }, [event]);

  // Scan venue to spawn the event's featured Pokemon
  const handleScanVenue = useCallback(() => {
    if (isScanning || hasSpawned || !event || hasCaught || hasAttended) return;
    setIsScanning(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } catch {}

    if (scanTimerRef.current) {
      clearTimeout(scanTimerRef.current);
    }

    scanTimerRef.current = setTimeout(() => {
      const venue = {
        latitude: event.location.latitude,
        longitude: event.location.longitude,
      };
      const featured = createEventPokemonSpot(venue, pokemonId);

      setEventPokemon(featured);
      setHasSpawned(true);
      setIsScanning(false);

      // Trigger haptic feedback
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => {}
        );
      } catch {}

      // Animate banner slide down
      Animated.spring(bannerAnim, {
        toValue: 0,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }).start();
    }, 1500);
  }, [isScanning, hasSpawned, event, hasCaught, hasAttended, pokemonId, bannerAnim]);

  const handleExpired = useCallback((instanceId?: string) => {
    setEventPokemon((prev) => {
      if (!instanceId || prev?.instanceId === instanceId) {
        return null;
      }
      return prev;
    });
  }, []);

  const handleCatch = useCallback(
    (pokemon: WildPokemon) => {
      if (!event) return;
      router.push(
        buildCatchParams({
          id: pokemon.id,
          name: pokemon.name,
          rarity: pokemon.rarity,
          types: pokemon.types,
          eventId: event.id,
        }) as any
      );
    },
    [router, event]
  );

  const handleDirectCatch = () => {
    if (!pokemonMeta || !event) return;
    router.push(
      buildCatchParams({
        id: pokemonId,
        name: pokemonMeta.name,
        rarity: pokemonMeta.rarity,
        types: [...pokemonMeta.types],
        eventId: event.id,
      }) as any
    );
  };

  const handleRecenter = () => {
    if (mapRef.current && venueLocation) {
      mapRef.current.recenter(venueLocation);
    }
  };

  if (isLoading || !event) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121212' : '#F4F6F8' },
        ]}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={[styles.loadingText, { color: isDark ? '#ECEDEE' : '#11181C' }]}>
          กำลังเปิดแผนที่สถานที่จัดงาน...
        </Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121212' : '#F4F6F8' },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorText, { color: isDark ? '#ECEDEE' : '#11181C' }]}>
          {error}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>ย้อนกลับ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isNotRegistered) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: isDark ? '#121212' : '#F4F6F8' },
        ]}
      >
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={[styles.loadingText, { color: isDark ? '#ECEDEE' : '#11181C' }]}>
          กำลังเปลี่ยนเส้นทาง...
        </Text>
      </SafeAreaView>
    );
  }

  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  return (
    <View style={styles.container}>
      {/* Interactive Map centered on Event Venue */}
      <LeafletMapView
        ref={mapRef}
        location={venueLocation}
        wildList={eventPokemon ? [eventPokemon] : []}
        eventPins={eventPins}
        onCatch={handleCatch}
        onExpired={handleExpired}
      />

      {/* Top Header Navigation Bar */}
      <SafeAreaView edges={['top']} style={styles.safeHeaderArea}>
        <View
          style={[
            styles.headerBar,
            { backgroundColor: isDark ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.94)' },
          ]}
        >
          <TouchableOpacity
            style={styles.circleIconButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="ย้อนกลับ"
          >
            <Ionicons name="arrow-back" size={22} color={textColor} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
              {event.title}
            </Text>
            <View style={styles.headerSubtitleRow}>
              <Ionicons name="location-sharp" size={13} color="#EF4444" />
              <Text
                style={[styles.headerSubtitle, { color: subTextColor }]}
                numberOfLines={1}
              >
                {event.location.name}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.circleIconButton}
            onPress={handleRecenter}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="ซูมกลับมายังสถานที่จัดงาน"
          >
            <Ionicons name="navigate" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Event status strip: featured + remaining time */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: isDark ? 'rgba(30,30,30,0.92)' : 'rgba(255,255,255,0.94)',
            borderRadius: 12,
            paddingVertical: 8,
            paddingHorizontal: 12,
            gap: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: '800', color: isDark ? '#FDE047' : '#7C3AED', flex: 1 }} numberOfLines={1}>
            ⭐ {capitalizePokemonName(pokemonMeta?.name || 'Pokemon')}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#10B981' }}>
            ⏱️ {remainingLabel}
          </Text>
        </View>

        {/* Dynamic Spawn Event Alert Banner */}
        {hasSpawned && (
          <Animated.View
            style={[
              styles.spawnAlertBanner,
              { transform: [{ translateY: bannerAnim }] },
            ]}
          >
            <View style={styles.spawnAlertIconCircle}>
              <Text style={{ fontSize: 16 }}>⚡</Text>
            </View>
            <View style={styles.spawnAlertContent}>
              <Text style={styles.spawnAlertTitle}>
                {capitalizePokemonName(pokemonMeta?.name || 'Pokemon')} ปรากฏตัวขึ้นแล้ว!
              </Text>
              <Text style={styles.spawnAlertSubtitle}>
                แตะที่ตัวโปเกมอนบนแผนที่ เพื่อเปิดกล้อง AR Catch เริ่มจับได้เลย!
              </Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>

      {/* Bottom Floating Catch & Event Venue Card */}
      <SafeAreaView edges={['bottom']} style={styles.bottomCardWrap}>
        <View style={[styles.bottomCard, { backgroundColor: cardBg }]}>
          <View style={styles.pokemonPreviewRow}>
            <Image
              source={{ uri: getArtworkUrl(pokemonId) }}
              style={styles.pokemonArtwork}
              resizeMode="contain"
            />
            <View style={styles.pokemonInfo}>
              <View style={styles.badgeRow}>
                <View style={styles.eventChip}>
                  <Text style={styles.eventChipText}>โปเกมอนประจำงาน</Text>
                </View>
                {pokemonMeta ? (
                  <Text style={styles.rarityBadge}>
                    {pokemonMeta.rarity.toUpperCase()}
                  </Text>
                ) : null}
              </View>

              <Text style={[styles.pokemonName, { color: textColor }]}>
                {capitalizePokemonName(pokemonMeta?.name || 'Pokemon')}{' '}
                {formatPokemonId(pokemonId)}
              </Text>

              <Text style={[styles.venueCoordText, { color: subTextColor }]}>
                พิกัดจัดงาน: {event.location.latitude.toFixed(4)},{' '}
                {event.location.longitude.toFixed(4)}
              </Text>
            </View>
          </View>

          {hasCaught || hasAttended ? (
            <View style={{ gap: 8, marginTop: 4 }}>
              <View
                style={{
                  backgroundColor: hasCaught ? '#ECFDF5' : '#FEF2F2',
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Ionicons
                  name={hasCaught ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={hasCaught ? '#10B981' : '#EF4444'}
                />
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '700',
                    color: hasCaught ? '#065F46' : '#991B1B',
                    flex: 1,
                  }}
                >
                  {hasCaught
                    ? 'คุณได้จับโปเกมอนประจำงานนี้แล้ว (1 ครั้ง)'
                    : 'คุณใช้สิทธิ์จับของกิจกรรมนี้ไปแล้ว'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.catchActionButton, { backgroundColor: '#6B7280' }]}
                onPress={() => router.back()}
                activeOpacity={0.85}
              >
                <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
                <Text style={styles.catchActionButtonText}>
                  กลับหน้ารายละเอียดกิจกรรม
                </Text>
              </TouchableOpacity>
            </View>
          ) : hasSpawned ? (
            <TouchableOpacity
              style={styles.catchActionButton}
              onPress={handleDirectCatch}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="เริ่มจับโปเกมอนประจำงานนี้"
            >
              <Ionicons name="flash" size={18} color="#FFFFFF" />
              <Text style={styles.catchActionButtonText}>
                เริ่มจับ {capitalizePokemonName(pokemonMeta?.name || 'Pokemon')} (AR Catch)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.catchActionButton,
                { backgroundColor: isScanning ? '#6B7280' : '#8B5CF6' },
              ]}
              onPress={handleScanVenue}
              disabled={isScanning}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="สแกนพื้นที่เพื่อค้นหาโปเกมอน"
            >
              {isScanning ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="radio" size={18} color="#FFFFFF" />
              )}
              <Text style={styles.catchActionButtonText}>
                {isScanning ? 'กำลังสแกนค้นหาสัญญาณ...' : 'สแกนพื้นที่จัดงานเพื่อค้นหาโปเกมอน'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  safeHeaderArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
    gap: 10,
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(128,128,128,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  spawnAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1B4B',
    borderWidth: 1.5,
    borderColor: '#8B5CF6',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  spawnAlertIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  spawnAlertContent: {
    flex: 1,
  },
  spawnAlertTitle: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '800',
  },
  spawnAlertSubtitle: {
    color: '#E0E7FF',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  bottomCardWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 10,
  },
  bottomCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  pokemonPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pokemonArtwork: {
    width: 68,
    height: 68,
  },
  pokemonInfo: {
    flex: 1,
    gap: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventChip: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eventChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  rarityBadge: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pokemonName: {
    fontSize: 16,
    fontWeight: '800',
  },
  venueCoordText: {
    fontSize: 11,
    fontWeight: '500',
  },
  catchActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EE1515',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  catchActionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
