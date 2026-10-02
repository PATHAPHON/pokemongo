# Pokémon Events + Map-Catch Plan (plan.md)

Single unified project, Events-first. Event organizers create events, players
discover -> register -> go to venue map -> catch featured + wild Pokémon.

## Current state (verified 2026-10-01, tsc clean)

- Tabs: Events (`(tabs)/index`), MyEvents (`(tabs)/pokemon`), Profile.
  Pokédex tab hidden (`href:null`, alias to index). Bag restored as `/bag` stack.
- Per-event map (`events/map.tsx`): venue pin + featured spawn + 6 wilds,
  countdown, bottom catch card -> `/catch`. Uses `buildCatchParams`,
  `formatRemainingLabel`, single `EventVenuePin` type.
- State: `EventProvider` (context) + `event-service` (in-memory) + SQLite
  (`campus_events`, `event_registrations`) + AsyncStorage favorites.
  Cache is merge (INSERT OR REPLACE). `useEventDetail` abort fixed.
- Shared: `src/shared/utils/event-helpers.ts` (date/capacity/catch),
  `src/shared/utils/routes.ts` (central routes).

## Next phase — Event Map-Catch loop

### P1 Organizer: create event with map location

- [ ] Date/time picker in `events/create.tsx` (now fixed +1h/+4h).
- [ ] Venue picker reuses `LocationPickerModal` (map feature) instead of presets.
- [ ] Featured Pokémon picker searches registry (not hardcoded 10 ids).
- [ ] Admin approve/cancel in `AdminConsoleView` (now permissions only).
- Verify: create event -> appears in list + SQLite `campus_events` with `is_custom=1`.

### P2 Player: discover -> register -> venue map -> catch

- [ ] `events/[id].tsx`: single status banner (remove duplicate green banner),
      single capacity check via `isEventFull`, catch button uses `buildCatchParams`.
- [ ] `events/map.tsx`: consume `useEventVenuePins` for multi-event view (optional),
      handle `SPAWNED/EXPIRED` messages, pass `onExpired` so pins go stale at 0s.
      Fix spawn bar `pct=remaining/60` vs 600s expiry mismatch.
- [ ] `events/register.tsx`: `getEventById` fallback for deep links,
      success routes via `Routes` constants only.
- Verify: register -> map shows featured+wilds -> tap -> `/catch` -> bag count +1.

### P3 Restore Pokémon catalog (debt from overwrite)

- [ ] Restore `features/pokedex` as `/pokedex` stack screen (not tab).
      Keep `(tabs)/pokedex` hidden alias until cutover, then delete alias.
- [ ] Global roaming map hooks stay removed; venue map remains event-scoped.
      Do not wire to tabs.
- Verify: `/pokedex` lists Gen1-3, `/bag` lists caught, no `/(tabs)/bag` pushes.

### P4 State unification (later, not now)

- SQLite-first single source, remove service-side count bump,
  unify favorites (AsyncStorage vs SQLite `is_favorite`), one Thai date formatter
  for detail long form. Do NOT do in this round (risk).

## Success criteria

1. `npx tsc --noEmit` passes.
2. `npm test` passes (needs `tsx --test` runner — see task.md).
3. No push to `/(tabs)/bag` or `/(tabs)/pokedex` for discovery.
4. Create -> register -> venue map -> catch -> bag works on Simulator + Web.
