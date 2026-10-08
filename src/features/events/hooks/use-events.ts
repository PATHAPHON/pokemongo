import { useState, useMemo } from 'react';
import { useEventContext } from '@/shared/context/event-context';
import { EventStatusFilter } from '../types';
import { CampusEvent } from '@/shared/types';

export function useEvents() {
  const {
    events,
    registrations,
    favorites,
    isLoading,
    isOffline,
    lastUpdated,
    refreshEvents,
    toggleFavorite,
  } = useEventContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');

  const registeredEventIds = useMemo(() => {
    return new Set(
      registrations
        .filter((r) => r.status === 'registered' || r.status === 'attended')
        .map((r) => r.eventId)
    );
  }, [registrations]);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  const [nowMs] = useState(() => Date.now());

  // Filtered event list
  const filteredEvents: CampusEvent[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      // Hide registered events from Meetups list (they live in 'ของฉัน' tab)
      if (registeredEventIds.has(event.id)) {
        return false;
      }

      // 1. Status filter
      if (statusFilter === 'favorites') {
        if (!favoritesSet.has(event.id)) return false;
      } else if (statusFilter === 'upcoming') {
        if (new Date(event.startsAt).getTime() < nowMs) return false;
      }

      // 2. Search query filter (matches title, description, location name, or organizer)
      if (query.length > 0) {
        const matchesTitle = event.title.toLowerCase().includes(query);
        const matchesDesc = event.description.toLowerCase().includes(query);
        const matchesLoc = event.location.name.toLowerCase().includes(query);
        const matchesOrg = event.organizer?.toLowerCase().includes(query) ?? false;

        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesOrg) {
          return false;
        }
      }

      return true;
    });
  }, [
    events,
    statusFilter,
    searchQuery,
    registeredEventIds,
    favoritesSet,
    nowMs,
  ]);

  return {
    events: filteredEvents,
    isLoading,
    isOffline,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    registeredEventIds,
    favoritesSet,
    refreshEvents,
    toggleFavorite,
  };
}
