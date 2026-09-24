# Project Rules & Agent Instructions (AGENTS.md)

This is an **Expo / React Native** mobile application simulating **Pokémon GO** based on the 11-week course curriculum and PokéAPI (`https://pokeapi.co/`).
Prioritize mobile-first patterns, performance, and cross-platform compatibility.

> **Session Acknowledgment:** ทุกครั้งที่เริ่มการตอบข้อความใหม่ หากเป็นข้อความแรกหรือผู้ใช้ถามถึงกฎ ให้ระบุหัวข้อชัดเจนว่าได้โหลดกฎจาก `AGENTS.md` เรียบร้อยแล้ว

---

## 1. Simulator & Hardware Fallbacks

Always provide fallbacks so the app runs smoothly on iOS Simulator, Android Emulator, and Expo Go:
- **Camera (AR Mode):** Fallback to a styled classic field graphic background when camera permission is denied or running on Simulator.
- **Location (GPS):** Provide D-pad directional controls and a "Spawn Nearby" button for indoor/simulator testing.
- **Haptics:** Wrap haptic calls gracefully with visual shake fallbacks.

---

## 2. Project Documentation & Skills (Always Loaded & Referenced)

### 2.1 Always Loaded Skills & Guidelines
Always load and follow the instructions from these skills and design specs:
- **Caveman Mode:** [.agents/skills/caveman/SKILL.md]
- **Karpathy Guidelines:** [.agents/skills/karpathy-guidelines/SKILL.md]
- **Pokémon GO Domain:** [.agents/skills/pokemon-go/SKILL.md]
- **Design System & Screen Specs:** [design.md] (ต้องโหลดและเรียกใช้อ้างอิงทุกครั้งที่ออกแบบ พัฒนา หรือปรับปรุงหน้าจอ/UI ทั้ง Mobile และ Web)

### 2.2 Project Documentation References (On-Demand)

When working on specific features, refer to the corresponding project documents:
- **Implementation Plan (Weeks 1 - 11):** [plan.md]
- **Architecture Decisions (ADR):** [docs/adr/README.md]