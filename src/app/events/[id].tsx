import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import {
  useEventDetail,
  EventDetailHero,
  EventDetailInfo,
  useEventActions,
} from '@/features/events';
import { useTrainer } from '@/shared/context/trainer-context';
import { formatRemainingLabel } from '@/shared/utils/event-helpers';

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { trainer } = useTrainer();

  const screenBg = isDark ? '#121212' : '#F4F6F8';
  const cardBg = isDark ? '#1E1E1E' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';
  const borderColor = isDark ? '#2C2C2E' : '#E5E7EB';

  const {
    event,
    isLoading,
    error,
    isRegistered,
    registration,
    hasCaught,
    hasAttended,
    isFavorite,
    hasReminder,
    reload,
    toggleFavorite,
    toggleReminder,
  } = useEventDetail(id || '');

  const { handleCancelRegistration } = useEventActions();

  const handleViewOnMap = () => {
    if (!id) return;
    router.push({
      pathname: '/events/map' as any,
      params: { id },
    });
  };

  if (!id) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: screenBg }]}>
        <Ionicons name="alert-circle-outline" size={54} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: textColor }]}>
          รหัสมีตอัปไม่ถูกต้อง
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

  if (isLoading && !event) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: screenBg }]}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={[styles.loadingText, { color: subTextColor }]}>
          กำลังโหลดรายละเอียดมีตอัป...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={[styles.centerScreen, { backgroundColor: screenBg }]}>
        <Ionicons name="alert-circle-outline" size={54} color="#EF4444" />
        <Text style={[styles.errorTitle, { color: textColor }]}>
          {error || 'ไม่พบข้อมูลมีตอัปนี้'}
        </Text>
        <Text style={[styles.errorSubtitle, { color: subTextColor }]}>
          มีตอัปอาจถูกยกเลิกหรือไม่มีอยู่ในระบบ
        </Text>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.retryButton} onPress={reload}>
            <Text style={styles.retryButtonText}>ลองใหม่</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>ย้อนกลับ</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isFull =
    event.capacity !== undefined && event.registeredCount >= event.capacity;

  const isOrganizer = Boolean(
    event.isCustom ||
    (event.organizerId && trainer && event.organizerId === trainer.id)
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBg }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <EventDetailHero
          event={event}
          isFavorite={isFavorite}
          hasReminder={hasReminder}
          onBack={() => router.back()}
          onToggleFavorite={toggleFavorite}
          onToggleReminder={toggleReminder}
          isDark={isDark}
        />

        {isRegistered && event.featuredPokemonId ? (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 12,
              backgroundColor: hasCaught ? '#ECFDF5' : hasAttended ? '#FEF2F2' : '#EFF6FF',
              borderWidth: 1,
              borderColor: hasCaught ? '#A7F3D0' : hasAttended ? '#FECACA' : '#BFDBFE',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Ionicons
              name={hasCaught ? 'checkmark-circle' : hasAttended ? 'close-circle' : 'sparkles'}
              size={24}
              color={hasCaught ? '#10B981' : hasAttended ? '#EF4444' : '#3B82F6'}
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '800',
                  color: hasCaught ? '#065F46' : hasAttended ? '#991B1B' : '#1E40AF',
                }}
              >
                {hasCaught
                  ? 'จับโปเกมอนประจำงานสำเร็จแล้ว 🎉'
                  : hasAttended
                    ? 'คุณใช้สิทธิ์จับของกิจกรรมนี้ไปแล้ว'
                    : 'มีสิทธิ์เข้าจับโปเกมอนประจำงานแล้ว!'}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: hasCaught ? '#047857' : hasAttended ? '#B91C1C' : '#1D4ED8',
                  fontWeight: '500',
                }}
              >
                {hasCaught || hasAttended
                  ? `จำกัดสิทธิ์ 1 ครั้งต่อคน • ${formatRemainingLabel(event.endsAt, Date.now())}`
                  : 'เปิดแผนที่จัดงานเพื่อสแกนและเริ่มจับโปเกมอน'}
              </Text>
              {!hasCaught && !hasAttended ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: '#EE1515',
                    paddingVertical: 10,
                    borderRadius: 10,
                    alignItems: 'center',
                    flexDirection: 'row',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 4,
                  }}
                  onPress={handleViewOnMap}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="เปิดแผนที่และเริ่มจับโปเกมอนในงาน"
                >
                  <Ionicons name="map" size={16} color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                    เปิดแผนที่ & สแกนจับโปเกมอน
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <EventDetailInfo
          event={event}
          registration={registration}
          isDark={isDark}
          onViewOnMap={handleViewOnMap}
          isOrganizer={isOrganizer}
        />
      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: cardBg,
            borderTopColor: borderColor,
          },
        ]}
      >
        {isRegistered ? (
          <View style={styles.registeredBar}>
            <View style={styles.registeredTextGroup}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.registeredLabel}>คุณลงทะเบียนแล้ว</Text>
            </View>
            <View style={styles.registeredActionsRow}>
              {event.featuredPokemonId && !hasCaught && !hasAttended ? (
                <TouchableOpacity
                  style={styles.bottomCatchButton}
                  onPress={handleViewOnMap}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="เปิดแผนที่จัดงานและจับโปเกมอน"
                >
                  <Ionicons name="map" size={16} color="#FFFFFF" />
                  <Text style={styles.bottomCatchButtonText}>
                    แผนที่ & จับโปเกมอน
                  </Text>
                </TouchableOpacity>
              ) : event.featuredPokemonId ? (
                <View
                  style={[
                    styles.bottomCatchButton,
                    {
                      backgroundColor: hasCaught ? '#059669' : '#6B7280',
                      shadowOpacity: 0,
                      elevation: 0,
                    },
                  ]}
                >
                  <Ionicons
                    name={hasCaught ? 'checkmark-circle' : 'lock-closed'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.bottomCatchButtonText}>
                    {hasCaught ? 'จับสำเร็จแล้ว' : 'ใช้สิทธิ์แล้ว'}
                  </Text>
                </View>
              ) : null}
              <TouchableOpacity
                style={styles.cancelRegButton}
                onPress={() => {
                  if (registration) {
                    handleCancelRegistration(registration.id, event.title);
                  }
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelRegButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : isFull ? (
          <View style={[styles.primaryButton, styles.disabledButton]}>
            <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              มีตอัปนี้มีผู้ลงทะเบียนเต็มแล้ว
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              router.push({
                pathname: '/events/register' as any,
                params: { id: event.id },
              });
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="ลงทะเบียนเข้าร่วมมีตอัป"
          >
            <Ionicons name="ticket" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              ลงทะเบียนเข้าร่วมมีตอัป
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  registeredBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  registeredTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  registeredLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#10B981',
  },
  cancelRegButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  cancelRegButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  registeredActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomCatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EE1515',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    shadowColor: '#EE1515',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomCatchButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
