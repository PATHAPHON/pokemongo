import { useState, useMemo } from 'react';
import { useEventContext } from '@/shared/context/event-context';
import {
  EventCategoryFilter,
  EventStatusFilter,
  EventStats,
} from '../types';
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
  const [categoryFilter, setCategoryFilter] =
    useState<EventCategoryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');

  const registeredEventIds = useMemo(() => {
    return new Set(
      registrations
        .filter((r) => r.status === 'registered' || r.status === 'attended')
        .map((r) => r.eventId)
    );
  }, [registrations]);

  const favoritesSet = useMemo(() => new Set(favorites), [favorites]);

  // Overall statistics
  const stats: EventStats = useMemo(() => {
    const total = events.length;
    const nowMs = Date.now();
    const upcoming = events.filter(
      (e) => new Date(e.startsAt).getTime() >= nowMs
    ).length;
    const registered = registeredEventIds.size;
    const favCount = favorites.length;

    return {
      total,
      upcoming,
      registered,
      favorites: favCount,
    };
  }, [events, registeredEventIds, favorites]);

  // Filtered event list
  const filteredEvents: CampusEvent[] = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const nowMs = Date.now();

    return events.filter((event) => {
      // 1. Category filter
      if (categoryFilter !== 'all' && event.category !== categoryFilter) {
        return false;
      }

      // 2. Status filter
      if (statusFilter === 'registered') {
        if (!registeredEventIds.has(event.id)) return false;
      } else if (statusFilter === 'favorites') {
        if (!favoritesSet.has(event.id)) return false;
      } else if (statusFilter === 'upcoming') {
        if (new Date(event.startsAt).getTime() < nowMs) return false;
      }

      // 3. Search query filter (matches title, description, location name, or organizer)
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
    categoryFilter,
    statusFilter,
    searchQuery,
    registeredEventIds,
    favoritesSet,
  ]);

  return {
    events: filteredEvents,
    allEvents: events,
    stats,
    isLoading,
    isOffline,
    lastUpdated,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    registeredEventIds,
    favoritesSet,
    refreshEvents,
    toggleFavorite,
  };
}
