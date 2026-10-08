# Campus Events Mobile (Pokémon GO Edition) - Task Breakdown & Progress Tracker (task.md)

เอกสารภาพรวมความคืบหน้าของโครงการ **Campus Events Mobile** อ้างอิงตามหลักสูตร React Native + Expo (11 สัปดาห์) ครอบคลุม Core UI, Navigation, Forms, Networking, SQLite Offline, Hardware Integration, Maps และ Notifications

---

## สรุปสถานะภาพรวมหลักสูตร (11 Weeks Milestones Overview)

| สัปดาห์ | หัวข้อหลักสูตร (Curriculum Milestone) | สถานะความพร้อม | จำนวน Tasks |
| :---: | :--- | :---: | :---: |
| **W1** | Mobile Development, React Native และ Expo | 100% (สมบูรณ์ตามเกณฑ์ Lab 1) ✅ | 4/4 Tasks |
| **W2** | Components, Props, State และ Events | 100% (สมบูรณ์ตามเกณฑ์ Lab 2) ✅ | 5/5 Tasks |
| **W3** | Styling และ Responsive Mobile UI | 100% (สมบูรณ์ตามเกณฑ์ Lab 3) ✅ | 4/4 Tasks |
| **W4** | Expo Router และ Navigation | 100% (สมบูรณ์ตามเกณฑ์ Lab 4) ✅ | 5/5 Tasks |
| **W5** | Forms และ State Management | 100% (สมบูรณ์ตามเกณฑ์ Lab 5) ✅ | 5/5 Tasks |
| **W6** | REST API และ Networking | 100% (สมบูรณ์ตามเกณฑ์ Lab 6) ✅ | 4/4 Tasks |
| **W7** | Local Storage และ Offline Applications | 100% (สมบูรณ์ตามเกณฑ์ Lab 7) ✅ | 5/5 Tasks |
| **W8** | Authentication และ Mobile Security | 100% (สมบูรณ์ตามเกณฑ์ Lab 8) ✅ | 5/5 Tasks |
| **W9** | Camera, Image Picker และ Permissions | 100% (สมบูรณ์ตามเกณฑ์ Lab 9) ✅ | 4/4 Tasks |
| **W10** | Location และ Maps | 100% (สมบูรณ์ตามเกณฑ์ Lab 10) ✅ | 5/5 Tasks |
| **W11** | Notifications และ Mobile Platform APIs | 100% (สมบูรณ์ตามเกณฑ์ Lab 11) ✅ | 5/5 Tasks |
| **รวม** | **ทั้งหมด 11 สัปดาห์** | **100% Compliant ✅** | **46/46 Tasks** |

---

## รายการงานปรับปรุงรายสัปดาห์ (Tasks Checklist)

### สัปดาห์ 1: Mobile Development, React Native และ Expo
- [x] `W1-01` โครงสร้างโปรเจกต์ Expo SDK 57, TypeScript strict mode และ `@/*` path alias
- [x] `W1-02` Profile screen (`src/app/(tabs)/profile.tsx`) แสดงผลด้วย Core Components
- [x] `W1-03` เพิ่มประเภทข้อมูล `StudentProfile` พร้อมฟิลด์ `program` และ `interests` tags ใน `src/shared/types/trainer.ts`
- [x] `W1-04` จัดเตรียม `assets/images/` และใช้ React Native Core `<Image>` component แทนไอคอนล้วนในโปรไฟล์

### สัปดาห์ 2: Components, Props, State และ Events
- [x] `W2-01` นิยาม `CampusEvent` และ mock events ใน `src/shared/constants/campus-events-data.ts`
- [x] `W2-02` Reusable `EventCard` แยกไฟล์ใน `src/features/events/components/event-card.tsx`
- [x] `W2-03` Re-export `CampusEvent` ใน `src/features/events/types.ts` และส่งออก `EventCardProps` พร้อม alias `onOpen`
- [x] `W2-04` ปรับปรุง `toggleFavorite` ให้ใช้ updater function `prev => prev.includes(id) ? ... : ...`
- [x] `W2-05` เพิ่ม `accessibilityRole="button"` และ `accessibilityLabel` สำหรับรูปภาพและปุ่มทั้งหมดใน EventCard

