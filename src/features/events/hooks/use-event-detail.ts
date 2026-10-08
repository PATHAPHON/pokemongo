import { useState, useEffect, useCallback } from 'react';
import { CampusEvent, EventRegistration } from '@/shared/types';
import { getEventById } from '@/shared/services/events';
import { useEventContext } from '@/shared/context/event-context';
import { EVENT_REMINDER_MINUTES_BEFORE } from '@/shared/services/notifications';

export function useEventDetail(eventId: string) {
  const {
    events,
    registrations,
    favorites,
    reminders,
    testReminders,
    toggleFavorite,
    scheduleReminder,
    cancelReminder,
    scheduleTestLoop,
    cancelTestLoop,
  } = useEventContext();

  const [fetchedEvent, setFetchedEvent] = useState<CampusEvent | null>(null);
  const event = events.find((e) => e.id === eventId) ?? fetchedEvent;
  const [isLoading, setIsLoading] = useState<boolean>(!event);
  const [error, setError] = useState<string | null>(null);

  const registration: EventRegistration | undefined = registrations.find(
    (r) => r.eventId === eventId && r.status !== 'cancelled'
  );
  const isRegistered = Boolean(registration);
  const hasCaught = Boolean(registration?.hasCaught);
  const hasAttended = registration?.status === 'attended';
  const isFavorite = favorites.includes(eventId);
  const hasReminder = Boolean(reminders[eventId]);
  const hasTestLoop = Boolean(testReminders[eventId]);

  const loadDetail = useCallback(() => {
    if (!eventId) return;

    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getEventById(eventId, controller.signal);
        if (cancelled) return;
        if (data) {
          setFetchedEvent(data);
        } else {
          setError('ไม่พบข้อมูลกิจกรรมนี้');
        }
      } catch (err: any) {
        if (!cancelled && err?.name !== 'AbortError') {
          setError(err?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [eventId]);

  useEffect(() => {
    if (!eventId || event) return;
    const cleanup = loadDetail();
    return cleanup;
  }, [eventId, event, loadDetail]);

  return {
    event,
    isLoading,
    error,
    isRegistered,
    registration,
    hasCaught,
    hasAttended,
    isFavorite,
    hasReminder,
    hasTestLoop,
    reload: loadDetail,
    toggleFavorite: () => toggleFavorite(eventId),
    toggleReminder: async () => {
      if (hasReminder) {
        await cancelReminder(eventId);
        return { success: true };
      } else {
        return scheduleReminder(eventId, EVENT_REMINDER_MINUTES_BEFORE);
      }
    },
    toggleTestLoop: async () => {
      if (hasTestLoop) {
        await cancelTestLoop(eventId);
        return { success: true };
      } else {
        return scheduleTestLoop(eventId);
      }
    },
  };
}
