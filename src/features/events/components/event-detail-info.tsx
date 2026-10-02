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

interface EventDetailInfoProps {
  event: CampusEvent;
  registration?: EventRegistration;
  isDark?: boolean;
  onViewOnMap?: () => void;
  isOrganizer?: boolean;
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
  isOrganizer = false,
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

      {/* Registration Status Banner (if registered) */}
      {registration && (
        <View style={styles.statusBanner}>
          <View style={styles.statusHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.statusTitle}>
              คุณได้ลงทะเบียนกิจกรรมนี้แล้ว
            </Text>
          </View>
          <Text style={styles.statusDetail}>
            รหัสลงทะเบียน: {registration.id} • ลงทะเบียนเมื่อ:{' '}
            {new Date(registration.registeredAt).toLocaleDateString('th-TH')}
          </Text>
          {registration.notes ? (
            <Text style={styles.statusNotes}>
              หมายเหตุ: {registration.notes}
            </Text>
          ) : null}
          {registration.photoUri ? (
            <View style={styles.ticketPhotoWrap}>
              <Text style={styles.ticketPhotoLabel}>รูปภาพหลักฐาน:</Text>
              <Image
                source={{ uri: registration.photoUri }}
                style={styles.ticketPhoto}
                resizeMode="cover"
              />
            </View>
          ) : null}
        </View>
      )}

      {/* Info Cards: Date, Venue, Capacity */}
      <View style={styles.cardGroup}>
        {/* Date & Time */}
        <View
          style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="calendar-outline" size={22} color="#8B5CF6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: subTextColor }]}>
              วันและเวลา
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {formatEventDateThai(event.startsAt)}
            </Text>
            <Text style={[styles.infoSubValue, { color: subTextColor }]}>
              {formatEventTimeRange(event.startsAt, event.endsAt)}
            </Text>
          </View>
        </View>

        {/* Location & Venue */}
        <View
          style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
            <Ionicons name="location-outline" size={22} color="#EF4444" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoLabel, { color: subTextColor }]}>
              สถานที่จัดงาน
            </Text>
            <Text style={[styles.infoValue, { color: textColor }]}>
              {event.location.name}
            </Text>
            <Text style={[styles.infoSubValue, { color: subTextColor }]}>
              พิกัด GPS: {event.location.latitude.toFixed(4)},{' '}
              {event.location.longitude.toFixed(4)}
            </Text>
            {onViewOnMap ? (
              <TouchableOpacity
                style={styles.mapLinkRow}
                onPress={onViewOnMap}
                activeOpacity={0.7}
              >
                <Ionicons name="map-outline" size={14} color="#3B82F6" />
                <Text style={styles.mapLinkText}>
                  เปิดแผนที่จัดงาน & สำรวจสถานที่
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Capacity Progress */}
        <View
          style={[styles.infoCard, { backgroundColor: cardBg, borderColor }]}
        >
          <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }]}>
            <Ionicons name="people-outline" size={22} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <View style={styles.capacityHeader}>
              <Text style={[styles.infoLabel, { color: subTextColor }]}>
                จำนวนที่เปิดรับ
              </Text>
              <Text
                style={[
                  styles.capacityRemaining,
                  { color: seatsRemaining === 0 ? '#EF4444' : '#10B981' },
                ]}
              >
                {seatsRemaining === 0
                  ? 'เต็มจำนวนแล้ว'
                  : `ว่างอีก ${seatsRemaining} ที่`}
              </Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.round(progressRatio * 100)}%`,
                    backgroundColor:
                      progressRatio >= 1
                        ? '#EF4444'
                        : progressRatio > 0.8
                          ? '#F59E0B'
                          : '#10B981',
                  },
                ]}
              />
            </View>

            <Text style={[styles.infoSubValue, { color: subTextColor }]}>
              ลงทะเบียนแล้ว {registered} / {capacity} ที่นั่ง (
              {Math.round(progressRatio * 100)}%)
            </Text>
          </View>
        </View>
      </View>

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
                ไปยังสถานที่จัดงานเพื่อจับโปเกมอนพิเศษประจำงานผ่านแผนที่จัดงาน!
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
              ) : onViewOnMap && registration != null && registration.status !== 'cancelled' ? (
                <TouchableOpacity
                  style={styles.catchEventButton}
                  onPress={onViewOnMap}
                  activeOpacity={0.85}
                >
                  <Ionicons name="map" size={16} color="#FFFFFF" />
                  <Text style={styles.catchEventButtonText}>
                    เปิดแผนที่จัดงาน & สแกนจับโปเกมอน
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      ) : null}

      {/* Description Section */}
      <View
        style={[styles.descSection, { backgroundColor: cardBg, borderColor }]}
      >
        <Text style={[styles.descHeading, { color: textColor }]}>
          เกี่ยวกับมีตอัป
        </Text>
        <Text style={[styles.descText, { color: textColor }]}>
          {event.description}
        </Text>
      </View>
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
  statusBanner: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#065F46',
  },
  statusDetail: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '500',
  },
  statusNotes: {
    fontSize: 12,
    color: '#065F46',
    marginTop: 4,
    fontStyle: 'italic',
  },
  ticketPhotoWrap: {
    marginTop: 8,
  },
  ticketPhotoLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 4,
  },
  ticketPhoto: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  cardGroup: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 3,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  infoSubValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  capacityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  capacityRemaining: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  descSection: {
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  descHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '400',
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
  mapLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  mapLinkText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
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
});
