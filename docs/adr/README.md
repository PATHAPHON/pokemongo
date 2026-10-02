# Architecture Decision Records (ADR)

บันทึกการตัดสินใจเชิงสถาปัตยกรรม (Architecture Decision Records) สำหรับโปรเจกต์ **Pokémon GO (React Native + Expo)** โดยใช้รูปแบบ **1 Markdown File = 1 การตัดสินใจ** เพื่อบันทึกเหตุผล บริบท ข้อดี และข้อจำกัดของการเลือกเทคโนโลยีและการออกแบบในแต่ละด้าน

---

## สารบัญการตัดสินใจ (Decision Log)

| รหัส | หัวข้อการตัดสินใจ | สถานะ | สัปดาห์ที่เกี่ยวข้อง |
|---|---|:---:|:---:|
| [ADR-001](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0001-navigation-expo-router.md) | โครงสร้าง Navigation Events-first (Events/MyEvents/Profile + hidden pokedex + /bag stack) | **Accepted** | Week 4 + Events unification |
| [ADR-002](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0002-data-fetching-pokeapi.md) | การเชื่อมต่อข้อมูล PokéAPI (Gen1-3 ผ่าน registry) พร้อมภาพ HD Artwork | **Accepted** | Week 6 |
| [ADR-003](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0003-offline-storage-persistence.md) | การจัดเก็บออฟไลน์ด้วย SQLite (WAL) + SecureStore (pokemon + campus_events/event_registrations) | **Accepted** | Week 7, 8 |
| [ADR-004](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0004-camera-ar-fallback.md) | สถาปัตยกรรมโหมดจับโปเกมอน (AR Camera ควบคู่ Classic Field Fallback) | **Accepted** | Week 9 |
| [ADR-005](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0005-location-and-spawn-simulation.md) | แผนที่ Leaflet OSM ประจำ event venue + spawn engine 15 จุด + event spots | **Accepted** | Week 10 |
| [ADR-006](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0006-haptics-and-notifications.md) | Haptic Feedback + Local Notifications (pokemon-spawns/pokemon-catch + event reminder + deep link /catch /events/[id]) | **Accepted** | Week 11 |
| [ADR-007](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0007-campus-events-unification.md) | รวม campus + pokemon เป็นโปรเจกต์เดียว Events-first (shared helpers, /bag stack, merge cache) | **Accepted** | Events unification |

---