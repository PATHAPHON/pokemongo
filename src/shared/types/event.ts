export interface CampusEvent {
  id: string;
  title: string;
  description: string;
  startsAt: string; // ISO 8601
  endsAt?: string; // ISO 8601
  imageUrl?: string;
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  capacity?: number;
  registeredCount: number;
  organizer?: string;
  organizerId?: string;
  featuredPokemonId: number;
  isCustom?: boolean;
}

export type EventRegistrationStatus = 'registered' | 'attended' | 'cancelled';

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: EventRegistrationStatus;
  notes?: string;
  photoUri?: string;
  hasCaught?: boolean;
  attemptedAt?: string;
}

export type EventFilterStatus = 'all' | 'upcoming' | 'registered' | 'favorites';
