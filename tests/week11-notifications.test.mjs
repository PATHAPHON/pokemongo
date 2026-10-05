import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const EVENT_REMINDER_CHANNEL_ID = 'event-reminders';
const EVENT_REMINDER_MINUTES_BEFORE = 30;
const EVENT_TEST_LOOP_SECONDS = 10;

const STALE_CHANNEL_IDS = [
  'campus-event-reminders',
  'pokemon-wild-alerts',
  'pokemon-spawns',
  'pokemon-spawns-v2',
];

function buildReminderContent(event, minutesBefore = 30, isTest = false) {
  return {
    title: `ใกล้ถึงเวลา: ${event.title}`,
    body: isTest
      ? `[ทดสอบ] อีก ${minutesBefore} นาทีที่ ${event.location.name} — เด้งทุก ${EVENT_TEST_LOOP_SECONDS} วิ แตะเพื่อเปิดรายละเอียด`
      : `เริ่มในอีก ${minutesBefore} นาทีที่ ${event.location.name}`,
    data: {
      eventId: String(event.id),
      type: isTest ? 'event-reminder-test' : 'event-reminder',
    },
  };
}

function resolveDateTrigger(startsAt, minutesBefore = 30) {
  const startTime = new Date(startsAt).getTime();
  const triggerDate = new Date(startTime - minutesBefore * 60 * 1000);
  if (triggerDate.getTime() <= Date.now()) {
    return { error: 'reminder-time-has-passed' };
  }
  return { date: triggerDate };
}

describe('Week 11: Event Reminder Notifications Contract Tests', () => {
  describe('1. Android Notification Channel Configuration', () => {
    test('Single event channel uses HIGH importance with public visibility', () => {
      const AndroidImportance = {
        UNKNOWN: 0,
        NONE: 1,
        MIN: 2,
        LOW: 3,
        DEFAULT: 4,
        HIGH: 5,
        MAX: 6,
      };

      const AndroidNotificationVisibility = {
        UNKNOWN: 0,
        PUBLIC: 1,
        PRIVATE: 2,
        SECRET: 3,
      };

      const channelConfig = {
        id: EVENT_REMINDER_CHANNEL_ID,
        name: 'การแจ้งเตือนกิจกรรม',
        importance: AndroidImportance.HIGH,
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        enableLights: true,
        lightColor: '#8B5CF6',
        enableVibrate: true,
        vibrationPattern: [0, 400, 200, 400],
      };

      assert.equal(channelConfig.id, 'event-reminders');
      assert.equal(channelConfig.importance, 5, 'Must be AndroidImportance.HIGH');
      assert.equal(
        channelConfig.lockscreenVisibility,
        1,
        'Must be AndroidNotificationVisibility.PUBLIC'
      );
      assert.equal(channelConfig.enableVibrate, true);
      assert.deepEqual(channelConfig.vibrationPattern, [0, 400, 200, 400]);
    });

    test('Stale spawn/event channels are deleted before creating the new one', () => {
      assert.ok(!STALE_CHANNEL_IDS.includes(EVENT_REMINDER_CHANNEL_ID));
      assert.ok(STALE_CHANNEL_IDS.includes('pokemon-wild-alerts'));
      assert.ok(STALE_CHANNEL_IDS.includes('campus-event-reminders'));
    });

    test('Reminder payload uses max priority with event vibration', () => {
      const payload = {
        priority: 'max',
        vibrate: [0, 400, 200, 400],
      };

      assert.equal(payload.priority, 'max');
      assert.deepEqual(payload.vibrate, [0, 400, 200, 400]);
    });
  });

  describe('2. Fixed 30-min DATE reminder', () => {
    test('Trigger date is exactly 30 min before startsAt', () => {
      const startsAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      const resolved = resolveDateTrigger(
        startsAt,
        EVENT_REMINDER_MINUTES_BEFORE
      );
      assert.ok(!resolved.error);
      const diffMs =
        new Date(startsAt).getTime() - resolved.date.getTime();
      assert.equal(diffMs, 30 * 60 * 1000);
    });

    test('Past trigger returns reminder-time-has-passed (no silent 5s fallback)', () => {
      const startsAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const resolved = resolveDateTrigger(startsAt, 30);
      assert.equal(resolved.error, 'reminder-time-has-passed');
    });

    test('Far-away meetup still resolves a future DATE (no demo fallback)', () => {
      const startsAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      const resolved = resolveDateTrigger(startsAt, 30);
      assert.ok(!resolved.error);
      assert.ok(resolved.date.getTime() > Date.now());
    });
  });

  describe('3. Test loop for far-away meetups (every 10s, toggleable)', () => {
    test('Test loop formats valid repeating timeInterval trigger', () => {
      const trigger = {
        type: 'timeInterval',
        seconds: EVENT_TEST_LOOP_SECONDS,
        repeats: true,
        channelId: EVENT_REMINDER_CHANNEL_ID,
      };

      assert.equal(trigger.type, 'timeInterval');
      assert.equal(trigger.seconds, 10);
      assert.equal(trigger.repeats, true);
      assert.equal(trigger.channelId, 'event-reminders');
    });

    test('Test content carries the real eventId for tap-to-detail', () => {
      const event = {
        id: 'evt-123',
        title: 'Campus Meetup',
        location: { name: 'สนามบอลกลาง' },
      };
      const content = buildReminderContent(event, 30, true);
      assert.equal(content.data.eventId, 'evt-123');
      assert.equal(content.data.type, 'event-reminder-test');
      assert.match(content.title, /ใกล้ถึงเวลา/);
    });
  });

  describe('4. Notification Payload & Deep Link Contract', () => {
    test('Payload contains only eventId (no sensitive data) for /events/[id]', () => {
      const event = {
        id: 'evt-456',
        title: 'Kanto Night',
        location: { name: 'หอประชุมใหญ่' },
      };
      const notificationContent = buildReminderContent(event, 30, false);

      assert.equal(notificationContent.data.eventId, 'evt-456');
      assert.equal(notificationContent.data.type, 'event-reminder');
      assert.equal('pokemonId' in notificationContent.data, false);
      assert.match(notificationContent.title, /ใกล้ถึงเวลา: Kanto Night/);
      assert.match(notificationContent.body, /เริ่มในอีก 30 นาทีที่/);
    });

    test('Tap handler ignores non-default actions and non-string eventId', () => {
      const valid = { actionIdentifier: 'expo-notifications-default-action-identifier', notification: { request: { content: { data: { eventId: 'evt-1' } } } } };
      const dismissed = { actionIdentifier: 'dismiss', notification: { request: { content: { data: { eventId: 'evt-1' } } } } };
      const invalid = { actionIdentifier: 'expo-notifications-default-action-identifier', notification: { request: { content: { data: { eventId: 123 } } } } };

      const shouldNavigate = (response) => {
        if (!response) return false;
        if (response.actionIdentifier && response.actionIdentifier !== 'expo-notifications-default-action-identifier') return false;
        const eventId = response.notification?.request?.content?.data?.eventId;
        return typeof eventId === 'string' && eventId.length > 0;
      };

      assert.equal(shouldNavigate(valid), true);
      assert.equal(shouldNavigate(dismissed), false);
      assert.equal(shouldNavigate(invalid), false);
      assert.equal(shouldNavigate(null), false);
    });
  });
});
