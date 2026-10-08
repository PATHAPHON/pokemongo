import type { CampusEvent } from '@/shared/types';

const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

/** Single Thai date formatter for all event UI. Replaces 4 local copies. */
export function formatEventDateThai(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${THAI_MONTHS[d.getMonth()]} ${d.getFullYear() + 543}`;
}

/** Single Thai time formatter (HH:MM). */
export function formatEventTimeThai(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น.`;
}

/** Single capacity-full check. Replaces 3 local copies. */
export function isEventFull(
  event: Pick<CampusEvent, 'capacity' | 'registeredCount'>
): boolean {
  if (event.capacity == null) return false;
  return event.registeredCount >= event.capacity;
}

/** Single /catch param builder. Replaces duplicated router.push in [id].tsx + map.tsx. */
export function buildCatchParams(pokemon: {
  id: number | string;
  name: string;
  rarity: string;
  types: string[];
  eventId?: string;
}): { pathname: '/catch'; params: Record<string, string> } {
  return {
    pathname: '/catch',
    params: {
      id: String(pokemon.id),
      name: pokemon.name,
      rarity: pokemon.rarity,
      types: JSON.stringify(pokemon.types),
      ...(pokemon.eventId ? { eventId: pokemon.eventId } : {}),
    },
  };
}

/** Countdown label shared by map + detail. */
export function formatRemainingLabel(
  endsAt: string | undefined,
  now: number
): string {
  if (!endsAt) return 'ไม่จำกัดเวลา';
  const ms = new Date(endsAt).getTime() - now;
  if (ms <= 0) return 'กิจกรรมสิ้นสุดแล้ว';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `เหลืออีก ${h} ชม. ${m} นาที`;
  if (m > 0) return `เหลืออีก ${m} นาที ${sec} วิ`;
  return `เหลืออีก ${sec} วินาที`;
}

/** Standard email validation regex */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate email format using standard regex */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  return EMAIL_REGEX.test(email.trim());
}

/** Validate full name requires at least 2 characters */
export function validateFullName(name: string): boolean {
  if (!name) return false;
  return name.trim().length >= 2;
}

export interface RegistrationFieldErrors {
  fullName?: string;
  email?: string;
}

