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
  isDark?: boolean;
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
  onRequestLocation,
  onRequestNotifications,
  onRequestCamera,
  onTestNotification,
  onTestDelayNotification,
  onResetAndRecheck,
  onOpenAppSettings,
}: PermissionSettingsSectionProps) {
  const textColor = '#0F172A';
  const subTextColor = '#64748B';

  return (
    <View>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          สิทธิ์การใช้งานแอพ (Permissions)
        </Text>
        <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
          เปิดสิทธิ์เพื่อดูสถานที่จัดมีตอัป การแจ้งเตือนกิจกรรม และเปิดโหมด AR
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#EE1515" />
        </View>
      ) : (
        <>
          <PermissionCard
            icon="location-sharp"
            iconBg="#EE1515"
            title="ตำแหน่ง GPS (Location)"
            subtitle="ใช้ค้นหาพิกัดสถานที่จัดมีตอัปและคำนวณระยะทาง"
            permission={location}
            onPress={onRequestLocation}
          />

          <PermissionCard
            icon="notifications-sharp"
            iconBg="#F59E0B"
            title="การแจ้งเตือนกิจกรรม (Notifications)"
            subtitle="แจ้งเตือนกิจกรรมมีตอัปล่วงหน้า 30 นาที"
            permission={notifications}
            onPress={onRequestNotifications}
          />

          {/* Test Notification Action Card */}
          <View
            style={[
              styles.testNotificationCard,
              {
                backgroundColor: '#FFFDF0',
                borderColor: '#FDE68A',
              },
            ]}
          >
            <View style={styles.testNotificationContent}>
              <View
                style={[
                  styles.testNotificationIconWrap,
                  { backgroundColor: '#FEF3C7' },
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
                    { color: '#B45309' },
                  ]}
                >
                  ทดสอบการแจ้งเตือนกิจกรรม (Event Alerts)
                </Text>
                <Text
                  style={[
                    styles.testNotificationSubtitle,
                    { color: '#78350F' },
                  ]}
                >
                  ทดสอบส่งแจ้งเตือนกิจกรรมมีตอัป (Heads-up Banner)
                </Text>
              </View>
            </View>

            <View style={styles.testButtonRow}>
              <TouchableOpacity
                onPress={onTestNotification}
                activeOpacity={0.8}
                style={[
                  styles.testActionBtn,
                  { backgroundColor: '#F59E0B' },
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
                      backgroundColor: '#FEF3C7',
                      borderWidth: 1,
                      borderColor: '#F59E0B',
                    },
                  ]}
                >
                  <Ionicons
                    name="timer-outline"
                    size={14}
                    color="#B45309"
                  />
                  <Text
                    style={[
                      styles.testActionBtnText,
                      { color: '#B45309' },
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
            iconBg="#EE1515"
            title="กล้องถ่ายรูป (Camera AR)"
            subtitle="ใช้เปิดโหมด AR จับโปเกมอนในโลกความเป็นจริง"
            permission={camera}
            onPress={onRequestCamera}
          />

          {/* Android OEM Guide: Heads-up + Lock screen */}
          <View
            style={[
              styles.oemGuideCard,
              {
                backgroundColor: '#FEF2F2',
                borderColor: '#FEE2E2',
              },
            ]}
          >
            <View style={styles.testNotificationContent}>
              <View
                style={[
                  styles.testNotificationIconWrap,
                  { backgroundColor: '#FEE2E2' },
                ]}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color="#EE1515"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.testNotificationTitle,
                    { color: '#991B1B' },
                  ]}
                >
                  แบนเนอร์ไม่เด้งทับแอปอื่น?
                </Text>
                <Text
                  style={[
                    styles.testNotificationSubtitle,
                    { color: '#7F1D1D' },
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
                { backgroundColor: '#EE1515' },
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
                { backgroundColor: '#F1F5F9' },
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color="#0F172A"
              />
              <Text
                style={[
                  styles.resetButtonText,
                  { color: '#0F172A' },
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
                backgroundColor: '#FFFDF0',
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={18}
              color="#F59E0B"
              style={{ marginTop: 1 }}
            />
            <Text
              style={[
                styles.infoText,
                { color: '#78350F' },
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
    backgroundColor: '#EE1515',
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
