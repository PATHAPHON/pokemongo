import type { EventCategory } from '@/shared/types';

// Canonical filter types live in @/shared/types/event.ts.
// These aliases stay for backward compat with existing imports.
export type { EventFilterCategory as EventCategoryFilter } from '@/shared/types';
export type { EventFilterStatus as EventStatusFilter } from '@/shared/types';

export interface EventStats {
  total: number;
  upcoming: number;
  registered: number;
  favorites: number;
}

export type { EventCategory };
