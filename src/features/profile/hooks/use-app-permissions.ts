import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus, Linking, Alert } from 'react-native';
import * as Location from 'expo-location';
import { Camera } from 'expo-camera';

import {
  getNotificationPermissionStatus,
  ensureNotificationPermission,
  resetNotificationPreferences,
  sendTestNotification,
  sendDelayedTestNotification,
} from '@/shared/services/notifications/index';

export interface PermissionDetail {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
}

interface AppPermissionsState {
  location: PermissionDetail;
  notifications: PermissionDetail;
  camera: PermissionDetail;
  isLoading: boolean;
  requestLocation: () => Promise<boolean>;
  requestNotifications: () => Promise<boolean>;
  requestCamera: () => Promise<boolean>;
  testNotification: () => Promise<boolean>;
  testDelayNotification: (delaySeconds?: number) => Promise<boolean>;
  openAppSettings: () => Promise<void>;
  refreshAll: () => Promise<void>;
  resetAndRecheckPermissions: () => Promise<void>;
}

const DEFAULT_DETAIL: PermissionDetail = {
  granted: false,
  status: 'undetermined',
  canAskAgain: true,
};

export function useAppPermissions(): AppPermissionsState {
  const [location, setLocation] = useState<PermissionDetail>(DEFAULT_DETAIL);
  const [notifications, setNotifications] =
    useState<PermissionDetail>(DEFAULT_DETAIL);
  const [camera, setCamera] = useState<PermissionDetail>(DEFAULT_DETAIL);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const appState = useRef<AppStateStatus>(AppState.currentState);

  const refreshAll = useCallback(async () => {
    try {
      // 1. Location
      try {
        const loc = await Location.getForegroundPermissionsAsync();
        setLocation({
          granted: loc.granted,
          status: loc.status,
          canAskAgain: loc.canAskAgain,
        });
      } catch {
        setLocation((prev) => ({ ...prev }));
      }

      // 2. Notifications
      try {
        const notif = await getNotificationPermissionStatus();
        setNotifications({
          granted: notif.granted,
          status: notif.status,
          canAskAgain: notif.canAskAgain,
        });
      } catch {
        setNotifications((prev) => ({ ...prev }));
      }

      // 3. Camera
      try {
        if (Camera && typeof Camera.getCameraPermissionsAsync === 'function') {
          const cam = await Camera.getCameraPermissionsAsync();
          setCamera({
            granted: cam.granted,
            status: cam.status,
            canAskAgain: cam.canAskAgain,
          });
        }
      } catch {
        setCamera((prev) => ({ ...prev }));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();

    // Re-check permissions whenever the app returns from Background or Settings
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        refreshAll();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [refreshAll]);

  const openAppSettings = useCallback(async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(
        'ไม่สามารถเปิดการตั้งค่าได้',
        'กรุณาเปิดแอพ Settings บนเครื่องของคุณ แล้วค้นหา Pokémon GO เพื่อแก้ไขสิทธิ์'
      );
    }
  }, []);

  const promptOpenSettings = useCallback(
    (title: string, message: string) => {
      Alert.alert(title, message, [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'เปิดการตั้งค่า',
          onPress: openAppSettings,
        },
      ]);
    },
    [openAppSettings]
  );

  const requestLocation = useCallback(async (): Promise<boolean> => {
    try {
      const current = await Location.getForegroundPermissionsAsync();
      if (current.granted) {
        setLocation({
          granted: true,
          status: current.status,
          canAskAgain: current.canAskAgain,
        });
        return true;
      }

      // If user previously denied or cannot ask directly
      if (!current.canAskAgain && current.status === 'denied') {
        promptOpenSettings(
          'ต้องการสิทธิ์เข้าถึงตำแหน่ง (GPS)',
          'คุณได้ปิดสิทธิ์ตำแหน่งไว้ กรุณากด "เปิดการตั้งค่า" เพื่ออนุญาตสิทธิ์ตำแหน่งสำหรับค้นหาโปเกมอนป่ารอบตัว'
        );
        return false;
      }

      const res = await Location.requestForegroundPermissionsAsync();
      const detail: PermissionDetail = {
        granted: res.granted,
        status: res.status,
        canAskAgain: res.canAskAgain,
      };
      setLocation(detail);

      if (!res.granted && !res.canAskAgain) {
        promptOpenSettings(
          'ต้องการสิทธิ์เข้าถึงตำแหน่ง (GPS)',
          'คุณได้ปฏิเสธสิทธิ์ตำแหน่ง กรุณาเปิดในการตั้งค่าเพื่อให้แผนที่แสดงตำแหน่งและโปเกมอนรอบตัวคุณ'
        );
      }
      return res.granted;
    } catch (err) {
      console.warn('[useAppPermissions] Failed to request location:', err);
      return false;
    }
  }, [promptOpenSettings]);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const current = await getNotificationPermissionStatus();
      if (current.granted) {
        setNotifications({
          granted: true,
          status: current.status,
          canAskAgain: current.canAskAgain,
        });
        return true;
      }

      if (!current.canAskAgain && current.status === 'denied') {
        promptOpenSettings(
          'ต้องการสิทธิ์การแจ้งเตือนกิจกรรม (Notifications)',
          'กรุณาเปิดการแจ้งเตือนในการตั้งค่าระบบของอุปกรณ์เพื่อรับแจ้งเตือนกิจกรรมมีตอัปล่วงหน้า 30 นาที'
        );
        return false;
      }

      const granted = await ensureNotificationPermission();
      const updated = await getNotificationPermissionStatus();
      setNotifications(updated);

      if (!granted) {
        promptOpenSettings(
          'ต้องการสิทธิ์การแจ้งเตือนกิจกรรม (Notifications)',
          'กรุณาเปิดการแจ้งเตือนในการตั้งค่าระบบของอุปกรณ์เพื่อรับแจ้งเตือนกิจกรรมมีตอัปล่วงหน้า 30 นาที'
        );
      }
      return granted;
    } catch (err) {
      console.warn('[useAppPermissions] Failed to request notifications:', err);
      return false;
    }
  }, [promptOpenSettings]);

  const requestCamera = useCallback(async (): Promise<boolean> => {
    try {
      if (
        !Camera ||
        typeof Camera.getCameraPermissionsAsync !== 'function' ||
        typeof Camera.requestCameraPermissionsAsync !== 'function'
      ) {
        promptOpenSettings(
          'ต้องการสิทธิ์การเข้าถึงกล้อง (Camera)',
          'กรุณาเปิดสิทธิ์กล้องในการตั้งค่าระบบของอุปกรณ์'
        );
        return false;
      }

      const current = await Camera.getCameraPermissionsAsync();
      if (current.granted) {
        setCamera({
          granted: true,
          status: current.status,
          canAskAgain: current.canAskAgain,
        });
        return true;
      }

      if (!current.canAskAgain && current.status === 'denied') {
        promptOpenSettings(
          'ต้องการสิทธิ์การเข้าถึงกล้อง (Camera)',
          'คุณได้ปิดสิทธิ์กล้องไว้ กรุณากด "เปิดการตั้งค่าระบบ" เพื่ออนุญาตสิทธิ์กล้องสำหรับใช้งานโหมดจับโปเกมอน AR'
        );
        return false;
      }

      const res = await Camera.requestCameraPermissionsAsync();
      const detail: PermissionDetail = {
        granted: res.granted,
        status: res.status,
        canAskAgain: res.canAskAgain,
      };
      setCamera(detail);

      if (!res.granted && !res.canAskAgain) {
        promptOpenSettings(
          'ต้องการสิทธิ์การเข้าถึงกล้อง (Camera)',
          'คุณได้ปฏิเสธสิทธิ์กล้อง กรุณาเปิดในการตั้งค่าระบบหากต้องการจับโปเกมอนในโหมด AR'
        );
      }
      return res.granted;
    } catch (err) {
      console.warn('[useAppPermissions] Failed to request camera:', err);
      return false;
    }
  }, [promptOpenSettings]);

  const testNotification = useCallback(async (): Promise<boolean> => {
    try {
      const res = await sendTestNotification();
      if (res.success) {
        await refreshAll();
        return true;
      } else {
        Alert.alert(
          'ไม่สามารถส่งแจ้งเตือนได้',
          res.message || 'กรุณาตรวจสอบและเปิดสิทธิ์การแจ้งเตือนในการตั้งค่า'
        );
        return false;
      }
    } catch (err: any) {
      Alert.alert('เกิดข้อผิดพลาด', err?.message || 'ส่งการแจ้งเตือนไม่สำเร็จ');
      return false;
    }
  }, [refreshAll]);

  const testDelayNotification = useCallback(
    async (delaySeconds: number = 5): Promise<boolean> => {
      try {
        const res = await sendDelayedTestNotification(delaySeconds);
        if (res.success) {
          await refreshAll();
          return true;
        } else {
          Alert.alert(
            'ไม่สามารถส่งแจ้งเตือนได้',
            res.message || 'กรุณาตรวจสอบและเปิดสิทธิ์การแจ้งเตือนในการตั้งค่า'
          );
          return false;
        }
      } catch (err: any) {
        Alert.alert(
          'เกิดข้อผิดพลาด',
          err?.message || 'ส่งการแจ้งเตือนไม่สำเร็จ'
        );
        return false;
      }
    },
    [refreshAll]
  );

  const resetAndRecheckPermissions = useCallback(async () => {
    setIsLoading(true);
    try {
      await resetNotificationPreferences();
      await refreshAll();
      Alert.alert(
        'รีเฟรชสิทธิ์เรียบร้อย',
        'ระบบได้ดึงข้อมูลสถานะสิทธิ์การใช้งานล่าสุดจากอุปกรณ์ของคุณแล้ว'
      );
    } catch (err) {
      console.warn('[useAppPermissions] Failed to reset and recheck:', err);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAll]);

  return {
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
    refreshAll,
    resetAndRecheckPermissions,
  };
}
