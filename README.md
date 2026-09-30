<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/25.gif" height="90" alt="Pikachu" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/6.gif" height="110" alt="Charizard" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/150.gif" height="115" alt="Mewtwo" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/94.gif" height="95" alt="Gengar" />
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/133.gif" height="80" alt="Eevee" />
</p>

<h1 align="center">⚡ Pokémon GO Mobile App ⚡</h1>

<p align="center">
  <b>A Production-Grade Pokémon GO Simulation App built with React Native & Expo SDK 57</b>
  <br />
  <i>Modular Lego-Block Architecture, Live GPS Spawning, AR Catch, Pokédex Catalog, and Offline SQLite</i>
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

แอปพลิเคชันมือถือจำลองเกมระดับโลก **Pokémon GO** ที่พัฒนาขึ้นบน **React Native (Expo SDK 57)** ตามหลักสูตรโมบายล์ 11 สัปดาห์ ครบถ้วน 35 Micro-Tasks (100% Complete)

โครงสร้างโค้ดออกแบบด้วยสถาปัตยกรรม **Lego-Block Architecture (Feature-First & OOP Repositories)** เพื่อความยืดหยุ่น แยกส่วนชัดเจน (Decoupled) บำรุงรักษาง่าย และรองรับการทำงานแบบ Offline-first ผ่าน SQLite อย่างสมบูรณ์

> 💡 **Simulator & Hardware Fallback Support:** ทดสอบได้เต็มรูปแบบทั้งบน **iOS Simulator**, **Android Emulator**, **Web**, และเครื่องจริง โดยมีระบบจำลองพิกัดเดินด้วย D-Pad, การเสกโปเกมอนทดสอบ, และ Classic Meadow Fallback เมื่อไม่เปิดกล้อง AR

---

## ✨ ไฮไลต์ฟีเจอร์เด่น (Key Features)

<table>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🗺️ Live GPS & Spawn Engine</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" width="40" /><br/>
        แผนที่โต้ตอบ 2D Leaflet OSM หมุนตามเข็มทิศผู้เล่น พร้อมระบบสปอว์นรอบตัว 15 จุด มีแถบนับถอยหลัง Despawn Timer และชุดควบคุม <b>D-Pad & Teleport / Spawn Nearby</b> สำหรับทดสอบ
      </p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">📸 AR Catch Mode & Physics</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/great-ball.png" width="40" /><br/>
        จับโปเกมอนด้วยกล้องจริงผ่าน <code>expo-camera</code> พร้อมฟิสิกส์ขว้างบอล วงแหวนประเมินเกรด (Nice / Great / Excellent) แรงสั่น Haptic Feedback และ Fallback เป็นทุ่งหญ้าคลาสสิกเมื่อปิดกล้อง
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">📖 Complete Pokédex Catalog</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png" width="40" /><br/>
        สารานุกรมโปเกมอนครบวงจร พร้อมภาพ <b>Official Artwork</b>, ค้นหาแบบเรียลไทม์, กรองตามธาตุทั้ง 18 ธาตุ และหน้าแสดงข้อมูลสเตตัส Base Stats, ส่วนสูง, น้ำหนัก
      </p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">💾 Offline-First SQLite (OOP)</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png" width="40" /><br/>
        ฐานข้อมูลในเครื่องด้วย <code>expo-sqlite</code> โหมด WAL แยก Repository ชั้นข้อมูล: <code>PokemonRepository</code>, <code>TrainerRepository</code>, <code>InventoryRepository</code> เล่นและบันทึกออฟไลน์ได้ 100%
      </p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3 align="center">🎒 Caught Bag & Inventory</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razz-berry.png" width="40" /><br/>
        คลังโปเกมอนที่จับได้ จัดการตั้งชื่อเล่น (Nickname), ติดดาวรายการโปรด (Favorite), ปล่อยสู่ธรรมชาติ (Transfer), กรองระดับความหายาก (Common / Rare / Legendary) พร้อมคลังไอเทมบอลและเบอร์รี่
      </p>
    </td>
    <td width="50%" valign="top">
      <h3 align="center">🔔 Notifications & Permissions</h3>
      <p align="center">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/egg.png" width="40" /><br/>
        ระบบแจ้งเตือน Local Notifications เมื่อมีโปเกมอนเกิดใหม่หรือระดับ Rare ใกล้ตัวผู้เล่น รองรับ Android Notification Channels และ Deep Link เปิดเข้าหน้าจับกุมทันที
      </p>
    </td>
  </tr>
