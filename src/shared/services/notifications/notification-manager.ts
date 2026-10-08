import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isRunningInExpoGo } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
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

export class NotificationManager {
  private static instance: NotificationManager | null = null;
  public readonly isExpoGo: boolean;
  public readonly isAndroidExpoGo: boolean;
  public initError: string | null = null;
  private notificationsModule: typeof import('expo-notifications') | null =
    null;

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
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          priority: 'max' as any,
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

      const importance =
        this.notificationsModule.AndroidImportance?.MAX ??
        this.notificationsModule.AndroidImportance?.HIGH ??
        5;
      const visibility =
        this.notificationsModule.AndroidNotificationVisibility?.PUBLIC ?? 1;

      await this.notificationsModule.setNotificationChannelAsync(
        EVENT_REMINDER_CHANNEL_ID,
        {
          name: 'การแจ้งเตือนกิจกรรม',
          importance,
          lockscreenVisibility: visibility,
          sound: 'default',
          enableLights: true,
          lightColor: '#8B5CF6',
          enableVibrate: true,
          vibrationPattern: [0, 400, 200, 400],
          showBadge: true,
        }
      );

      // Also ensure Expo's fallback channel has MAX importance so no notifications are silenced
      await this.notificationsModule.setNotificationChannelAsync(
        'expo_notifications_fallback_notification_channel',
        {
          name: 'การแจ้งเตือนทั่วไป',
          importance,
          lockscreenVisibility: visibility,
          sound: 'default',
          enableLights: true,
          lightColor: '#8B5CF6',
          enableVibrate: true,
          vibrationPattern: [0, 400, 200, 400],
          showBadge: true,
        }
      );
    } catch {
      // Silent: channel creation fails when native module missing.
    }
  }

  public async ensurePermission(): Promise<boolean> {
    if (!this.notificationsModule) {
      return false;
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
      return false;
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
    // No-op: permissions are managed at OS level
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

      const dateTriggerType =
        this.notificationsModule.SchedulableTriggerInputTypes?.DATE || 'date';

      const trigger: any =
        Platform.OS === 'android'
          ? {
              type: dateTriggerType,
              date: triggerDate,
              channelId: EVENT_REMINDER_CHANNEL_ID,
            }
          : {
              type: dateTriggerType,
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
      const intervalType =
        this.notificationsModule.SchedulableTriggerInputTypes?.TIME_INTERVAL ||
        'timeInterval';
      const trigger: any = {
        type: intervalType,
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

  /**
   * Cancels all scheduled notifications and dismisses delivered notifications.
   * Clears OS notification state on logout or session reset.
   */
  public async cancelAllNotifications(): Promise<void> {
    if (!this.notificationsModule) return;
    try {
      if (
        typeof this.notificationsModule.cancelAllScheduledNotificationsAsync ===
        'function'
      ) {
        await this.notificationsModule.cancelAllScheduledNotificationsAsync();
      }
      if (
        typeof this.notificationsModule.dismissAllNotificationsAsync ===
        'function'
      ) {
        await this.notificationsModule.dismissAllNotificationsAsync();
      }
    } catch (err) {
      console.warn('[NotificationManager] cancelAllNotifications failed:', err);
    }
  }

  /**
   * Recovers scheduled notification IDs from the OS notification queue.
   * Maps eventId -> notificationId for both fixed reminders and test loops.
   */
  public async getScheduledReminders(): Promise<{
    reminders: Record<string, string>;
    testReminders: Record<string, string>;
  }> {
    if (
      !this.notificationsModule ||
      typeof this.notificationsModule.getAllScheduledNotificationsAsync !==
        'function'
    ) {
      return { reminders: {}, testReminders: {} };
    }

    try {
      const scheduled =
        await this.notificationsModule.getAllScheduledNotificationsAsync();
      return parseScheduledReminders(scheduled);
    } catch (err) {
      console.warn(
        '[NotificationManager] Failed to recover scheduled reminders:',
        err
      );
      return { reminders: {}, testReminders: {} };
    }
  }

  /** Generic channel check without any event payload (permission screen). */
  public async sendChannelTestNotification(): Promise<{
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
          type:
            this.notificationsModule.SchedulableTriggerInputTypes
              ?.TIME_INTERVAL || 'timeInterval',
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

}

export const defaultNotificationManager = NotificationManager.getInstance();

export function parseScheduledReminders(scheduled: unknown[]): {
  reminders: Record<string, string>;
  testReminders: Record<string, string>;
} {
  const reminders: Record<string, string> = {};
  const testReminders: Record<string, string> = {};

  if (!Array.isArray(scheduled)) {
    return { reminders, testReminders };
  }

  for (const item of scheduled) {
    const notifId = (item as any)?.identifier ?? (item as any)?.id;
    const data =
      (item as any)?.content?.data ??
      (item as any)?.request?.content?.data;
    const eventId =
      data?.eventId != null ? String(data.eventId).trim() : '';
    const type = data?.type;

    if (
      eventId.length > 0 &&
      typeof notifId === 'string' &&
      notifId.length > 0
    ) {
      if (type === 'event-reminder-test') {
        testReminders[eventId] = notifId;
      } else if (type === 'event-reminder') {
        reminders[eventId] = notifId;
      }
    }
  }

  return { reminders, testReminders };
}
