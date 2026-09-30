import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';

export interface NotificationPermissionModalProps {
  visible: boolean;
  canAskAgain: boolean;
  onAllow: () => Promise<void> | void;
  onDismiss: () => void;
  onOpenSettings: () => void;
}

export function NotificationPermissionModal({
  visible,
  canAskAgain,
  onAllow,
  onDismiss,
  onOpenSettings,
}: NotificationPermissionModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const cardBg = isDark ? '#1C1C1E' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subTextColor = isDark ? '#9CA3AF' : '#4B5563';
  const borderColor = isDark ? '#2D3748' : '#E5E7EB';
  const featureBg = isDark ? 'rgba(255, 255, 255, 0.05)' : '#F9FAFB';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            { backgroundColor: cardBg, borderColor },
          ]}
        >
          {/* Header Icon Badge */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={36} color="#FFFFFF" />
            </View>
            <View style={styles.badgeWrap}>
              <Text style={styles.badgeText}>BACKGROUND ALERTS</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.title, { color: textColor }]}>
            เปิดการแจ้งเตือนโปเกมอน
          </Text>
          <Text style={[styles.subtitle, { color: subTextColor }]}>
            ไม่พลาดทุกการค้นพบ! รับการแจ้งเตือนทันทีเมื่อพบโปเกมอนตัวใหม่หรือระดับหายากเกิดใกล้ตัวคุณ แม้ขณะพับหน้าจอหรือสลับไปแอปอื่น
          </Text>

          {/* Feature List */}
          <View style={[styles.featuresCard, { backgroundColor: featureBg }]}>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={18} color="#F59E0B" />
              <Text style={[styles.featureText, { color: textColor }]}>
                เตือนเมื่อพบโปเกมอนหายากใกล้พิกัดจริง
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="phone-portrait-outline" size={18} color="#3B82F6" />
              <Text style={[styles.featureText, { color: textColor }]}>
                ทำงานอัตโนมัติขณะพับจอ (Heads-up Banner)
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="flash-outline" size={18} color="#10B981" />
              <Text style={[styles.featureText, { color: textColor }]}>
                แตะการแจ้งเตือนเพื่อเปิดฉากจับได้ทันที
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {canAskAgain ? (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onAllow}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  เปิดการแจ้งเตือนทันที
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: '#3B82F6' }]}
                onPress={onOpenSettings}
                activeOpacity={0.8}
              >
                <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>
                  เปิดการตั้งค่าระบบ (Settings)
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.dismissButton}
              onPress={onDismiss}
              activeOpacity={0.7}
            >
              <Text style={[styles.dismissButtonText, { color: subTextColor }]}>
                ไว้คราวหลัง
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
  },
  badgeWrap: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  featuresCard: {
    width: '100%',
    borderRadius: 16,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dismissButton: {
    width: '100%',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
