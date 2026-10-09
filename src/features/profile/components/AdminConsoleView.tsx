import { View, Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import { useAppPermissions } from '../hooks/use-app-permissions';
import { PermissionSettingsSection } from './PermissionSettingsSection';

interface AdminConsoleViewProps {
  isDark?: boolean;
}

export function AdminConsoleView({ isDark: _isDark }: AdminConsoleViewProps) {
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

  const textColor = '#0F172A';
  const subTextColor = '#64748B';

  return (
    <View style={{ gap: 12 }}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>⚙️ Admin Console</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          จัดการสิทธิ์แอป ทดสอบแจ้งเตือน และตรวจสอบสถานะระบบ
        </Text>
      </View>

      <PermissionSettingsSection
        location={location}
        notifications={notifications}
        camera={camera}
        isLoading={isLoading}
        isDark={false}
        onRequestLocation={requestLocation}
        onRequestNotifications={requestNotifications}
        onRequestCamera={requestCamera}
        onTestNotification={testNotification}
        onTestDelayNotification={testDelayNotification}
        onResetAndRecheck={resetAndRecheckPermissions}
        onOpenAppSettings={openAppSettings}
      />

      <View style={styles.versionBox}>
        <Text style={[styles.versionText, { color: subTextColor }]}>
          App v{Constants.expoConfig?.version ?? '1.0.0'} • {Constants.expoConfig?.name ?? 'pokemongo'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 4,
    gap: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  versionBox: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