</table>

---

## 🎨 Design System & 18 Elemental Types

ชุดสีมาตรฐานสากลครบทั้ง 18 ธาตุ รองรับการแสดงผลทั้ง Dark Mode และ Light Mode อย่างคมชัด:

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

## 🏗️ โครงสร้างสถาปัตยกรรม (Lego-Block Architecture)

โค้ดถูกจัดระเบียบภายใต้ไดเรกทอรี `src/` แบบ Feature-First แยกย่อยเป็นโมดูลอิสระ (Lego Blocks):

```bash
pokemongo/
├── src/
│   ├── app/                               # Expo Router (File-based Navigation)
│   │   ├── (tabs)/                        # Main Bottom Tabs
│   │   │   ├── index.tsx                  # 🗺️ World Map & Spawns Radar
│   │   │   ├── pokedex.tsx                # 📖 Pokédex Catalog (All Generations)
│   │   │   ├── pokemon.tsx                # 🎒 Caught Pokémon & Inventory
│   │   │   ├── profile.tsx                # 👤 Trainer Profile & Settings
│   │   │   └── _layout.tsx                # Bottom Tabs Shell & Haptic Tab
│   │   ├── pokemon/[id].tsx               # 🔍 Pokémon Detail Screen
│   │   ├── catch.tsx                      # 🎯 AR Catch Screen Presentation Modal
│   │   ├── login.tsx                      # 🔐 Trainer Auth & Session Switch
│   │   └── _layout.tsx                    # Root Layout, Providers & Deep Links
│   ├── features/                          # Feature Modules (Lego Blocks)
│   │   ├── catch/                         # AR View, Throw Arena, Gotcha Modal
│   │   │   ├── components/                # PokeballArena, WildPokemonStage, CameraGate
│   │   │   └── hooks/use-catch-game.ts    # Catch Dynamics & Ball Physics
│   │   ├── map/                           # Leaflet 2D Map, D-Pad, Spawning
│   │   │   ├── components/                # LeafletMapView, MapControls, Modals
│   │   │   ├── hooks/                     # useUserLocation, useMapSpawns, useNotifications
│   │   │   └── services/spawn-engine.ts   # Procedural Spawning Engine (15 spots)
│   │   ├── pokedex/                       # Pokédex Grid, Search & Filter Bar
│   │   ├── pokemon/                       # Caught Cards, Rarity Bar, Details Hero
│   │   └── profile/                       # Trainer Card & Permission Controls
│   └── shared/                            # Shared Utilities & Foundation
│       ├── components/                    # TypeBadge, RarityBadge, HapticTab
│       ├── constants/                     # Theme Tokens, Kanto Data, Registry
│       ├── context/trainer-context.tsx    # Global State Provider
│       ├── services/                      # OOP Repositories & Singleton Services
│       │   ├── database/                  # DatabaseManager & OOP Repositories
│       │   ├── notifications/             # NotificationManager & Channel Config
│       │   ├── pokeapi/                   # PokeApiClient & Caching
│       │   └── auth-api.ts                # SecureStore Auth Session
│       └── types/                         # TypeScript Domain Types
├── tests/                                 # Automated Test Suites (Node.js Test Runner)
│   ├── pokemon-test-suite.test.mjs        # Core Domain & Repositories Test
│   ├── pokedex.test.mjs                   # Pokédex Data & Filtering Test
│   ├── gen2-gen3-unique-spawns.test.mjs   # Multi-Generation Spawning Test
│   ├── spawn-notifications-rarity.test.mjs# Spawn Alert & Rarity Evaluation Test
│   ├── week6-networking.test.mjs         # PokéAPI Integration Test
│   ├── week8-auth-session.test.mjs        # Auth & Storage Test
│   ├── week11-notifications.test.mjs      # Notification Channels & Triggers Test
│   └── web-platform-guard.test.mjs        # Cross-Platform Fallbacks Test
├── docs/                                  # Presentation & Architecture Documentation
│   └── syllabus-presentation.html         # 11-Week Course Presentation Slide
└── task.md                                # 11-Week Progress Tracker (35 Micro-Tasks)
```

