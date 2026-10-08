# Campus Events Mobile - Roadmap & Alignment Plan (plan.md)

แผนปฏิบัติการปรับปรุงสถาปัตยกรรมและฟีเจอร์ของ **Campus Events Mobile** ให้ตรงตามเกณฑ์ Definition of Done และผลลัพธ์การเรียนรู้ 11 สัปดาห์

---

## สรุปภาพรวมสถาปัตยกรรม (Architecture Baseline)

- **Entry & Navigation:** Expo Router (Root Stack ครอบ Bottom Tabs `(tabs)`), Deep Links (`campusevents://`, `pokemongo://`), Not Found Handler (`+not-found.tsx`)
- **Data & State:** Stale-While-Revalidate (SQLite Offline First + Background Revalidation), `favoriteReducer` พร้อม custom hook `useFavorites()`, Controlled Forms พร้อม Inline Validation
- **Hardware & Native:** On-demand Permission Lifecycle (Camera, Location, Notifications), Leaflet OSM WebView (ADR-005 Cross-platform), Local Notifications 30m Reminders, SecureStore Tokens + Biometrics

---

## แผนการดำเนินงาน 4 เฟส (4-Phase Execution Roadmap)

### เฟส 1: โครงสร้างหลัก, Types, และระบบนำทาง (Weeks 1, 2, 4) - เสร็จสมบูรณ์ ✅

- [x] **1.1 Profile Screen & Assets (Week 1):**
  - เพิ่ม `StudentProfile` interface ใน `src/shared/types/trainer.ts` พร้อมฟิลด์ `program` และ `interests`
  - สร้าง `assets/images/` และเปลี่ยน `TrainerHeaderCard.tsx` มาใช้ React Native Core `<Image>` component
  - อัปเดต `app.json` ระบุ asset paths สำหรับ icon, splash และ adaptiveIcon
- [x] **1.2 EventCard Contract & Favorite State (Week 2):**
  - Re-export `CampusEvent` ใน `src/features/events/types.ts`
  - ส่งออก `EventCardProps` พร้อม alias `onOpen`
  - ปรับ `toggleFavorite` ใน `event-context.tsx` ให้ใช้ updater function ป้องกัน race condition
  - เพิ่ม `accessibilityRole="button"` และ accessible labels ใน `event-card.tsx`
- [x] **1.3 Root Redirect & Dynamic Param Guards (Week 4):**
  - สร้าง `src/app/index.tsx` (redirect ไป `/(tabs)`)
  - สร้าง `src/app/+not-found.tsx` และลงทะเบียนใน Root Stack
  - ปรับ `src/app/events/[id].tsx` ให้กรอง/validate ID (Array, string, whitespace) ก่อนเรียกใช้ hook
  - เพิ่ม scheme `"campusevents"` ใน `app.json`

---

### เฟส 2: การออกแบบ Responsive, สถานะ UI และฟอร์ม (Weeks 3, 5) - เสร็จสมบูรณ์ ✅

- [x] **2.1 List States & Touch Target Compliance (Week 3):**
  - สร้าง `EventListState.tsx` รองรับ 3 สถานะ (`loading`, `empty`, `error` พร้อมปุ่ม Retry)
  - นำไปใช้ใน `src/app/(tabs)/index.tsx` ให้แสดง Error UI เมื่อโหลดไม่สำเร็จ
  - แก้ไข import `SafeAreaView` ใน `pokemon-picker-modal.tsx` ให้ใช้ `react-native-safe-area-context`
  - ขยาย Touch Targets ของปุ่มและชิปตัวกรองทั้งหมดให้ได้ >= 44×44pt
- [x] **2.2 Reducer State & Controlled Registration Form (Week 5):**
  - สร้าง `favoriteReducer` และ custom hook `useFavorites()` ใน `src/shared/context/event-context.tsx`
  - ปรับปรุง `src/app/events/register.tsx` ให้มีช่องกรอก `fullName` และ `email` แบบ Controlled
  - เพิ่มการตรวจสอบ Email Regex และแสดง Inline Field Error ใต้แต่ละช่อง
  - ตรวจสอบ `KeyboardAvoidingView` และการป้องกันการกดส่งซ้ำ

---

### เฟส 3: REST API, แคชออฟไลน์ และความปลอดภัย (Weeks 6, 7, 8) - เสร็จสมบูรณ์ ✅