/** Validate event registration form inputs */
export function validateRegistrationForm(values: {
  fullName: string;
  email: string;
}): { isValid: boolean; errors: RegistrationFieldErrors } {
  const errors: RegistrationFieldErrors = {};

  if (!validateFullName(values.fullName)) {
    errors.fullName = 'กรุณาระบุชื่อ-นามสกุลอย่างน้อย 2 ตัวอักษร';
  }

  if (!values.email || !values.email.trim()) {
    errors.email = 'กรุณาระบุอีเมล';
  } else if (!validateEmail(values.email)) {
    errors.email = 'รูปแบบอีเมลไม่ถูกต้อง';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/** Find the latest cached_at ISO timestamp across cached event rows */
export function findLatestCachedAt(rows: Array<{ cached_at?: string | null }>): string | null {
  return rows.reduce<string | null>((latest, r) => {
    if (!r.cached_at) return latest;
    if (!latest) return r.cached_at;
    const currentTime = new Date(r.cached_at).getTime();
    const latestTime = new Date(latest).getTime();
    if (isNaN(currentTime)) return r.cached_at > latest ? r.cached_at : latest;
    if (isNaN(latestTime)) return r.cached_at;
    return currentTime > latestTime ? r.cached_at : latest;
  }, null);
}

/** Check if current trainer is the organizer of the event */
export function isEventOrganizer(
  event: Pick<CampusEvent, 'isCustom' | 'organizerId' | 'organizer'>,
  trainer?: { id?: string; name?: string } | null
): boolean {
  if (!trainer?.id || !event.organizerId) return false;

  const eventOrgId = event.organizerId.trim().toLowerCase();
  const trainerId = trainer.id.trim().toLowerCase();

  // 1. Strict ID Match
  if (eventOrgId === trainerId) return true;

  // 2. Canonical base username-scoped ID match (e.g. "trainer-ash-101" vs "trainer-ash")
  const cleanEventOrg = eventOrgId.replace(/^trainer-/, '').split('-')[0];
  const cleanTrainer = trainerId.replace(/^trainer-/, '').split('-')[0];
  if (cleanEventOrg && cleanTrainer && cleanEventOrg === cleanTrainer) {
    return true;
  }

  return false;
}

export const THAI_MONTHS_NAMES = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม',
];

/** Get total number of days in a given year and month index (0-11) */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/** Calculate event year, auto-advancing to next year if selected date has already passed in current year */
export function calculateEventYear(
  monthIndex: number,
  day: number,
  referenceDate: Date = new Date()
): number {
  const currentYear = referenceDate.getFullYear();
  const targetEndOfDay = new Date(currentYear, monthIndex, day, 23, 59, 59, 999);
  if (targetEndOfDay.getTime() < referenceDate.getTime()) {
    return currentYear + 1;
  }
  return currentYear;
}

/** Build ISO 8601 startsAt and endsAt timestamps from date and hour selections */
export function buildEventIsoStrings(
  year: number,
  monthIndex: number,
  day: number,
  startHour: number,
  endHour: number
): { startsAt: string; endsAt: string } {
  const startDate = new Date(year, monthIndex, day, startHour, 0, 0, 0);

  let endDate: Date;
  if (endHour === 24 || endHour === 0) {
    endDate = new Date(year, monthIndex, day + 1, 0, 0, 0, 0);
  } else if (endHour <= startHour) {
    endDate = new Date(year, monthIndex, day + 1, endHour, 0, 0, 0);
  } else {
    endDate = new Date(year, monthIndex, day, endHour, 0, 0, 0);
  }

  return {
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
  };
}

export interface ParsedDateTimeResult {
  success: boolean;
  startsAt?: string;
  endsAt?: string;
  error?: string;
}

/** Parse text inputs for day, month, year, start time, and end time into ISO 8601 strings */
export function parseDateTimeInputs(
  dayStr: string,
  monthStr: string,
  yearStr: string,
  startTimeStr: string,
  endTimeStr: string
): ParsedDateTimeResult {
  const day = parseInt(dayStr.trim(), 10);
  const month = parseInt(monthStr.trim(), 10);
  let year = parseInt(yearStr.trim(), 10);

  if (isNaN(day) || day < 1 || day > 31) {
    return { success: false, error: 'กรุณาระบุวันที่ให้ถูกต้อง (1 - 31)' };
  }
  if (isNaN(month) || month < 1 || month > 12) {
    return { success: false, error: 'กรุณาระบุเดือนให้ถูกต้อง (1 - 12)' };
  }
  if (isNaN(year)) {
    return { success: false, error: 'กรุณาระบุปีให้ถูกต้อง' };
  }

  // Auto convert Thai Buddhist Era (พ.ศ.) to Common Era (ค.ศ.)
  if (year > 2400) {
    year -= 543;
  }

  const monthIndex = month - 1;
  const maxDays = getDaysInMonth(year, monthIndex);
  if (day > maxDays) {
    return {
      success: false,
      error: `เดือนนี้มีสูงสุด ${maxDays} วัน`,
    };
  }

  // Parse start time (e.g. "09:00", "9:00", or "9")
  const startParts = startTimeStr.trim().split(':');
  const startHour = parseInt(startParts[0], 10);
  const startMin = startParts.length > 1 ? parseInt(startParts[1], 10) : 0;
  if (
    isNaN(startHour) ||
    startHour < 0 ||
    startHour > 23 ||
    isNaN(startMin) ||
    startMin < 0 ||
    startMin > 59
  ) {
    return { success: false, error: 'กรุณาระบุเวลาเริ่มต้นให้ถูกต้อง (เช่น 09:00)' };
  }

  // Parse end time (e.g. "12:00", "00:00", "24:00")
  const endParts = endTimeStr.trim().split(':');
  const endHour = parseInt(endParts[0], 10);
  const endMin = endParts.length > 1 ? parseInt(endParts[1], 10) : 0;
  if (
    isNaN(endHour) ||
    endHour < 0 ||
    endHour > 24 ||
    isNaN(endMin) ||
    endMin < 0 ||
    endMin > 59
  ) {
    return { success: false, error: 'กรุณาระบุเวลาสิ้นสุดให้ถูกต้อง (เช่น 12:00)' };
  }

  const startDate = new Date(year, monthIndex, day, startHour, startMin, 0, 0);

  let endDate: Date;
  if (endHour === 24 || (endHour === 0 && endMin === 0)) {
    endDate = new Date(year, monthIndex, day + 1, 0, 0, 0, 0);
  } else if (endHour < startHour || (endHour === startHour && endMin <= startMin)) {
    endDate = new Date(year, monthIndex, day + 1, endHour, endMin, 0, 0);
  } else {
    endDate = new Date(year, monthIndex, day, endHour, endMin, 0, 0);
  }

  return {
    success: true,
    startsAt: startDate.toISOString(),
    endsAt: endDate.toISOString(),
  };
}



