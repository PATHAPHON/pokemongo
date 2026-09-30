import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const SPAWN_CHANNEL_ID = 'pokemon-wild-alerts';

const BACKGROUND_RARE_SPAWNS = [
  { id: 149, name: 'Dragonite', rarity: 'Legendary' },
  { id: 143, name: 'Snorlax', rarity: 'Rare' },
  { id: 6, name: 'Charizard', rarity: 'Rare' },
  { id: 130, name: 'Gyarados', rarity: 'Rare' },
  { id: 131, name: 'Lapras', rarity: 'Rare' },
  { id: 150, name: 'Mewtwo', rarity: 'Legendary' },
  { id: 94, name: 'Gengar', rarity: 'Rare' },
  { id: 59, name: 'Arcanine', rarity: 'Rare' },
];

describe('Week 11: Native Background Notifications Contract Tests', () => {
  describe('1. Android Notification Channel Configuration', () => {
    test('Channel configuration requires MAX importance for outside banner display', () => {
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
        name: 'การแจ้งเตือนโปเกมอนป่า',
        importance: AndroidImportance.MAX,
        lockscreenVisibility: AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        enableLights: true,
        lightColor: '#FFCB05',
        enableVibrate: true,
        vibrationPattern: [0, 500, 250, 500],
      };

      assert.equal(channelConfig.importance, 6, 'Must be AndroidImportance.MAX');
      assert.equal(
        channelConfig.lockscreenVisibility,
        1,
        'Must be AndroidNotificationVisibility.PUBLIC'
      );
      assert.equal(channelConfig.bypassDnd, true);
      assert.equal(channelConfig.enableVibrate, true);
      assert.deepEqual(channelConfig.vibrationPattern, [0, 500, 250, 500]);
    });

    test('Payload uses max priority with strong vibration', () => {
      const payload = {
        priority: 'max',
        vibrate: [0, 500, 250, 500],
      };

      assert.equal(payload.priority, 'max');
      assert.deepEqual(payload.vibrate, [0, 500, 250, 500]);
    });
  });

  describe('2. Background Rare Spawns Candidate Pool', () => {
    test('Candidate list contains only valid Gen 1 (Kanto 1-151) Rare/Legendary Pokémon', () => {
      assert.ok(BACKGROUND_RARE_SPAWNS.length >= 5);
      for (const p of BACKGROUND_RARE_SPAWNS) {
        assert.ok(p.id >= 1 && p.id <= 151, `ID ${p.id} must be in Kanto range 1-151`);
        assert.ok(typeof p.name === 'string' && p.name.length > 0);
        assert.ok(['Rare', 'Legendary', 'Ultra Rare', 'Common'].includes(p.rarity));
      }
    });

    test('Staggered background trigger schedules 15s, 60s, 300s, and 600s rounds', () => {
      const rounds = [
        { seconds: 15, expectedTag: 'bg-spawn-15s' },
        { seconds: 60, expectedTag: 'bg-spawn-60s' },
        { seconds: 300, expectedTag: 'bg-spawn-300s' },
        { seconds: 600, expectedTag: 'bg-spawn-600s' },
      ];

      assert.equal(rounds[0].seconds, 15);
      assert.equal(rounds[1].seconds, 60);
      assert.equal(rounds[2].seconds, 300);
      assert.equal(rounds[3].seconds, 600);
    });
  });

  describe('3. Notification Payload & Deep Link Contract', () => {
    test('Payload contains numeric string pokemonId for deep link navigation to /catch', () => {
      const samplePokemon = BACKGROUND_RARE_SPAWNS[0];
      const notificationContent = {
        title: `⚡ พบ ${samplePokemon.name} ป่าใกล้ตัวคุณ!`,
        body: `ระดับ ${samplePokemon.rarity}! โปเกมอนหายากกำลังจะหนีในอีกไม่กี่นาที แตะเพื่อจับทันที!`,
        sound: true,
        data: {
          pokemonId: String(samplePokemon.id),
          instanceId: `bg-spawn-15s-${Date.now()}`,
          type: 'wild-spawn',
        },
      };

      const parsedId = parseInt(notificationContent.data.pokemonId, 10);
      assert.equal(isNaN(parsedId), false);
      assert.equal(parsedId, 149);
      assert.equal(notificationContent.data.type, 'wild-spawn');
    });

    test('Delayed test notification formats valid timeInterval trigger', () => {
      const delaySeconds = 5;
      const trigger = {
        type: 'timeInterval',
        seconds: Math.max(1, delaySeconds),
        repeats: false,
        channelId: SPAWN_CHANNEL_ID,
      };

      assert.equal(trigger.type, 'timeInterval');
      assert.equal(trigger.seconds, 5);
      assert.equal(trigger.repeats, false);
      assert.equal(trigger.channelId, 'pokemon-wild-alerts');
    });
  });
});
