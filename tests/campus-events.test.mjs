import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { CAMPUS_EVENTS } from '../src/shared/constants/campus-events-data.ts';
import {
  EventCategoryColors,
  getCategoryLabel,
} from '../src/shared/constants/event-theme';
import {
  getEvents,
  getEventById,
  registerForEvent,
  cancelRegistration,
  getUserRegistrations,
  createEvent,
  markEventCatchAttempt,
} from '../src/shared/services/events/event-service';
import {
  createEventPokemonSpot,
  getDistanceInMeters,
} from '../src/features/map/services/spawn-engine';
import { buildCatchParams } from '../src/shared/utils/event-helpers.ts';

describe('Campus Events Data & Domain Model Tests', () => {
  it('CAMPUS_EVENTS contains valid events with required fields', () => {
    assert.ok(
      CAMPUS_EVENTS.length >= 10,
      'Must have at least 10 campus events'
    );

    for (const event of CAMPUS_EVENTS) {
      assert.ok(event.id, 'Event must have an id');
      assert.ok(event.title, 'Event must have a title');
      assert.ok(event.description, 'Event must have a description');
      assert.ok(
        ['workshop', 'academic', 'sports', 'social', 'career'].includes(
          event.category
        ),
        `Event category ${event.category} must be one of allowed categories`
      );
      assert.ok(
        !isNaN(new Date(event.startsAt).getTime()),
        'Event startsAt must be valid ISO 8601'
      );
      assert.ok(event.location.name, 'Location name is required');
      assert.ok(
        typeof event.location.latitude === 'number',
        'Location latitude must be number'
      );
      assert.ok(
        typeof event.location.longitude === 'number',
        'Location longitude must be number'
      );
      assert.ok(
        typeof event.registeredCount === 'number',
        'registeredCount must be number'
      );
    }
  });

  it('EventCategoryColors and label helpers map correctly', () => {
    const categories = ['workshop', 'academic', 'sports', 'social', 'career'];
    for (const cat of categories) {
      assert.ok(EventCategoryColors[cat], `Theme color for ${cat} must exist`);
      assert.ok(
        getCategoryLabel(cat).length > 0,
        `Category label for ${cat} must exist`
      );
    }

    assert.equal(getCategoryLabel('workshop'), 'เวิร์กช็อปเทคนิค');
    assert.equal(getCategoryLabel('academic'), 'วิจัยฟิลด์รีเสิร์ช');
  });
});

