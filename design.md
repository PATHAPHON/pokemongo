# Pokémon GO - Design System & Screen Specifications (design.md)

เอกสารมาตรฐานการออกแบบ UI/UX, Design Tokens, และโครงสร้างหน้าจอ (Screen Specifications) สำหรับแอปพลิเคชัน **Pokémon GO Mobile & Web** (React Native + Expo SDK 57)
เอกสารนี้เป็น Single Source of Truth ด้านการออกแบบที่ทุก Agent และนักพัฒนาต้องยึดถือและปฏิบัติตามทุกครั้งเมื่อมีการพัฒนา ปรับปรุง หรือสร้าง UI/UX ใหม่

---

## 1. ปรัชญาและทิศทางการออกแบบ (Design Philosophy)

1. **Authentic Pokémon GO Aesthetic:** ถ่ายทอดความรู้สึกของเกมจริง มีชีวิตชีวา (Vibrant), สีสันสดใส ชัดเจน, โค้งมนเข้าถึงง่าย (Rounded & Friendly), สื่อความหมายเชิงเกมมิ่ง (Gamified)
2. **Mobile-First & Cross-Platform Web Ready:**
   - **บน Mobile (iOS / Android):** Native Look & Feel, Bottom Tab Navigation, Safe Area Inset Handling, Tactile Haptics
   - **บน Web:** แสดงผลแบบ Mobile Container (Max-Width 430px กึ่งกลางหน้าจอ พร้อมพื้นหลังลวดลาย Pokémon GO Ambient) หรือ Responsive Layout ที่รองรับการคลิกเมาส์และปุ่มคีย์บอร์ด (WASD / Arrows)
3. **High Contrast & Accessibility:** รองรับทั้ง Light Mode และ Dark Mode สีของตัวอักษรและพื้นหลังต้องผ่านเกณฑ์ WCAG AA เพื่อให้อ่านง่ายทั้งกลางแจ้งและในร่ม
4. **Resilient Hardware Fallbacks:** ทุกหน้าจอที่มีฮาร์ดแวร์จริง (กล้อง AR, GPS, มอเตอร์สั่น) ต้องมี Fallback UI สวยงาม ไม่พังบน Web หรือ Simulator

---

## 2. Design Tokens (ระบบโทเค็นการออกแบบ)

ค่าคงที่ทั้งหมดถูกนิยามเป็นโค้ดอยู่ที่ [`constants/theme.ts`](constants/theme.ts) และ [`constants/pokemon-theme.ts`](constants/pokemon-theme.ts)

### 2.1 Color Palette (พาเลตต์สี)

#### System Theme Colors (`Colors` ใน `constants/theme.ts`)
| Token Name | Light Mode | Dark Mode | การนำไปใช้งาน |
|---|---|---|---|
| `text` | `#11181C` | `#ECEDEE` | ข้อความหลัก, ชื่อหัวข้อ |
| `background` | `#FFFFFF` | `#151718` | พื้นหลังของหน้าจอหลัก |
| `tint` | `#0A7EA4` | `#FFFFFF` | สีไฮไลต์, Active Tab Icon |
| `icon` | `#687076` | `#9BA1A6` | สีไอคอนทั่วไปที่ไม่ได้แอคทีฟ |
| `surface` | `#F4F6F8` | `#1E2124` | สีพื้นหลังการ์ดหรือแผงควบคุม |
| `border` | `#E1E4E8` | `#2D3135` | เส้นขอบและเส้นแบ่งส่วน |

#### 18 Elemental Type Colors (`PokemonTypeColors` ใน `constants/pokemon-theme.ts`)
ใช้สำหรับการ์ด, TypeBadge, พื้นหลังโปรไฟล์ และเอฟเฟกต์ธาตุ:

