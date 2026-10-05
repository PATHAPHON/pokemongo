import type { CampusEvent, EventRegistration } from '../../types/event';
import { CAMPUS_EVENTS } from '../../constants/campus-events-data';

// In-memory runtime state for registered events (mirrored to SQLite)
const runtimeEvents: CampusEvent[] = CAMPUS_EVENTS.map((e) => ({ ...e }));
const runtimeRegistrations: EventRegistration[] = [];

/**
 * Fetch all campus events with simulated network delay and AbortSignal support
 */
export async function getEvents(signal?: AbortSignal): Promise<CampusEvent[]> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 250);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });

  return runtimeEvents.map((e) => ({ ...e }));
}

/**
 * Fetch single campus event detail by ID
 */
export async function getEventById(
  id: string,
  signal?: AbortSignal
): Promise<CampusEvent | null> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 150);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    }
  });

  const event = runtimeEvents.find((e) => e.id === id);
  return event ? { ...event } : null;
}

/**
 * Register current user for an event with capacity & duplicate validation
 */
export async function registerForEvent(
  eventId: string,
  userId: string,
  notes?: string,
  photoUri?: string
): Promise<{
  success: boolean;
  error?: string;
  registration?: EventRegistration;
}> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const event = runtimeEvents.find((e) => e.id === eventId);
  if (!event) {
    return { success: false, error: 'ไม่พบกิจกรรมที่ต้องการลงทะเบียน' };
  }

  if (event.capacity && event.registeredCount >= event.capacity) {
    return { success: false, error: 'กิจกรรมนี้มีผู้ลงทะเบียนเต็มจำนวนแล้ว' };
  }

  const existingActive = runtimeRegistrations.find(
    (r) =>
      r.eventId === eventId && r.userId === userId && r.status !== 'cancelled'
  );
  if (existingActive) {
    return {
      success: false,
      error: 'คุณได้ลงทะเบียนเข้าร่วมกิจกรรมนี้เรียบร้อยแล้ว',
    };
  }

  const newReg: EventRegistration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    eventId,
    userId,
    registeredAt: new Date().toISOString(),
    status: 'registered',
    notes,
    photoUri,
  };

  runtimeRegistrations.push(newReg);
  event.registeredCount += 1;

  return { success: true, registration: newReg };
}

/**
 * Cancel an active registration
 */
export async function cancelRegistration(
  registrationId: string
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 250));

  const reg = runtimeRegistrations.find((r) => r.id === registrationId);
  if (!reg) {
    return { success: false, error: 'ไม่พบข้อมูลการลงทะเบียน' };
  }

  reg.status = 'cancelled';
  const event = runtimeEvents.find((e) => e.id === reg.eventId);
  if (event) {
    event.registeredCount = Math.max(0, event.registeredCount - 1);
  }

  return { success: true };
}

/**
 * Get active registrations for a specific user
 */
export async function getUserRegistrations(
  userId: string
): Promise<EventRegistration[]> {
  return runtimeRegistrations.filter(
    (r) => r.userId === userId && r.status !== 'cancelled'
  );
}

/**
 * Seed or sync runtime registrations from local SQLite storage
 */
export function syncRegistrationsFromStorage(
  savedRegistrations: EventRegistration[]
) {
  for (const reg of savedRegistrations) {
    const existingIndex = runtimeRegistrations.findIndex(
      (r) => r.id === reg.id
    );
    if (existingIndex >= 0) {
      runtimeRegistrations[existingIndex] = reg;
    } else {
      runtimeRegistrations.push(reg);
    }
  }
}

/**
 * Record a catch attempt for an event registration
 */
export async function markEventCatchAttempt(
  eventId: string,
  userId: string,
  hasCaught: boolean
): Promise<{ success: boolean; registration?: EventRegistration }> {
  const reg = runtimeRegistrations.find(
    (r) => r.eventId === eventId && r.userId === userId && r.status !== 'cancelled'
  );
  if (!reg) return { success: false };
  reg.status = 'attended';
  reg.hasCaught = reg.hasCaught || hasCaught;
  reg.attemptedAt = new Date().toISOString();
  return { success: true, registration: reg };
}

/**
 * Create a new custom campus event
 */
export async function createEvent(
  eventData: Omit<CampusEvent, 'id' | 'registeredCount'>
): Promise<{ success: boolean; event?: CampusEvent; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  if (!eventData.title?.trim()) {
    return { success: false, error: 'กรุณาระบุชื่อกิจกรรม' };
  }
  if (!eventData.location?.name?.trim()) {
    return { success: false, error: 'กรุณาระบุสถานที่จัดงาน' };
  }
  if (
    !eventData.featuredPokemonId ||
    typeof eventData.featuredPokemonId !== 'number' ||
    eventData.featuredPokemonId <= 0
  ) {
    return { success: false, error: 'กรุณาเลือกโปเกมอนประจำมีตอัป' };
  }

  const newEvent: CampusEvent = {
    ...eventData,
    id: `evt-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    registeredCount: 0,
    isCustom: true,
  };

  runtimeEvents.unshift(newEvent);
  return { success: true, event: newEvent };
}

/**
 * Sync custom/cached events loaded from local SQLite storage
 */
export function syncEventsFromStorage(savedEvents: CampusEvent[]) {
  for (const ev of savedEvents) {
    const existingIndex = runtimeEvents.findIndex((e) => e.id === ev.id);
    if (existingIndex >= 0) {
      runtimeEvents[existingIndex] = ev;
    } else {
      runtimeEvents.unshift(ev);
    }
  }
}
