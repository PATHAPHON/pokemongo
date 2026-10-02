import {
  createContext,
  useContext,
  useState,
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
} from '@/shared/services/notifications';

interface EventContextValue {
  events: CampusEvent[];
  registrations: EventRegistration[];
  favorites: string[];
  isLoading: boolean;
  isOffline: boolean;
  lastUpdated: string | null;
  reminders: Record<string, string>; // eventId -> notificationId
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
  refreshEvents: () => Promise<void>;
  createEvent: (
    eventData: Omit<CampusEvent, 'id' | 'registeredCount'>
  ) => Promise<{ success: boolean; event?: CampusEvent; error?: string }>;
  markCatchAttempt: (eventId: string, hasCaught: boolean) => Promise<void>;
}

const EventContext = createContext<EventContextValue | undefined>(undefined);

export function EventProvider({ children }: { children: ReactNode }) {
  const { trainer } = useTrainer();
  const userId = trainer?.id || 'guest_user';

  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Record<string, string>>({});

  /**
   * Initialize events from API (with fallback to SQLite offline cache)
   * and load favorites from AsyncStorage + registrations from SQLite
   */
  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Load favorites from AsyncStorage
      const storedFavorites = await getFavoriteEventIds();
      setFavorites(storedFavorites);

      // 2. Load cached registrations from SQLite
      const storedRegs = await defaultEventRepository.getAllRegistrations();
      setRegistrations(storedRegs);
      syncRegistrationsFromStorage(storedRegs);

      // 3. Load SQLite cached events first (restores any user-created custom events)
      const cached = await defaultEventRepository.getCachedEvents();
      if (cached.events.length > 0) {
        syncEventsFromStorage(cached.events);
      }

      // 4. Try fetching latest events from network service
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
        // Fallback to SQLite cache
        if (cached.events.length > 0) {
          setEvents(cached.events);
          setLastUpdated(cached.lastUpdated);
          setIsOffline(true);
        } else {
          // If fresh install & offline, fallback to mock data
          const { CAMPUS_EVENTS } =
            await import('@/shared/constants/campus-events-data');
          setEvents(CAMPUS_EVENTS);
          setIsOffline(true);
        }
      }
    } catch (err) {
      console.error('[EventContext] Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

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
  const toggleFavorite = useCallback(async (eventId: string) => {
    const updated = await serviceToggleFavorite(eventId);
    setFavorites(updated);
  }, []);

  /**
   * Schedule local push reminder for an event
   */
  const scheduleReminder = useCallback(
    async (
      eventId: string,
      minutesBefore: number = 15
    ): Promise<{ success: boolean; error?: string }> => {
      const event = events.find((e) => e.id === eventId);
      if (!event) return { success: false, error: 'ไม่พบกิจกรรม' };

      const res = await scheduleEventReminder(
        event.id,
        event.title,
        event.startsAt,
        minutesBefore
      );

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
   * Cancel local push reminder for an event
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
    registerEvent,
    cancelUserRegistration,
    toggleFavorite,
    scheduleReminder,
    cancelReminder,
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
