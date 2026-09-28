import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

// expo-notifications remote/push functionality was removed from Expo Go on Android in SDK 53+.
// Importing expo-notifications unconditionally on Expo Go Android triggers an uncaught error at module load time.
const isUnsupportedPlatform = Platform.OS === 'web' || (Platform.OS === 'android' && isRunningInExpoGo());

let Notifications: typeof import('expo-notifications') | null = null;

if (!isUnsupportedPlatform) {
  try {
    Notifications = require('expo-notifications');
    // Configure foreground notification behavior
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('[Notifications] Failed to load expo-notifications:', error);
  }
}

/**
 * Request notification permissions gracefully.
 * Returns true if granted or in web/simulator fallback mode.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web' || !Notifications) return false;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[Notifications] Failed to request permissions:', error);
    return false;
  }
}

/**
 * Triggers a local notification when a Pokémon is successfully caught.
 */
export async function sendCatchNotification(pokemonName: string, cp: number): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Gotcha!',
        body: `${pokemonName.toUpperCase()} (CP ${cp}) was added to your Pokémon Bag!`,
        sound: true,
      },
      trigger: null, // deliver immediately
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send catch notification:', error);
  }
}

/**
 * Triggers a local notification when a wild Pokémon appears nearby.
 */
export async function sendSpawnNotification(pokemonName: string): Promise<void> {
  if (Platform.OS === 'web' || !Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚡ Wild Pokémon Nearby!',
        body: `A wild ${pokemonName.toUpperCase()} just appeared nearby! Tap to catch it!`,
        sound: true,
      },
      trigger: null, // deliver immediately
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send spawn notification:', error);
  }
}
