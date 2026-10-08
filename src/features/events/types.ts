export type {
  CampusEvent,
  EventRegistration,
  EventRegistrationStatus,
  EventFilterStatus,
  EventFilterStatus as EventStatusFilter,
} from '@/shared/types';
export type { EventCardProps } from './components/event-card';

export interface EventStats {
  total: number;
  upcoming: number;
  registered: number;
  favorites: number;
}
