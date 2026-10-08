import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import {
  useEventDetail,
  EventDetailHero,
  EventDetailInfo,
} from '@/features/events';
import { useTrainer } from '@/shared/context/trainer-context';
import {
  buildCatchParams,
  isEventOrganizer,
} from '@/shared/utils/event-helpers';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const rawId = params.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isValidId = typeof id === 'string' && id.trim().length > 0;
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
    isFavorite,
    hasReminder,
    hasTestLoop,
    reload,
    toggleFavorite,
    toggleReminder,
    toggleTestLoop,
  } = useEventDetail(isValidId ? id : '');

  const handleToggleReminder = async () => {
    const res = await toggleReminder();
    if (res && !res.success && res.error) {
      Alert.alert('การแจ้งเตือน', res.error);
    }
  };

  const handleToggleTestLoop = async () => {
    const res = await toggleTestLoop();
    if (res && !res.success && res.error) {
      Alert.alert('ทดสอบแจ้งเตือน', res.error);
    }
  };

  const handleDirectCatch = () => {
    if (!id || !event?.featuredPokemonId) return;
    const meta = getPokemonMetaById(event.featuredPokemonId);
    const catchParams = buildCatchParams({
      id: event.featuredPokemonId,
      name: meta?.name ?? 'Pokemon',
      rarity: meta?.rarity ?? 'rare',
      types: meta?.types ?? ['normal'],
      eventId: event.id,
    });
    router.push(catchParams as any);
  };

  const handleViewOnMap = () => {
    if (!id) return;
    router.push({
      pathname: '/events/map' as any,
      params: { id },
    });
  };

  if (!isValidId) {
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

  const isOrganizer = isEventOrganizer(event, trainer);

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
          onToggleReminder={handleToggleReminder}
          isDark={isDark}
        />



        <EventDetailInfo
          event={event}
          registration={registration}
          isDark={isDark}
          onViewOnMap={handleViewOnMap}
          onCatchDirect={handleDirectCatch}
          isOrganizer={isOrganizer}
          hasTestLoop={hasTestLoop}
          onToggleTestLoop={handleToggleTestLoop}
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
        {!isRegistered && (isFull ? (
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
        ))}
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
});
