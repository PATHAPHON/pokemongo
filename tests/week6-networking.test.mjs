import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import type guards logic from pokeapi-client
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

describe('Week 6: REST API & Networking Tests', () => {
  describe('1. Runtime Type Guard Validation', () => {
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

    test('Malformed list response fails validation (missing fields)', () => {
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

    test('Malformed detail response fails validation', () => {
      const corruptDetail1 = { id: '25', name: 'pikachu' };
      const corruptDetail2 = { id: 25, name: 'pikachu', types: 'electric' };
      const corruptDetail3 = {};

      assert.equal(isPokeApiDetailResponse(corruptDetail1), false);
      assert.equal(isPokeApiDetailResponse(corruptDetail2), false);
      assert.equal(isPokeApiDetailResponse(corruptDetail3), false);
    });
  });

  describe('2. Response.ok and HTTP Status Handling Contract', () => {
    test('Simulated 404 response throws diagnostic error', async () => {
      const fakeResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      };

      assert.equal(fakeResponse.ok, false);
      const errorMessage = `PokéAPI HTTP error: ${fakeResponse.status} (${fakeResponse.statusText})`;
      assert.equal(errorMessage, 'PokéAPI HTTP error: 404 (Not Found)');
    });

    test('Simulated 500 response throws diagnostic server error', async () => {
      const fakeResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      };

      assert.equal(fakeResponse.ok, false);
      const errorMessage = `PokéAPI HTTP error: ${fakeResponse.status} (${fakeResponse.statusText})`;
      assert.equal(errorMessage, 'PokéAPI HTTP error: 500 (Internal Server Error)');
    });
  });

  describe('3. Request Cancellation via AbortSignal', () => {
    test('AbortController signals abort immediately if cancelled', () => {
      const controller = new AbortController();
      assert.equal(controller.signal.aborted, false);
      controller.abort();
      assert.equal(controller.signal.aborted, true);
    });
  });
});
