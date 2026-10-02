import type { CampusEvent } from '../types/event';

export const CAMPUS_EVENTS: CampusEvent[] = [
  {
    id: 'evt-001',
    title: 'Porygon Tech Lab: Curveball & IV Catch Clinic Meetup',
    description:
      'มีตอัปเวิร์กช็อปเทคนิคการปาบอล Curveball, การคำนวณ IV และการจัดทีมแบทเทิลสำหรับเทรนเนอร์ทุกระดับ พร้อมเปิดลานสแกนจับ Porygon ตัวพิเศษประจำงาน',
    category: 'workshop',
    startsAt: '2026-10-15T09:00:00+07:00',
    endsAt: '2026-10-15T12:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
    location: {
      name: 'อาคารวิศวกรรม 4 ชั้น 3 ห้อง 301',
      latitude: 13.7455,
      longitude: 100.5335,
    },
    capacity: 45,
    registeredCount: 38,
    organizer: 'Silph Co. Trainers Club',
    featuredPokemonId: 137, // Porygon
  },
  {
    id: 'evt-002',
    title: 'Pikachu & Friends: Community Day Meetup',
    description:
      'มีตอัปคอมมิวนิตี้เดย์รวมพลเทรนเนอร์ล่าไชนี่พิคาชู พร้อมโบนัส XP คูณสอง ลานเปิดเสาล่อ Lure Module และของรางวัลเข็มกลัดยิมสำหรับผู้เข้าร่วมงาน',
    category: 'social',
    startsAt: '2026-10-16T13:30:00+07:00',
    endsAt: '2026-10-16T17:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800',
    location: {
      name: 'ลานอเนกประสงค์ หอสมุดกลาง',
      latitude: 13.747,
      longitude: 100.535,
    },
    capacity: 100,
    registeredCount: 74,
    organizer: 'Campus Pokémon GO League',
    featuredPokemonId: 25, // Pikachu
  },
  {
    id: 'evt-003',
    title: 'Legendary Expedition: Articuno Special Research Meetup',
    description:
      'มีตอัปสำรวจภาคสนามและภารกิจวิจัย Special Research นกในตำนานแห่งคันโต รวมทีมแกะรอยพฤติกรรม Articuno พร้อมลุ้นรับไอเทมวิจัยระดับตำนาน',
    category: 'academic',
    startsAt: '2026-10-18T10:00:00+07:00',
    endsAt: '2026-10-18T12:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
    location: {
      name: 'หอประชุมใหญ่ อาคารนวัตกรรม ชั้น 5',
      latitude: 13.7445,
      longitude: 100.5362,
    },
    capacity: 200,
    registeredCount: 185,
    organizer: 'Professor Willow Research Squad',
    featuredPokemonId: 144, // Articuno
  },
  {
    id: 'evt-004',
    title: 'Safari Gathering: Chansey Lucky Trade Expo Meetup',
    description:
      'มีตอัปมหกรรมพบปะแลกเปลี่ยนโปเกมอนและไอเทมแรร์ Lucky Trade โซนประเมิน IV ฟรี และเปิดจุดสปอว์น Chansey พิเศษตลอดงาน',
    category: 'career',
    startsAt: '2026-10-20T09:00:00+07:00',
    endsAt: '2026-10-20T16:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
    location: {
      name: 'อาคารกิจกรรมนักศึกษา ศูนย์อาหารชั้น 2',
      latitude: 13.7482,
      longitude: 100.532,
    },
    capacity: 500,
    registeredCount: 312,
    organizer: 'Kanto Traders Club',
    featuredPokemonId: 113, // Chansey
  },
  {
    id: 'evt-005',
    title: 'Gym Battle Arena: Fighting Cup Machamp Meetup',
    description:
      'มีตอัปประลองยิมแบทเทิล Fighting Cup ชิงเข็มกลัดยิมจำลอง เทคนิคการจัดทีม Machamp และการเบรกชิลด์ขั้นสูงในสนามแข่งขัน',
    category: 'sports',
    startsAt: '2026-10-22T14:00:00+07:00',
    endsAt: '2026-10-22T19:00:00+07:00',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    location: {
      name: 'ศูนย์กีฬาและยิมเนเซียม 1',
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
    title: 'PvP Masterclass: Gengar Meta & Fast-Move Clinic Meetup',
    description:
      'มีตอัปเวิร์กช็อปวิเคราะห์เมต้า PvP Great League และ Master League สอนเทคนิคการนับเทิร์น Fast Move และจังหวะปล่อยชาร์จมูฟของ Gengar',
    category: 'workshop',
    startsAt: '2026-10-25T13:00:00+07:00',
    endsAt: '2026-10-25T16:00:00+07:00',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800',
    location: {
      name: 'ห้องปฏิบัติการคอมพิวเตอร์ อาคารวิทย์ 2',
      latitude: 13.7458,
      longitude: 100.5375,
    },
    capacity: 35,
    registeredCount: 35,
    organizer: 'Competitive Trainers League',
    featuredPokemonId: 94, // Gengar
  },
  {
    id: 'evt-007',
    title: 'Night Hunt: Ghost & Fairy Spotlight Hour Meetup',
    description:
      'มีตอัปเดินสายล่าโปเกมอนราตรี Spotlight Hour เน้นสาย Ghost และ Fairy ท่ามกลางบรรยากาศร่มรื่น พร้อมลุ้นจับ Clefable ไชนี่ตัวพิเศษ',
    category: 'social',
    startsAt: '2026-10-26T17:30:00+07:00',
    endsAt: '2026-10-26T21:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
    location: {
      name: 'สวนร่มเกล้า ลานต้นโพธิ์',
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
    title: 'Trainer Clinic: Alakazam Move Optimization Meetup',
    description:
      'มีตอัปคลินิกสอนการเลือกท่าต่อสู้ Fast & Charged Move ขั้นเทพ การคำนวณแดเมจต่อวินาที (DPS) และเทคนิคการวิวัฒนาการ Alakazam ให้คุ้มแคนดี้ที่สุด',
    category: 'career',
    startsAt: '2026-10-28T10:00:00+07:00',
    endsAt: '2026-10-28T15:00:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
    location: {
      name: 'ศูนย์ส่งเสริมการเรียนรู้ ชั้น 1',
      latitude: 13.7475,
      longitude: 100.536,
    },
    capacity: 50,
    registeredCount: 42,
    organizer: 'Pokémon Evolution Society',
    featuredPokemonId: 65, // Alakazam
  },
  {
    id: 'evt-009',
    title: 'Dragonite Sky Cup: 3v3 Friendly Tournament Meetup',
    description:
      'มีตอัปทัวร์นาเมนต์กระชับมิตร 3v3 ชิงถ้วย Dragonite Sky Cup เปิดให้ทุกสายส่งตัวแทนแข่งขัน ลุ้นรับของรางวัล Lucky Draw และเข็มกลัดประจำลีก',
    category: 'sports',
    startsAt: '2026-10-30T16:00:00+07:00',
    endsAt: '2026-10-30T19:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
    location: {
      name: 'สนามฟุตบอลหญ้าเทียมกลางแจ้ง',
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
    title: 'Mythical Discovery: Ancient Mew Lore & Field Meetup',
    description:
      'มีตอัปสัมมนาภาคสนามค้นหาความลับของ Mew และต้นกำเนิดโปเกมอนมายา เจาะลึกตำนานโบราณพร้อมสแกนจับ Mew ตัวพิเศษประจำงาน',
    category: 'academic',
    startsAt: '2026-11-02T09:30:00+07:00',
    endsAt: '2026-11-02T12:00:00+07:00',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
    location: {
      name: 'ห้องประชุมวิทยาสารนิเทศ ชั้น 3',
      latitude: 13.7465,
      longitude: 100.5358,
    },
    capacity: 120,
    registeredCount: 95,
    organizer: 'Pokémon Heritage Society',
    featuredPokemonId: 151, // Mew
  },
  {
    id: 'evt-011',
    title: 'Eevee Evolution Party: All Eeveelutions Gathering Meetup',
    description:
      'มีตอัปปาร์ตี้รวมพลคนรัก Eevee ครบทุกสายพันธุ์ ตั้งแต่ Vaporeon ถึง Sylveon พร้อมกิจกรรมถ่ายภาพ AR โซนเทรด และเล่นเกมทายวิวัฒนาการ',
    category: 'workshop',
    startsAt: '2026-11-05T13:30:00+07:00',
    endsAt: '2026-11-05T16:30:00+07:00',
    imageUrl:
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800',
    location: {
      name: 'ห้อง Media Lab อาคารศิลปกรรม ชั้น 2',
      latitude: 13.7448,
      longitude: 100.5342,
    },
    capacity: 30,
    registeredCount: 22,
    organizer: 'Eevee Lovers Club',
    featuredPokemonId: 133, // Eevee
  },
  {
    id: 'evt-012',
    title: '5-Star Raid Hour: Mewtwo Legendary Raid Meetup',
    description:
      'มีตอัปศึกรวมพลังตีเรดบอส Mewtwo ระดับ 5 ดาว ล่า IV 100% และลุ้นมิวทูไชนี่ รวมกลุ่มเทรนเนอร์ทุกระดับร่วมตีบอสได้ฟรีไม่มีค่าใช้จ่าย',
    category: 'social',
    startsAt: '2026-11-07T15:00:00+07:00',
    endsAt: '2026-11-07T18:00:00+07:00',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    location: {
      name: 'เสาธงใหญ่ หน้าอาคารอำนวยการ',
      latitude: 13.7472,
      longitude: 100.5345,
    },
    capacity: 120,
    registeredCount: 110,
    organizer: 'Legendary Raid Squad',
    featuredPokemonId: 150, // Mewtwo
  },
  {
    id: 'evt-udon-01',
    title: 'Udon Thani Trainers Meetup & Snorlax Safari Gathering',
    description:
      'มีตอัปใหญ่รวมพลเทรนเนอร์อุดรธานี Udon Thani ณ สวนหนองประจักษ์ ร่วมกิจกรรม Safari Gathering ล่า Snorlax และปล่อย Lure Module รอบหนองน้ำ',
    category: 'social',
    startsAt: '2026-11-10T14:00:00+07:00',
    endsAt: '2026-11-10T18:00:00+07:00',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    location: {
      name: 'สวนสาธารณะหนองประจักษ์ศิลปาคม อุดรธานี',
      latitude: 17.4138,
      longitude: 102.7872,
    },
    capacity: 150,
    registeredCount: 42,
    organizer: 'Udon Thani Pokémon Club',
    featuredPokemonId: 143, // Snorlax
  },
];
