# Pokémon GO - Task Breakdown & Progress Tracker (task.md)

เอกสารภาพรวมความคืบหน้าของโครงการ **Pokémon GO Mobile App** (11 สัปดาห์)
งานทั้งหมดถูกแจกแจงออกเป็น **33 Micro-Tasks** แยกไฟล์เอกสารอิสระอยู่ในโฟลเดอร์ [`tasks/`](tasks/README.md) เพื่อให้นักพัฒนาและ AI Agent สามารถอ่านทีละไฟล์ได้อย่างมีประสิทธิภาพ (Progressive Disclosure)

> 📖 **หน้าสารบัญและการตัดสินใจสำหรับ AI:** ดูได้ที่ [`tasks/README.md`](tasks/README.md)

---

## สรุปสถานะภาพรวม (Milestones Overview)

| Milestone | สถาปัตยกรรม (Layer) | สัปดาห์ | จำนวน Tasks | ความคืบหน้า |
|---|---|:---:|:---:|:---:|
| **M1** | Project Setup, Types & Design Tokens | W1, W3 | 4 Tasks | 4/4 (100%) |
| **M2** | Data Layer, Services & State Management | W5, 6, 7, 8 | 5 Tasks | 1/5 (20%) |
| **M3** | Core UI Design System & Atomic Components | W2, 3, 5 | 7 Tasks | 0/7 |
| **M4** | Navigation Architecture & Tab Shell | W4 | 6 Tasks | 0/6 |
| **M5** | Gameplay Mechanics, Spawning & Maps | W8, W10 | 5 Tasks | 0/5 |
| **M6** | Hardware Integration, AR Catch & Notifications | W9, W11 | 6 Tasks | 0/6 |
| **รวม** | **ทั้งหมด** | **Weeks 1 - 11** | **33 Tasks** | **5/33 (15%)** |

---

## สารบัญไฟล์ Task แยกทั้ง 33 รายการ (Direct Task Links)

### Milestone 1: Project Setup, Types & Design Tokens (Weeks 1 & 3)
- [x] [`TASK-01`](tasks/task-01.md) [Week 1] โครงสร้างโฟลเดอร์โปรเจกต์และเคลียร์ Template เริ่มต้น
- [x] [`TASK-02`](tasks/task-02.md) [Week 1] การตั้งค่า Expo SDK 57, Assets และ Splash Screen
- [x] [`TASK-03`](tasks/task-03.md) [Week 1, 2] Pokémon & Trainer TypeScript Types
- [x] [`TASK-04`](tasks/task-04.md) [Week 3] Color System (18 ธาตุ) และ Theme Constants

### Milestone 2: Data Layer, Services & State Management (Weeks 5, 6, 7, 8)
- [ ] [`TASK-05`](tasks/task-05.md) [Week 6] PokéAPI Service (Kanto 151 + Official Artwork)
- [ ] [`TASK-06`](tasks/task-06.md) [Week 6] Custom Hooks สำหรับดึงข้อมูล Pokémon (`usePokemons`, `usePokemonDetail`)
- [x] [`TASK-07`](tasks/task-07.md) [Week 7] SQLite Database Persistence Service (`expo-sqlite`: caught_pokemon, inventory, trainer)
- [ ] [`TASK-08`](tasks/task-08.md) [Week 8] SecureStore Auth & Session Service
- [ ] [`TASK-09`](tasks/task-09.md) [Week 5, 7, 8] Global TrainerContext & State Management

### Milestone 3: Core UI Design System & Atomic Components (Weeks 2, 3, 5)
- [ ] [`TASK-10`](tasks/task-10.md) [Week 2, 3] `TypeBadge` Component
- [ ] [`TASK-11`](tasks/task-11.md) [Week 2] `StatBar` Component
- [ ] [`TASK-12`](tasks/task-12.md) [Week 2] `PokeballButton` Component
- [ ] [`TASK-13`](tasks/task-13.md) [Week 2, 3] `PokemonCard` Component
- [ ] [`TASK-14`](tasks/task-14.md) [Week 3, 6] `PokemonGrid` และ `SkeletonLoader` Component
- [ ] [`TASK-15`](tasks/task-15.md) [Week 5] `SearchFilterBar` Component
- [ ] [`TASK-16`](tasks/task-16.md) [Week 5] `NicknameModal` Component พร้อม Validation