| ธาตุ (Type) | สีหลัก (Primary) | สีพื้นหลังการ์ด (Background) | สีตัวอักษร (Text) |
|---|---|---|---|
| **Normal** | `#A8A878` | `#C6C6A7` | `#FFFFFF` |
| **Fire** | `#EE8130` | `#F5AC78` | `#FFFFFF` |
| **Water** | `#6390F0` | `#9DB7F5` | `#FFFFFF` |
| **Grass** | `#7AC74C` | `#A7DB8D` | `#FFFFFF` |
| **Electric** | `#F7D02C` | `#FAE078` | `#1E1E1E` |
| **Ice** | `#96D9D6` | `#BCE6E6` | `#1E1E1E` |
| **Fighting** | `#C22E28` | `#D67873` | `#FFFFFF` |
| **Poison** | `#A33EA1` | `#C183C1` | `#FFFFFF` |
| **Ground** | `#E2BF65` | `#EBD69D` | `#1E1E1E` |
| **Flying** | `#A98FF3` | `#C6B7F5` | `#FFFFFF` |
| **Psychic** | `#F95587` | `#FA92B2` | `#FFFFFF` |
| **Bug** | `#A6B91A` | `#C6D16E` | `#FFFFFF` |
| **Rock** | `#B6A136` | `#D1C17D` | `#FFFFFF` |
| **Ghost** | `#735797` | `#A292BC` | `#FFFFFF` |
| **Dragon** | `#6F35FC` | `#A27DFA` | `#FFFFFF` |
| **Steel** | `#B7B7CE` | `#D1D1E0` | `#1E1E1E` |
| **Fairy** | `#D685AD` | `#F4BDC9` | `#FFFFFF` |
| **Dark** | `#705746` | `#A29288` | `#FFFFFF` |

#### Team Colors (`TeamColors` ใน `constants/pokemon-theme.ts`)
- **Team Valor (ไฟ/โมลเทรส):** Primary `#FF3B30`, Secondary `#FFE5E5`
- **Team Mystic (น้ำแข็ง/ฟรีซเซอร์):** Primary `#007AFF`, Secondary `#E5F2FF`
- **Team Instinct (สายฟ้า/ธันเดอร์):** Primary `#FFCC00`, Secondary `#FFF9E5`
- **None (ยังไม่เลือกทีม):** Primary `#8E8E93`, Secondary `#F2F2F7`

#### Base Stats Colors (`StatColors` ใน `constants/pokemon-theme.ts`)
- **HP (พลังชีวิต):** `#48D0B0` (Teal Green)
- **Attack (พลังโจมตี):** `#FB6C6C` (Coral Red)
- **Defense (พลังป้องกัน):** `#76BDFE` (Sky Blue)
- **Special Attack:** `#F85888` (Magenta Pink)
- **Special Defense:** `#A890F0` (Lavender Purple)
- **Speed (ความเร็ว):** `#F5AC78` (Warm Peach)

#### Catch Throw & Accuracy Colors (`ThrowRatingColors`)
- **Excellent Throw:** `#34C759` (Vivid Green)
- **Great Throw:** `#007AFF` (Electric Blue)
- **Nice Throw:** `#FF9500` (Amber Orange)
- **Miss Throw:** `#FF3B30` (Alert Red)

---

### 2.2 Typography Scale (ระดับขนาดตัวอักษร)

ใช้ Font Family ตามแพลตฟอร์มผ่าน [`Fonts`](constants/theme.ts) (iOS: `system-ui`/`ui-rounded`, Android: `normal`, Web: `system-ui, -apple-system, sans-serif`):

| Token | ขนาด (Size) | ความหนา (Weight) | Line Height | การใช้งาน |
|---|---|---|---|---|
| `display` | 32px | 800 (Bold) | 38px | สถิติใหญ่, ชื่อโปเกมอนในหน้า Detail |
| `title` | 24px | 700 (Bold) | 28px | หัวข้อหน้า (Page Title) |
| `subtitle` | 18px | 600 (SemiBold) | 24px | หัวข้อย่อย, ชื่อกลุ่มไอเทม |
| `body` | 15px | 400 (Regular) | 20px | รายละเอียด, ข้อความอธิบายทั่วไป |
| `callout` | 14px | 600 (SemiBold) | 18px | ตัวเลข CP, ป้ายเลเวล, ข้อความในปุ่ม |
| `caption` | 12px | 500 (Medium) | 16px | รหัสโปเกมอน (`#025`), สเตตัสย่อย |
| `micro` | 10px | 600 (SemiBold) | 12px | ป้ายระบุจำนวนในกระเป๋า (Badge Count) |

---

### 2.3 Spacing, Radius & Shadows (ระยะห่าง ขอบมน และเงา)

#### Spacing Scale (ตารางระยะห่าง 4pt/8pt Grid)
- `xs`: 4px | `sm`: 8px | `md`: 16px | `lg`: 24px | `xl`: 32px | `2xl`: 48px

