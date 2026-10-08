import {
  createContext,
  useContext,
  useState,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { CampusEvent, EventRegistration } from '@/shared/types';
import {
  getEvents,
  createEvent as serviceCreateEvent,
  registerForEvent as serviceRegister,
  cancelRegistration as serviceCancel,
  syncRegistrationsFromStorage,
  syncEventsFromStorage,
  markEventCatchAttempt as serviceMarkCatchAttempt,
} from '@/shared/services/events';
import {
  getFavoriteEventIds,
  toggleFavoriteEvent as serviceToggleFavorite,
} from '@/shared/services/event-favorites';
import { defaultEventRepository } from '@/shared/services/database';
import { useTrainer } from '@/shared/context/trainer-context';
import {
  scheduleEventReminder,
  cancelEventReminder,
  scheduleEventTestLoop,
  cancelEventTestLoop,
  cancelAllNotifications,
  getScheduledReminders,
  EVENT_REMINDER_MINUTES_BEFORE,
} from '@/shared/services/notifications';

interface EventContextValue {
  events: CampusEvent[];
  registrations: EventRegistration[];
  favorites: string[];
  isLoading: boolean;
  isOffline: boolean;
  lastUpdated: string | null;
  reminders: Record<string, string>; // eventId -> notificationId (30-min DATE)
  testReminders: Record<string, string>; // eventId -> test loop notificationId (10s)
  registerEvent: (
    eventId: string,
    notes?: string,
    photoUri?: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelUserRegistration: (
    registrationId: string
  ) => Promise<{ success: boolean; error?: string }>;
  toggleFavorite: (eventId: string) => Promise<void>;
  scheduleReminder: (
    eventId: string,
    minutesBefore?: number
  ) => Promise<{ success: boolean; error?: string }>;
  cancelReminder: (eventId: string) => Promise<void>;
  scheduleTestLoop: (
    eventId: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelTestLoop: (eventId: string) => Promise<void>;
  clearReminders: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  createEvent: (
    eventData: Omit<CampusEvent, 'id' | 'registeredCount'>
  ) => Promise<{ success: boolean; event?: CampusEvent; error?: string }>;
  markCatchAttempt: (eventId: string, hasCaught: boolean) => Promise<void>;
}

export type FavoriteAction =
  | { type: 'SET_FAVORITES'; payload: string[] }
  | { type: 'TOGGLE_FAVORITE'; payload: string };

export function favoriteReducer(
  state: string[],
  action: FavoriteAction
): string[] {
  switch (action.type) {
    case 'SET_FAVORITES':
      return Array.isArray(action.payload) ? [...action.payload] : [];
    case 'TOGGLE_FAVORITE':
      return state.includes(action.payload)
        ? state.filter((id) => id !== action.payload)
        : [...state, action.payload];
    default:
      return state;
  }
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const { trainer, isAuthenticated } = useTrainer();
  const userId = trainer?.id || 'guest_user';

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [favorites, dispatchFavorites] = useReducer(favoriteReducer, []);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, string>>({});
  const [testReminders, setTestReminders] = useState<Record<string, string>>(
    {}
  );

  /**
   * Initialize events from API (with fallback to SQLite offline cache)
   * and load favorites from AsyncStorage + registrations from SQLite.
   * Stale-While-Revalidate: renders SQLite cache immediately, then revalidates over network.
   */
  const loadInitialData = useCallback(async () => {
    try {
      const currentUserId = isAuthenticated ? trainer?.id : undefined;
      // 1. Load favorites from AsyncStorage
      const storedFavorites = await getFavoriteEventIds(currentUserId);
      dispatchFavorites({ type: 'SET_FAVORITES', payload: storedFavorites });

      // 2. Load cached registrations from SQLite
      const storedRegs = await defaultEventRepository.getAllRegistrations(currentUserId);
      setRegistrations(storedRegs);
      syncRegistrationsFromStorage(storedRegs);

      // 3. Stale-While-Revalidate: display cached events immediately if available
      const cached = await defaultEventRepository.getCachedEvents();
      if (cached.events.length > 0) {
        syncEventsFromStorage(cached.events);
        setEvents(cached.events);
        setLastUpdated(cached.lastUpdated);
        setIsLoading(false);
      }

      // 4. Try fetching latest events from network service (revalidate)
      try {
        const remoteEvents = await getEvents();
        setEvents(remoteEvents);
        setIsOffline(false);
        const now = new Date().toISOString();
        setLastUpdated(now);

        // Cache to local SQLite for offline resilience
        await defaultEventRepository.saveEventsToCache(remoteEvents);
      } catch (networkErr) {
        console.warn(
          '[EventContext] Remote fetch failed, falling back to SQLite cache:',
          networkErr
        );
        // Fallback to SQLite cache or mock data
        if (cached.events.length > 0) {
          setEvents(cached.events);
          setLastUpdated(cached.lastUpdated);
          setIsOffline(true);
        } else {
          const { CAMPUS_EVENTS } =
            await import('@/shared/constants/campus-events-data');
          setEvents(CAMPUS_EVENTS);
          setIsOffline(true);
        }
      }

      // 5. Recover scheduled reminders from OS notification queue
      try {
        const scheduled = await getScheduledReminders();
        setReminders(scheduled.reminders);
        setTestReminders(scheduled.testReminders);
      } catch (notifErr) {
        console.warn(
          '[EventContext] Failed to recover scheduled reminders:',
          notifErr
        );
      }
    } catch (err) {
      console.error('[EventContext] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, trainer?.id]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Clear reminder, favorites and registration state whenever session is unauthenticated / logged out
  useEffect(() => {
    if (!isAuthenticated || !trainer?.id) {
      setReminders({});
      setTestReminders({});
      setRegistrations([]);
      dispatchFavorites({ type: 'SET_FAVORITES', payload: [] });
    } else {
      defaultEventRepository
        .getAllRegistrations(trainer.id)
        .then((storedRegs) => {
          setRegistrations(storedRegs);
          syncRegistrationsFromStorage(storedRegs);
        })
        .catch(() => {});

      getFavoriteEventIds(trainer.id)
        .then((favs) => {
          dispatchFavorites({ type: 'SET_FAVORITES', payload: favs });
        })
        .catch(() => {});
    }
  }, [isAuthenticated, trainer?.id]);

  /**
   * Refresh events on pull-to-refresh
   */
  const refreshEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const remoteEvents = await getEvents();
      setEvents(remoteEvents);
      setIsOffline(false);
      const now = new Date().toISOString();
      setLastUpdated(now);
      await defaultEventRepository.saveEventsToCache(remoteEvents);
    } catch (err) {
      console.warn('[EventContext] Refresh failed, using cache:', err);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register for an event
   */
  const registerEvent = useCallback(
    async (
      eventId: string,
      notes?: string,
      photoUri?: string
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await serviceRegister(eventId, userId, notes, photoUri);
      if (res.success && res.registration) {
        // Persist to SQLite
        await defaultEventRepository.insertRegistration(res.registration);
        setRegistrations((prev) => [res.registration!, ...prev]);

        // Update local event registered count
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, registeredCount: e.registeredCount + 1 }
              : e
          )
        );
        return { success: true };
      }
      return { success: false, error: res.error || 'ลงทะเบียนไม่สำเร็จ' };
    },
    [userId]
  );

  /**
   * Cancel an event registration
   */
  const cancelUserRegistration = useCallback(
    async (
      registrationId: string
    ): Promise<{ success: boolean; error?: string }> => {
      const res = await serviceCancel(registrationId);
      if (res.success) {
        await defaultEventRepository.updateRegistrationStatus(
          registrationId,
          'cancelled'
        );
        setRegistrations((prev) =>
          prev.map((r) =>
            r.id === registrationId ? { ...r, status: 'cancelled' } : r
          )
        );

        const target = registrations.find((r) => r.id === registrationId);
        if (target) {
          setEvents((prev) =>
            prev.map((e) =>
              e.id === target.eventId
                ? {
                    ...e,
                    registeredCount: Math.max(0, e.registeredCount - 1),
                  }
                : e
            )
          );
        }
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'ยกเลิกการลงทะเบียนไม่สำเร็จ',
      };
    },
    [registrations]
  );

  /**
   * Toggle favorite in state & AsyncStorage
   */
  const toggleFavorite = useCallback(
    async (eventId: string) => {
      const activeUserId = isAuthenticated ? trainer?.id : undefined;
      dispatchFavorites({ type: 'TOGGLE_FAVORITE', payload: eventId });
      const updated = await serviceToggleFavorite(eventId, activeUserId);
      dispatchFavorites({ type: 'SET_FAVORITES', payload: updated });
    },
    [isAuthenticated, trainer?.id]
  );

  /**
   * Schedule fixed 30-min DATE reminder for an event
   */
  const scheduleReminder = useCallback(
    async (
      eventId: string,
      minutesBefore: number = EVENT_REMINDER_MINUTES_BEFORE
    ): Promise<{ success: boolean; error?: string }> => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return { success: false, error: 'ไม่พบกิจกรรม' };

      const res = await scheduleEventReminder(event, minutesBefore);

      if (res.success && res.id) {
        setReminders((prev) => ({ ...prev, [eventId]: res.id! }));
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'ตั้งการแจ้งเตือนไม่สำเร็จ',
      };
    },
    [events]
  );

  /**
   * Cancel fixed reminder for an event
   */
  const cancelReminder = useCallback(
    async (eventId: string) => {
      const notifId = reminders[eventId];
      if (notifId) {
        await cancelEventReminder(notifId);
        setReminders((prev) => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
      }
    },
    [reminders]
  );

  /**
   * Test loop for far-away meetups: repeats every 10s, toggleable.
   */
  const scheduleTestLoop = useCallback(
    async (eventId: string): Promise<{ success: boolean; error?: string }> => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return { success: false, error: 'ไม่พบกิจกรรม' };

      const res = await scheduleEventTestLoop(
        event,
        EVENT_REMINDER_MINUTES_BEFORE
      );
      if (res.success && res.id) {
        setTestReminders((prev) => ({ ...prev, [eventId]: res.id! }));
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'ตั้งการแจ้งเตือนทดสอบไม่สำเร็จ',
      };
    },
    [events]
  );

  const cancelTestLoop = useCallback(
    async (eventId: string) => {
      const notifId = testReminders[eventId];
      if (notifId) {
        await cancelEventTestLoop(notifId);
        setTestReminders((prev) => {
          const next = { ...prev };
          delete next[eventId];
          return next;
        });
      }
    },
    [testReminders]
  );

  /**
   * Clears all reminders from OS and local state
   */
  const clearReminders = useCallback(async () => {
    try {
      await cancelAllNotifications();
    } catch (err) {
      console.warn('[EventContext] Failed to cancel all notifications:', err);
    }
    setReminders({});
    setTestReminders({});
  }, []);

  /**
   * Create a new campus event (Organizer mode)
   */
  const createEvent = useCallback(
    async (
      eventData: Omit<CampusEvent, 'id' | 'registeredCount'>
    ): Promise<{ success: boolean; event?: CampusEvent; error?: string }> => {
      const dataWithOrganizer = {
        ...eventData,
        organizer: eventData.organizer || trainer?.name || 'เทรนเนอร์นิสิต',
        organizerId: trainer?.id || userId,
      };

      const res = await serviceCreateEvent(dataWithOrganizer);
      if (res.success && res.event) {
        await defaultEventRepository.insertEvent(res.event);
        setEvents((prev) => [res.event!, ...prev]);
        return { success: true, event: res.event };
      }
      return { success: false, error: res.error || 'ไม่สามารถสร้างกิจกรรมได้' };
    },
    [trainer, userId]
  );

  /**
   * Record catch attempt for an event
   */
  const markCatchAttempt = useCallback(
    async (eventId: string, hasCaught: boolean) => {
      try {
        await defaultEventRepository.markCatchAttempt(eventId, userId, hasCaught);
        await serviceMarkCatchAttempt(eventId, userId, hasCaught);
        const now = new Date().toISOString();
        setRegistrations((prev) =>
          prev.map((r) =>
            r.eventId === eventId && r.userId === userId
              ? {
                  ...r,
                  status: 'attended',
                  hasCaught: hasCaught || Boolean(r.hasCaught),
                  attemptedAt: now,
                }
              : r
          )
        );
      } catch (err) {
        console.error('[EventContext] Failed to mark catch attempt:', err);
      }
    },
    [userId]
  );

  const value: EventContextValue = {
    events,
    registrations,
    favorites,
    isLoading,
    isOffline,
    lastUpdated,
    reminders,
    testReminders,
    registerEvent,
    cancelUserRegistration,
    toggleFavorite,
    scheduleReminder,
    cancelReminder,
    scheduleTestLoop,
    cancelTestLoop,
    clearReminders,
    refreshEvents,
    createEvent,
    markCatchAttempt,
  };

  return (
    <EventContext.Provider value={value}>{children}</EventContext.Provider>
  );
}

export function useEventContext(): EventContextValue {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
}

export const useEventsContext = useEventContext;

export function useFavorites() {
  const { favorites, toggleFavorite } = useEventContext();
  return {
    favorites,
    isFavorite: (id: string) => favorites.includes(id),
    toggleFavorite,
    favoriteCount: favorites.length,
  };
}