- [x] **3.1 REST API Layer & Type Guards (Week 6):**
  - สร้าง `src/shared/services/events/events-api.ts`
  - เพิ่ม Runtime Type Guards: `isCampusEvent` และ `parseEvents`
  - ตรวจสอบ `EXPO_PUBLIC_API_URL` และสถานะ `response.ok` (พร้อม fallback เมื่อไม่มีเซิร์ฟเวอร์)
  - เชื่อมต่อ `AbortController` เข้ากับ `useEvents` / `EventProvider`
- [x] **3.2 True Stale-While-Revalidate & Data Resilience (Week 7):**
  - ปรับ `loadInitialData` ให้เรนเดอร์ข้อมูลจาก SQLite Cache ทันทีที่เปิดแอป แล้วค่อย Revalidate ในพื้นหลัง
  - เพิ่ม Mutex Write Queue ใน `event-favorites.ts` ป้องกัน Concurrency Race Condition
  - ครอบ `JSON.parse` ด้วย `try/catch` ใน SQLite repositories ป้องกันแอป Crash จากข้อมูลเสียหาย
  - แก้ไขการดึง `lastUpdated` timestamp ให้ดึงเวลาแคชล่าสุด และแสดงสถานะออฟไลน์บนหน้า MyEvents
- [x] **3.3 Dependencies, Token Expiry & Biometrics (Week 8):**
  - เพิ่ม dependencies `expo-dev-client` และ `expo-local-authentication` ใน `package.json`
  - เพิ่มฟังก์ชันตรวจสอบอายุ Token (TTL 7 วัน) และ `mockValidateTokenApi` ใน `auth-api.ts`
  - เพิ่มฟังก์ชันบริการ Biometrics (Face ID/Touch ID) และปุ่มล็อกอินด้วยชีวมาตรใน `src/app/login.tsx`
  - บล็อกการลงทะเบียนกิจกรรมหากยังไม่ได้เข้าสู่ระบบ

---

### เฟส 4: ฮาร์ดแวร์, แผนที่สถานที่ และการแจ้งเตือน (Weeks 9, 10, 11) - เสร็จสมบูรณ์ ✅

- [x] **4.1 Permissions & Settings Links (Week 9):**
  - เพิ่มการตรวจสอบ `canAskAgain` ใน `event-image-picker.tsx`
  - เพิ่มปุ่ม `Linking.openSettings()` เมื่อผู้ใช้ปฏิเสธสิทธิ์กล้องหรือคลังภาพถาวร
- [x] **4.2 Inline Venue Map Preview (Week 10):**
  - เพิ่ม Inline Mini Map Preview แสดงหมุดสถานที่ในหน้ารายละเอียดกิจกรรม (`event-detail-info.tsx`)
  - ซ่อน `playerMarker` ในโหมดเลือกพิกัด (`LeafletMapView.tsx`) เพื่อไม่ให้ซ้อนทับหมุดสถานที่
- [x] **4.3 Local Notifications & Deep Link Recovery (Week 11):**
  - ย้ายการดักฟัง Notification Tap เข้าไปใน `NavigationStack` เพื่อแก้ปัญหา Cold Start Deep Link หลุด
  - แก้ไข `ensurePermission()` ให้คืนค่า `false` เมื่อเกิดข้อผิดพลาด
  - กู้คืน Reminders ที่ตั้งไว้ในระบบปฏิบัติการกลับเข้าสู่ State เมื่อเปิดแอป (`getScheduledReminders`)
  - แจ้งเตือน Alert เมื่อผู้ใช้ตั้งเตือนกิจกรรมที่เหลือเวลาน้อยกว่า 30 นาที

---

## เกณฑ์การตรวจรับงาน (Success & Acceptance Criteria) - ผ่านทั้งหมด ✅

1. `npx tsc --noEmit` ผ่าน 100% ไม่มีข้อผิดพลาด (0 errors)
2. `npm test` ผ่านครบทุกชุดทดสอบ 191/191 tests pass ครอบคลุม Contract ใหม่ทั้ง 11 สัปดาห์
3. Deep link `campusevents://events/[id]` และ `+not-found` ทำงานถูกต้อง
4. ปิดเครือข่ายแล้วเปิดแอป ข้อมูลกิจกรรมแสดงทันทีจาก SQLite Cache พร้อมบอกเวลาอัปเดตล่าสุด
5. ฟอร์มลงทะเบียนปฏิเสธอีเมลที่ผิดรูปแบบและแสดงข้อความแจ้งเตือนสีแดงใต้ฟิลด์
6. หน้าจอรายละเอียดกิจกรรมมี Mini Map Preview แสดงหมุดสถานที่จัดงาน
7. ตั้งเวลาแจ้งเตือนล่วงหน้า 30 นาที และเปิดแอปจาก Notification ได้แม้แอปปิดอยู่ (Cold Start)
