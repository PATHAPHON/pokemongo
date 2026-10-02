# ADR-007: Campus + Pokémon Unification (Events-first)

## Status
Accepted (2026-10-01)

## Context
Campus event code อยู่ใน untracked files ส่วน pokemon tabs (Map/Pokédex/Bag) โดน overwrite
เป็น Events/MyEvents เกิด route พัง (`/(tabs)/bag` ไม่มีไฟล์, `/(tabs)/pokedex` alias ซ่อน),
import `.ts` ผสม `@/` กับ relative, date/capacity/catch logic ซ้ำ 4 จุด, cache DELETE-all
เสี่ยงลบ custom events

## Decision
Events-first โปรเจกต์เดียว:
- Tabs: Events (`(tabs)/index`), MyEvents (`(tabs)/pokemon`), Profile.
  `(tabs)/pokedex` คง hidden alias ชั่วคราว ห้าม push discovery ที่นี่.
- Map อยู่แค่ `events/map.tsx` (venue pin + featured + 6 wilds -> `/catch`).
- Bag ฟื้นเป็น `/bag` stack จาก Profile menu.
- Shared `src/shared/utils/event-helpers.ts` (format/isEventFull/buildCatchParams)
  + `routes.ts` ห้ามเขียน local copy.
- Import ห้าม `.ts` extension ใช้ `@/` alias.
- `EventRepository.saveEventsToCache` เป็น merge (INSERT OR REPLACE).
- `features/events/types.ts` re-export canonical จาก `@/shared/types`.
- `useEventDetail` abort ถูกต้อง ไม่ refetch loop.

## Consequences
- `tsc --noEmit` ผ่าน, route พังหาย, custom events ไม่หายหลัง refresh.
- Debt คงเหลือ: `features/pokedex` orphaned (-> `/pokedex` stack P3),
  global map hooks dead, favorites 2 ระบบ, test ต้องใช้ `tsx --test` (ดู plan.md/task.md).
