# Pokémon GO - Task Breakdown & Progress Tracker (task.md)

เอกสารภาพรวมความคืบหน้าของโครงการ **Pokémon GO Mobile App** (11 สัปดาห์ + Campus Events Phase)
งานทั้งหมดถูกแจกแจงออกเป็น **35 Micro-Tasks** ตามหลักสูตร React Native + Expo (11 สัปดาห์) ครอบคลุม Core UI, API, SQLite Offline, Map Spawning, AR Camera Dual-mode, Haptics และ Notifications

---

## สรุปสถานะภาพรวม (Milestones Overview)

| Milestone | สถาปัตยกรรม (Layer)                            |     สัปดาห์      | จำนวน Tasks  |     ความคืบหน้า     |
| --------- | ---------------------------------------------- | :--------------: | :----------: | :-----------------: |
| **M1**    | Project Setup, Types & Design Tokens           |      W1, W3      |   4 Tasks    |    4/4 (100%) ✅    |
| **M2**    | Data Layer, Services & State Management        |   W5, 6, 7, 8    |   5 Tasks    |    5/5 (100%) ✅    |
| **M3**    | Core UI Design System & Atomic Components      |     W2, 3, 5     |   7 Tasks    |    7/7 (100%) ✅    |
| **M4**    | Navigation Architecture & Tab Shell            |        W4        |   6 Tasks    |    6/6 (100%) ✅    |
| **M5**    | Gameplay Mechanics, Spawning & Maps            |       W10        |   3 Tasks    |    3/3 (100%) ✅    |
| **M6**    | Hardware Integration, AR Catch & Notifications |     W9, W11      |   10 Tasks   |   10/10 (100%) ✅   |
| **รวม**   | **ทั้งหมด**                                    | **Weeks 1 - 11** | **35 Tasks** | **35/35 (100%)** 🎉 |

---

## Campus Events Unification (Events-first, 2026-10-01)

โปรเจกต์เดียวรวม campus + pokemon แล้ว (tabs: Events/MyEvents/Profile, Map อยู่แค่ใน event venue):

- [x] `TASK-36` Normalize imports (strip `.ts`, ใช้ `@/` alias) + `tsc` clean
- [x] `TASK-37` Shared helpers `src/shared/utils/event-helpers.ts` (date/capacity/catch) + `routes.ts`
- [x] `TASK-38` Fix `useEventDetail` abort + dep loop, `EventVenuePin.category` type
- [x] `TASK-39` Fix navigation: `/bag` stack restore, `/(tabs)` discovery, `buildCatchParams` ใน venue map
- [x] `TASK-40` `EventRepository.saveEventsToCache` merge (INSERT OR REPLACE) กัน custom event หาย
- [x] `TASK-41` Deduplicate `features/events/types.ts` re-export canonical + `isEventFull` ใน EventCard
- [x] `TASK-46` Refactor single-event catch flow: Scan-to-spawn, 1-time catch limit, auto-exit to event detail, dead code removal (`useMapSpawns`, `useSpawnNotifications`, `MapControls`, `NotificationPermissionModal`, `LocationPickerModal`, `use-user-location`, `StatBar`, `PokeballButton`)
- [x] `TASK-42` Test runner `tsx --test` and test fixes (ESM `.ts` import paths in `campus-events.test.mjs`, removed obsolete tests in `web-platform-guard.test.mjs`)
- [ ] `TASK-43` P1 Organizer: date picker + venue picker + registry search + admin approve (ดู plan.md)
- [ ] `TASK-44` P2 Venue map: `SPAWNED/EXPIRED` handler + `onExpired` + spawn bar 600s fix
- [x] `TASK-45` Restore Pokédex tab in `(tabs)/pokedex.tsx` with full Gen1-3 catalog, search, and filters

---

## สารบัญไฟล์ Task ทั้ง 30 รายการ

### Milestone 1: Project Setup, Types & Design Tokens (Weeks 1 & 3)

- [x] `TASK-01` [Week 1] โครงสร้างโฟลเดอร์โปรเจกต์และเคลียร์ Template เริ่มต้น
- [x] `TASK-02` [Week 1] การตั้งค่า Expo SDK 57, Assets และ Splash Screen
- [x] `TASK-03` [Week 1, 2] Pokémon & Trainer TypeScript Types
- [x] `TASK-04` [Week 3] Color System (18 ธาตุ) และ Theme Constants

### Milestone 2: Data Layer, Services & State Management (Weeks 5, 6, 7, 8)

- [x] `TASK-05` [Week 6] PokéAPI Service (Kanto 151 + Official Artwork)
- [x] `TASK-06` [Week 6] Custom Hooks สำหรับดึงข้อมูล Pokémon (`usePokemons`, `usePokemonDetail`)
- [x] `TASK-07` [Week 7] SQLite Database Persistence Service (`expo-sqlite`: caught_pokemon, inventory, trainer)
- [x] `TASK-08` [Week 8] SecureStore Auth & Session Service
- [x] `TASK-09` [Week 5, 7, 8] Global TrainerContext & State Management

### Milestone 3: Core UI Design System & Atomic Components (Weeks 2, 3, 5)

