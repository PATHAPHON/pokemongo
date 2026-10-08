import { useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CampusEvent, EventRegistration } from '@/shared/types';
import {
  getArtworkUrl,
  formatPokemonId,
  capitalizePokemonName,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import {
  formatEventDateThai,
  formatEventTimeThai,
} from '@/shared/utils/event-helpers';
import { LeafletMapView, EventVenuePin } from '@/features/map';

interface EventDetailInfoProps {
  event: CampusEvent;
  registration?: EventRegistration;
  isDark?: boolean;
  onViewOnMap?: () => void;
  onCatchDirect?: () => void;
  isOrganizer?: boolean;
  hasTestLoop?: boolean;
  onToggleTestLoop?: () => void;
}

function formatEventTimeRange(startIso: string, endIso?: string): string {
  if (!endIso) return `${formatEventTimeThai(startIso)} เป็นต้นไป`;
  return `${formatEventTimeThai(startIso)} - ${formatEventTimeThai(endIso)}`;
}

export function EventDetailInfo({
  event,
  registration,
  isDark = false,
  onViewOnMap,
  onCatchDirect,
  isOrganizer = false,
  hasTestLoop = false,
  onToggleTestLoop,
}: EventDetailInfoProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

  const capacity = event.capacity ?? 50;
  const registered = event.registeredCount;
  const progressRatio = Math.min(1, registered / capacity);
  const seatsRemaining = Math.max(0, capacity - registered);
  const pokemonMeta = event.featuredPokemonId
    ? getPokemonMetaById(event.featuredPokemonId)
    : undefined;

  const venueLocation = useMemo(
    () => ({
      latitude: event.location.latitude,
      longitude: event.location.longitude,
    }),
    [event.location.latitude, event.location.longitude]
  );

  const venuePins: EventVenuePin[] = useMemo(
    () => [
      {
        id: event.id,
        title: event.title,
        categoryColor: '#8B5CF6',
        latitude: event.location.latitude,
        longitude: event.location.longitude,
        venueName: event.location.name,
        featuredPokemonId: event.featuredPokemonId,
      },
    ],
    [event.id, event.title, event.location, event.featuredPokemonId]
  );

  return (
    <View style={styles.container}>
      {/* Organizer Banner */}
      {isOrganizer && (
        <View style={styles.organizerBanner}>
          <Ionicons name="ribbon" size={20} color="#8B5CF6" />
          <Text style={styles.organizerText}>
            ⭐ คุณเป็นผู้จัดมีตอัปนี้ (Meetup Host)
          </Text>
        </View>
      )}




      {/* Unified Info Card */}
      <View style={[styles.unifiedCard, { backgroundColor: cardBg, borderColor }]}>

        {/* Date & Time Row */}
        <View style={styles.unifiedRow}>
          <View style={[styles.unifiedIconWrap, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
          </View>
          <View style={styles.unifiedContent}>
            <Text style={[styles.unifiedLabel, { color: subTextColor }]}>วันและเวลา</Text>
            <Text style={[styles.unifiedValue, { color: textColor }]}>
              {formatEventDateThai(event.startsAt)}
            </Text>
            <Text style={[styles.unifiedSub, { color: subTextColor }]}>
              {formatEventTimeRange(event.startsAt, event.endsAt)}
            </Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Venue Row */}
        <View style={styles.unifiedRow}>
          <View style={[styles.unifiedIconWrap, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="location-outline" size={20} color="#EF4444" />
          </View>
          <View style={styles.unifiedContent}>
            <Text style={[styles.unifiedLabel, { color: subTextColor }]}>สถานที่จัดงาน</Text>
            <Text style={[styles.unifiedValue, { color: textColor }]}>
              {event.location.name}
            </Text>
            <Text style={[styles.unifiedSub, { color: subTextColor }]}>
              GPS: {event.location.latitude.toFixed(4)}, {event.location.longitude.toFixed(4)}
            </Text>
            {onViewOnMap ? (
              <TouchableOpacity
                style={styles.mapChip}
                onPress={onViewOnMap}
                activeOpacity={0.7}
              >
                <Ionicons name="map-outline" size={13} color="#3B82F6" />
                <Text style={styles.mapChipText}>เปิดแผนที่ & สำรวจสถานที่</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Inline Mini Leaflet Venue Map Preview */}
        <View style={[styles.miniMapContainer, { borderColor }]}>
          <LeafletMapView
            location={venueLocation}
            wildList={[]}
            eventPins={venuePins}
          />
          {onViewOnMap ? (
            <TouchableOpacity
              style={styles.miniMapBadge}
              onPress={onViewOnMap}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="แตะเพื่อเปิดแผนที่ขนาดใหญ่"
            >
              <Ionicons name="map-outline" size={13} color="#FFFFFF" />
              <Text style={styles.miniMapBadgeText}>แตะเพื่อเปิดแผนที่ขนาดใหญ่</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.miniMapBadge}>
              <Ionicons name="map-outline" size={13} color="#FFFFFF" />
              <Text style={styles.miniMapBadgeText}>แตะเพื่อเปิดแผนที่ขนาดใหญ่</Text>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: borderColor }]} />

        {/* Capacity Row */}
        <View style={styles.unifiedRow}>
          <View style={[styles.unifiedIconWrap, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="people-outline" size={20} color="#3B82F6" />
          </View>
          <View style={styles.unifiedContent}>
            <View style={styles.capacityHeaderRow}>
              <Text style={[styles.unifiedLabel, { color: subTextColor }]}>จำนวนที่เปิดรับ</Text>
              <Text style={[
                styles.seatsBadge,
                { color: seatsRemaining === 0 ? '#EF4444' : '#10B981' },
              ]}>
                {seatsRemaining === 0 ? 'เต็มแล้ว' : `ว่างอีก ${seatsRemaining} ที่`}
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.round(progressRatio * 100)}%` as any,
                    backgroundColor:
                      progressRatio >= 1 ? '#EF4444' : progressRatio > 0.8 ? '#F59E0B' : '#10B981',
                  },
                ]}
              />
            </View>
            <Text style={[styles.unifiedSub, { color: subTextColor }]}>
              ลงทะเบียนแล้ว {registered} / {capacity} ที่นั่ง ({Math.round(progressRatio * 100)}%)
            </Text>
          </View>
        </View>

      </View>

      {/* Test loop toggle: verify tap-to-detail when meetup is far away */}
      {onToggleTestLoop ? (
        <TouchableOpacity
          style={[
            styles.testLoopCard,
            {
              backgroundColor: isDark ? '#1E1E1E' : '#FFFBEB',
              borderColor: hasTestLoop ? '#F59E0B' : borderColor,
            },
          ]}
          onPress={onToggleTestLoop}
          activeOpacity={0.8}
          accessibilityRole="switch"
          accessibilityLabel={hasTestLoop ? 'ปิดโหมดทดสอบ' : 'เปิดโหมดทดสอบ'}
        >
          <Ionicons
            name={hasTestLoop ? 'notifications' : 'notifications-outline'}
            size={20}
            color="#F59E0B"
          />
          <View style={styles.testLoopContent}>
            <Text style={[styles.testLoopTitle, { color: textColor }]}>
              {hasTestLoop ? '⏱️ ทดสอบทุก 10 วิ: เปิดอยู่ (แตะเพื่อปิด)' : '⏱️ ทดสอบทุก 10 วิ (มีตอัปยังอีกนาน)'}
            </Text>
            <Text style={[styles.testLoopSub, { color: subTextColor }]}>
              เด้งซ้ำทุก 10 วินาทีพร้อม eventId จริง แตะเพื่อเปิดรายละเอียด
            </Text>
          </View>
        </TouchableOpacity>
      ) : null}


      {/* Featured Pokemon Card */}
      {event.featuredPokemonId ? (
        <View
          style={[
            styles.featuredCard,
            {
              backgroundColor: isDark ? '#261F35' : '#F5F3FF',
              borderColor: '#8B5CF6',
            },
          ]}
        >
          <View style={styles.featuredHeader}>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>
                ⚡ โปเกมอนพิเศษประจำอีเวนต์
              </Text>
            </View>
            {pokemonMeta ? (
              <Text style={styles.featuredRarityText}>
                {pokemonMeta.rarity.toUpperCase()}
              </Text>
            ) : null}
          </View>
          <View style={styles.featuredBody}>
            <Image
              source={{ uri: getArtworkUrl(event.featuredPokemonId) }}
              style={styles.featuredImage}
              resizeMode="contain"
            />
            <View style={styles.featuredDetails}>
              <Text style={[styles.featuredPokemonName, { color: textColor }]}>
                {capitalizePokemonName(pokemonMeta?.name || 'Pokemon')}{' '}
                {formatPokemonId(event.featuredPokemonId)}
              </Text>
              <Text
                style={[styles.featuredDescription, { color: subTextColor }]}
              >
                ลงทะเบียนเข้าร่วมกิจกรรมเพื่อรับสิทธิ์จับโปเกมอนพิเศษประจำงาน!
              </Text>
              {registration?.hasCaught ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: '#ECFDF5',
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                    marginTop: 8,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={{ color: '#065F46', fontSize: 12, fontWeight: '700' }}>
                    จับสำเร็จแล้ว (1 ครั้ง)
                  </Text>
                </View>
              ) : onCatchDirect && registration != null && registration.status !== 'cancelled' ? (
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity
                    style={styles.catchEventButton}
                    onPress={onCatchDirect}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel="จับโปเกมอนประจำงานทันที"
                  >
                    <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                    <Text style={styles.catchEventButtonText}>
                      จับ {capitalizePokemonName(pokemonMeta?.name || 'Pokemon')} ทันที ⚡
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  unifiedCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  unifiedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  unifiedIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unifiedContent: {
    flex: 1,
    gap: 3,
  },
  unifiedLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  unifiedValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  unifiedSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: 16,
  },
  capacityHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  seatsBadge: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  mapChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 7,
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  mapChipText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  organizerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDE9FE',
    borderWidth: 1,
    borderColor: '#C4B5FD',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  organizerText: {
    color: '#6D28D9',
    fontSize: 13,
    fontWeight: '800',
  },
  featuredCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    gap: 12,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  featuredRarityText: {
    color: '#8B5CF6',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featuredImage: {
    width: 84,
    height: 84,
  },
  featuredDetails: {
    flex: 1,
    gap: 4,
  },
  featuredPokemonName: {
    fontSize: 16,
    fontWeight: '800',
  },
  featuredDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  catchEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EE1515',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 6,
  },
  catchEventButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  testLoopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  testLoopContent: {
    flex: 1,
    gap: 2,
  },
  testLoopTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  testLoopSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  miniMapContainer: {
    height: 140,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    backgroundColor: '#E5E3DF',
  },
  miniMapBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17, 24, 28, 0.82)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    zIndex: 10,
  },
  miniMapBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
