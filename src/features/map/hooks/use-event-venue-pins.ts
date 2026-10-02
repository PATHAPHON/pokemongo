import type { EventCategory } from '@/shared/types';

export interface EventVenuePin {
  id: string;
  title: string;
  category: EventCategory;
  categoryColor: string;
  latitude: number;
  longitude: number;
  venueName: string;
  featuredPokemonId?: number;
}