#### Border Radius Scale
- `radius-sm`: 8px (ป้าย Badge, Tag ขนาดเล็ก)
- `radius-md`: 14px (การ์ดโปเกมอน, กล่องข้อมูล, ช่องค้นหา)
- `radius-lg`: 20px (Modal, Bottom Sheet, แผงควบคุม D-pad)
- `radius-full`: 9999px (ปุ่มวงกลม FAB, Pokéball Button, หลอดพลัง)

#### Elevation & Shadows
- **Card Shadow:** `box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);` (iOS/Web) / `elevation: 3` (Android)
- **Floating Button / Modal Shadow:** `box-shadow: 0px 8px 24px rgba(0, 0, 0, 0.16);` / `elevation: 6`
- **Type Glow (เฉพาะสีธาตุ):** `box-shadow: 0px 4px 16px ${typeColor}66;`

---

## 3. รายละเอียดการออกแบบแต่ละหน้าจอ (Screen Specifications)

### 3.1 Tab 1: World Map & Radar Screen (`app/(tabs)/index.tsx`)
หน้าจอหลักสำหรับการสำรวจ แผนที่ดาวเทียม และตรวจจับโปเกมอนรอบตัว

```
+------------------------------------------------+
|  [Weather: Sunny]            [Compass: North]  |
|                                                |
|                   ( Wild Pidgey )              |
|                                                |
|              (o) Player Avatar                 |
|             / | \  [Pulse Radar 100m]          |
|                                                |
|       ( Wild Pikachu )                         |
|                                                |
|  [Floating Simulator D-Pad]   [Spawn Nearby]   |
|  [<] [^] [v] [>]             [PokeStop Pin]    |
|------------------------------------------------|
|  [Trainer Mini]      ( Pokéball )     [Bag]    |
+------------------------------------------------+
```

- **Top Status Overlay:**
  - ซ้าย: กล่องบอกสภาพอากาศ (Weather Badge เช่น Sunny, Rainy) มีผลต่อธาตุโปเกมอนที่เกิด
  - ขวา: เข็มทิศนำทาง (Compass) แตะเพื่อหันหน้าจอไปทางทิศเหนือ
- **Map Viewport:**
  - จุดผู้เล่น (Player Avatar Pin) มีวงเรดาร์สีฟ้าขยายเป็นจังหวะ (Radar Pulse Effect) รัศมี 100 เมตร
  - มาร์กเกอร์โปเกมอนป่า (Wild Pokémon Pins): ไอคอนโปเกมอนลอย พร้อมวงแหวนนับถอยหลังการหายตัว (Despawn Ring) เมื่อแตะจะเปิดหน้าจอ [`app/catch.tsx`](app/catch.tsx)
- **Simulator & Web Controls Dock:**
  - แผงลอย (Floating Panel) โปร่งใส มนโค้ง:
    - **D-Pad Directional Controls:** ปุ่มลูกศร 4 ทิศสำหรับเดินทดสอบใน Simulator และ Web
    - **Speed Multiplier:** สลับความเร็วเดิน (1x / 3x / 5x)
    - **Spawn Nearby Button:** ปุ่มสีเขียวกดเพื่อสุ่มเสกโปเกมอนรอบตัวทันที (ไม่แครชแม้ไม่มีสัญญาณ GPS จริง)
- **Bottom HUD:**
  - ปุ่มโปรไฟล์ขนาดเล็กด้านซ้าย (แสดงอวาตาร์และเลเวล)
  - ปุ่ม Pokéball กลมขนาดใหญ่ตรงกลาง (กดเพื่อเปิดเมนูด่วน)
  - ปุ่ม Bag และ Pokédex ลัดด้านขวา

---

### 3.2 Tab 2: Pokédex Catalog Screen (`app/(tabs)/pokedex.tsx`)
สารานุกรมโปเกมอนภูมิภาคคันโต 151 ตัว พร้อมระบบค้นหาและกรองข้อมูล