describe('Campus Event Service Layer Tests', () => {
  it('getEvents returns all events', async () => {
    const events = await getEvents();
    assert.ok(Array.isArray(events));
    assert.equal(events.length, CAMPUS_EVENTS.length);
  });

  it('getEventById returns matching event or null', async () => {
    const event = await getEventById('evt-001');
    assert.ok(event);
    assert.equal(event.id, 'evt-001');

    const notFound = await getEventById('non-existent-id');
    assert.equal(notFound, null);
  });

  it('registerForEvent successfully registers a user and prevents duplicates', async () => {
    const testUserId = `test-user-${Date.now()}`;
    const targetEventId = 'evt-001';

    // 1. Initial registration
    const res1 = await registerForEvent(
      targetEventId,
      testUserId,
      'Test notes for workshop',
      'file:///test/ticket.jpg'
    );
    assert.equal(res1.success, true);
    assert.ok(res1.registration);
    assert.equal(res1.registration.eventId, targetEventId);
    assert.equal(res1.registration.userId, testUserId);
    assert.equal(res1.registration.status, 'registered');
    assert.equal(res1.registration.notes, 'Test notes for workshop');
    assert.equal(res1.registration.photoUri, 'file:///test/ticket.jpg');

    // 2. Query user registrations
    const userRegs = await getUserRegistrations(testUserId);
    assert.equal(userRegs.length, 1);
    assert.equal(userRegs[0].eventId, targetEventId);

    // 3. Duplicate registration must be rejected
    const res2 = await registerForEvent(targetEventId, testUserId);
    assert.equal(res2.success, false);
    assert.ok(res2.error?.includes('ลงทะเบียน'));

    // 4. Cancel registration
    const cancelRes = await cancelRegistration(res1.registration.id);
    assert.equal(cancelRes.success, true);

    // 5. Active registrations should now be 0 for this user
    const updatedUserRegs = await getUserRegistrations(testUserId);
    assert.equal(updatedUserRegs.length, 0);
  });

  it('registerForEvent enforces event capacity limits', async () => {
    // evt-006 has capacity 35 and initial registeredCount 35
    const fullRes = await registerForEvent('evt-006', 'overflow-student-999');
    assert.equal(fullRes.success, false);
    assert.ok(fullRes.error?.includes('เต็ม'));
  });

  it('createEvent creates a custom event with featuredPokemonId and organizerId', async () => {
    // 1. Validation error on missing title
    const invalidRes = await createEvent({
      title: '',
      description: 'Test description',
      category: 'social',
      startsAt: new Date().toISOString(),
      location: { name: 'Campus Lawn', latitude: 13.793, longitude: 100.323 },
    });
    assert.equal(invalidRes.success, false);
    assert.ok(invalidRes.error?.includes('ชื่อกิจกรรม'));

    // 2. Successful creation
    const createRes = await createEvent({
      title: 'Pikachu Community Gathering',
      description: 'รวมพลจับพิคาชูริมสระน้ำมหาวิทยาลัย',
      category: 'social',
      startsAt: '2026-10-15T09:00:00.000Z',
      endsAt: '2026-10-15T12:00:00.000Z',
      location: {
        name: 'ริมสระน้ำ คณะวิทยาศาสตร์',
        latitude: 13.7935,
        longitude: 100.3238,
      },
      capacity: 50,
      organizerId: 'trainer-prof-oak',
      featuredPokemonId: 25,
    });

    assert.equal(createRes.success, true);
    assert.ok(createRes.event);
    assert.equal(createRes.event.isCustom, true);
    assert.equal(createRes.event.featuredPokemonId, 25);
    assert.equal(createRes.event.organizerId, 'trainer-prof-oak');
    assert.equal(createRes.event.registeredCount, 0);

    // 3. Newly created event can be fetched by ID
    const fetched = await getEventById(createRes.event.id);
    assert.ok(fetched);
    assert.equal(fetched.id, createRes.event.id);
    assert.equal(fetched.title, 'Pikachu Community Gathering');
    assert.equal(fetched.featuredPokemonId, 25);
  });

  it('verifies Udon Thani event exists and has valid coordinates & featured Pokemon', () => {
    const udonEvent = CAMPUS_EVENTS.find((e) => e.id === 'evt-udon-01');
    assert.ok(udonEvent, 'Udon Thani event evt-udon-01 must exist');
    assert.ok(udonEvent.title.includes('Udon Thani'));
    assert.equal(udonEvent.location.latitude, 17.4138);
    assert.equal(udonEvent.location.longitude, 102.7872);
    assert.equal(udonEvent.featuredPokemonId, 143); // Snorlax
  });

  it('createEventPokemonSpot creates active spawn right at the event venue', () => {
    const venue = { latitude: 17.4138, longitude: 102.7872 };
    const spot = createEventPokemonSpot(venue, 143);

    assert.ok(spot);
    assert.equal(spot.id, 143);
    assert.equal(spot.name, 'snorlax');
    assert.equal(spot.status, 'ACTIVE');
    assert.ok(spot.instanceId.startsWith('evt-spot-143-'));

    // Distance from venue must be within 30 meters
    const dist = getDistanceInMeters(venue, {
      latitude: spot.latitude,
      longitude: spot.longitude,
    });
    assert.ok(
      dist <= 40,
      `Spawned pokemon must be near venue (got ${dist.toFixed(1)}m <= 40m)`
    );
  });

  it('markEventCatchAttempt records attended status and single-catch completion', async () => {
    const singleCatchUserId = `trainer-single-catch-${Date.now()}`;
    const targetEventId = 'evt-002';

    // 1. Register for event
    const regRes = await registerForEvent(targetEventId, singleCatchUserId);
    assert.equal(regRes.success, true);
    assert.equal(regRes.registration.status, 'registered');

    // 2. Mark catch attempt consumed with success
    const attemptRes = await markEventCatchAttempt(targetEventId, singleCatchUserId, true);
    assert.equal(attemptRes.success, true);
    assert.ok(attemptRes.registration);
    assert.equal(attemptRes.registration.status, 'attended');
    assert.equal(attemptRes.registration.hasCaught, true);
    assert.ok(attemptRes.registration.attemptedAt);

    // 3. User can no longer register again
    const dupRes = await registerForEvent(targetEventId, singleCatchUserId);
    assert.equal(dupRes.success, false);
  });

  it('buildCatchParams carries eventId when provided', () => {
    const params = buildCatchParams({
      id: 25,
      name: 'pikachu',
      rarity: 'rare',
      types: ['electric'],
      eventId: 'evt-001',
    });

    assert.equal(params.pathname, '/catch');
    assert.equal(params.params.id, '25');
    assert.equal(params.params.name, 'pikachu');
    assert.equal(params.params.eventId, 'evt-001');
  });
});
