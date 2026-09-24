<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif" height="90" alt="Pikachu" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif" height="110" alt="Charizard" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/150.gif" height="115" alt="Mewtwo" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif" height="95" alt="Gengar" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif" height="80" alt="Eevee" />
</p>

<h1 align="center">⚡ Pokémon GO Mobile App ⚡</h1>

<p align="center">
  <b>A Cross-Platform Pokémon GO Simulation App built with React Native & Expo SDK 57</b>
  <br />
  <i>Simulating GPS Map Spawning, AR Catch Dynamics, PokéAPI Kanto 151, and Offline-first SQLite Storage</i>
</p>

<p align="center">
  <a href="https://expo.dev"><img src="https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" /></a>
  <a href="https://reactnative.dev"><img src="https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://docs.expo.dev/versions/latest/sdk/sqlite/"><img src="https://img.shields.io/badge/Storage-SQLite_(WAL)-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" /></a>
  <a href="https://pokeapi.co"><img src="https://img.shields.io/badge/Data-PokéAPI_v2-EF5350?style=for-the-badge&logo=pokemon&logoColor=white" alt="PokeAPI" /></a>
  <a href="https://github.com/PATHAPHON/pokemongo/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.style=for-the-badge" alt="License" /></a>
</p>

---

## 🌟 ภาพรวมโปรเจกต์ (Overview)

แอปพลิเคชันมือถือจำลองเกมยอดนิยมระดับโลก **Pokémon GO** ที่พัฒนาขึ้นบน **React Native (Expo SDK 57)** ตามหลักสูตรการพัฒนามือถือ 11 สัปดาห์ ครอบคลุมตั้งแต่งานสถาปัตยกรรม UI Design System, การเชื่อมต่อ REST API, ฐานข้อมูล Relational แบบ Offline-first ไปจนถึงการควบคุมฮาร์ดแวร์จริง เช่น กล้อง AR, GPS เซนเซอร์, และมอเตอร์สั่น Haptics

> 💡 **Simulator & Hardware Fallback Support:** ออกแบบมาให้ทำงานและทดสอบได้อย่างสมบูรณ์แบบทั้งบน **iOS Simulator**, **Android Emulator**, และเครื่องจริง โดยมีระบบจำลองตำแหน่ง (D-Pad Control) และหน้าจอสนามหญ้าคลาสสิก (Classic Meadow) เมื่อกล้องไม่พร้อมใช้งาน

---

## ✨ ไฮไลต์ฟีเจอร์เด่น (Key Features)

<table>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🗺️ Live GPS & Spawn Engine</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" width="40" /><br/>
        แผนที่โต้ตอบแบบเรียลไทม์ พร้อมระบบสุ่มเสกโปเกมอนป่ารอบตำแหน่งผู้เล่น พร้อมชุดควบคุม <b>D-Pad & Spawn Nearby</b> สำหรับทดสอบใน Simulator
      </p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">📸 AR Catch Mode</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png" width="40" /><br/>
        จับโปเกมอนด้วยกล้องจริง (AR Viewfinder) ฟิสิกส์การขว้างบอลและประเมินเกรด (Nice / Great / Excellent) พร้อม Fallback สู่ทุ่งหญ้าคลาสสิก
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">📖 Kanto 151 Pokédex</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" width="40" /><br/>
        สารานุกรมโปเกมอน Gen 1 ครบ 151 ชนิด พร้อมภาพ <b>Official HD Artwork</b>, ระบบค้นหาความเร็วสูง, กรองตามธาตุ และแสดงค่า Base Stats แบบละเอียด
      </p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">💾 Offline-First SQLite</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" width="40" /><br/>
        บันทึกคลังโปเกมอนที่จับได้ กระเป๋าไอเทม และโปรไฟล์เทรนเนอร์ลงใน <b>SQLite (WAL Mode)</b> เล่นและเปิดดูข้อมูลได้แม้ออฟไลน์ 100%
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🎒 Trainer Inventory & Profile</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razz-berry.png" width="40" /><br/>
        ระบบกระเป๋าไอเทม (Pokéballs, Berries, Potions), เลเวลเทรนเนอร์, สตาร์ดัสต์, เหรียญ PokéCoins และการเลือกสังกัดทีม (Valor, Mystic, Instinct)
      </p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">📳 Haptics & Notifications</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/egg.png" width="40" /><br/>
        การตอบสนองผ่านแรงสั่น Tactile Haptic Feedback ทุกจังหวะบอลสั่นและจับติด พร้อมการแจ้งเตือนสปอว์นและไข่ฟัก
      </p>
    </td>
  </tr>
</table>

---

## 🎨 Design System & 18 Elemental Types

ระบบสีมาตรฐานครบทั้ง 18 ธาตุ ออกแบบเพื่อการแสดงผลบน Dark Mode และ Light Mode อย่างสมบูรณ์:

<p align="center">
  <img src="https://img.shields.io/badge/Fire-EE8130?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Water-6390F0?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Grass-7AC74C?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Electric-F7D02C?style=flat-square&logoColor=black" />
  <img src="https://img.shields.io/badge/Psychic-F95587?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Ice-96D9D6?style=flat-square&logoColor=black" />
  <img src="https://img.shields.io/badge/Dragon-6F35FC?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Dark-705746?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Fairy-D685AD?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Normal-A8A878?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Fighting-C22E28?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Flying-A98FF3?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Poison-A33EA1?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Ground-E2BF65?style=flat-square&logoColor=black" />
  <img src="https://img.shields.io/badge/Rock-B6A136?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Bug-A6B91A?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Ghost-735797?style=flat-square&logoColor=white" />
  <img src="https://img.shields.io/badge/Steel-B7B7CE?style=flat-square&logoColor=black" />
