---
name: pokemon-go
description: Use when developing, testing, or maintaining the Pokémon GO mobile app (React Native + Expo SDK 57) covering Weeks 1 to 11 syllabus, PokéAPI integration, AR catch screen, GPS map spawning, and offline storage.
---

# Pokémon GO Mobile Project Skill

คู่มือและแนวทางการพัฒนาแอปพลิเคชัน Pokémon GO ตามหลักสูตร 11 สัปดาห์

## เอกสารอ้างอิงหลัก (Progressive Disclosure)
เมื่อต้องการข้อมูลเชิงลึกในแต่ละส่วน ให้เปิดอ่านไฟล์เฉพาะทางต่อไปนี้:
- **แผนการพัฒนารายสัปดาห์ (Week 1 - 11):** [plan.md](../../../plan.md)
- **กฎเหล็กการทำงานและข้อกำหนด Expo SDK 57:** [agent.md](../../../agent.md)
- **บันทึกการตัดสินใจเชิงสถาปัตยกรรม (ADR):**
  - [ADR-001 Navigation & Tabs](../../../docs/adr/0001-navigation-expo-router.md)
  - [ADR-002 PokéAPI Integration](../../../docs/adr/0002-data-fetching-pokeapi.md)
  - [ADR-003 Storage & Persistence](../../../docs/adr/0003-offline-storage-persistence.md)
  - [ADR-004 Camera AR & Fallback](../../../docs/adr/0004-camera-ar-fallback.md)
  - [ADR-005 Location & Spawn Simulation](../../../docs/adr/0005-location-and-spawn-simulation.md)
  - [ADR-006 Haptics & Notifications](../../../docs/adr/0006-haptics-and-notifications.md)

## กฎสำคัญในการพัฒนา
1. **การติดตั้ง Native Library:** ใช้ `npx expo install <package>` เสมอ ห้ามใช้ `npm i` โดยตรง
2. **Simulator Fallback:** กล้อง AR, GPS Map, และการสั่น Haptics ต้องมี fallback ให้รันบน Simulator ได้ไม่แครช
3. **การตรวจสอบ:** รัน `npx tsc --noEmit` เพื่อตรวจ Type ก่อนส่งมอบงานเสมอ
