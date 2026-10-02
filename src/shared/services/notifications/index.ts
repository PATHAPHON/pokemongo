import { defaultNotificationManager } from './notification-manager';

export * from './notification-manager';

export const isAndroidExpoGo = defaultNotificationManager.isAndroidExpoGo;

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

export async function scheduleBackgroundNotifications(
  caughtPokemonIds?: Set<number>
): Promise<void> {
  return defaultNotificationManager.scheduleBackgroundSpawnNotifications(
    caughtPokemonIds
  );
}

export async function cancelScheduledNotifications(): Promise<void> {
  return defaultNotificationManager.cancelScheduledNotifications();
}

export async function sendTestNotification(): Promise<{
  success: boolean;
  message: string;
}> {
  return defaultNotificationManager.sendTestNotification();
}

export async function sendDelayedTestNotification(
  delaySeconds: number = 5
): Promise<{
  success: boolean;
  message: string;
}> {
  return defaultNotificationManager.sendDelayedTestNotification(delaySeconds);
}

export async function scheduleEventReminder(
  eventId: string,
  title: string,
  startsAt: string,
  minutesBefore: number = 15
): Promise<{ success: boolean; id?: string; error?: string }> {
  return defaultNotificationManager.scheduleEventReminder(
    eventId,
    title,
    startsAt,
    minutesBefore
  );
}

export async function cancelEventReminder(
  notificationId: string
): Promise<void> {
  return defaultNotificationManager.cancelEventReminder(notificationId);
}

export function registerNotificationTapListener(
  onNavigateToCatch: (pokemonId: number) => void,
  onNavigateToEvent?: (eventId: string) => void
): () => void {
  return defaultNotificationManager.registerTapListener(
    onNavigateToCatch,
    onNavigateToEvent
  );
}

