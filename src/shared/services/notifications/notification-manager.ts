import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isRunningInExpoGo } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import type { CampusEvent } from '@/shared/types';

export const EVENT_REMINDER_CHANNEL_ID = 'event-reminders';
export const EVENT_REMINDER_MINUTES_BEFORE = 30;
export const EVENT_TEST_LOOP_SECONDS = 10;

const OLD_CHANNEL_IDS = [
  'campus-event-reminders',
  'pokemon-wild-alerts',
  'pokemon-spawns',
  'pokemon-spawns-v2',
];
const NOTIFICATION_PREF_KEY = 'pokemon_go_notifications_enabled';

export class NotificationManager {
  private static instance: NotificationManager | null = null;
  public readonly isExpoGo: boolean;
  public readonly isAndroidExpoGo: boolean;
  public initError: string | null = null;
  private notificationsModule: typeof import('expo-notifications') | null =
    null;
  private readonly memoryStorage = new Map<string, string>();

  public constructor() {
    this.isExpoGo =
      isRunningInExpoGo() ||
      Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
      (Constants as any).appOwnership === 'expo';

    this.isAndroidExpoGo = Platform.OS === 'android' && this.isExpoGo;

    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.notificationsModule = require('expo-notifications');
      this.configureNotificationHandler();
      this.initError = null;
    } catch (err: any) {
      const msg = String(err?.message || err);
      this.initError = msg;
      this.notificationsModule = null;
    }
  }

  public configureNotificationHandler(): void {
    if (!this.notificationsModule) return;
    try {
      this.notificationsModule.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch (err) {
      console.warn(
        '[NotificationManager] Failed to configure notification handler:',
        err
      );
    }
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private async getStoredPref(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return this.memoryStorage.get(key) ?? null;
    }
  }

  private async setStoredPref(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      this.memoryStorage.set(key, value);
    }
  }

  public async setupChannels(): Promise<void> {
    if (Platform.OS !== 'android' || !this.notificationsModule) return;
    if (
      typeof this.notificationsModule.setNotificationChannelAsync !== 'function'
    ) {
      return;
    }
    try {
      // Android caches channel settings permanently: delete stale channels so
      // the single event-reminders channel takes effect on existing installs.
      if (
        typeof this.notificationsModule.deleteNotificationChannelAsync ===
        'function'
      ) {
        for (const oldId of OLD_CHANNEL_IDS) {
          try {
            await this.notificationsModule.deleteNotificationChannelAsync(
              oldId
            );
          } catch {
            // Old channel may not exist. Ignore.
          }
        }
      }

      await this.notificationsModule.setNotificationChannelAsync(
        EVENT_REMINDER_CHANNEL_ID,
        {
          name: 'การแจ้งเตือนกิจกรรม',
          importance: this.notificationsModule.AndroidImportance.HIGH,
          lockscreenVisibility:
            this.notificationsModule.AndroidNotificationVisibility.PUBLIC,
          enableLights: true,
          lightColor: '#8B5CF6',
          enableVibrate: true,
          vibrationPattern: [0, 400, 200, 400],
        }
      );
    } catch {
      // Silent: channel creation fails when native module missing.
    }
  }

  public async ensurePermission(): Promise<boolean> {
    if (!this.notificationsModule) {
      return true;
    }

    try {
      await this.setupChannels();
      const { status: existingStatus } =
        await this.notificationsModule.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } =
          await this.notificationsModule.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.warn('[NotificationManager] Failed to ensure permission:', error);
      return true;
    }
  }

  public async getPermissionStatus(): Promise<{
    granted: boolean;
    status: string;
    canAskAgain: boolean;
  }> {
    if (!this.notificationsModule) {
      return {
        granted: false,
        status: 'undetermined',
        canAskAgain: true,
      };
    }
    try {
      const res = await this.notificationsModule.getPermissionsAsync();
      return {
        granted: res.granted,
        status: res.status,
        canAskAgain: res.canAskAgain,
      };
    } catch {
      return {
        granted: false,
        status: 'denied',
        canAskAgain: false,
      };
    }
  }

  public async resetPreferences(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(NOTIFICATION_PREF_KEY);
    } catch {
      this.memoryStorage.delete(NOTIFICATION_PREF_KEY);
    }
  }

  private buildReminderContent(event: Pick<CampusEvent, 'id' | 'title' | 'location'>, minutesBefore: number, isTest = false) {
    return {
      title: `ใกล้ถึงเวลา: ${event.title}`,
      body: isTest
        ? `[ทดสอบ] อีก ${minutesBefore} นาทีที่ ${event.location.name} — เด้งทุก ${EVENT_TEST_LOOP_SECONDS} วิ แตะเพื่อเปิดรายละเอียด`
        : `เริ่มในอีก ${minutesBefore} นาทีที่ ${event.location.name}`,
      sound: true,
      priority: 'max' as const,
      vibrate: [0, 400, 200, 400],
      data: {
        eventId: String(event.id),
        type: isTest ? 'event-reminder-test' : 'event-reminder',
      },
    };
  }

  public async scheduleEventReminder(
    event: Pick<CampusEvent, 'id' | 'title' | 'startsAt' | 'location'>,
    minutesBefore: number = EVENT_REMINDER_MINUTES_BEFORE
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.notificationsModule) {
      return { success: false, error: 'โมดูลการแจ้งเตือนไม่พร้อมใช้งาน' };
    }
    const granted = await this.ensurePermission();
    if (!granted) {
      return { success: false, error: 'ยังไม่ได้รับสิทธิ์การแจ้งเตือน' };
    }

    try {
      await this.setupChannels();
      const startTime = new Date(event.startsAt).getTime();
      if (Number.isNaN(startTime)) {
        return { success: false, error: 'เวลาเริ่มกิจกรรมไม่ถูกต้อง' };
      }
      const triggerDate = new Date(startTime - minutesBefore * 60 * 1000);
      if (triggerDate.getTime() <= Date.now()) {
        return { success: false, error: 'reminder-time-has-passed' };
      }

      const trigger: any =
        Platform.OS === 'android'
          ? {
              type: this.notificationsModule.SchedulableTriggerInputTypes.DATE,
              date: triggerDate,
              channelId: EVENT_REMINDER_CHANNEL_ID,
            }
          : {
              type: this.notificationsModule.SchedulableTriggerInputTypes.DATE,
              date: triggerDate,
            };

      const notifId = await this.notificationsModule.scheduleNotificationAsync({
        content: this.buildReminderContent(event, minutesBefore, false),
        trigger,
      });

      return { success: true, id: notifId };
    } catch (err: any) {
      console.warn('[NotificationManager] scheduleEventReminder failed:', err);
      return {
        success: false,
        error: err?.message || 'ตั้งการแจ้งเตือนไม่สำเร็จ',
      };
    }
  }

  /**
   * Test loop for far-away meetups: repeats every 10s with the same
   * eventId payload so tap-to-detail can be verified without waiting.
   */
  public async scheduleEventTestLoop(
    event: Pick<CampusEvent, 'id' | 'title' | 'location'>,
    minutesBefore: number = EVENT_REMINDER_MINUTES_BEFORE
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.notificationsModule) {
      return { success: false, error: 'โมดูลการแจ้งเตือนไม่พร้อมใช้งาน' };
    }
    const granted = await this.ensurePermission();
    if (!granted) {
      return { success: false, error: 'ยังไม่ได้รับสิทธิ์การแจ้งเตือน' };
    }

    try {
      await this.setupChannels();
      const trigger: any = {
        type: this.notificationsModule.SchedulableTriggerInputTypes
          .TIME_INTERVAL,
        seconds: EVENT_TEST_LOOP_SECONDS,
        repeats: true,
        ...(Platform.OS === 'android'
          ? { channelId: EVENT_REMINDER_CHANNEL_ID }
          : {}),
      };

      const notifId = await this.notificationsModule.scheduleNotificationAsync({
        content: this.buildReminderContent(event, minutesBefore, true),
        trigger,
      });

      return { success: true, id: notifId };
    } catch (err: any) {
      console.warn('[NotificationManager] scheduleEventTestLoop failed:', err);
      return {
        success: false,
        error: err?.message || 'ตั้งการแจ้งเตือนทดสอบไม่สำเร็จ',
      };
    }
  }

  public async cancelEventReminder(notificationId: string): Promise<void> {
    if (!this.notificationsModule || !notificationId) return;
    try {
      await this.notificationsModule.cancelScheduledNotificationAsync(
        notificationId
      );
    } catch (err) {
      console.warn('[NotificationManager] cancelEventReminder failed:', err);
    }
  }

  public async cancelEventTestLoop(notificationId: string): Promise<void> {
    return this.cancelEventReminder(notificationId);
  }

  /** Generic channel check without any event payload (permission screen). */
  public async sendChannelTestNotification(now = false): Promise<{
    success: boolean;
    message: string;
    id?: string;
  }> {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    } catch {
      // ignore
    }

    if (!this.notificationsModule) {
      return {
        success: false,
        message: this.initError
          ? `โมดูลการแจ้งเตือนไม่พร้อมใช้งาน (${this.initError})`
          : 'โมดูลการแจ้งเตือนไม่พร้อมใช้งาน',
      };
    }

    try {
      await this.setupChannels();
      const granted = await this.ensurePermission();
      if (!granted) {
        return {
          success: false,
          message:
            'ไม่ได้รับอนุญาตสิทธิ์การแจ้งเตือน กรุณาเปิดการแจ้งเตือนในการตั้งค่าระบบ',
        };
      }

      const trigger: any =
        Platform.OS === 'android'
          ? { channelId: EVENT_REMINDER_CHANNEL_ID }
          : null;

      const id = await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: '🔔 ทดสอบการแจ้งเตือนกิจกรรม',
          body: 'ช่องแจ้งเตือนกิจกรรมทำงานปกติ แตะเพื่อปิด',
          sound: true,
          priority: 'max' as const,
          vibrate: [0, 400, 200, 400],
          data: { type: 'event-channel-test' },
        },
        trigger,
      });

      void now;
      return {
        success: true,
        message: 'ส่งการแจ้งเตือนทดสอบไปยังแถบแจ้งเตือนของเครื่องเรียบร้อยแล้ว!',
        id,
      };
    } catch (error: any) {
      console.warn(
        '[NotificationManager] Channel test notification failed:',
        error
      );
      return {
        success: false,
        message: error?.message || 'ส่งการแจ้งเตือนไม่สำเร็จ',
      };
    }
  }

  public async sendDelayedChannelTestNotification(
    delaySeconds: number = 5
  ): Promise<{ success: boolean; message: string; id?: string }> {
    if (!this.notificationsModule) {
      return {
        success: false,
        message: this.initError
          ? `โมดูลการแจ้งเตือนไม่พร้อมใช้งาน (${this.initError})`
          : 'โมดูลการแจ้งเตือนไม่พร้อมใช้งาน',
      };
    }

    try {
      await this.setupChannels();
      const granted = await this.ensurePermission();
      if (!granted) {
        return {
          success: false,
          message:
            'ไม่ได้รับอนุญาตสิทธิ์การแจ้งเตือน กรุณาเปิดการแจ้งเตือนในการตั้งค่าระบบ',
        };
      }

      const id = await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: '🔔 ทดสอบการแจ้งเตือนกิจกรรม',
          body: `ตั้งเวลาแจ้งเตือนในอีก ${delaySeconds} วินาทีแล้ว กดปุ่มโฮมเพื่อสลับออกนอกแอปได้เลย!`,
          sound: true,
          priority: 'max' as const,
          vibrate: [0, 400, 200, 400],
          data: { type: 'event-channel-test' },
        },
        trigger: {
          type: this.notificationsModule.SchedulableTriggerInputTypes
            .TIME_INTERVAL,
          seconds: Math.max(1, delaySeconds),
          repeats: false,
          ...(Platform.OS === 'android'
            ? { channelId: EVENT_REMINDER_CHANNEL_ID }
            : {}),
        } as any,
      });

      return {
        success: true,
        message: `ตั้งเวลาแจ้งเตือนในอีก ${delaySeconds} วินาทีแล้ว กดปุ่มโฮมเพื่อสลับออกนอกแอปได้เลย!`,
        id,
      };
    } catch (error: any) {
      console.warn(
        '[NotificationManager] Failed to schedule delayed channel test:',
        error
      );
      return {
        success: false,
        message: error?.message || 'ตั้งเวลาแจ้งเตือนล้มเหลว',
      };
    }
  }

  public registerTapListener(
    onNavigateToEvent: (eventId: string) => void
  ): () => void {
    if (!this.notificationsModule) {
      return () => {};
    }

    const mod = this.notificationsModule;

    const handleResponse = (response: any) => {
      if (!response) return;
      const actionId = response.actionIdentifier;
      if (actionId && actionId !== mod.DEFAULT_ACTION_IDENTIFIER) {
        return;
      }
      const data = response.notification?.request?.content?.data;
      const eventId = data?.eventId;
      if (typeof eventId === 'string' && eventId.length > 0) {
        onNavigateToEvent(eventId);
      }
    };

    try {
      const initialResponse = mod.getLastNotificationResponse();
      if (initialResponse) {
        handleResponse(initialResponse);
        mod.clearLastNotificationResponse();
      }
    } catch (err) {
      console.warn('[NotificationManager] Cold start check failed:', err);
    }

    try {
      const subscription =
        mod.addNotificationResponseReceivedListener(handleResponse);
      return () => subscription.remove();
    } catch (err) {
      console.warn('[NotificationManager] Subscription failed:', err);
      return () => {};
    }
  }

  /** Keep for legacy callers: no-op wrapper (do NOT wipe event reminders). */
  public async cancelScheduledNotifications(): Promise<void> {
    return;
  }
}

export const defaultNotificationManager = NotificationManager.getInstance();