```
+------------------------------------------------+
|  [< Back]     Pokédex (Kanto 151)     [Total]  |
|  [🔍 Search name or #number...               ]  |
|  (All) [Fire] [Water] [Grass] [Electric] ->   |
|------------------------------------------------|
|  +--------------------+  +--------------------+|
|  | #001 Bulbasaur     |  | #004 Charmander    ||
|  | [Grass] [Poison]   |  | [Fire]             ||
|  |     [ Image ]      |  |     [ Image ]      ||
|  +--------------------+  +--------------------+|
|  +--------------------+  +--------------------+|
|  | #007 Squirtle      |  | #025 Pikachu       ||
|  | [Water]            |  | [Electric]         ||
|  |     [ Image ]      |  |     [ Image ]      ||
|  +--------------------+  +--------------------+|
+------------------------------------------------+
```

- **Sticky Header:**
  - หัวข้อแสดงจำนวนที่ปลดล็อก เช่น `Seen: 45 / Caught: 32`
  - กล่องค้นหา (Search Input) แบบ Instant Filter: ค้นหาได้ทั้งชื่อภาษาอังกฤษ และหมายเลข ID เช่น `#025` หรือ `Pikachu`
  - Carousel แถบแนวนอนกรองธาตุ (Type Pills): เลื่อนซ้าย-ขวาได้ แตะเพื่อกรองเฉพาะธาตุที่ต้องการ พร้อม Badge สีธาตุ
- **Grid Layout:**
  - Mobile: 2 คอลัมน์ (ความกว้างการ์ดเท่ากัน, ระยะห่าง gap: 12px)
  - Web/Tablet: 3-4 คอลัมน์ รองรับหน้าจอแนวกว้าง
- **Pokémon Card Spec:**
  - สีพื้นหลังการ์ด: ใช้สีพื้นหลังของธาตุหลัก (`PokemonTypeColors[type].background`) แบบไล่เฉดหรือทึบแสง 15% พร้อมลายน้ำ Pokéball จางๆ
  - ข้อมูลภายในการ์ด: หมายเลขประจำตัว `#001` มุมบนซ้าย, ชื่อมุมบน, ป้าย `TypeBadge` ขนาดกะทัดรัด
  - รูปโปเกมอน: Official Artwork คมชัด ตัดฉากหลัง วางตำแหน่งลอยออกมาเล็กน้อย (Offset overlap)
  - Loading State: Skeleton Loader ทรงสี่เหลี่ยมมนสีกระพริบ Shimmer Effect

---

### 3.3 Tab 3: Bag & Inventory Screen (`app/(tabs)/bag.tsx`)
คลังโปเกมอนที่จับได้และกระเป๋าไอเทม รองรับการทำงาน Offline 100% ผ่าน SQLite

```
+------------------------------------------------+
|  [ Caught Pokémon (24/250) ] | [ Items (48) ]  |
|  Sort: [CP ▼]                     [Search 🔍]  |
|------------------------------------------------|
|  +--------------+  +--------------+  +--------+|
|  | CP 1420      |  | CP 890       |  | CP 650 ||
|  | [★ Favorite] |  |              |  |        ||
|  |   [Gengar]   |  |  [Snorlax]   |  | [Eevee]||
|  | Gengar       |  | Snorlax      |  | Eevee  ||
|  +--------------+  +--------------+  +--------+|
|------------------------------------------------|
|  💾 Offline Ready (SQLite WAL Mode Active)    |
+------------------------------------------------+
```

- **Top Segmented Tabs:**
  - สลับระหว่าง **Pokémon** (จำนวนตัว/ความจุสูงสุด เช่น `42/250`) และ **Items** (จำนวนชิ้น เช่น `65/350`)
- **Pokémon Tab:**
  - แถบเครื่องมือ: จัดเรียง (Sort by: CP สูงสุด, หมายเลข ID, วันที่จับล่าสุด, ความชื่นชอบ Favorite)
  - รายการโปเกมอน: แสดงค่า CP ชัดเจนที่มุมบน, ไอคอนดาวสีเหลืองสำหรับตัวโปรด, แตะเพื่อดูรายละเอียดหรือโอนย้าย (Transfer เพื่อแลก Candy)
- **Items Tab:**
  - จัดหมวดหมู่ 3 กลุ่ม:
    1. **Pokéballs:** Pokéball, Great Ball, Ultra Ball, Master Ball
    2. **Berries:** Razz Berry (เพิ่มโอกาสจับ), Nanab Berry (ทำให้โปเกมอนอยู่นิ่ง), Pinap Berry (ได้ Candy x2)
    3. **Recovery & Boost:** Potion, Revive, Incense, Lucky Egg
  - มีป้ายวงกลมแสดงจำนวนไอเทมคงเหลือชัดเจน
