import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isCampusEvent,
  parseEvents,
  getEventsApi,
  getEventByIdApi,
} from '../src/shared/services/events/events-api';
import { CAMPUS_EVENTS } from '../src/shared/constants/campus-events-data.ts';

// Legacy PokeAPI type guards preserved for backwards compatibility
function isPokeApiListResponse(value) {
  if (typeof value !== 'object' || value === null) return false;
  return (
    typeof value.count === 'number' &&
    Array.isArray(value.results) &&
    value.results.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.url === 'string'
    )
  );
}

function isPokeApiDetailResponse(value) {
  if (typeof value !== 'object' || value === null) return false;
  return (
    typeof value.id === 'number' &&
    typeof value.name === 'string' &&
    Array.isArray(value.types) &&
    Array.isArray(value.stats)
  );
}

const validSampleEvent = {
  id: 'evt-test-01',
  title: 'Pikachu Meetup Test',
  description: 'A test event for networking validation',
  startsAt: '2026-10-15T09:00:00+07:00',
  endsAt: '2026-10-15T12:00:00+07:00',
  imageUrl: 'https://example.com/pikachu.png',
  location: {
    name: 'Main Campus Courtyard',
    latitude: 13.7455,
    longitude: 100.5335,
  },
  capacity: 50,
  registeredCount: 12,
  organizer: 'Campus Trainers',
  featuredPokemonId: 25,
};

