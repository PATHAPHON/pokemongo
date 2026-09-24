# ADR-003: การจัดเก็บข้อมูลโปเกมอนออฟไลน์ด้วย SQLite (expo-sqlite) และ SecureStore

- **สถานะ:** Accepted (Updated to SQLite)
- **วันที่ตัดสินใจ:** 2026-09-24
- **สัปดาห์หลักสูตรที่เกี่ยวข้อง:** สัปดาห์ที่ 7 (Storage และ Offline) และสัปดาห์ที่ 8 (Authentication และ Security)

---

## บริบท (Context)
เกม Pokémon GO ต้องสามารถจดจำประวัติโปเกมอนที่ผู้เล่นจับได้, จำนวนไอเทมในกระเป๋า (Pokéball), สถิติ และข้อมูลของเทรนเนอร์ โดยข้อมูลเหล่านี้ต้อง:
1. ไม่สูญหายเมื่อผู้เล่นปิดแอปพลิเคชัน (App Termination / Restart)
2. สามารถเปิดดูคลังโปเกมอนในกระเป๋า (Bag) ได้ทันทีแม้อุปกรณ์ไม่มีสัญญาณอินเทอร์เน็ต (Offline Mode)
3. รองรับการ Query, Filter, Sort โปเกมอนตามเงื่อนไข (เช่น ตาม CP, ธาตุ, ดาว Favorite) ได้รวดเร็วและมีประสิทธิภาพสูง
4. แยกข้อมูลทั่วไปออกจากข้อมูลที่ต้องเข้ารหัสความปลอดภัย (เช่น รหัสประจำตัวเทรนเนอร์)

## การตัดสินใจ (Decision)
1. **จัดเก็บคลังโปเกมอน, คลังไอเทม, และโปรไฟล์ด้วย `expo-sqlite` (SQLite Database):**
   - ฐานข้อมูล: `pokemongo.db`
   - ตาราง `caught_pokemon`: รองรับ `instance_id`, `pokemon_id`, `nickname`, `name`, `artwork`, `types_json`, `cp`, `level`, `iv_attack`, `iv_defense`, `iv_stamina`, `stats_json`, `caught_at`, `is_favorite`
   - ตาราง `inventory`: สต็อกของ Pokéball (`pokeballs`, `greatballs`, `ultraballs`) และเบอร์รี่
   - ตาราง `trainer_profile`: ข้อมูลเลเวล, Stardust, PokeCoins, ทีม
   - ใช้ Next-gen Async API ของ `expo-sqlite` (`openDatabaseAsync`, `execAsync`, `getAllAsync`, `runAsync`)
2. **จัดเก็บโทเคนหรือคีย์เซสชันเทรนเนอร์ด้วย `expo-secure-store`:**
   - ใช้เข้ารหัสข้อมูลความปลอดภัยบน Keychain (iOS) หรือ Keystore (Android) เพื่อป้องกันการดัดแปลงแก้ไข (Week 8 Security Concept)
3. **การเชื่อมโยงกับ Global State (React Context):**
   - โหลดข้อมูลจาก SQLite ตอนแอปเริ่มทำงาน และมี Service Layer (`services/database.ts`) สำหรับ CRUD แบบ Async ปลอดภัยจาก SQL Injection

## ผลลัพธ์และข้อดี (Consequences)
- **ข้อดี:**
  - รองรับ Relational Queries, Sorting (ตาม CP, วันที่จับ, ธาตุ) และ Pagination มีประสิทธิภาพสูงกว่า Key-Value
  - ข้อมูลมีความเสถียร (ACID compliant) รองรับการขยายคลังโปเกมอนได้ไม่จำกัด
  - ทำงานแบบ Offline-first 100%
- **ข้อพิจารณา:**
  - ต้องมี Database Migration และ Initial Table Schema Creation เมื่อเปิดแอปครั้งแรก