- **Offline Sync Status Banner:**
  - มีแถบสถานะระบุการซิงค์ข้อมูลกับ Local SQLite อัตโนมัติ ปลอดภัยแม้ไม่มีอินเทอร์เน็ต

---

### 3.4 Tab 4: Trainer Profile Screen (`app/(tabs)/profile.tsx`)
หน้าข้อมูลผู้เล่น สังกัดทีม เหรียญเกียรติยศ และสถิติการผจญภัย

```
+------------------------------------------------+
|  ============= TEAM MYSTIC BANNER =============|
|                  ( Trainer )                   |
|                    Avatar                      |
|                  AshKetchum                    |
|                [ LEVEL 24 ]                    |
|  XP: [========--------] 45,200 / 60,000 XP     |
|------------------------------------------------|
|  💰 1,250 PokéCoins        ✨ 48,000 Stardust  |
|------------------------------------------------|
|  Total Caught: 148          PokéStops: 312     |
|  Distance Walked: 42.5 km   Gym Battles: 18    |
|------------------------------------------------|
|  🏅 Medals & Achievements                      |
|  [Kanto Gold]  [Collector Silver]  [Jogger]    |
+------------------------------------------------+
```

- **Header & Team Theming:**
  - แบนเนอร์ด้านบนเปลี่ยนสีและสัญลักษณ์ตามสังกัดทีม (`TeamColors`: แดง Valor, ฟ้า Mystic, เหลือง Instinct)
  - รูปอวาตาร์เทรนเนอร์ตรงกลาง พร้อมป้ายชื่อและเลเวล
- **Level & Experience Gauge:**
  - หลอดบาร์ EXP แบบสองสี พร้อมตัวเลขบอก XP ปัจจุบันและ XP ที่ต้องการเพื่อเลเวลถัดไป
- **Currencies Strip:**
  - แถบเหรียญทอง PokéCoins และผงดาว Stardust พร้อมไอคอนประกายระยิบระยับ
- **Statistics Grid (2x2 Matrix):**
  - จำนวนโปเกมอนที่จับได้ (Total Caught)
  - จำนวนเสา PokéStop ที่หมุน (PokéStops Visited)
  - ระยะทางที่เดินสะสม (Distance Walked กิโลเมตร)
  - ข้อมูลสารานุกรมที่ค้นพบ (Pokédex Registered)
- **Medal Showcase:**
  - ชั้นวางเหรียญรางวัล (ทอง, เงิน, ทองแดง) แตะเพื่อดูเงื่อนไขการปลดล็อก

---

### 3.5 Detail Screen: Dynamic Pokémon Details (`app/pokemon/[id].tsx`)
หน้ารายละเอียดเชิงลึก สถิติ Base Stats และสายวิวัฒนาการ

```
+------------------------------------------------+
|  [< Back]               #025             [★ Fav]
|                                                |
|             ( Official HD Sprite )             |
|                                                |
|                     Pikachu                    |
|             [ Electric ] Type Badge            |
|                                                |
|      Weight: 6.0 kg      |      Height: 0.4 m  |
|------------------------------------------------|
|  BASE STATS                                    |
|  HP      35  [====-----------------------]     |
|  ATK     55  [=======--------------------]     |
|  DEF     40  [=====----------------------]     |
|  SP.ATK  50  [======---------------------]     |
|  SP.DEF  50  [======---------------------]     |
|  SPD     90  [============---------------]     |
|------------------------------------------------|
|  EVOLUTION CHAIN                               |
|  (Pichu) ----> (Pikachu) ----> (Raichu)        |
+------------------------------------------------+
```

- **Header & Hero View:**
  - พื้นหลังไล่เฉดสีตามธาตุหลักของโปเกมอน
  - ภาพสไปรต์ HD Artwork ขนาดใหญ่ตรงกลาง พร้อมแอนิเมชันลอยเบาๆ (Floating Bobbing Effect)
- **Attributes Section:**
  - น้ำหนัก (Weight), ส่วนสูง (Height), ประเภทสายพันธุ์ (Species), และหมวดหมู่
