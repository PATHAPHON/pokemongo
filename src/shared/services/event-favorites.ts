import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'campus_event_favorites';

let writeQueue: Promise<unknown> = Promise.resolve();

/**
 * Safely parse favorites JSON from AsyncStorage, falling back to empty array
 */
export function safeParseFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === 'string')
      : [];
  } catch {
    return [];
  }
}

function getFavoritesStorageKey(userId?: string): string {
  return userId ? `campus_event_favorites_${userId}` : FAVORITES_KEY;
}

/**
 * Retrieve list of favorite event IDs from AsyncStorage
 */
export async function getFavoriteEventIds(userId?: string): Promise<string[]> {
  try {
    const key = getFavoritesStorageKey(userId);
    const raw = await AsyncStorage.getItem(key);
    return safeParseFavorites(raw);
  } catch (error) {
    console.warn('[EventFavorites] Failed to read favorites from AsyncStorage:', error);
    return [];
  }
}

/**
 * Toggle favorite status for an event ID and persist
 */
export async function toggleFavoriteEvent(
  eventId: string,
  userId?: string
): Promise<string[]> {
  const operation = async (): Promise<string[]> => {
    try {
      const key = getFavoritesStorageKey(userId);
      const current = await getFavoriteEventIds(userId);
      let updated: string[];
      if (current.includes(eventId)) {
        updated = current.filter((id) => id !== eventId);
      } else {
        updated = [...current, eventId];
      }
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.warn('[EventFavorites] Failed to toggle favorite:', error);
      return [];
    }
  };

  const next = writeQueue.then(operation, operation);
  writeQueue = next;
  return next;
}
