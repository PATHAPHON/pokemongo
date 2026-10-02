import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { isRunningInExpoGo } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { getAllPokemonMeta } from '@/shared/services/pokemon-registry';

function formatRarityLabel(rarity?: string): string {
  if (rarity === 'ultra_rare') return 'Ultra Rare';
  if (rarity === 'rare') return 'Rare';
  return 'Common';
}

function formatRarityEmoji(rarity?: string): string {
  if (rarity === 'ultra_rare') return '🌌';
  if (rarity === 'rare') return '⚡';
  return '🌟';
}

function formatPokemonName(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const SPAWN_CHANNEL_ID = 'pokemon-wild-alerts';
const EVENT_REMINDER_CHANNEL_ID = 'campus-event-reminders';
const OLD_CHANNEL_IDS = ['pokemon-spawns', 'pokemon-spawns-v2'];
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
      // Silent in Expo Go / dev-build mismatch: native module may not exist.
      // Keep initError for status UI, avoid LogBox spam.
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
    // Native channel manager may not exist in mismatched Expo Go / old dev build.
    if (
      typeof this.notificationsModule.setNotificationChannelAsync !== 'function'
    ) {
      return;
    }
    try {
      // Android caches channel settings permanently: delete old channels so
      // the new MAX-importance + PUBLIC-visibility channel takes effect.
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
          name: 'เตือนความจำกิจกรรมมหาวิทยาลัย',
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
      // Local notifications still attempt delivery; avoid LogBox spam.
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

  public async sendTestNotification(): Promise<{
    success: boolean;
    message: string;
  }> {
    // 1. Always trigger haptic vibration
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    } catch {
      // ignore
    }

    // 2. Dispatch native system notification
    if (this.notificationsModule) {
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

        await this.notificationsModule.scheduleNotificationAsync({
          content: {
            title: '⚡ ทดสอบการแจ้งเตือน Pokémon GO!',
            body: 'พบ Pikachu ป่าเลเวล 25 ใกล้ตัวคุณ! ระบบแจ้งเตือนทำงานได้ปกติ 🎉',
            sound: true,
            priority: 'max',
            vibrate: [0, 500, 250, 500],
            data: {
              pokemonId: '25',
              type: 'test-notification',
            },
          },
          trigger:
            Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : null,
        });

        return {
          success: true,
          message:
            'ส่งการแจ้งเตือนทดสอบไปยังแถบแจ้งเตือนของเครื่องเรียบร้อยแล้ว!',
        };
      } catch (error: any) {
        console.warn(
          '[NotificationManager] Native test notification failed:',
          error
        );
        return {
          success: false,
          message: error?.message || 'ส่งการแจ้งเตือนไม่สำเร็จ',
        };
      }
    }

    return {
      success: false,
      message: this.initError
        ? `โมดูลการแจ้งเตือนไม่พร้อมใช้งาน (${this.initError})`
        : 'โมดูลการแจ้งเตือนไม่พร้อมใช้งาน',
    };
  }

  public async sendDelayedTestNotification(delaySeconds: number = 5): Promise<{
    success: boolean;
    message: string;
  }> {
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

      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: '⚡ ทดสอบการแจ้งเตือน Pokémon GO!',
          body: 'พบ Pikachu ป่าเลเวล 25 ใกล้ตัวคุณ! (แจ้งเตือนนอกแอปสำเร็จ) 🎉',
          sound: true,
          priority: 'max',
          vibrate: [0, 500, 250, 500],
          data: {
            pokemonId: '25',
            type: 'test-notification',
          },
        },
        trigger: {
          type: 'timeInterval',
          seconds: Math.max(1, delaySeconds),
          repeats: false,
          ...(Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : {}),
        } as any,
      });

      return {
        success: true,
        message: `ตั้งเวลาแจ้งเตือนในอีก ${delaySeconds} วินาทีแล้ว กดปุ่มโฮมเพื่อสลับออกนอกแอปได้เลย!`,
      };
    } catch (error: any) {
      console.warn(
        '[NotificationManager] Failed to schedule delayed test notification:',
        error
      );
      return {
        success: false,
        message: error?.message || 'ตั้งเวลาแจ้งเตือนล้มเหลว',
      };
    }
  }

  public async scheduleBackgroundSpawnNotifications(
    caughtPokemonIds?: Set<number>
  ): Promise<void> {
    if (!this.notificationsModule) {
      console.log(
        '[NotificationManager] Background notifications skipped: module not available'
      );
      return;
    }
    const { granted } = await this.getPermissionStatus();
    if (!granted) {
      console.log(
        '[NotificationManager] Background notifications skipped: alerts disabled or permission not granted'
      );
      return;
    }

    try {
      await this.notificationsModule.cancelAllScheduledNotificationsAsync();
      await this.setupChannels();

      let caught = caughtPokemonIds;
      if (!caught) {
        try {
          const { DatabaseManager, PokemonRepository } = require('@/shared/services/database');
          const repo = new PokemonRepository(DatabaseManager.getInstance());
          const allCaught = await repo.getAll();
          caught = new Set(allCaught.map((p: any) => p.pokemonId));
        } catch {
          caught = new Set();
        }
      }

      const allMeta = getAllPokemonMeta();
      const uncaught = allMeta.filter((p) => !caught!.has(p.id));

      if (uncaught.length === 0) {
        return;
      }

      // Shuffle uncaught candidates to get random spawns across all rarities
      const shuffled = [...uncaught].sort(() => 0.5 - Math.random());
      const p1 = shuffled[0];
      const p2 = shuffled[1 % shuffled.length];
      const p3 = shuffled[2 % shuffled.length];
      const p4 = shuffled[3 % shuffled.length];

      // Round 1: 25 seconds after background
      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: `${formatRarityEmoji(p1.rarity)} พบ ${formatPokemonName(p1.name)} (${formatRarityLabel(p1.rarity)}) ตัวใหม่ใกล้ตัวคุณ!`,
          body: `ระดับ ${formatRarityLabel(p1.rarity)}! โปเกมอนที่คุณยังไม่เคยจับกำลังจะหนีในอีกไม่กี่นาที แตะเพื่อจับทันที!`,
          sound: true,
          priority: 'max',
          vibrate: [0, 500, 250, 500],
          data: {
            pokemonId: String(p1.id),
            instanceId: `bg-spawn-25s-${Date.now()}`,
            type: 'wild-spawn',
          },
        },
        trigger: {
          type: 'timeInterval',
          seconds: 25,
          repeats: false,
          ...(Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : {}),
        } as any,
      });

      // Round 2: 50 seconds (25s + 25s) after background
      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: `${formatRarityEmoji(p2.rarity)} พบ ${formatPokemonName(p2.name)} (${formatRarityLabel(p2.rarity)}) ตัวใหม่ใกล้ตัวคุณ!`,
          body: `พบ ${formatPokemonName(p2.name)} (ระดับ ${formatRarityLabel(p2.rarity)}) ที่ยังไม่เคยจับ กำลังปรากฏตัวใกล้พิกัดของคุณ แตะเพื่อเข้าสู่ฉากจับ!`,
          sound: true,
          priority: 'max',
          vibrate: [0, 500, 250, 500],
          data: {
            pokemonId: String(p2.id),
            instanceId: `bg-spawn-50s-${Date.now()}`,
            type: 'wild-spawn',
          },
        },
        trigger: {
          type: 'timeInterval',
          seconds: 50,
          repeats: false,
          ...(Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : {}),
        } as any,
      });

      // Round 3: 75 seconds (50s + 25s) after background
      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: `${formatRarityEmoji(p3.rarity)} มีโปเกมอนตัวใหม่ระดับ ${formatRarityLabel(p3.rarity)} เกิดใกล้ตัว!`,
          body: `พบ ${formatPokemonName(p3.name)} (${formatRarityLabel(p3.rarity)}) ที่ยังไม่เคยจับ เกิดใหม่ในบริเวณใกล้เคียง รีบกลับมาจับก่อนหมดเวลา!`,
          sound: true,
          priority: 'max',
          vibrate: [0, 500, 250, 500],
          data: {
            pokemonId: String(p3.id),
            instanceId: `bg-spawn-75s-${Date.now()}`,
            type: 'wild-spawn',
          },
        },
        trigger: {
          type: 'timeInterval',
          seconds: 75,
          repeats: false,
          ...(Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : {}),
        } as any,
      });

      // Round 4: 100 seconds (75s + 25s) after background
      await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: `${formatRarityEmoji(p4.rarity)} พบ ${formatPokemonName(p4.name)} (${formatRarityLabel(p4.rarity)}) ตัวใหม่ใกล้ตัวคุณ!`,
          body: `พบ ${formatPokemonName(p4.name)} (${formatRarityLabel(p4.rarity)}) ที่ยังไม่เคยจับ เกิดใหม่ในบริเวณใกล้เคียง รีบกลับมาจับก่อนหมดเวลา!`,
          sound: true,
          priority: 'max',
          vibrate: [0, 500, 250, 500],
          data: {
            pokemonId: String(p4.id),
            instanceId: `bg-spawn-100s-${Date.now()}`,
            type: 'wild-spawn',
          },
        },
        trigger: {
          type: 'timeInterval',
          seconds: 100,
          repeats: false,
          ...(Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : {}),
        } as any,
      });
    } catch (error) {
      console.warn(
        '[NotificationManager] Failed to schedule background notifications:',
        error
      );
    }
  }

  public async cancelScheduledNotifications(): Promise<void> {
    if (!this.notificationsModule) return;
    try {
      await this.notificationsModule.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.warn(
        '[NotificationManager] Failed to cancel scheduled notifications:',
        error
      );
    }
  }

  public async scheduleEventReminder(
    eventId: string,
    title: string,
    startsAt: string,
    minutesBefore: number = 15
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
      const startTime = new Date(startsAt).getTime();
      const triggerTime = startTime - minutesBefore * 60 * 1000;
      const now = Date.now();

      // If event starts soon or time calculation gives past, schedule in 5s for demo
      let triggerSeconds = Math.max(5, Math.floor((triggerTime - now) / 1000));
      if (triggerTime <= now) {
        triggerSeconds = 5;
      }

      const notifId = await this.notificationsModule.scheduleNotificationAsync({
        content: {
          title: `📅 เตือนกิจกรรม: ${title}`,
          body: `กิจกรรมกำลังจะเริ่มในอีก ${minutesBefore} นาที แตะเพื่อดูรายละเอียดและเตรียมตัว`,
          sound: true,
          priority: 'max',
          vibrate: [0, 400, 200, 400],
          data: {
            eventId: String(eventId),
            type: 'event-reminder',
          },
        },
        trigger: {
          type: 'timeInterval',
          seconds: triggerSeconds,
          repeats: false,
          ...(Platform.OS === 'android'
            ? { channelId: EVENT_REMINDER_CHANNEL_ID }
            : {}),
        } as any,
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

  public registerTapListener(
    onNavigateToCatch: (pokemonId: number) => void,
    onNavigateToEvent?: (eventId: string) => void
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
      if (data?.eventId && onNavigateToEvent) {
        onNavigateToEvent(String(data.eventId));
        return;
      }
      const rawId = data?.pokemonId;
      if (rawId) {
        const parsedId = parseInt(String(rawId), 10);
        if (!isNaN(parsedId) && parsedId > 0) {
          onNavigateToCatch(parsedId);
        }
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