describe('Week 6: REST API & Networking Tests', () => {
  describe('1. Runtime Type Guard Validation (isCampusEvent & parseEvents)', () => {
    test('Valid CampusEvent payload passes runtime validation', () => {
      assert.equal(isCampusEvent(validSampleEvent), true);
      assert.equal(isCampusEvent(CAMPUS_EVENTS[0]), true);

      // parseEvents succeeds and returns valid array
      const parsed = parseEvents([validSampleEvent]);
      assert.equal(parsed.length, 1);
      assert.equal(parsed[0].id, 'evt-test-01');

      // parseEvents parses full CAMPUS_EVENTS catalog
      const allParsed = parseEvents(CAMPUS_EVENTS);
      assert.equal(allParsed.length, CAMPUS_EVENTS.length);
    });

    test('Malformed payload fails validation (missing or invalid fields)', () => {
      // Null / primitive / array checks
      assert.equal(isCampusEvent(null), false);
      assert.equal(isCampusEvent(undefined), false);
      assert.equal(isCampusEvent('not-an-object'), false);
      assert.equal(isCampusEvent([]), false);

      // Missing required fields
      assert.equal(isCampusEvent({}), false);
      assert.equal(isCampusEvent({ id: 'evt-01' }), false);

      // Malformed location
      assert.equal(isCampusEvent({ ...validSampleEvent, location: null }), false);
      assert.equal(
        isCampusEvent({ ...validSampleEvent, location: 'Faculty of Science' }),
        false
      );
      assert.equal(
        isCampusEvent({
          ...validSampleEvent,
          location: { name: 'Lab', latitude: 'invalid', longitude: 100 },
        }),
        false
      );

      // Malformed date
      assert.equal(
        isCampusEvent({ ...validSampleEvent, startsAt: 'invalid-date' }),
        false
      );

      // Malformed featuredPokemonId
      assert.equal(
        isCampusEvent({ ...validSampleEvent, featuredPokemonId: -1 }),
        false
      );
      assert.equal(
        isCampusEvent({ ...validSampleEvent, featuredPokemonId: 0 }),
        false
      );
      assert.equal(
        isCampusEvent({ ...validSampleEvent, featuredPokemonId: '25' }),
        false
      );

      // parseEvents throws on malformed payloads
      assert.throws(
        () => parseEvents(null),
        /Malformed events payload/
      );
      assert.throws(
        () => parseEvents({ notArray: true }),
        /Malformed events payload/
      );
      assert.throws(
        () => parseEvents([{ id: 'bad-event' }]),
        /Malformed event at index 0/
      );
      assert.throws(
        () => parseEvents([validSampleEvent, { id: 'corrupt' }]),
        /Malformed event at index 1/
      );
    });

    test('Valid PokeAPI list response passes validation', () => {
      const validPayload = {
        count: 151,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      };
      assert.equal(isPokeApiListResponse(validPayload), true);
    });

    test('Malformed PokeAPI list response fails validation (missing fields)', () => {
      const corruptPayload1 = { count: 151 };
      const corruptPayload2 = { count: '151', results: [] };
      const corruptPayload3 = { count: 151, results: [{ name: 123 }] };
      const corruptPayload4 = null;

      assert.equal(isPokeApiListResponse(corruptPayload1), false);
      assert.equal(isPokeApiListResponse(corruptPayload2), false);
      assert.equal(isPokeApiListResponse(corruptPayload3), false);
      assert.equal(isPokeApiListResponse(corruptPayload4), false);
    });

    test('Valid PokeAPI detail response passes validation', () => {
      const validDetail = {
        id: 25,
        name: 'pikachu',
        types: [{ slot: 1, type: { name: 'electric' } }],
        stats: [{ base_stat: 35, stat: { name: 'hp' } }],
      };
      assert.equal(isPokeApiDetailResponse(validDetail), true);
    });

    test('Malformed PokeAPI detail response fails validation', () => {
      const corruptDetail1 = { id: '25', name: 'pikachu' };
      const corruptDetail2 = { id: 25, name: 'pikachu', types: 'electric' };
      const corruptDetail3 = {};

      assert.equal(isPokeApiDetailResponse(corruptDetail1), false);
      assert.equal(isPokeApiDetailResponse(corruptDetail2), false);
      assert.equal(isPokeApiDetailResponse(corruptDetail3), false);
    });
  });

  describe('2. Response.ok and HTTP Status Handling Contract', () => {
    test('Status code 404 throws descriptive error', async () => {
      const originalFetch = globalThis.fetch;
      const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

      try {
        process.env.EXPO_PUBLIC_API_URL = 'https://api.campusevents.internal';
        globalThis.fetch = async () => ({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        });

        await assert.rejects(
          async () => {
            await getEventsApi();
          },
          (err) => {
            assert.ok(err instanceof Error);
            assert.match(err.message, /404/);
            assert.match(err.message, /Not Found/);
            return true;
          }
        );
      } finally {
        globalThis.fetch = originalFetch;
        process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      }
    });

    test('Status code 500 throws descriptive server error', async () => {
      const originalFetch = globalThis.fetch;
      const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

      try {
        process.env.EXPO_PUBLIC_API_URL = 'https://api.campusevents.internal';
        globalThis.fetch = async () => ({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

        await assert.rejects(
          async () => {
            await getEventsApi();
          },
          (err) => {
            assert.ok(err instanceof Error);
            assert.match(err.message, /500/);
            assert.match(err.message, /Internal Server Error/);
            return true;
          }
        );
      } finally {
        globalThis.fetch = originalFetch;
        process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      }
    });

    test('200 OK response parses and returns valid events from API', async () => {
      const originalFetch = globalThis.fetch;
      const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

      try {
        process.env.EXPO_PUBLIC_API_URL = 'https://api.campusevents.internal';
        globalThis.fetch = async () => ({
          ok: true,
          status: 200,
          statusText: 'OK',
          json: async () => [validSampleEvent],
        });

        const events = await getEventsApi();
        assert.equal(events.length, 1);
        assert.equal(events[0].id, validSampleEvent.id);
      } finally {
        globalThis.fetch = originalFetch;
        process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      }
    });
  });

  describe('3. Request Cancellation via AbortSignal', () => {
    test('AbortController signals abort immediately if cancelled', () => {
      const controller = new AbortController();
      assert.equal(controller.signal.aborted, false);
      controller.abort();
      assert.equal(controller.signal.aborted, true);
    });

    test('AbortSignal triggers abort in getEventsApi with remote API', async () => {
      const originalFetch = globalThis.fetch;
      const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;

      try {
        process.env.EXPO_PUBLIC_API_URL = 'https://api.campusevents.internal';
        globalThis.fetch = async (_url, options) => {
          if (options?.signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
          }
          return new Promise((_resolve, reject) => {
            options?.signal?.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          });
        };

        const controller = new AbortController();
        const apiPromise = getEventsApi(controller.signal);
        controller.abort();

        await assert.rejects(apiPromise, (err) => {
          assert.equal(err.name, 'AbortError');
          return true;
        });
      } finally {
        globalThis.fetch = originalFetch;
        process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      }
    });

    test('AbortSignal triggers abort in fallback getEventsApi', async () => {
      const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
      delete process.env.EXPO_PUBLIC_API_URL;

      try {
        const controller = new AbortController();
        const apiPromise = getEventsApi(controller.signal);
        controller.abort();

        await assert.rejects(apiPromise, (err) => {
          assert.equal(err.name, 'AbortError');
          return true;
        });
      } finally {
        process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      }
    });
  });

  describe('4. Graceful Fallback Contract', () => {
    test('Fallback gracefully to local events when EXPO_PUBLIC_API_URL is unset', async () => {
      const originalApiUrl = process.env.EXPO_PUBLIC_API_URL;
      delete process.env.EXPO_PUBLIC_API_URL;

      try {
        const events = await getEventsApi();
        assert.ok(Array.isArray(events));
        assert.ok(events.length > 0);

        const singleEvent = await getEventByIdApi('evt-001');
        assert.ok(singleEvent);
        assert.equal(singleEvent.id, 'evt-001');

        const nonExistent = await getEventByIdApi('evt-non-existent-999');
        assert.equal(nonExistent, null);
      } finally {
        process.env.EXPO_PUBLIC_API_URL = originalApiUrl;
      }
    });
  });
});
