import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

// expo-notifications remote/push functionality was removed from Expo Go on Android in SDK 53+.
// Importing expo-notifications unconditionally on Expo Go Android triggers an uncaught error at module load time.
const isExpoGo =
  isRunningInExpoGo() ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === 'expo';

const isUnsupportedPlatform = Platform.OS === 'android' && isExpoGo;

let Notifications: typeof import('expo-notifications') | null = null;

export const SPAWN_CHANNEL_ID = 'pokemon-spawns';
export const CATCH_CHANNEL_ID = 'pokemon-catch';
const NOTIFICATION_PREF_KEY = 'pokemon_go_notifications_enabled';

// In-memory fallback for environments without SecureStore
const memoryStorage = new Map<string, string>();

async function getStoredPref(key: string): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return memoryStorage.get(key) ?? null;
  }
}

async function setStoredPref(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    memoryStorage.set(key, value);
  }
}

if (!isUnsupportedPlatform) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Notifications = require('expo-notifications');
    // Configure foreground notification behavior (Banner, Sound, List)
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
    Notifications = null;
  }
}

/**
 * Configure Android notification channels according to importance.
 */
export async function setupNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android' && Notifications) {
    try {
      await Notifications.setNotificationChannelAsync(SPAWN_CHANNEL_ID, {
        name: 'Wild Pokémon Spawns',
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FFCB05',
      });
      await Notifications.setNotificationChannelAsync(CATCH_CHANNEL_ID, {
        name: 'Catch Results',
        importance: Notifications.AndroidImportance.DEFAULT,
        sound: 'default',
      });
    } catch (error) {
      console.warn('[Notifications] Failed to set notification channels:', error);
    }
  }
}

/**
 * Ensures notification permission is requested and channels configured.
 */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (!Notifications) return false;

  try {
    await setupNotificationChannels();
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    const granted = finalStatus === 'granted';
    if (granted) {
      await setNotificationsEnabled(true);
    }
    return granted;
  } catch (error) {
    console.warn('[Notifications] Failed to ensure notification permission:', error);
    return false;
  }
}

/**
 * Check if the user has enabled spawn notifications.
 */
export async function isNotificationsEnabled(): Promise<boolean> {
  if (isUnsupportedPlatform) return false;
  const pref = await getStoredPref(NOTIFICATION_PREF_KEY);
  // Default to enabled if user granted system permissions
  if (pref === null) {
    if (!Notifications) return false;
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  }
  return pref === 'true';
}

/**
 * Set the notification toggle state.
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await setStoredPref(NOTIFICATION_PREF_KEY, enabled ? 'true' : 'false');
}

/**
 * List of Rare & Starter Pokémon IDs (Kanto 151)
 */
export const RARE_POKEMON_IDS = new Set<number>([
  1, 2, 3,       // Bulbasaur line
  4, 5, 6,       // Charmander line
  7, 8, 9,       // Squirtle line
  25, 26,        // Pikachu, Raichu
  59,            // Arcanine
  65,            // Alakazam
  68,            // Machamp
  76,            // Golem
  94,            // Gengar
  113,           // Chansey
  123,           // Scyther
  127,           // Pinsir
  130,           // Gyarados
  131,           // Lapras
  133, 134, 135, 136, // Eevee line
  142,           // Aerodactyl
  143,           // Snorlax
  144, 145, 146, // Legendary Birds
  147, 148, 149, // Dratini line
  150, 151,      // Mewtwo, Mew
]);

/**
 * Determine if a spawned Pokémon is Rare or Uncaught.
 */
export function isRareOrUncaughtPokemon(
  pokemonId: number,
  caughtPokemonIds: Set<number>
): boolean {
  // If not caught yet, it's a new encounter!
  if (!caughtPokemonIds.has(pokemonId)) {
    return true;
  }
  // Otherwise check if in rare set
  return RARE_POKEMON_IDS.has(pokemonId);
}

/**
 * Triggers a local notification when a Pokémon is successfully caught.
 */
export async function sendCatchNotification(pokemonName: string, cp: number): Promise<void> {
  if (!Notifications) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Gotcha!',
        body: `${pokemonName.toUpperCase()} (CP ${cp}) was added to your Pokémon Bag!`,
        sound: true,
      },
      trigger: Platform.OS === 'android' ? { channelId: CATCH_CHANNEL_ID } : null,
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send catch notification:', error);
  }
}

/**
 * Triggers a local notification when a wild rare or uncaught Pokémon appears.
 */
export async function sendSpawnNotification(
  pokemonName: string,
  pokemonId: number,
  isNew: boolean = false,
  instanceId?: string
): Promise<void> {
  if (!Notifications) return;

  const enabled = await isNotificationsEnabled();
  if (!enabled) return;

  const title = isNew ? '🌟 New Pokémon Nearby!' : '⚡ Rare Pokémon Nearby!';
  const body = isNew
    ? `An uncaught ${pokemonName.toUpperCase()} appeared nearby! Tap to catch it!`
    : `A wild ${pokemonName.toUpperCase()} appeared nearby! Tap to catch it!`;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        data: {
          pokemonId: String(pokemonId),
          instanceId: instanceId ?? '',
        },
      },
      trigger: Platform.OS === 'android' ? { channelId: SPAWN_CHANNEL_ID } : null,
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send spawn notification:', error);
  }
}

/**
 * Subscribes to notification taps (Cold Start & Foreground/Background responses)
 * and navigates to the target catch screen.
 */
export function registerNotificationTapListener(
  onNavigateToCatch: (pokemonId: number) => void
): () => void {
  if (!Notifications) {
    return () => {};
  }

  const handleResponse = (response: any) => {
    if (!response) return;
    const actionId = response.actionIdentifier;
    if (Notifications && actionId && actionId !== Notifications.DEFAULT_ACTION_IDENTIFIER) {
      return;
    }
    const rawId = response.notification?.request?.content?.data?.pokemonId;
    if (rawId) {
      const parsedId = parseInt(String(rawId), 10);
      if (!isNaN(parsedId) && parsedId > 0) {
        onNavigateToCatch(parsedId);
      }
    }
  };

  // 1. Cold start handling
  try {
    const initialResponse = Notifications.getLastNotificationResponse();
    if (initialResponse) {
      handleResponse(initialResponse);
      Notifications.clearLastNotificationResponse();
    }
  } catch (err) {
    console.warn('[Notifications] Cold start check failed:', err);
  }

  // 2. Foreground & Background listener
  try {
    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);
    return () => subscription.remove();
  } catch (err) {
    console.warn('[Notifications] Subscription failed:', err);
    return () => {};
  }
}
