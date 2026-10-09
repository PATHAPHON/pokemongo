import { useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useEventDetail } from '@/features/events';
import {
  LeafletMapView,
  LeafletMapViewRef,
  EventVenuePin,
} from '@/features/map';
import {
  formatEventDateThai,
  formatEventTimeThai,
} from '@/shared/utils/event-helpers';

export default function EventVenueMapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const mapRef = useRef<LeafletMapViewRef>(null);

  const { event, isLoading, error } = useEventDetail(id || '');

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

  // Event venue pin for Leaflet (clean venue pin)
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
      },
    ];
  }, [event]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && venueLocation) {
      mapRef.current.recenter(venueLocation);
    }
  }, [venueLocation]);

  const handleOpenExternalMaps = useCallback(() => {
    if (!event?.location) return;
    const { latitude, longitude, name } = event.location;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
      default: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
    });
    Linking.openURL(url || '').catch(() => {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
    });
  }, [event]);

  if (isLoading || !event) {
    return (
      <SafeAreaView
        style={[
          styles.loadingContainer,
          { backgroundColor: '#F8FAFC' },
        ]}
      >
        <ActivityIndicator size="large" color="#EE1515" />
        <Text style={[styles.loadingText, { color: '#11181C' }]}>
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
          { backgroundColor: '#F8FAFC' },
        ]}
      >
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={[styles.errorText, { color: '#11181C' }]}>
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

  const cardBg = '#FFFFFF';
  const textColor = '#11181C';
  const subTextColor = '#687076';
  const borderColor = '#E5E7EB';

  return (
    <View style={styles.container}>
      {/* Interactive Map centered on Event Venue */}
      <LeafletMapView
        ref={mapRef}
        location={venueLocation}
        wildList={[]}
        eventPins={eventPins}
      />

      {/* Top Header Navigation Bar */}
      <SafeAreaView edges={['top']} style={styles.safeHeaderArea}>
        <View
          style={[
            styles.headerBar,
            { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
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
            <Ionicons name="navigate" size={20} color="#EE1515" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Bottom Floating Venue Details Card */}
      <SafeAreaView edges={['bottom']} style={styles.bottomCardWrap}>
        <View style={[styles.bottomCard, { backgroundColor: cardBg, borderColor }]}>
          {/* Venue Info Section */}
          <View style={styles.venueHeaderRow}>
            <View style={styles.venueIconCircle}>
              <Ionicons name="location" size={22} color="#EF4444" />
            </View>
            <View style={styles.venueInfoContent}>
              <Text style={[styles.venueTitle, { color: textColor }]} numberOfLines={2}>
                {event.location.name}
              </Text>
              <Text style={[styles.venueCoordinates, { color: subTextColor }]}>
                GPS: {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
              </Text>
            </View>
          </View>

          {/* Event Date & Time details */}
          <View style={[styles.dateBadgeRow, { backgroundColor: '#FEF2F2' }]}>
            <Ionicons name="calendar-outline" size={15} color="#EE1515" />
            <Text style={[styles.dateBadgeText, { color: textColor }]}>
              {formatEventDateThai(event.startsAt)} ({formatEventTimeThai(event.startsAt)})
            </Text>
          </View>

          {/* Navigation Button */}
          <TouchableOpacity
            style={styles.directionsButton}
            onPress={handleOpenExternalMaps}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="เปิดแผนที่นำทาง"
          >
            <Ionicons name="navigate-circle" size={20} color="#FFFFFF" />
            <Text style={styles.directionsButtonText}>
              เปิดแผนที่นำทาง
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#EE1515',
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
    zIndex: 20,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    gap: 10,
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(128,128,128,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomCardWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bottomCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    gap: 12,
  },
  venueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  venueIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueInfoContent: {
    flex: 1,
  },
  venueTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  venueCoordinates: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  dateBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dateBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  directionsButton: {
    backgroundColor: '#EE1515',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
