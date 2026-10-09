import { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

import {
  LeafletMapView,
  LeafletMapViewRef,
  Coordinates,
} from '@/features/map';
import { setPendingPick } from '@/shared/utils/pick-location-store';

function parseCoord(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const num = parseFloat(raw ?? '');
  return Number.isFinite(num) ? num : fallback;
}

export default function PickLocationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lat?: string; lng?: string }>();

  const mapRef = useRef<LeafletMapViewRef>(null);

  const initialPin: Coordinates = useMemo(
    () => ({
      latitude: parseCoord(params.lat, 13.7462),
      longitude: parseCoord(params.lng, 100.5347),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [pin, setPin] = useState<Coordinates>(initialPin);
  const [isResolving, setIsResolving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const cardBg = '#FFFFFF';
  const textColor = '#0F172A';
  const subTextColor = '#64748B';

  const handleUseGps = async () => {
    try {
      setIsLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('ต้องการสิทธิ์ GPS', 'กรุณาอนุญาตสิทธิ์เข้าถึงพิกัด');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setPin(next);
      mapRef.current?.recenter(next);
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ไม่สามารถระบุพิกัดได้');
    } finally {
      setIsLocating(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsResolving(true);
      let venueName = `พิกัดปักหมุด ${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}`;
      try {
        const [place] = await Location.reverseGeocodeAsync({
          latitude: pin.latitude,
          longitude: pin.longitude,
        });
        if (place) {
          const parts = [place.street, place.name, place.city, place.region].filter(
            (p): p is string => !!p && p !== place.isoCountryCode
          );
          const unique = [...new Set(parts)];
          if (unique.length > 0) venueName = unique.join(' ');
        }
      } catch {
        // Keep coordinate fallback name
      }

      setPendingPick({ latitude: pin.latitude, longitude: pin.longitude, venueName });
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      router.back();
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LeafletMapView
        ref={mapRef}
        location={pin}
        wildList={[]}
        mode="pick"
        pickPin={pin}
        onMapPick={setPin}
      />

      <SafeAreaView edges={['top']} style={styles.safeHeaderArea}>
        <View
          style={[
            styles.headerBar,
            { backgroundColor: 'rgba(255,255,255,0.96)' },
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
              ปักหมุดสถานที่จัดงาน
            </Text>
            <Text style={[styles.headerSubtitle, { color: subTextColor }]} numberOfLines={1}>
              แตะบนแผนที่หรือลากหมุดไปยังจุดที่ต้องการ
            </Text>
          </View>
          <TouchableOpacity
            style={styles.circleIconButton}
            onPress={handleUseGps}
            disabled={isLocating}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="ใช้พิกัด GPS ปัจจุบัน"
          >
            {isLocating ? (
              <ActivityIndicator size="small" color="#EE1515" />
            ) : (
              <Ionicons name="navigate" size={20} color="#EE1515" />
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <SafeAreaView edges={['bottom']} style={styles.bottomCardWrap}>
        <View style={[styles.bottomCard, { backgroundColor: cardBg }]}>
          <View style={styles.pinRow}>
            <Ionicons name="location-sharp" size={20} color="#EE1515" />
            <Text style={[styles.pinText, { color: textColor }]}>
              {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.confirmButton, isResolving && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={isResolving}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="ยืนยันพิกัดนี้"
          >
            {isResolving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>ยืนยันพิกัดนี้</Text>
              </>
            )}
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
  safeHeaderArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    gap: 10,
  },
  circleIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
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
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '500',
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
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pinText: {
    fontSize: 15,
    fontWeight: '800',
  },
  confirmButton: {
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
  confirmButtonDisabled: {
    opacity: 0.7,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
