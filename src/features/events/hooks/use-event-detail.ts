import { useState, useEffect, useCallback } from 'react';
import { CampusEvent, EventRegistration } from '@/shared/types';
import { getEventById } from '@/shared/services/events';
import { useEventContext } from '@/shared/context/event-context';

export function useEventDetail(eventId: string) {
  const {
    events,
    registrations,
    favorites,
    reminders,
    toggleFavorite,
    scheduleReminder,
    cancelReminder,
  } = useEventContext();

  const [event, setEvent] = useState<CampusEvent | null>(() => {
    return events.find((e) => e.id === eventId) ?? null;
  });
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

  const loadDetail = useCallback(() => {
    const controller = new AbortController();
    let cancelled = false;

    const run = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Prefer in-context event (single source of truth for list);
        // fall back to service fetch only when missing (deep link).
        const cached = events.find((e) => e.id === eventId);
        if (cached) {
          setEvent(cached);
          setIsLoading(false);
          return;
        }
        const data = await getEventById(eventId, controller.signal);
        if (cancelled) return;
        if (data) {
          setEvent(data);
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
  }, [eventId, events]);

  useEffect(() => {
    const cleanup = loadDetail();
    return cleanup;
  }, [loadDetail]);

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
    reload: loadDetail,
    toggleFavorite: () => toggleFavorite(eventId),
    toggleReminder: async () => {
      if (hasReminder) {
        await cancelReminder(eventId);
        return { success: true };
      } else {
        return scheduleReminder(eventId, 15);
      }
    },
  };
}
