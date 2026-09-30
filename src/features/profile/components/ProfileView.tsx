import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTrainer } from '@/shared/context/trainer-context';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { useAppPermissions } from '../hooks/use-app-permissions';
import { TrainerHeaderCard } from './TrainerHeaderCard';
import { PermissionSettingsSection } from './PermissionSettingsSection';

export function ProfileView() {
  const { trainer, logout } = useTrainer();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    location,
    notifications,
    camera,
    isLoading,
    requestLocation,
    requestNotifications,
    requestCamera,
    testNotification,
    testDelayNotification,
    openAppSettings,
    resetAndRecheckPermissions,
  } = useAppPermissions();

  const handleLogout = () => {
    Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบเทรนเนอร์ใช่หรือไม่?', [
      { text: 'ยกเลิก', style: 'cancel' },
      {
        text: 'ออกจากระบบ',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Trainer Profile Card */}
      <TrainerHeaderCard trainer={trainer} isDark={isDark} />

      {/* 2. App Permissions Configuration */}
      <PermissionSettingsSection
        location={location}
        notifications={notifications}
        camera={camera}
        isLoading={isLoading}
        isDark={isDark}
        onRequestLocation={requestLocation}
        onRequestNotifications={requestNotifications}
        onRequestCamera={requestCamera}
        onTestNotification={testNotification}
        onTestDelayNotification={testDelayNotification}
        onResetAndRecheck={resetAndRecheckPermissions}
        onOpenAppSettings={openAppSettings}
      />

      {/* 3. Account & Security Logout */}
      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutButtonText}>ออกจากระบบ (Logout)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  logoutWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
