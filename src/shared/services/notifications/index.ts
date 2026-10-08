import { defaultNotificationManager } from './notification-manager';
import type { CampusEvent } from '@/shared/types';

export * from './notification-manager';

export async function setupNotificationChannels(): Promise<void> {
  return defaultNotificationManager.setupChannels();
}

export function configureNotificationHandler(): void {
  return defaultNotificationManager.configureNotificationHandler();
}

export async function ensureNotificationPermission(): Promise<boolean> {
  return defaultNotificationManager.ensurePermission();
}

export async function getNotificationPermissionStatus(): Promise<{
  granted: boolean;
  status: string;
  canAskAgain: boolean;
}> {
  return defaultNotificationManager.getPermissionStatus();
}

export async function resetNotificationPreferences(): Promise<void> {
  return defaultNotificationManager.resetPreferences();
}

export async function sendTestNotification(): Promise<{
  success: boolean;
  message: string;
}> {
  const res = await defaultNotificationManager.sendChannelTestNotification();
  return { success: res.success, message: res.message };
}

export async function sendDelayedTestNotification(
  delaySeconds: number = 5
): Promise<{
  success: boolean;
  message: string;
}> {
  const res =
    await defaultNotificationManager.sendDelayedChannelTestNotification(
      delaySeconds
    );
  return { success: res.success, message: res.message };
}

type ReminderEvent = Pick<CampusEvent, 'id' | 'title' | 'startsAt' | 'location'>;

export async function scheduleEventReminder(
  event: ReminderEvent,
  minutesBefore: number = 30
): Promise<{ success: boolean; id?: string; error?: string }> {
  return defaultNotificationManager.scheduleEventReminder(
    event,
    minutesBefore
  );
}

export async function scheduleEventTestLoop(
  event: Pick<CampusEvent, 'id' | 'title' | 'location'>,
  minutesBefore: number = 30
): Promise<{ success: boolean; id?: string; error?: string }> {
  return defaultNotificationManager.scheduleEventTestLoop(event, minutesBefore);
}

export async function cancelEventReminder(
  notificationId: string
): Promise<void> {
  return defaultNotificationManager.cancelEventReminder(notificationId);
}

export async function cancelEventTestLoop(
  notificationId: string
): Promise<void> {
  return defaultNotificationManager.cancelEventTestLoop(notificationId);
}

export async function cancelAllNotifications(): Promise<void> {
  return defaultNotificationManager.cancelAllNotifications();
}

export function registerNotificationTapListener(
  onNavigateToEvent: (eventId: string) => void
): () => void {
  return defaultNotificationManager.registerTapListener(onNavigateToEvent);
}

export async function getScheduledReminders(): Promise<{
  reminders: Record<string, string>;
  testReminders: Record<string, string>;
}> {
  return defaultNotificationManager.getScheduledReminders();
}

