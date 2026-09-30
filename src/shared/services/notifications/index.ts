import { defaultNotificationManager } from './notification-manager';
import { PokemonRarity } from '@/shared/types';

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

export async function isNotificationsEnabled(): Promise<boolean> {
  return defaultNotificationManager.isEnabled();
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  return defaultNotificationManager.setEnabled(enabled);
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

export async function sendSpawnNotification(
  pokemonName: string,
  pokemonId: number,
  rarityOrIsNew?: PokemonRarity | boolean,
  instanceId?: string
): Promise<void> {
  return defaultNotificationManager.sendSpawn(
    pokemonName,
    pokemonId,
    rarityOrIsNew,
    instanceId
  );
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

export function registerNotificationTapListener(
  onNavigateToCatch: (pokemonId: number) => void
): () => void {
  return defaultNotificationManager.registerTapListener(onNavigateToCatch);
}
