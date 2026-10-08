import type { CampusEvent } from '../types/event';

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'evt-001',
    title: 'Porygon Cyberspace Safari: Curveball & IV 100% Meetup',
    description:
      'มีตอัปเทรนเนอร์รวมพลล่า Porygon ไซเบอร์สเปซ พร้อมเทคนิคการปาบอล Curveball Excellent, การตรวจ IV 100% และเปิดลานสแกนจับ Porygon พิเศษประจำงาน',
    startsAt: '2026-10-15T09:00:00+07:00',
    endsAt: '2026-10-15T12:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    location: {
      name: 'Silph Co. Field Station & Cyberspace PokéStop',
      latitude: 13.7455,
      longitude: 100.5335,
    },
    capacity: 45,
    registeredCount: 38,
    organizer: 'Ash Ketchum (Kanto Champion)',
    organizerId: 'trainer-ash-101',
    featuredPokemonId: 137, // Porygon
  },
  {
    id: 'evt-002',
    title: 'Pikachu Community Day Safari: Shiny Hunt Meetup',
    description:
      'มีตอัปคอมมิวนิตี้เดย์รวมพลเทรนเนอร์ล่าไชนี่พิคาชู โบนัส Catch XP คูณสอง เปิดเสาล่อ Lure Module ตลอดเส้นทาง และแจกเข็มกลัดยิมที่ระลึก',
    startsAt: '2026-10-16T13:30:00+07:00',
    endsAt: '2026-10-16T17:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800',
    location: {
      name: 'Pikachu Central Park PokéStop Hub',
      latitude: 13.747,
      longitude: 100.535,
    },
    capacity: 100,
    registeredCount: 74,
    organizer: 'Ash Ketchum (Silph Co. Trainers Club)',
    organizerId: 'trainer-ash-101',
    featuredPokemonId: 25, // Pikachu
  },
  {
    id: 'evt-003',
    title: 'Legendary Raid Hour: Articuno Blizzard Raid Battle Meetup',
    description:
      'มีตอัปตีเรดบอสนกในตำนาน Articuno ระดับ 5 ดาว รวมทีมเทรนเนอร์จัดทัพต่อกรธาตุน้ำแข็ง ล่าไชนี่ Articuno พร้อมลุ้นรับ Rare Candy และไอเทมระดับตำนาน',
    startsAt: '2026-10-18T10:00:00+07:00',
    endsAt: '2026-10-18T12:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    location: {
      name: 'Ice Peak Legendary Raid Gym Arena',
      latitude: 13.7445,
      longitude: 100.5362,
    },
    capacity: 200,
    registeredCount: 185,
    organizer: 'Misty Waterflower (Cerulean Gym Leader)',
    organizerId: 'trainer-misty-202',
    featuredPokemonId: 144, // Articuno
  },
  {
    id: 'evt-004',
    title: 'Chansey Lucky Trade Expo: Friendship Safari Meetup',
    description:
      'มีตอัปมหกรรมพบปะแลกเปลี่ยนโปเกมอน Lucky Trade โซนแลกเปลี่ยนร่างไชนี่และโปเกมอนหายาก พร้อมเปิดจุดสปอว์น Chansey ปั๊ม Candy XL ตลอดงาน',
    startsAt: '2026-10-20T09:00:00+07:00',
    endsAt: '2026-10-20T16:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    location: {
      name: 'Pokémon Center Friendship & Trading Pavilion',
      latitude: 13.7482,
      longitude: 100.532,
    },
    capacity: 500,
    registeredCount: 312,
    organizer: 'Kanto Lucky Traders Club',
    featuredPokemonId: 113, // Chansey
  },
  {
    id: 'evt-005',
    title: 'Machamp Fighting Arena: Battle League Championship Meetup',
    description:
      'มีตอัปประลอง GO Battle League ทัวร์นาเมนต์ชิงเข็มกลัดยิมต่อสู้ เทคนิคการจัดทีม Machamp เคาน์เตอร์เมต้า และการเบรกชิลด์ขั้นสูงในสนามแข่งขัน',
    startsAt: '2026-10-22T14:00:00+07:00',
    endsAt: '2026-10-22T19:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    location: {
      name: 'Fighting Arena Colosseum Gym',
      latitude: 13.7432,
      longitude: 100.5312,
    },
    capacity: 150,
    registeredCount: 88,
    organizer: 'Pokémon Battle Association',
    featuredPokemonId: 68, // Machamp
  },
  {
    id: 'evt-006',
    title: 'Shadow Gengar Ghost Night: Fast-Move & PvP Clinic Meetup',
    description:
      'มีตอัปแกะรอยโปเกมอนวิญญาณ Shadow Gengar รอบดึก วิเคราะห์เมต้า Great & Master League สอนเทคนิค Fast Move Shadow Claw และจังหวะปล่อยชาร์จมูฟ',
    startsAt: '2026-10-25T13:00:00+07:00',
    endsAt: '2026-10-25T16:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800',
    location: {
      name: 'Lavender Ghost Tower Gym & Shadow Lure Zone',
      latitude: 13.7458,
      longitude: 100.5375,
    },
    capacity: 35,
    registeredCount: 35,
    organizer: 'Competitive Ghost Trainers League',
    featuredPokemonId: 94, // Gengar
  },
  {
    id: 'evt-007',
    title: 'Moonlight Fairy Spotlight: Clefable Night Hunt Meetup',
    description:
      'มีตอัปเดินสายล่า Spotlight Hour ใต้แสงจันทร์ เน้นโปเกมอนแฟรี่ Clefable ท่ามกลางบรรยากาศร่มรื่น ถ่ายภาพ AR Snapshot และรับโบนัส Stardust x2',
    startsAt: '2026-10-26T17:30:00+07:00',
    endsAt: '2026-10-26T21:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    location: {
      name: 'Mt. Moon Fairy Garden PokéStop',
      latitude: 13.7468,
      longitude: 100.5338,
    },
    capacity: 250,
    registeredCount: 160,
    organizer: 'Midnight Trainers Squad',
    featuredPokemonId: 36, // Clefable
  },
  {
    id: 'evt-008',
    title: 'Psychic Masters Clinic: Alakazam Mega Energy Meetup',
    description:
      'มีตอัปฟาร์ม Mega Energy และเรดบอส Mega Alakazam คำนวณแดเมจต่อวินาที (DPS) สอนการเลือกท่า Fast & Charged Move Psycho Cut ขั้นเทพ',
    startsAt: '2026-10-28T10:00:00+07:00',
    endsAt: '2026-10-28T15:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
    location: {
      name: 'Saffron Psychic Gym Center PokéStop',
      latitude: 13.7475,
      longitude: 100.536,
    },
    capacity: 50,
    registeredCount: 42,
    organizer: 'Psychic Masters Guild',
    featuredPokemonId: 65, // Alakazam
  },
  {
    id: 'evt-009',
    title: 'Dragonite Sky Cup: 3v3 Master League Tournament Meetup',
    description:
      'มีตอัปทัวร์นาเมนต์กระชับมิตร 3v3 ชิงถ้วย Dragonite Sky Cup สายดรากอนปะทะทีมเมต้า ลุ้นรับของรางวัล Lucky Draw และโค้ด Incubator พิเศษ',
    startsAt: '2026-10-30T16:00:00+07:00',
    endsAt: '2026-10-30T19:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    location: {
      name: 'Dragon Shrine Sky Stadium Gym',
      latitude: 13.7425,
      longitude: 100.5325,
    },
    capacity: 80,
    registeredCount: 65,
    organizer: 'Dragon Tamer Guild',
    featuredPokemonId: 149, // Dragonite
  },
  {
    id: 'evt-010',
    title: 'Mythical Discovery: Ancient Mew Field Research Meetup',
    description:
      'มีตอัปสัมมนาภาคสนามค้นหาความลับของ Mew และต้นกำเนิดโปเกมอนมายา เจาะลึกภารกิจวิจัย Special Research พร้อมสแกนจับ Mew พิเศษประจำงาน',
    startsAt: '2026-11-02T09:30:00+07:00',
    endsAt: '2026-11-02T12:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    location: {
      name: 'Ancient Mythical Ruins PokéStop Hub',
      latitude: 13.7465,
      longitude: 100.5358,
    },
    capacity: 120,
    registeredCount: 95,
    organizer: 'Professor Willow Research Squad',
    featuredPokemonId: 151, // Mew
  },
  {
    id: 'evt-011',
    title: 'Eevee Evolution Party: AR Photo Safari & Trade Meetup',
    description:
      'มีตอัปปาร์ตี้รวมพลคนรัก Eevee ครบทั้ง 8 ร่างวิวัฒนาการ กิจกรรมประกวดภาพถ่าย AR Snapshot โซนแจกริบบิ้น Best Buddy และโซนเทรด Eevee ไชนี่',
    startsAt: '2026-11-05T13:30:00+07:00',
    endsAt: '2026-11-05T16:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
    location: {
      name: 'Eeveelution Meadow Garden PokéStop',
      latitude: 13.7448,
      longitude: 100.5342,
    },
    capacity: 30,
    registeredCount: 22,
    organizer: 'Eevee Fan Club Thailand',
    featuredPokemonId: 133, // Eevee
  },
  {
    id: 'evt-012',
    title: 'EX Raid Battle: 5-Star Mewtwo Legendary Raid Meetup',
    description:
      'มีตอัปศึกรวมพลังตีเรดบอส Mewtwo ระดับ 5 ดาว ล่าค่า IV 100% ปลดล็อกท่าพิเศษ Psystrike รวมกลุ่มเทรนเนอร์ทุกระดับร่วมตีบอสได้ฟรี',
    startsAt: '2026-11-07T15:00:00+07:00',
    endsAt: '2026-11-07T18:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    location: {
      name: 'Cerulean Cave EX Raid Arena Gym',
      latitude: 13.7472,
      longitude: 100.5345,
    },
    capacity: 120,
    registeredCount: 110,
    organizer: 'Legendary Raid Champions',
    featuredPokemonId: 150, // Mewtwo
  },
  {
    id: 'evt-udon-01',
    title: 'Udon Thani Trainers Safari: Snorlax Sleep & Catch Gathering',
    description:
      'มีตอัปใหญ่รวมพลเทรนเนอร์อุดรธานี ณ สวนหนองประจักษ์ กิจกรรม Safari Gathering ล่า Snorlax และปล่อย Lure Module รอบหนองน้ำตลอดวัน',
    startsAt: '2026-11-10T14:00:00+07:00',
    endsAt: '2026-11-10T18:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    location: {
      name: 'สวนสาธารณะหนองประจักษ์ศิลปาคม อุดรธานี (PokéStop Hub)',
      latitude: 17.4138,
      longitude: 102.7872,
    },
    capacity: 150,
    registeredCount: 42,
    organizer: 'Udon Thani Pokémon GO Club',
    featuredPokemonId: 143, // Snorlax
  },
];