- [x] `TASK-10` [Week 2, 3] `TypeBadge` Component
- [x] `TASK-11` [Week 2] `StatBar` Component (เลิกใช้งานและลบออกใน Dead Code Cleanup)
- [x] `TASK-12` [Week 2] `PokeballButton` Component (เลิกใช้งานและลบออกใน Dead Code Cleanup)
- [x] `TASK-13` [Week 2, 3] `PokemonCard` Component
- [x] `TASK-14` [Week 3, 6] `PokemonGrid` และ `SkeletonLoader` Component
- [x] `TASK-15` [Week 5] `SearchFilterBar` Component
- [x] `TASK-16` [Week 5] `NicknameModal` Component พร้อม Validation

### Milestone 4: Navigation Architecture & Tab Shell (Week 4)

- [x] `TASK-17` [Week 4] Root Layout และ Stack Navigation (`app/_layout.tsx`)
- [x] `TASK-18` [Week 4] Bottom Tab Shell (`app/(tabs)/_layout.tsx`)
- [x] `TASK-19` [Week 4, 6] Pokédex Catalog Screen (`app/(tabs)/pokedex.tsx`)
- [x] `TASK-20` [Week 4, 7] Caught Bag Screen (`app/(tabs)/bag.tsx`) พร้อมโหมด Offline
- [x] `TASK-21` [Week 4, 8] Trainer Profile Screen (`app/(tabs)/profile.tsx`)
- [x] `TASK-22` [Week 4] Dynamic Pokémon Detail Screen (`app/pokemon/[id].tsx`)

### Milestone 5: Gameplay Mechanics, Spawning & Maps (Week 10)

- [x] `TASK-23` [Week 10] Procedural Wild Pokémon Spawning Engine (15 จุด, PENDING 10s / ACTIVE 60s, Auto-respawn, No CP)
- [x] `TASK-24` [Week 10] Map Custom Markers (หัวลูกศรนำทางพร้อมแสงส่องทิศ, Progress Bar นับถอยหลัง, ออร่าสีทอง !)
- [x] `TASK-25` [Week 4, 10] Map Screen (`app/(tabs)/index.tsx` & `index.web.tsx`) แผนที่ 2D Leaflet OSM ฟิกซ์ตำแหน่งผู้เล่น, รองรับการหมุนเข็มทิศแบบไม่โหลดใหม่

### Milestone 6: Hardware Integration, AR Catch & Notifications (Weeks 9 & 11)

- [x] `TASK-26` [Week 9] Pokeball Thrower & Catch Physics
- [x] `TASK-27` [Week 4, 9, 11] Catch Screen Presentation Modal (`app/catch.tsx`)
- [x] `TASK-28` [Week 9] AR Camera Preview (`expo-camera`) พร้อมปุ่ม Toggle สลับ AR ON/OFF และ Classic Meadow Field Fallback
- [x] `TASK-29` [Week 11] Haptics Sensory Feedback & Local Notifications Service (`expo-haptics` + `expo-notifications` พร้อม Expo Go Android SDK 53+ Graceful Fallback)
- [x] `TASK-30` [Weeks 1-11] End-to-End Build & Simulator Verification Checklist
- [x] `TASK-31` [Week 11] Android Notification Channel & Permission Lifecycle Manager
- [x] `TASK-32` [Week 11] Rare & Uncaught Spawn Alert Trigger Engine
- [x] `TASK-33` [Week 11] Deep Link & Notification Response Observer (Root Layout to /catch)
- [x] `TASK-34` [Week 11] Map Notification Toggle UI & Test Simulator
- [x] `TASK-35` [Week 11] Platform Compatibility & Verification Checklist

---

## บันทึกการปรับปรุงล่าสุด (Maintenance & Bug Fixes)

- **Week 11 Notifications & Mobile Platform APIs:** เชื่อมต่อ Android Notification Channel (`pokemon-spawns`, `pokemon-catch`), ระบบแจ้งเตือนเมื่อโปเกมอนหายากหรือโปเกมอนใหม่เกิดใกล้ตัวผู้เล่น, ปุ่ม Bell Toggle บนหน้าแผนที่, Deep Link เปิดหน้า `/catch` ทั้ง Cold Start และ Foreground/Background รวมถึงตรวจจับสถานะ `AppState` กลับสู่หน้าจอ
- **Fix Expo Go Android SDK 53+ Uncaught Error:** ปรับปรุง `services/notifications.ts` ให้ใช้ Dynamic require และตรวจสอบ `isRunningInExpoGo()` เพื่อป้องกัน Fatal Exception จากโมดูล `expo-notifications` บน Android Expo Go พร้อม fallback รองรับ iOS และ Development Builds
- **Final Architecture Refactoring (Lego Blocks & OOP Pattern):** ปรับโครงสร้างโปรเจกต์เป็น Lego Blocks (Pluggable Components & Hooks) พร้อมใช้ OOP Repositories (`DatabaseManager`, `PokemonRepository`, `TrainerRepository`, `InventoryRepository`), Domain Game Engines (`PokemonSpawnEngine`, `CatchEngine`), และ Singleton Services (`PokeApiClient`, `NotificationManager`) คง Facade เดิม 100% และย่อขนาดโค้ด Screen Shell ใน `src/app/` ให้อ่านง่ายที่สุด
- **Dead Code Cleanup & Test Modernization:** เคลียร์ Dead Code ตามสถาปัตยกรรม Campus Events-first (`useMapSpawns`, `useSpawnNotifications`, `MapControls`, `NotificationPermissionModal`, `LocationPickerModal`, `use-user-location`, `StatBar`, `PokeballButton`), ปรับปรุง ESM import paths ด้วย `.ts` ใน `campus-events.test.mjs` และปรับชุดทดสอบ `web-platform-guard.test.mjs` ให้สอดคล้องกัน