- **Base Stats Gauges (หลอดค่าพลัง):**
  - แสดงค่าพลังทั้ง 6 อย่าง: HP, Attack, Defense, Special Attack, Special Defense, Speed
  - หลอดพลังใช้สีตาม [`StatColors`](constants/pokemon-theme.ts) และมีความยาวสัมพันธ์กับค่าสูงสุด (Max 255) พร้อมตัวเลขอ่านง่าย
- **Evolution Chain Flow:**
  - แผนภาพแสดงสายวิวัฒนาการเรียงจากร่างแรกไปร่างสุดท้าย พร้อมลูกศรเชื่อมโยงและเงื่อนไข (Candy หรือ Level)

---

### 3.6 Interactive Modal: AR Catch Screen (`app/catch.tsx`)
หน้าจอจับโปเกมอนด้วยกล้องจริง หรือสนามหญ้าจำลอง พร้อมฟิสิกส์การขว้างบอล

```
+------------------------------------------------+
|  [🏃 Run Away]               [📸 AR Switch]    |
|                                                |
|                   ( Wild Eevee )               |
|                   ((  Target  ))               |
|                   ((   Ring   ))               |
|                                                |
|                                                |
|                   ( Pokéball )                 |
|                   [ Swipe Up ]                 |
|------------------------------------------------|
|  [🍓 Razz Berry (x5)]     [🔴 Pokéball (x18)]  |
+------------------------------------------------+
```

- **Viewport Background:**
  - **โหมดเปิดกล้อง (AR Enabled):** แสดงฟีดกล้องจริงจากเลนส์หลัง
  - **โหมด Simulator / ไม่ได้สิทธิ์กล้อง / Web:** แสดงฉากหลัง **Classic Meadow Field** (ทุ่งหญ้าสีเขียวสด ท้องฟ้าสีคราม และก้อนเมฆสไตล์การ์ตูน) อัตโนมัติ ไม่แครช
- **Catch Ring Physics (วงแหวนเป้าหมาย):**
  - วงแหวนเป้าหมายสีขยาย-หดตัววนลูปต่อเนื่อง
  - สีของวงแหวนตามความยากในการจับ:
    - สีเขียว (`#34C759`): จับง่าย (อัตราสำเร็จสูง)
    - สีเหลือง/ส้ม (`#FF9500`): ปานกลาง
    - สีแดง (`#FF3B30`): ยาก (โปเกมอนหายาก/CP สูง)
- **Pokéball Throwing Gesture:**
  - รองรับการลากนิ้วขึ้น (Swipe Up) บนหน้าจอสัมผัส หรือคลิกลากเมาส์บน Web
  - คำนวณความเร็วและทิศทางการโยนบอล
  - ตรวจจับจุดกระทบเป้าหมาย: ประเมินคะแนนเป็น `Nice!`, `Great!`, หรือ `Excellent!` พร้อมแสดงป้ายลอยขึ้นมา
- **Catch Outcome Sequences:**
  - ลูกบอลขยับสั่น 3 จังหวะ (มี Haptic สั่นสะเทือน หรือหน้าจอสั่นไหวหากรันบน Simulator)
  - จังหวะจับสำเร็จ: แสดงเอฟเฟกต์ดาวประกายรอบบอล พร้อมเปิดกล่องสรุปผล (EXP, Stardust, Candy ที่ได้รับ)
  - จังหวะหลุดออกจากบอล (Breakout): โปเกมอนกระโดดออกมาพร้อมเอฟเฟกต์ควัน

---

## 4. ข้อกำหนดส่วนประกอบหลัก (Component Specifications)

ทุกคอมโพเนนต์ต้องถูกสร้างให้อยู่ในโครงสร้างแบบ Atomic UI ในโฟลเดอร์ `components/`:

### 4.1 `TypeBadge` Component
- **หน้าที่:** แสดงป้ายชื่อธาตุโปเกมอน เช่น `FIRE`, `WATER`, `ELECTRIC`
- **Props:**
  - `type: PokemonTypeName` (1 ใน 18 ธาตุ)
  - `size?: 'sm' | 'md' | 'lg'` (default: `'md'`)
  - `showIcon?: boolean`
- **สไตล์:** ขอบมน Capsule (`borderRadius: 9999px`), ตัวอักษรสีขาวหนาพิมพ์ใหญ่ทั้งหมด, สีพื้นหลังตาม `PokemonTypeColors[type].primary`

