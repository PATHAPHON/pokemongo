/**
 * Central route table — single unified project (Events-first).
 * Tabs: index=Events, pokemon=MyEvents, profile=Profile, pokedex=hidden legacy.
 * Map lives only inside event venue (events/map). Bag restored as stack /bag.
 */
export const Routes = {
  tabsEvents: '/(tabs)',
  tabsMyEvents: '/(tabs)/pokemon',
  tabsProfile: '/(tabs)/profile',
  bag: '/bag',
  catch: '/catch' as const,
  pokemonDetail: (id: number | string) => `/pokemon/${id}`,
  eventDetail: (id: string) => `/events/${id}`,
  eventRegister: (id: string) => ({
    pathname: '/events/register',
    params: { id },
  }),
  eventMap: (id: string) => ({ pathname: '/events/map', params: { id } }),
  eventPickLocation: (lat?: number | string, lng?: number | string) => ({
    pathname: '/events/pick-location',
    params: {
      ...(lat !== undefined ? { lat: String(lat) } : {}),
      ...(lng !== undefined ? { lng: String(lng) } : {}),
    },
  }),
  admin: '/profile/admin',
} as const;
