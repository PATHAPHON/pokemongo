# ADR-001: โครงสร้าง Navigation แบบ 4 Tabs และ Modal ด้วย Expo Router

- **สถานะ:** Accepted
- **วันที่ตัดสินใจ:** 2026-09-24
- **สัปดาห์หลักสูตรที่เกี่ยวข้อง:** สัปดาห์ที่ 4 (Expo Router และ Navigation)

---

## บริบท (Context)
แอปพลิเคชัน Pokémon GO จำเป็นต้องมีเส้นทางการใช้งานที่แบ่งหมวดหมู่อย่างชัดเจน ระหว่าง:
1. การสำรวจแผนที่เพื่อจับโปเกมอน (Map)
2. การค้นหาข้อมูลสายพันธุ์ทั้งหมด (Pokédex)
3. การจัดการคลังโปเกมอนที่จับได้ (My Pokémon / Bag)
4. การจัดการข้อมูลเทรนเนอร์ (Profile)
นอกจากนี้ เมื่อผู้เล่นแตะที่ตัวโปเกมอนในแผนที่เพื่อเข้าสู่โหมดจับ จำเป็นต้องแสดงหน้าจอแบบเต็มจอ (Fullscreen Modal) ที่แยกขาดจากการเลื่อนแท็บปกติเพื่อโฟกัสที่การจับมอนสเตอร์

## การตัดสินใจ (Decision)
เลือกใช้ **Expo Router v6** (File-based Routing) โดยกำหนดโครงสร้างดังนี้:
1. **Root Stack (`app/_layout.tsx`):**
   - เป็นตัวควบคุมชั้นนอกสุด (Root Stack Navigator)
   - ครอบแท็บ `(tabs)`
   - ประกาศเส้นทางพิเศษสำหรับ Modal ได้แก่:
     - `catch` (presentation: 'fullScreenModal')
     - `pokemon/[id]` (presentation: 'modal')
2. **Bottom Tabs Layout (`app/(tabs)/_layout.tsx`):**
   - มี 4 แท็บหลัก:
     - `index.tsx` (Icon: Map) -> แผนที่และการสปอว์น
     - `pokedex.tsx` (Icon: Book) -> สมุดภาพโปเกมอน
     - `bag.tsx` (Icon: Backpack) -> คลังโปเกมอนที่จับได้
     - `profile.tsx` (Icon: Person) -> ข้อมูลเทรนเนอร์

## ผลลัพธ์และข้อดี (Consequences)
- **ข้อดี:**
  - สอดคล้องกับมาตรฐานของ Expo และเนื้อหาสัปดาห์ที่ 4
  - Type-safe navigation ผ่าน `expo-router` (`router.push('/catch')`, `router.push('/pokemon/25')`)
  - หน้าจอจับมอนสเตอร์ `/catch` แสดงผลแบบเต็มจอได้โดยไม่ถูก Tab Bar ด้านล่างบดบัง
- **ข้อพิจารณา:**
  - ไฟล์ในโฟลเดอร์ `app/` จะต้องเป็น Screen หรือ Layout เท่านั้น คอมโพเนนต์ย่อยต้องแยกไว้ใน `components/` ภายนอกเพื่อไม่ให้เกิดเส้นทาง URL ปลอม
