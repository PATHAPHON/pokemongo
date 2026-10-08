import type { CampusEvent } from '../../types/event';
import { getEvents, getEventById } from './event-service';

/**
 * Runtime type guard for validating whether an unknown value conforms to CampusEvent
 */
export function isCampusEvent(value: unknown): value is CampusEvent {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  // Required string properties
  if (
    typeof candidate.id !== 'string' ||
    candidate.id.trim() === '' ||
    typeof candidate.title !== 'string' ||
    candidate.title.trim() === '' ||
    typeof candidate.description !== 'string' ||
    typeof candidate.startsAt !== 'string' ||
    isNaN(Date.parse(candidate.startsAt))
  ) {
    return false;
  }

  // Location object validation
  if (
    typeof candidate.location !== 'object' ||
    candidate.location === null ||
    Array.isArray(candidate.location)
  ) {
    return false;
  }

  const loc = candidate.location as Record<string, unknown>;
  if (
    typeof loc.name !== 'string' ||
    loc.name.trim() === '' ||
    typeof loc.latitude !== 'number' ||
    isNaN(loc.latitude) ||
    typeof loc.longitude !== 'number' ||
    isNaN(loc.longitude)
  ) {
    return false;
  }

  // Numeric count and Pokemon ID
  if (
    typeof candidate.registeredCount !== 'number' ||
    isNaN(candidate.registeredCount) ||
    candidate.registeredCount < 0 ||
    typeof candidate.featuredPokemonId !== 'number' ||
    isNaN(candidate.featuredPokemonId) ||
    candidate.featuredPokemonId <= 0
  ) {
    return false;
  }

  // Optional string / number / boolean fields
  if (candidate.endsAt !== undefined && typeof candidate.endsAt !== 'string') {
    return false;
  }
  if (candidate.imageUrl !== undefined && typeof candidate.imageUrl !== 'string') {
    return false;
  }
  if (
    candidate.capacity !== undefined &&
    (typeof candidate.capacity !== 'number' ||
      isNaN(candidate.capacity) ||
      candidate.capacity < 0)
  ) {
    return false;
  }
  if (candidate.organizer !== undefined && typeof candidate.organizer !== 'string') {
    return false;
  }
  if (candidate.organizerId !== undefined && typeof candidate.organizerId !== 'string') {
    return false;
  }
  if (candidate.isCustom !== undefined && typeof candidate.isCustom !== 'boolean') {
    return false;
  }

  return true;
}

/**
 * Runtime parser for validating and extracting an array of CampusEvent objects
 */
export function parseEvents(data: unknown): CampusEvent[] {
  let list: unknown[];

  if (Array.isArray(data)) {
    list = data;
  } else if (
    data &&
    typeof data === 'object' &&
    'events' in data &&
    Array.isArray((data as { events: unknown }).events)
  ) {
    list = (data as { events: unknown[] }).events;
  } else if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray((data as { data: unknown }).data)
  ) {
    list = (data as { data: unknown[] }).data;
  } else {
    throw new Error('Malformed events payload: expected an array or events collection');
  }

  const validEvents: CampusEvent[] = [];
  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    if (!isCampusEvent(item)) {
      throw new Error(`Malformed event at index ${i}: invalid CampusEvent structure`);
    }
    validEvents.push(item);
  }

  return validEvents;
}

/**
 * Fetch events from REST API or fallback to local in-memory/mock events
 */
export async function getEventsApi(signal?: AbortSignal): Promise<CampusEvent[]> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!baseUrl) {
    return getEvents(signal);
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const url = normalizedBase.endsWith('/events')
    ? normalizedBase
    : `${normalizedBase}/events`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    const statusText =
      response.statusText ||
      (response.status === 404
        ? 'Not Found'
        : response.status >= 500
          ? 'Internal Server Error'
          : 'Request failed');

    throw new Error(`Events API HTTP error: ${response.status} (${statusText})`);
  }

  const rawData: unknown = await response.json();
  return parseEvents(rawData);
}

/**
 * Fetch a single event by ID from REST API or fallback to local event service
 */
export async function getEventByIdApi(
  id: string,
  signal?: AbortSignal
): Promise<CampusEvent | null> {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

  if (!baseUrl) {
    return getEventById(id, signal);
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const normalizedBase = baseUrl.replace(/\/+$/, '');
  const url = normalizedBase.endsWith('/events')
    ? `${normalizedBase}/${encodeURIComponent(id)}`
    : `${normalizedBase}/events/${encodeURIComponent(id)}`;

  const response = await fetch(url, { signal });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const statusText =
      response.statusText ||
      (response.status >= 500 ? 'Internal Server Error' : 'Request failed');
    throw new Error(`Events API HTTP error: ${response.status} (${statusText})`);
  }

  const rawData: unknown = await response.json();
  const rawItem =
    rawData && typeof rawData === 'object' && 'event' in rawData
      ? (rawData as { event: unknown }).event
      : rawData;

  if (!isCampusEvent(rawItem)) {
    throw new Error(`Malformed event payload for event ${id}`);
  }

  return rawItem;
}