</p>

---

## 🏗️ โครงสร้างไฟล์และสถาปัตยกรรม (Project Structure)

```bash
pokemongo/
├── app/                        # Expo Router (File-based Routing)
│   ├── (tabs)/                 # 4 Main Tabs
│   │   ├── index.tsx           # 🗺️ Live World Map & Nearby Radar
│   │   ├── pokedex.tsx         # 📖 Kanto 151 Pokédex Catalog
│   │   ├── bag.tsx             # 🎒 Caught Pokémon & Inventory
│   │   ├── profile.tsx         # 👤 Trainer Profile & Team Info
│   │   └── _layout.tsx         # Tab Navigation Shell
│   ├── pokemon/[id].tsx        # 🔍 Dynamic Pokémon Details Screen
│   ├── catch.tsx               # 🎯 AR Camera & Pokeball Throw Screen
│   └── _layout.tsx             # Root Layout with Theme & SQLite Provider
├── components/                 # Atomic & Feature UI Components
│   ├── ui/                     # Reusable Design System Elements
│   ├── TypeBadge.tsx           # Elemental Type Badges
│   ├── StatBar.tsx             # Animated Stat Gauges
│   └── PokeballButton.tsx      # Interactive Throw Controls
├── constants/                  # Design Tokens & Theme Colors
│   ├── pokemon-theme.ts        # 18 Type Colors, Team Colors & Stat Colors
│   └── theme.ts                # Application Theme Settings
├── docs/adr/                   # Architecture Decision Records (ADRs)
│   ├── 0001-navigation-expo-router.md
│   ├── 0002-data-fetching-pokeapi.md
│   ├── 0003-offline-storage-persistence.md  # SQLite Architecture
│   ├── 0004-camera-ar-fallback.md
│   ├── 0005-location-and-spawn-simulation.md
│   └── 0006-haptics-and-notifications.md
├── services/                   # Business & Data Services
│   ├── database.ts             # 🗄️ SQLite Engine (expo-sqlite WAL Mode)
│   └── pokeapi.ts              # 🌐 PokéAPI REST Client with HD Sprites
├── types/                      # TypeScript Definitions
│   ├── pokemon.ts              # Pokémon, Stats, IVs, Caught Specs
│   ├── trainer.ts              # Profile, Teams, Inventory Items
│   ├── gameplay.ts             # Wild Spawns, Catch Result, Map
│   └── index.ts                # Centralized Type Exports
└── task.md                     # 11-Week Progress Tracker (33 Micro-Tasks)
```

---

## 🗺️ แผนการพัฒนา 11 สัปดาห์ (11-Week Roadmap)

| Milestone | สถาปัตยกรรม (Layer) | สัปดาห์ | จำนวน Tasks | สถานะ |
|:---:|---|:---:|:---:|:---:|
| **M1** | Project Setup, Types & Design Tokens | W1, W3 | 4 Tasks | **100% (4/4)** ✅ |
| **M2** | Data Layer, Services & State Management | W5, 6, 7, 8 | 5 Tasks | **20% (1/5)** 🚀 |
| **M3** | Core UI Design System & Atomic Components | W2, 3, 5 | 7 Tasks | กำลังเริ่ม ⏳ |
| **M4** | Navigation Architecture & Tab Shell | W4 | 6 Tasks | กำลังเริ่ม ⏳ |
| **M5** | Gameplay Mechanics, Spawning & Maps | W8, W10 | 5 Tasks | กำลังเริ่ม ⏳ |
| **M6** | Hardware Integration, AR Catch & Notifications | W9, W11 | 6 Tasks | กำลังเริ่ม ⏳ |

> 📊 รายละเอียด micro-tasks แต่ละรายการ ติดตามได้ที่ [`task.md`](task.md)

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป)
- [npm](https://www.npmjs.com/) หรือ [yarn](https://yarnpkg.com/)
- [Expo Go App](https://expo.dev/go) บนมือถือ หรือ Xcode / Android Studio สำหรับ Simulator

### 2. ติดตั้ง Dependencies
```bash
git clone https://github.com/PATHAPHON/pokemongo.git
cd pokemongo
npm install
```

### 3. รันโปรเจกต์
```bash
# เริ่มต้น Metro Bundler
npx expo start

# รันตรงบน iOS Simulator
npx expo start --ios

# รันตรงบน Android Emulator
npx expo start --android

# รันเวอร์ชัน Web
npx expo start --web
```

### 4. ตรวจสอบ TypeScript Type Safety
```bash
npx tsc --noEmit
```

---

## 👨‍💻 ผู้พัฒนา (Author)

- **PATHAPHON** - [GitHub Profile](https://github.com/PATHAPHON)
- โครงการ: [PATHAPHON/pokemongo](https://github.com/PATHAPHON/pokemongo)

<p align="center">
  <sub>Gotta Catch 'Em All! • สร้างสรรค์ด้วยความหลงใหลในโลกโปเกมอนและโมบายล์เทคโนโลยี</sub>
</p>
