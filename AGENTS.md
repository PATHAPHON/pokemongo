# Project Rules & Agent Instructions (AGENTS.md)

## 1. Project Documentation & Skills (Always Loaded & Referenced)

### 1.1 Always Loaded Skills & Guidelines

Always load and follow the instructions from these 3 skills

- **Caveman Mode:** [.agents/skills/caveman/SKILL.md]
- **Karpathy Guidelines:** [.agents/skills/karpathy-guidelines/SKILL.md]
- **Pokémon GO Domain:** [.agents/skills/pokemon-go/SKILL.md]

### 1.2 Project Documentation References (On-Demand)

Single unified project (Events-first). Read docs in this order, never guess:

- **Progress Tracker (source of truth for status):** [task.md]
- **Event Map-Catch Roadmap (next phase plan):** [plan.md]
- **Design System + Screen Specs:** [design.md]
- **Architecture Overview:** [README.md]
- **ADRs:** [docs/adr/README.md] (ADR-001 navigation, ADR-007 campus-events)

### 1.3 Unified Structure (Events-first, verified 2026-10-01)

```
src/app/
  (tabs)/index.tsx      # Events list (home)
  (tabs)/pokemon.tsx    # MyEvents (registered/favorites)
  (tabs)/profile.tsx    # Profile wrapper -> ProfileView
  (tabs)/pokedex.tsx    # hidden legacy alias (href:null), do NOT push here
  bag.tsx               # Caught Pokémon bag (stack, from Profile menu)
  events/[id].tsx       # Event detail
  events/register.tsx   # Event registration form
  events/create.tsx     # Event creation form
  events/map.tsx        # Event venue map + catch (Map lives ONLY here)
  pokemon/[id].tsx      # Pokémon detail
  catch.tsx             # AR catch modal
  profile/admin.tsx     # Admin console (stack)
src/features/events/   # Events domain (cards, hooks useEvents/useEventDetail/useEventActions)
src/features/map/       # Leaflet map + spawn-engine (per-event use only)
src/features/pokemon/  # Bag cards, detail hero (used by bag.tsx + pokemon/[id].tsx)
src/features/pokedex/   # ORPHANED catalog (usePokedex unused) — restore as /pokedex stack next phase
src/shared/utils/       # event-helpers.ts (date/capacity/catch/routes) — use these, no local copies
```

Rules:

- Push discovery -> `/(tabs)`, never `/(tabs)/pokedex` (hidden alias).
- Push bag -> `/bag`, never `/(tabs)/bag` (does not exist).
- Catch params -> `buildCatchParams()` from `@/shared/utils/event-helpers`.
- Date/capacity -> `formatEventDateThai/formatEventTimeThai/isEventFull` from same file.
- No `.ts` extension in imports (Metro + tsc). Use `@/` alias.
- `saveEventsToCache` is merge (INSERT OR REPLACE), never DELETE-all.