### สัปดาห์ 3: Styling และ Responsive Mobile UI
- [x] `W3-01` Responsive layout ด้วย `useWindowDimensions()` แบ่ง 1 คอลัมน์ (มือถือ) และ 2 คอลัมน์ (แท็บเล็ต)
- [x] `W3-02` ใช้ `FlatList` พร้อม stable key extractor (`item.id`) และ virtualization props
- [x] `W3-03` เพิ่มหน้าจอ `EventListState` รองรับ Loading, Empty, และ **Error State พร้อมปุ่ม Retry** ใน `(tabs)/index.tsx`
- [x] `W3-04` เปลี่ยนการ import `SafeAreaView` ใน `pokemon-picker-modal.tsx` และขยาย Touch targets ให้ได้ >= 44×44pt

### สัปดาห์ 4: Expo Router และ Navigation
- [x] `W4-01` วางโครงสร้าง Root Stack ครอบ Bottom Tabs พร้อม Route Groups `(tabs)`
- [x] `W4-02` ส่งเฉพาะ `id` ใน Dynamic route `/events/[id]` โดยไม่ส่ง object ทั้งก้อน
- [x] `W4-03` สร้าง `src/app/index.tsx` เพื่อ redirect ไปยัง `/(tabs)`
- [x] `W4-04` สร้าง `src/app/+not-found.tsx` สำหรับดักจับ URL ที่ไม่มีอยู่จริง
- [x] `W4-05` ปรับปรุง `src/app/events/[id].tsx` ให้ตรวจสอบ Array และ String ก่อนใช้งาน, เพิ่ม scheme `campusevents` ใน `app.json`

### สัปดาห์ 5: Forms และ State Management
- [x] `W5-01` ค้นหากิจกรรมจากชื่อ/สถานที่โดยใช้ derived state (`useMemo`) ไม่เก็บ array ซ้ำ
- [x] `W5-02` ป้องกันการส่งฟอร์มซ้ำ (`isSubmitting`) และจัดการคีย์บอร์ดด้วย `KeyboardAvoidingView`
- [x] `W5-03` แยกการจัดการ Favorite ด้วย `favoriteReducer` และ custom hook `useFavorites()`
- [x] `W5-04` ปรับฟอร์มลงทะเบียน `src/app/events/register.tsx` เป็น controlled inputs สำหรับ `fullName` และ `email`
- [x] `W5-05` เพิ่มการตรวจสอบรูปแบบอีเมล (Email regex) และแสดง Error แบบรายฟิลด์ (Inline field errors)

### สัปดาห์ 6: REST API และ Networking
- [x] `W6-01` รองรับการยกเลิก request ด้วย `AbortController` / `AbortSignal` ในหน้ารายละเอียด
- [x] `W6-02` มี Pull-to-refresh บนหน้ารายการกิจกรรมด้วย `RefreshControl`
- [x] `W6-03` สร้าง `src/shared/services/events/events-api.ts` มี runtime type guards `isCampusEvent` และ `parseEvents`
- [x] `W6-04` เชื่อมต่อ `EXPO_PUBLIC_API_URL`, ตรวจสอบ `response.ok`, จัดการ status codes (404, 500) และเพิ่มปุ่ม Retry บนแท็บค้นหา