### 4.2 `StatBar` Component
- **หน้าที่:** แถบแสดงค่าพลังสถิติพร้อมแอนิเมชันวิ่งเต็มหลอด
- **Props:**
  - `name: PokemonStatName`
  - `value: number`
  - `maxValue?: number` (default: `255`)
- **สไตล์:** ความสูง 8px, ขอบมนมน, พื้นหลังสีเทาอ่อน, สีแถบพลังตาม `StatColors[name]`

### 4.3 `PokeballButton` Component
- **หน้าที่:** ปุ่มแอคชันหลักทรงลูกบอล Pokéball สำหรับกดจับ เปิดเมนู หรือยิงฟังก์ชันสำคัญ
- **Props:**
  - `size?: number` (default: `56`)
  - `onPress: () => void`
  - `disabled?: boolean`
- **สไตล์:** ครึ่งบนสีแดง `#FF3B30`, ครึ่งล่างสีขาว `#FFFFFF`, แถบคาดดำตรงกลางพร้อมปุ่มกดตรงกลาง มีเงา Pop-up ชัดเจน

### 4.4 `SimulatorControls` Component
- **หน้าที่:** ชุดควบคุมสำหรับการทดสอบบน Simulator และ Web Browser
- **องค์ประกอบ:**
  - ปุ่มทิศทาง D-pad (ขึ้น, ลง, ซ้าย, ขวา) เชื่อมต่อฟังก์ชันเลื่อนพิกัด Latitude/Longitude
  - ปุ่มสลับความเร็วเดิน (Walk / Run / Drive)
  - ปุ่ม "Spawn Nearby" สำหรับทดสอบเรียก Event โปเกมอนป่าเกิด

---

## 5. การปรับแต่งสำหรับการแสดงผลบน Web (Web Adaptation Guidelines)

เนื่องจากโปรเจกต์รองรับคำสั่ง `npx expo start --web` จึงต้องปฏิบัติตามกฎดังต่อไปนี้:

1. **Responsive Mobile Shell บน Web:**
   - เมื่อเปิดบนเบราว์เซอร์เดสก์ท็อป ให้จัดเลย์เอาต์แอปให้อยู่ในคอนเทนเนอร์ขนาดโทรศัพท์ (`maxWidth: 430px`, `minHeight: 100vh`) วางกึ่งกลางหน้าจอ (`margin: '0 auto'`)
   - พื้นหลังภายนอกคอนเทนเนอร์ให้แสดงลวดลายกราฟิกสีฟ้าเข้มสไตล์ Pokémon GO แผนที่โลก
2. **Keyboard Navigation:**
   - รองรับการกดปุ่มคีย์บอร์ด `W`, `A`, `S`, `D` หรือปุ่มลูกศร (Arrow Keys) เพื่อควบคุมการเดินบนแผนที่แทนการแตะ D-Pad
3. **Cursor & Hover States:**
   - ปุ่มที่คลิกได้ทั้งหมดต้องมีสไตล์ `cursor: pointer` บนแพลตฟอร์ม Web
   - การ์ดโปเกมอนมีเอฟเฟกต์ยกตัวขึ้นเล็กน้อยเมื่อนำเมาส์ไปชี้ (`transform: translateY(-4px)`)

---

## 6. ข้อกำหนดการตรวจสอบและส่งมอบ (Design Checklist)

ก่อนส่งมอบงาน UI หรือหน้าจอทุกครั้ง ต้องตรวจสอบรายการต่อไปนี้:
- [ ] เรียกใช้ค่าสีจาก `constants/theme.ts` หรือ `constants/pokemon-theme.ts` โดยตรง (ห้าม Hardcode สีอิสระที่ไม่ผ่าน Token)
- [ ] หน้าจอทำงานได้ปกติทั้งบนอุปกรณ์หน้าจอเล็ก (iPhone SE), หน้าจอปกติ (iPhone 15/16 Pro), และ Web Browser
- [ ] ฟอนต์และระยะห่างตรงตามสเกล 4pt/8pt ที่ระบุไว้ในเอกสารนี้
- [ ] มี Fallback เหมาะสมสำหรับกล้องและพิกัดตำแหน่ง (ไม่ทำให้แอปเกิด Exception เมื่อไม่มีสิทธิ์)
- [ ] ผ่านการตรวจสอบ Type ด้วยคำสั่ง `npx tsc --noEmit`
