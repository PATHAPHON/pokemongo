# ADR-006: การสร้างปฏิสัมพันธ์ผ่าน Haptic Feedback และ Local Notifications

- **สถานะ:** Accepted
- **วันที่ตัดสินใจ:** 2026-09-24
- **สัปดาห์หลักสูตรที่เกี่ยวข้อง:** สัปดาห์ที่ 11 (Notifications และ Platform APIs)

---

## บริบท (Context)
ความรู้สึกในการเล่นเกม Pokémon GO (Game Feel) ขึ้นอยู่กับการตอบสนองทางกายภาพและประสาทสัมผัส (Sensory Feedback) เป็นอย่างมาก เช่น:
1. การสั่นของมือถือตามจังหวะที่ Pokéball ขยับไปมา 3 ครั้งขณะลุ้นว่าจะจับติดหรือไม่
2. การแจ้งเตือนเตือนเทรนเนอร์เมื่อมีโปเกมอนตัวหายากสปอว์นใกล้ๆ

## การตัดสินใจ (Decision)
1. **การใช้งาน `expo-haptics`:**
   - **ตอนปาบอล:** สั่นเบาๆ (`Haptics.impactAsync(ImpactFeedbackStyle.Light)`)
   - **ตอนบอลสั่น (3 สเต็ป):** สั่นเตือนตามจังหวะบอลกระตุก (`Haptics.impactAsync(ImpactFeedbackStyle.Medium)`)
   - **ตอนจับสำเร็จ:** สั่นรูปแบบฉลองความสำเร็จ (`Haptics.notificationAsync(NotificationFeedbackType.Success)`)
   - **ห่อหุ้มด้วย Error Boundary / Graceful Fallback:** หากอุปกรณ์ไม่มีมอเตอร์สั่นหรือรันบน Web/Simulator ให้เล่น Animation สั่นหน้าจอบน UI แทน
2. **การใช้งาน `expo-notifications`:**
   - ขอสิทธิ์ Notification สำหรับส่ง Local Notification (ไม่ต้องพึ่งพิง Push Notification Server ภายนอก)
   - ส่งการแจ้งเตือนในเครื่องเมื่อผู้เล่นพบมอนสเตอร์ระดับ Rare หรือเมื่อมีโปเกมอนเกิดใหม่ในละแวกใกล้เคียง

## ผลลัพธ์และข้อดี (Consequences)
- **ข้อดี:**
  - นำเทคโนโลยีตามหลักสูตรสัปดาห์ที่ 11 มาใช้จริงและเสริมความสมจริงของเกมอย่างเด่นชัด
  - ทำงานแบบ Local-only ไม่ต้องตั้งค่า Firebase Cloud Messaging หรือ Apple APNs Backend ให้ยุ่งยาก
- **ข้อพิจารณา:**
  - บน Simulator จะไม่รู้สึกถึงแรงสั่น แต่จะมี Visual Shake Indicator เพื่อยืนยันว่าโค้ด Haptic ถูกเรียกทำงานถูกต้อง