### สัปดาห์ 7: Local Storage และ Offline Applications
- [x] `W7-01` แบ่งระดับพื้นที่จัดเก็บ: AsyncStorage (Favorites), SecureStore (Tokens), SQLite (Events)
- [x] `W7-02` ตาราง SQLite `campus_events` และ `event_registrations` ผ่าน `expo-sqlite`
- [x] `W7-03` ปรับปรุง Offline read flow เป็น True Stale-While-Revalidate (แสดงแคช SQLite ทันทีตอนเปิดแอป)
- [x] `W7-04` เพิ่ม Mutex write queue ใน `event-favorites.ts` และเพิ่ม `try/catch` ครอบ `JSON.parse` ใน SQLite repositories
- [x] `W7-05` แก้ไขการคำนวณ `lastUpdated` ให้ดึงเวลา sync ล่าสุด และแสดงสถานะออฟไลน์บนหน้า MyEvents

### สัปดาห์ 8: Authentication และ Mobile Security
- [x] `W8-01` จัดเก็บ Token ลงใน hardware keychain ด้วย `expo-secure-store`
- [x] `W8-02` ป้องกันเส้นทางด้วย `Stack.Protected` บน Expo Router
- [x] `W8-03` ติดตั้ง `expo-dev-client` และ `expo-local-authentication`
- [x] `W8-04` เพิ่มระบบตรวจสอบความถูกต้องและวันหมดอายุของ Token (TTL 7 วัน) ใน `auth-api.ts`
- [x] `W8-05` เพิ่มระบบปลดล็อกด้วยชีวมาตร (Biometrics/Face ID/Touch ID) และป้องกันการลงทะเบียนกิจกรรมโดยไม่ได้ล็อกอิน

### สัปดาห์ 9: Camera, Image Picker และ Permissions
- [x] `W9-01` ติดตั้ง `expo-camera` และ `expo-image-picker`
- [x] `W9-02` ขอ permission แบบ On-demand เมื่อผู้ใช้เริ่มทำ action เท่านั้น (ไม่มีการขอตอนเปิดแอป)
- [x] `W9-03` พรีวิวรูปภาพที่เลือกและมีปุ่มเปลี่ยน/ลบรูปภาพโดยรักษาค่าในฟอร์มไว้
- [x] `W9-04` ตรวจสอบ `canAskAgain` และมีปุ่มเปิด `Linking.openSettings()` เมื่อผู้ใช้ปฏิเสธสิทธิ์ถาวร

### สัปดาห์ 10: Location และ Maps
- [x] `W10-01` ขอ Foreground location permission เฉพาะเมื่อผู้ใช้กดปุ่มดึงพิกัด
- [x] `W10-02` แผนที่สถานที่จัดงานแยกขาดจากสิทธิ์ตำแหน่งผู้ใช้ (ปฏิเสธ GPS ก็ยังดูกิจกรรมได้)
- [x] `W10-03` ปุ่ม "ใช้ตำแหน่งปัจจุบัน" และการแตะ/ลากหมุดปรับพิกัดใน `pick-location.tsx`
- [x] `W10-04` เพิ่ม Inline Mini Map Preview แสดงหมุดสถานที่ในหน้ารายละเอียดกิจกรรม (`event-detail-info.tsx`)
- [x] `W10-05` ทำความสะอาดหมุดผู้เล่นไม่ให้แสดงซ้อนทับในโหมดเลือกพิกัด (`LeafletMapView.tsx`)

### สัปดาห์ 11: Notifications และ Mobile Platform APIs
- [x] `W11-01` ตั้งค่า Notification Handler และ Android Channel `event-reminders` (HIGH importance)
- [x] `W11-02` คำนวณเวลาแจ้งเตือนล่วงหน้า 30 นาที และบรรจุเฉพาะ `eventId` ใน payload
- [x] `W11-03` ย้าย Notification Tap Listener เข้า `NavigationStack` ป้องกัน Cold Start Race Condition
- [x] `W11-04` ฟื้นฟูรายการแจ้งเตือนที่ตั้งไว้จาก OS ตอนเปิดแอป (`getScheduledReminders`)
- [x] `W11-05` แสดง Alert แจ้งเตือนเมื่อกิจกรรมเริ่มใน < 30 นาที หรือเมื่อผู้ใช้ยังไม่อนุญาตสิทธิ์