### Milestone 4: Navigation Architecture & Tab Shell (Week 4)
- [ ] [`TASK-17`](tasks/task-17.md) [Week 4] Root Layout และ Stack Navigation (`app/_layout.tsx`)
- [ ] [`TASK-18`](tasks/task-18.md) [Week 4] Bottom Tab Shell (`app/(tabs)/_layout.tsx`)
- [ ] [`TASK-19`](tasks/task-19.md) [Week 4, 6] Pokédex Catalog Screen (`app/(tabs)/pokedex.tsx`)
- [ ] [`TASK-20`](tasks/task-20.md) [Week 4, 7] Caught Bag Screen (`app/(tabs)/bag.tsx`) พร้อมโหมด Offline
- [ ] [`TASK-21`](tasks/task-21.md) [Week 4, 8] Trainer Profile Screen (`app/(tabs)/profile.tsx`)
- [ ] [`TASK-22`](tasks/task-22.md) [Week 4] Dynamic Pokémon Detail Screen (`app/pokemon/[id].tsx`)

### Milestone 5: Gameplay Mechanics, Spawning & Maps (Weeks 8 & 10)
- [ ] [`TASK-23`](tasks/task-23.md) [Week 8] Trainer Onboarding Modal (ชื่อ, เลือกทีม, สตาร์ตเตอร์)
- [ ] [`TASK-24`](tasks/task-24.md) [Week 10] Procedural Wild Pokémon Spawning Engine
- [ ] [`TASK-25`](tasks/task-25.md) [Week 10] Map Custom Markers และ Player Radar Component
- [ ] [`TASK-26`](tasks/task-26.md) [Week 10] Simulator Indoor Controls (D-pad & Spawn Nearby)
- [ ] [`TASK-27`](tasks/task-27.md) [Week 4, 10] Map Screen (`app/(tabs)/index.tsx`) เชื่อม GPS และ Spawns

### Milestone 6: Hardware Integration, AR Catch & Notifications (Weeks 9 & 11)
- [ ] [`TASK-28`](tasks/task-28.md) [Week 11] Haptics Service พร้อม Visual Shake Fallback
- [ ] [`TASK-29`](tasks/task-29.md) [Week 9] AR Camera Preview พร้อม Classic Meadow Field Fallback
- [ ] [`TASK-30`](tasks/task-30.md) [Week 9] Pokeball Thrower & Catch Physics
- [ ] [`TASK-31`](tasks/task-31.md) [Week 4, 9, 11] AR Catch Screen Modal (`app/catch.tsx`)
- [ ] [`TASK-32`](tasks/task-32.md) [Week 11] Local Notifications Service สำหรับสปอว์นและไข่
- [ ] [`TASK-33`](tasks/task-33.md) [Weeks 1-11] End-to-End Build & Simulator Verification Checklist

---

## คำแนะนำการหยิบงาน (Workflow สำหรับ Developer & AI)

1. เข้าดู [`tasks/README.md`](tasks/README.md) เพื่อเช็กว่า Task ใดมีสถานะ `READY` (ไม่มี Dependency ค้าง)
2. เปิดอ่านเฉพาะ `tasks/task-XX.md` ที่จะทำ
3. เขียนโค้ดแบบ Surgical changes ตามข้อกำหนดในไฟล์นั้น
4. รัน `npx tsc --noEmit` ตรวจสอบ Type
5. เมื่อเสร็จแล้วเปลี่ยนเครื่องหมาย `[ ]` เป็น `[x]` ในไฟล์ Task, `task.md` และ `tasks/README.md`
