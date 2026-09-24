# Architecture Decision Records (ADR)

บันทึกการตัดสินใจเชิงสถาปัตยกรรม (Architecture Decision Records) สำหรับโปรเจกต์ **Pokémon GO (React Native + Expo)** โดยใช้รูปแบบ **1 Markdown File = 1 การตัดสินใจ** เพื่อบันทึกเหตุผล บริบท ข้อดี และข้อจำกัดของการเลือกเทคโนโลยีและการออกแบบในแต่ละด้าน

---

## สารบัญการตัดสินใจ (Decision Log)

| รหัส | หัวข้อการตัดสินใจ | สถานะ | สัปดาห์ที่เกี่ยวข้อง |
|---|---|:---:|:---:|
| [ADR-001](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0001-navigation-expo-router.md) | โครงสร้าง Navigation แบบ 4 Tabs และ Modal ด้วย Expo Router | **Accepted** | Week 4 |
| [ADR-002](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0002-data-fetching-pokeapi.md) | การเชื่อมต่อข้อมูล PokéAPI (Kanto 151 ตัวแรก) พร้อมภาพ HD Artwork | **Accepted** | Week 6 |
| [ADR-003](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0003-offline-storage-persistence.md) | การจัดเก็บข้อมูลโปเกมอนออฟไลน์ด้วย AsyncStorage และ SecureStore | **Accepted** | Week 7, 8 |
| [ADR-004](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0004-camera-ar-fallback.md) | สถาปัตยกรรมโหมดจับโปเกมอน (AR Camera ควบคู่ Classic Field Fallback) | **Accepted** | Week 9 |
| [ADR-005](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0005-location-and-spawn-simulation.md) | ระบบแผนที่ GPS, ระบบสปอว์นรอบตัว และชุดควบคุมจำลองบน Simulator | **Accepted** | Week 10 |
| [ADR-006](file:///Users/pat/Project/pokemongo/pokemongo/docs/adr/0006-haptics-and-notifications.md) | การสร้างปฏิสัมพันธ์ผ่าน Haptic Feedback และ Local Notifications | **Accepted** | Week 11 |

---