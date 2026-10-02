import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PermissionCard } from './PermissionCard';
import { PermissionDetail } from '../hooks/use-app-permissions';

interface PermissionSettingsSectionProps {
  location: PermissionDetail;
  notifications: PermissionDetail;
  camera: PermissionDetail;
  isLoading: boolean;
  isDark: boolean;
  onRequestLocation: () => void;
  onRequestNotifications: () => void;
  onRequestCamera: () => void;
  onTestNotification: () => void;
  onTestDelayNotification?: (delaySeconds?: number) => void;
  onResetAndRecheck: () => void;
  onOpenAppSettings: () => void;
}

export function PermissionSettingsSection({
  location,
  notifications,
  camera,
  isLoading,
  isDark,
  onRequestLocation,
  onRequestNotifications,
  onRequestCamera,
  onTestNotification,
  onTestDelayNotification,
  onResetAndRecheck,
  onOpenAppSettings,
}: PermissionSettingsSectionProps) {
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const subTextColor = isDark ? '#9BA1A6' : '#687076';

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          สิทธิ์การใช้งานแอพ (Permissions)
        </Text>
        <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
          เปิดสิทธิ์เพื่อค้นหาโปเกมอนตามพิกัดจริง การแจ้งเตือน และเปิดโหมด AR
          จับโปเกมอน
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : (
        <>
          <PermissionCard
            icon="location-sharp"
            iconBg="#007AFF"
            title="ตำแหน่ง GPS (Location)"
            subtitle="ใช้ค้นหาพิกัดสถานที่จัดมีตอัปและคำนวณระยะทาง"
            permission={location}
            onPress={onRequestLocation}
            isDark={isDark}
          />

          <PermissionCard
            icon="notifications-sharp"
            iconBg="#FF9500"
            title="การแจ้งเตือน (Notifications)"
            subtitle="แจ้งเตือนการเริ่มกิจกรรมมีตอัปและการแจ้งเตือนสำคัญ"
            permission={notifications}
            onPress={onRequestNotifications}
            isDark={isDark}
          />

          {/* Test Notification Action Card */}
          <View
            style={[
              styles.testNotificationCard,
              {
                backgroundColor: isDark
                  ? 'rgba(245, 158, 11, 0.12)'
                  : '#FFFBEB',
                borderColor: isDark ? '#B45309' : '#FCD34D',
              },
            ]}
          >
            <View style={styles.testNotificationContent}>
              <View
                style={[
                  styles.testNotificationIconWrap,
                  { backgroundColor: isDark ? '#78350F' : '#FEF3C7' },
                ]}
              >
                <Ionicons
                  name="notifications-circle"
                  size={24}
                  color="#F59E0B"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.testNotificationTitle,
                    { color: isDark ? '#FBBF24' : '#B45309' },
                  ]}
                >
                  ทดสอบการแจ้งเตือนมีตอัป (Event Alerts)
                </Text>
                <Text
                  style={[
                    styles.testNotificationSubtitle,
                    { color: isDark ? '#D1D5DB' : '#78350F' },
                  ]}
                >
                  ทดสอบส่งการแจ้งเตือนเตือนความจำกิจกรรมมีตอัป (Heads-up Banner)
                </Text>
              </View>
            </View>

            <View style={styles.testButtonRow}>
              <TouchableOpacity
                onPress={onTestNotification}
                activeOpacity={0.8}
                style={[
                  styles.testActionBtn,
                  { backgroundColor: isDark ? '#D97706' : '#F59E0B' },
                ]}
              >
                <Ionicons name="flash" size={14} color="#FFFFFF" />
                <Text style={styles.testActionBtnText}>
                  ⚡ ทดสอบเตือนกิจกรรมทันที
                </Text>
              </TouchableOpacity>

              {onTestDelayNotification && (
                <TouchableOpacity
                  onPress={() => onTestDelayNotification(5)}
                  activeOpacity={0.8}
                  style={[
                    styles.testActionBtn,
                    {
                      backgroundColor: isDark ? '#78350F' : '#FEF3C7',
                      borderWidth: 1,
                      borderColor: isDark ? '#B45309' : '#F59E0B',
                    },
                  ]}
                >
                  <Ionicons
                    name="timer-outline"
                    size={14}
                    color={isDark ? '#FBBF24' : '#B45309'}
                  />
                  <Text
                    style={[
                      styles.testActionBtnText,
                      { color: isDark ? '#FBBF24' : '#B45309' },
                    ]}
                  >
                    ⏱️ เตือนกิจกรรมใน 5 วิ (สลับไปแอปอื่น / ล็อคหน้าจอ)
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <PermissionCard
            icon="camera-sharp"
            iconBg="#5856D6"
            title="กล้องถ่ายรูป (Camera AR)"
            subtitle="ใช้เปิดโหมด AR จับโปเกมอนในโลกความเป็นจริง"
            permission={camera}
            onPress={onRequestCamera}
            isDark={isDark}
          />

          {/* Android OEM Guide: Heads-up + Lock screen */}
          <View
            style={[
              styles.oemGuideCard,
              {
                backgroundColor: isDark
                  ? 'rgba(59, 130, 246, 0.12)'
                  : '#EFF6FF',
                borderColor: isDark ? '#1D4ED8' : '#BFDBFE',
              },
            ]}
          >
            <View style={styles.testNotificationContent}>
              <View
                style={[
                  styles.testNotificationIconWrap,
                  { backgroundColor: isDark ? '#1E3A8A' : '#DBEAFE' },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color="#3B82F6"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.testNotificationTitle,
                    { color: isDark ? '#93C5FD' : '#1D4ED8' },
                  ]}
                >
                  แบนเนอร์ไม่เด้งทับแอปอื่น?
                </Text>
                <Text
                  style={[
                    styles.testNotificationSubtitle,
                    { color: isDark ? '#D1D5DB' : '#1E40AF' },
                  ]}
                >
                  Xiaomi / Samsung / Oppo / Vivo อาจปิด &quot;ป๊อปอัปขณะอยู่เบื้องหลัง&quot;
                  และ &quot;แสดงบนหน้าจอล็อค&quot; ไว้ เปิดสวิตช์ทั้งสองอย่างในตั้งค่าระบบ
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onOpenAppSettings}
              activeOpacity={0.8}
              style={[
                styles.testActionBtn,
                styles.oemGuideBtn,
                { backgroundColor: isDark ? '#1D4ED8' : '#3B82F6' },
              ]}
            >
              <Ionicons name="settings-outline" size={14} color="#FFFFFF" />
              <Text style={styles.testActionBtnText}>เปิดการตั้งค่าระบบ</Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons: Reset/Re-check and Open Settings */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              onPress={onResetAndRecheck}
              activeOpacity={0.8}
              style={[
                styles.resetButton,
                { backgroundColor: isDark ? '#2A2A2E' : '#E5E7EB' },
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={isDark ? '#ECEDEE' : '#11181C'}
              />
              <Text
                style={[
                  styles.resetButtonText,
                  { color: isDark ? '#ECEDEE' : '#11181C' },
                ]}
              >
                รีเซ็ต/รีเฟรชสิทธิ์
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onOpenAppSettings}
              activeOpacity={0.8}
              style={styles.settingsButton}
            >
              <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
              <Text style={styles.settingsButtonText}>เปิดการตั้งค่าระบบ</Text>
            </TouchableOpacity>
          </View>

          {/* Information Tip Note */}
          <View
            style={[
              styles.infoCard,
              {
                backgroundColor: isDark
                  ? 'rgba(255, 204, 0, 0.1)'
                  : 'rgba(255, 149, 0, 0.08)',
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#FF9500"
              style={{ marginTop: 1 }}
            />
            <Text
              style={[
                styles.infoText,
                { color: isDark ? '#E5E7EB' : '#4B5563' },
              ]}
            >
              หากคุณเคยกด &quot;ไม่อนุญาต&quot; ในหน้าต่างเด้งครั้งแรก
              ระบบโทรศัพท์จะไม่อนุญาตให้ถามซ้ำ คุณสามารถกดปุ่ม{' '}
              <Text style={{ fontWeight: '700' }}>
                &quot;เปิดการตั้งค่าระบบ&quot;
              </Text>{' '}
              ด้านบนเพื่อเปิดสิทธิ์ได้ตลอดเวลา
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  resetButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  settingsButton: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  settingsButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  testNotificationCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  oemGuideCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  oemGuideBtn: {
    marginTop: 10,
  },
  testNotificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  testNotificationIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  testNotificationTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  testNotificationSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  testButtonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  testActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    gap: 5,
  },
  testActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
