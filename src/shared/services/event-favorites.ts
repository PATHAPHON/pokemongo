import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'campus_event_favorites';

/**
 * Retrieve list of favorite event IDs from AsyncStorage
 */
export async function getFavoriteEventIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[EventFavorites] Failed to read favorites from AsyncStorage:', error);
    return [];
  }
}

/**
 * Toggle favorite status for an event ID and persist
 */
export async function toggleFavoriteEvent(eventId: string): Promise<string[]> {
  try {
    const current = await getFavoriteEventIds();
    let updated: string[];
    if (current.includes(eventId)) {
      updated = current.filter((id) => id !== eventId);
    } else {
      updated = [...current, eventId];
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.warn('[EventFavorites] Failed to toggle favorite:', error);
    return [];
  }
}