---

## 🗺️ แผนการพัฒนา 11 สัปดาห์ (11-Week Roadmap)

| Milestone | สถาปัตยกรรม (Layer) | สัปดาห์ | จำนวน Tasks | สถานะ |
|:---:|---|:---:|:---:|:---:|
| **M1** | Project Setup, Types & Design Tokens | W1, W3 | 4 Tasks | **100% (4/4)** ✅ |
| **M2** | Data Layer, Services & State Management | W5, 6, 7, 8 | 5 Tasks | **100% (5/5)** ✅ |
| **M3** | Core UI Design System & Atomic Components | W2, 3, 5 | 7 Tasks | **100% (7/7)** ✅ |
| **M4** | Navigation Architecture & Tab Shell | W4 | 6 Tasks | **100% (6/6)** ✅ |
| **M5** | Gameplay Mechanics, Spawning & Maps | W10 | 3 Tasks | **100% (3/3)** ✅ |
| **M6** | Hardware Integration, AR Catch & Notifications | W9, W11 | 10 Tasks | **100% (10/10)** ✅ |
| **รวม** | **ทั้งหมด (Full Game Loop & Platform APIs)** | **Weeks 1 - 11** | **35 Tasks** | **100% (35/35)** 🎉 |

> 📊 ติดตามรายละเอียด Checklist ทุกขั้นตอนได้ที่ [`task.md`](task.md)

---

## 🧪 การทดสอบระบบ (Automated Testing)

โปรเจกต์มีชุดทดสอบอัตโนมัติ (Automated Unit & Integration Tests) ครอบคลุมทุกเลเยอร์ของระบบ:

```bash
# รันชุดทดสอบทั้งหมด (8 Test Suites)
npm test

# ตรวจสอบรูปแบบโค้ด (Prettier Format Check)
npm run format:check

# จัดรูปแบบโค้ดอัตโนมัติ
npm run format
```

---

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### 1. ความต้องการของระบบ (Prerequisites)
- [Node.js](https://nodejs.org/) (เวอร์ชัน 18 ขึ้นไป แนะนำ LTS)
- [npm](https://www.npmjs.com/)
- [Expo Go App](https://expo.dev/go) บนมือถือ หรือ iOS Simulator / Android Emulator

### 2. ติดตั้ง Dependencies
```bash
git clone https://github.com/PATHAPHON/pokemongo.git
cd pokemongo
npm install
```

### 3. รันโปรเจกต์
```bash
# รัน Metro Bundler
npm start

# รันตรงบน iOS Simulator
npx expo start --ios

# รันตรงบน Android Emulator
npx expo start --android

# รันบน Web Browser
npx expo start --web
```

---

## 👨‍💻 ผู้พัฒนา (Author)

- **PATHAPHON** - [GitHub Profile](https://github.com/PATHAPHON)
- Repository: [PATHAPHON/pokemongo](https://github.com/PATHAPHON/pokemongo)

<p align="center">
  <sub>Gotta Catch 'Em All! • สร้างสรรค์ด้วยความหลงใหลในโลกโปเกมอนและโมบายล์เทคโนโลยี</sub>
</p>
