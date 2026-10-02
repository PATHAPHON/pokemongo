/**
 * Central route table — single unified project (Events-first).
 * Tabs: index=Events, pokemon=MyEvents, profile=Profile, pokedex=hidden legacy.
 * Map lives only inside event venue (events/map). Bag restored as stack /bag.
 */
export const Routes = {
  tabsHome: '/(tabs)',
  tabsEvents: '/(tabs)',
  tabsMyEvents: '/(tabs)/pokemon',
  tabsProfile: '/(tabs)/profile',
  tabsPokedex: '/(tabs)/pokedex' as const,
  bag: '/bag',
  catch: '/catch' as const,
  pokedexEntry: (id: number | string) => `/pokemon/${id}`,
  eventDetail: (id: string) => `/events/${id}`,
  eventRegister: (id: string) => ({
    pathname: '/events/register',
    params: { id },
  }),
  eventMap: (id: string) => ({ pathname: '/events/map', params: { id } }),
  admin: '/profile/admin',
} as const;
