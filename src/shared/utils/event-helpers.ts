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
