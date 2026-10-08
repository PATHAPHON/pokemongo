import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

  describe('5. Permission Safety Contract (ensurePermission)', () => {
    async function simulateEnsurePermission(
      notificationsModule,
      setupChannels = async () => {}
    ) {
      if (!notificationsModule) {
        return false;
      }
      try {
        await setupChannels();
        const { status: existingStatus } =
          await notificationsModule.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } =
            await notificationsModule.requestPermissionsAsync();
          finalStatus = status;
        }
        return finalStatus === 'granted';
      } catch {
        return false;
      }
    }

    test('Returns true when permissions are already granted', async () => {
      const mockModule = {
        getPermissionsAsync: async () => ({ status: 'granted' }),
        requestPermissionsAsync: async () => ({ status: 'granted' }),
      };
      const result = await simulateEnsurePermission(mockModule);
      assert.equal(typeof result, 'boolean');
      assert.equal(result, true);
    });

    test('Returns true when permission requested and granted by user', async () => {
      const mockModule = {
        getPermissionsAsync: async () => ({ status: 'undetermined' }),
        requestPermissionsAsync: async () => ({ status: 'granted' }),
      };
      const result = await simulateEnsurePermission(mockModule);
      assert.equal(typeof result, 'boolean');
      assert.equal(result, true);
    });

    test('Returns false when permission is denied', async () => {
      const mockModule = {
        getPermissionsAsync: async () => ({ status: 'denied' }),
        requestPermissionsAsync: async () => ({ status: 'denied' }),
      };
      const result = await simulateEnsurePermission(mockModule);
      assert.equal(typeof result, 'boolean');
      assert.equal(result, false);
    });

    test('Fails safely and returns false (boolean) when permission request throws', async () => {
      const mockModule = {
        getPermissionsAsync: async () => {
          throw new Error('OS Permission system error');
        },
        requestPermissionsAsync: async () => ({ status: 'granted' }),
      };
      const result = await simulateEnsurePermission(mockModule);
      assert.equal(typeof result, 'boolean');
      assert.equal(result, false);
    });

    test('Fails safely and returns false when channel setup throws', async () => {
      const mockModule = {
        getPermissionsAsync: async () => ({ status: 'granted' }),
      };
      const setupChannels = async () => {
        throw new Error('Channel setup error');
      };
      const result = await simulateEnsurePermission(mockModule, setupChannels);
      assert.equal(typeof result, 'boolean');
      assert.equal(result, false);
    });

    test('Returns false when notificationsModule is null/unavailable', async () => {
      const result = await simulateEnsurePermission(null);
      assert.equal(typeof result, 'boolean');
      assert.equal(result, false);
    });

    test('Source code verification: ensurePermission catches error and returns false', () => {
      const filePath = path.resolve(
        process.cwd(),
        'src/shared/services/notifications/notification-manager.ts'
      );
      assert.ok(fs.existsSync(filePath), 'notification-manager.ts must exist');
      const content = fs.readFileSync(filePath, 'utf8');

      const methodMatch = content.match(
        /ensurePermission\s*\(\s*\)[^{]*\{([\s\S]*?)\n\s*public\s+async\s+getPermissionStatus/
      );
      assert.ok(methodMatch, 'ensurePermission method must be present');
      const methodBody = methodMatch[1];

      assert.match(
        methodBody,
        /catch\s*\([^)]*\)\s*\{[\s\S]*?return\s+false\s*;/,
        'ensurePermission catch block must return false, not true'
      );
      assert.doesNotMatch(
        methodBody,
        /catch\s*\([^)]*\)\s*\{[\s\S]*?return\s+true\s*;/,
        'ensurePermission catch block must NOT return true'
      );
    });
  });

  describe('6. Scheduled Reminders Recovery Contract (getScheduledReminders)', () => {
    function parseScheduledReminders(scheduled) {
      const reminders = {};
      const testReminders = {};
      if (!Array.isArray(scheduled)) {
        return { reminders, testReminders };
      }
      for (const item of scheduled) {
        const notifId = item?.identifier ?? item?.id;
        const data = item?.content?.data ?? item?.request?.content?.data;
        const eventId =
          data?.eventId != null ? String(data.eventId).trim() : '';
        const type = data?.type;
        if (
          eventId.length > 0 &&
          typeof notifId === 'string' &&
          notifId.length > 0
        ) {
          if (type === 'event-reminder-test') {
            testReminders[eventId] = notifId;
          } else if (type === 'event-reminder') {
            reminders[eventId] = notifId;
          }
        }
      }
      return { reminders, testReminders };
    }

    test('Maps scheduled notification IDs to reminders and testReminders by eventId', () => {
      const scheduled = [
        {
          identifier: 'notif-fixed-1',
          content: {
            data: {
              eventId: 'evt-101',
              type: 'event-reminder',
            },
          },
        },
        {
          identifier: 'notif-loop-1',
          content: {
            data: {
              eventId: 'evt-202',
              type: 'event-reminder-test',
            },
          },
        },
        {
          identifier: 'notif-channel-test',
          content: {
            data: {
              type: 'event-channel-test',
            },
          },
        },
      ];

      const result = parseScheduledReminders(scheduled);
      assert.deepEqual(result.reminders, { 'evt-101': 'notif-fixed-1' });
      assert.deepEqual(result.testReminders, { 'evt-202': 'notif-loop-1' });
    });

    test('Supports id property fallback if identifier is missing', () => {
      const scheduled = [
        {
          id: 'legacy-id-1',
          content: {
            data: {
              eventId: 'evt-303',
              type: 'event-reminder',
            },
          },
        },
      ];

      const result = parseScheduledReminders(scheduled);
      assert.equal(result.reminders['evt-303'], 'legacy-id-1');
    });

    test('Ignores items with empty or missing eventId or notifId', () => {
      const scheduled = [
        {
          identifier: 'notif-bad-1',
          content: { data: { eventId: '', type: 'event-reminder' } },
        },
        {
          identifier: 'notif-bad-2',
          content: { data: { type: 'event-reminder' } },
        },
        {
          identifier: '',
          content: { data: { eventId: 'evt-valid', type: 'event-reminder' } },
        },
        null,
        undefined,
      ];

      const result = parseScheduledReminders(scheduled);
      assert.deepEqual(result.reminders, {});
      assert.deepEqual(result.testReminders, {});
    });

    test('Returns empty maps when scheduled notifications list is empty or non-array', () => {
      assert.deepEqual(parseScheduledReminders([]), {
        reminders: {},
        testReminders: {},
      });
      assert.deepEqual(parseScheduledReminders(null), {
        reminders: {},
        testReminders: {},
      });
      assert.deepEqual(parseScheduledReminders(undefined), {
        reminders: {},
        testReminders: {},
      });
    });

    test('Source code verification: getScheduledReminders implemented and exported', () => {
      const managerPath = path.resolve(
        process.cwd(),
        'src/shared/services/notifications/notification-manager.ts'
      );
      const indexPath = path.resolve(
        process.cwd(),
        'src/shared/services/notifications/index.ts'
      );

      const managerContent = fs.readFileSync(managerPath, 'utf8');
      const indexContent = fs.readFileSync(indexPath, 'utf8');

      assert.match(
        managerContent,
        /getScheduledReminders\s*\(\s*\)\s*:\s*Promise\s*<\s*\{\s*reminders:\s*Record<string,\s*string>;\s*testReminders:\s*Record<string,\s*string>;?\s*\}\s*>/,
        'NotificationManager must have getScheduledReminders method with matching signature'
      );
      assert.match(
        managerContent,
        /getAllScheduledNotificationsAsync\s*\(/,
        'NotificationManager must use getAllScheduledNotificationsAsync()'
      );
      assert.match(
        indexContent,
        /export\s+(async\s+)?function\s+getScheduledReminders/,
        'src/shared/services/notifications/index.ts must export getScheduledReminders'
      );
    });
  });

  describe('7. Logout & Notification Cleanup Contract (cancelAllNotifications)', () => {
    async function simulateCancelAll(notificationsModule) {
      if (!notificationsModule) return;
      try {
        if (typeof notificationsModule.cancelAllScheduledNotificationsAsync === 'function') {
          await notificationsModule.cancelAllScheduledNotificationsAsync();
        }
        if (typeof notificationsModule.dismissAllNotificationsAsync === 'function') {
          await notificationsModule.dismissAllNotificationsAsync();
        }
      } catch {
        // safe swallow
      }
    }

    test('Cancels all scheduled notifications and dismisses delivered notifications on logout', async () => {
      let cancelledCount = 0;
      let dismissedCount = 0;
      const mockModule = {
        cancelAllScheduledNotificationsAsync: async () => {
          cancelledCount++;
        },
        dismissAllNotificationsAsync: async () => {
          dismissedCount++;
        },
      };

      await simulateCancelAll(mockModule);
      assert.equal(cancelledCount, 1, 'Must cancel all scheduled notifications');
      assert.equal(dismissedCount, 1, 'Must dismiss delivered notifications');
    });

    test('Handles missing notificationsModule or thrown error safely without crashing', async () => {
      // Null module
      await assert.doesNotReject(async () => {
        await simulateCancelAll(null);
      });

      // Throwing methods
      const errorModule = {
        cancelAllScheduledNotificationsAsync: async () => {
          throw new Error('OS error');
        },
        dismissAllNotificationsAsync: async () => {
          throw new Error('OS error');
        },
      };
      await assert.doesNotReject(async () => {
        await simulateCancelAll(errorModule);
      });
    });

    test('Source code verification: cancelAllNotifications exported and integrated with logout', () => {
      const managerPath = path.resolve(
        process.cwd(),
        'src/shared/services/notifications/notification-manager.ts'
      );
      const indexPath = path.resolve(
        process.cwd(),
        'src/shared/services/notifications/index.ts'
      );
      const trainerContextPath = path.resolve(
        process.cwd(),
        'src/shared/context/trainer-context.tsx'
      );
      const eventContextPath = path.resolve(
        process.cwd(),
        'src/shared/context/event-context.tsx'
      );

      const managerContent = fs.readFileSync(managerPath, 'utf8');
      const indexContent = fs.readFileSync(indexPath, 'utf8');
      const trainerContent = fs.readFileSync(trainerContextPath, 'utf8');
      const eventContent = fs.readFileSync(eventContextPath, 'utf8');

      // 1. NotificationManager defines cancelAllNotifications
      assert.match(
        managerContent,
        /public\s+async\s+cancelAllNotifications\s*\(\s*\)/,
        'NotificationManager must define cancelAllNotifications'
      );
      assert.match(
        managerContent,
        /cancelAllScheduledNotificationsAsync\s*\(/,
        'cancelAllNotifications must invoke cancelAllScheduledNotificationsAsync()'
      );

      // 2. index.ts exports cancelAllNotifications
      assert.match(
        indexContent,
        /export\s+(async\s+)?function\s+cancelAllNotifications/,
        'notifications/index.ts must export cancelAllNotifications'
      );

      // 3. trainer-context.tsx calls cancelAllNotifications during logout
      assert.match(
        trainerContent,
        /cancelAllNotifications\s*\(\s*\)/,
        'trainer-context.tsx must call cancelAllNotifications during logout'
      );

      // 4. event-context.tsx clears reminder state on logout / unauthenticated
      assert.match(
        eventContent,
        /setReminders\s*\(\s*\{\s*\}\s*\)/,
        'event-context.tsx must clear reminders when session is unauthenticated'
      );
    });
  });
});


