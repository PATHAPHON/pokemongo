import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getDaysInMonth,
  calculateEventYear,
  buildEventIsoStrings,
  parseDateTimeInputs,
  THAI_MONTHS_NAMES,
} from '../src/shared/utils/event-helpers.ts';

describe('Event Date & Month Picker Helpers', () => {
  it('THAI_MONTHS_NAMES has all 12 Thai full month names', () => {
    assert.equal(THAI_MONTHS_NAMES.length, 12);
    assert.equal(THAI_MONTHS_NAMES[0], 'มกราคม');
    assert.equal(THAI_MONTHS_NAMES[1], 'กุมภาพันธ์');
    assert.equal(THAI_MONTHS_NAMES[11], 'ธันวาคม');
  });

  it('getDaysInMonth returns correct days for 28/29/30/31 day months', () => {
    // January (monthIndex 0) -> 31
    assert.equal(getDaysInMonth(2026, 0), 31);
    // February 2026 (non-leap) -> 28
    assert.equal(getDaysInMonth(2026, 1), 28);
    // February 2028 (leap year) -> 29
    assert.equal(getDaysInMonth(2028, 1), 29);
    // April (monthIndex 3) -> 30
    assert.equal(getDaysInMonth(2026, 3), 30);
    // October (monthIndex 9) -> 31
    assert.equal(getDaysInMonth(2026, 9), 31);
  });

  it('calculateEventYear keeps current year for future or today, rolls over to next year for past date', () => {
    // Reference date: 2026-10-07 14:00:00
    const ref = new Date('2026-10-07T14:00:00.000Z');

    // Same day (Oct 7) -> 2026
    assert.equal(calculateEventYear(9, 7, ref), 2026);

    // Later in current year (Nov 15) -> 2026
    assert.equal(calculateEventYear(10, 15, ref), 2026);

    // Earlier date (Jan 10) -> 2027 (past date rolls over)
    assert.equal(calculateEventYear(0, 10, ref), 2027);

    // Earlier date (Oct 1) -> 2027
    assert.equal(calculateEventYear(9, 1, ref), 2027);
  });

  it('buildEventIsoStrings creates valid ISO startsAt and endsAt', () => {
    const { startsAt, endsAt } = buildEventIsoStrings(2026, 9, 15, 9, 12);
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    assert.equal(start.getFullYear(), 2026);
    assert.equal(start.getMonth(), 9);
    assert.equal(start.getDate(), 15);
    assert.equal(start.getHours(), 9);

    assert.equal(end.getFullYear(), 2026);
    assert.equal(end.getMonth(), 9);
    assert.equal(end.getDate(), 15);
    assert.equal(end.getHours(), 12);

    assert.ok(end.getTime() > start.getTime(), 'endsAt must be after startsAt');
  });

  it('buildEventIsoStrings handles midnight 00:00 / 24:00 correctly', () => {
    const { startsAt, endsAt } = buildEventIsoStrings(2026, 9, 15, 20, 24);
    const start = new Date(startsAt);
    const end = new Date(endsAt);

    assert.equal(start.getDate(), 15);
    assert.equal(start.getHours(), 20);

    // Next day midnight
    assert.equal(end.getDate(), 16);
    assert.equal(end.getHours(), 0);
    assert.ok(end.getTime() > start.getTime());
  });

  it('parseDateTimeInputs parses valid inputs and produces valid ISO dates', () => {
    const res = parseDateTimeInputs('15', '10', '2026', '09:00', '12:00');
    assert.equal(res.success, true);
    assert.ok(res.startsAt);
    assert.ok(res.endsAt);

    const start = new Date(res.startsAt);
    const end = new Date(res.endsAt);
    assert.equal(start.getFullYear(), 2026);
    assert.equal(start.getMonth(), 9); // October is index 9
    assert.equal(start.getDate(), 15);
    assert.equal(start.getHours(), 9);
    assert.equal(end.getHours(), 12);
  });

  it('parseDateTimeInputs converts Thai Buddhist Year (พ.ศ.) to Common Era (ค.ศ.)', () => {
    const res = parseDateTimeInputs('20', '11', '2569', '10:00', '13:00');
    assert.equal(res.success, true);
    const start = new Date(res.startsAt);
    assert.equal(start.getFullYear(), 2026); // 2569 - 543 = 2026
    assert.equal(start.getMonth(), 10); // November is index 10
    assert.equal(start.getDate(), 20);
  });

  it('parseDateTimeInputs rejects invalid date inputs', () => {
    // Invalid day
    const res1 = parseDateTimeInputs('32', '10', '2026', '09:00', '12:00');
    assert.equal(res1.success, false);
    assert.ok(res1.error?.includes('วันที่'));

    // Invalid month
    const res2 = parseDateTimeInputs('15', '13', '2026', '09:00', '12:00');
    assert.equal(res2.success, false);
    assert.ok(res2.error?.includes('เดือน'));

    // Day exceeds month maximum (Feb 30)
    const res3 = parseDateTimeInputs('30', '2', '2026', '09:00', '12:00');
    assert.equal(res3.success, false);
    assert.ok(res3.error?.includes('28 วัน'));

    // Invalid time
    const res4 = parseDateTimeInputs('15', '10', '2026', '25:00', '12:00');
    assert.equal(res4.success, false);
    assert.ok(res4.error?.includes('เวลาเริ่มต้น'));
  });

  it('Static Analysis: create.tsx integrates TextInput date & time fields and calls parseDateTimeInputs', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const createContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/app/events/create.tsx'),
      'utf8'
    );

    assert.ok(
      createContent.includes('parseDateTimeInputs'),
      'create.tsx must import and call parseDateTimeInputs'
    );
    assert.ok(
      createContent.includes('dayInput'),
      'create.tsx must manage dayInput'
    );
    assert.ok(
      createContent.includes('monthInput'),
      'create.tsx must manage monthInput'
    );
    assert.ok(
      createContent.includes('yearInput'),
      'create.tsx must manage yearInput'
    );
    assert.ok(
      createContent.includes('startTimeInput'),
      'create.tsx must manage startTimeInput'
    );
    assert.ok(
      createContent.includes('endTimeInput'),
      'create.tsx must manage endTimeInput'
    );
    assert.ok(
      createContent.includes('วันจัดกิจกรรม (วัน / เดือน / ปี)'),
      'create.tsx must render Date section'
    );
    assert.ok(
      createContent.includes('เวลาจัดกิจกรรม (เวลาเริ่ม - สิ้นสุด)'),
      'create.tsx must render Time section'
    );
  });
});
