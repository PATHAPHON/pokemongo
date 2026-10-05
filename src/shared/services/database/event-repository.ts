import { DatabaseManager } from './database-manager';
import {
  CampusEvent,
  EventRegistration,
  EventRegistrationStatus,
} from '@/shared/types';

export class EventRepository {
  private readonly dbManager: DatabaseManager;

  public constructor(
    dbManager: DatabaseManager = DatabaseManager.getInstance()
  ) {
    this.dbManager = dbManager;
  }

  public async getCachedEvents(): Promise<{
    events: CampusEvent[];
    lastUpdated: string | null;
  }> {
    const db = await this.dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM campus_events ORDER BY starts_at ASC'
    );

    if (!rows || rows.length === 0) {
      return { events: [], lastUpdated: null };
    }

    const events: CampusEvent[] = rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      startsAt: r.starts_at,
      endsAt: r.ends_at ?? undefined,
      imageUrl: r.image_url ?? undefined,
      location: {
        name: r.location_name,
        latitude: r.location_lat,
        longitude: r.location_lng,
      },
      capacity: r.capacity ?? undefined,
      registeredCount: r.registered_count,
      organizer: r.organizer ?? undefined,
      organizerId: r.organizer_id ?? undefined,
      featuredPokemonId: r.featured_pokemon_id ?? 25,
      isCustom: Boolean(r.is_custom),
    }));

    const lastUpdated = rows[0]?.cached_at ?? null;

    return { events, lastUpdated };
  }

  public async saveEventsToCache(events: CampusEvent[]): Promise<void> {
    const db = await this.dbManager.getDatabase();
    const now = new Date().toISOString();

    // Merge (INSERT OR REPLACE) instead of DELETE-all so offline custom
    // events created via insertEvent survive the next refresh.
    await db.withTransactionAsync(async () => {
      for (const e of events) {
        await db.runAsync(
          `INSERT OR REPLACE INTO campus_events (
            id, title, description, category, starts_at, ends_at,
            image_url, location_name, location_lat, location_lng,
            capacity, registered_count, organizer, organizer_id,
            featured_pokemon_id, is_custom, cached_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            e.id,
            e.title,
            e.description,
            'pokemon',
            e.startsAt,
            e.endsAt ?? null,
            e.imageUrl ?? null,
            e.location.name,
            e.location.latitude,
            e.location.longitude,
            e.capacity ?? null,
            e.registeredCount,
            e.organizer ?? null,
            e.organizerId ?? null,
            e.featuredPokemonId ?? null,
            e.isCustom ? 1 : 0,
            now,
          ]
        );
      }
    });
  }

  public async insertEvent(e: CampusEvent): Promise<void> {
    const db = await this.dbManager.getDatabase();
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT OR REPLACE INTO campus_events (
        id, title, description, category, starts_at, ends_at,
        image_url, location_name, location_lat, location_lng,
        capacity, registered_count, organizer, organizer_id,
        featured_pokemon_id, is_custom, cached_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        e.id,
        e.title,
        e.description,
        'pokemon',
        e.startsAt,
        e.endsAt ?? null,
        e.imageUrl ?? null,
        e.location.name,
        e.location.latitude,
        e.location.longitude,
        e.capacity ?? null,
        e.registeredCount,
        e.organizer ?? null,
        e.organizerId ?? null,
        e.featuredPokemonId ?? null,
        e.isCustom ? 1 : 0,
        now,
      ]
    );
  }

  public async getAllRegistrations(): Promise<EventRegistration[]> {
    const db = await this.dbManager.getDatabase();
    const rows = await db.getAllAsync<any>(
      'SELECT * FROM event_registrations ORDER BY registered_at DESC'
    );

    return rows.map((r) => ({
      id: r.id,
      eventId: r.event_id,
      userId: r.user_id,
      registeredAt: r.registered_at,
      status: r.status as EventRegistrationStatus,
      notes: r.notes ?? undefined,
      photoUri: r.photo_uri ?? undefined,
      hasCaught: Boolean(r.has_caught),
      attemptedAt: r.attempted_at ?? undefined,
    }));
  }

  public async insertRegistration(reg: EventRegistration): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO event_registrations (
        id, event_id, user_id, registered_at, status, notes, photo_uri, has_caught, attempted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        reg.id,
        reg.eventId,
        reg.userId,
        reg.registeredAt,
        reg.status,
        reg.notes ?? null,
        reg.photoUri ?? null,
        reg.hasCaught ? 1 : 0,
        reg.attemptedAt ?? null,
      ]
    );
  }

  public async updateRegistrationStatus(
    registrationId: string,
    status: EventRegistrationStatus
  ): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync(
      'UPDATE event_registrations SET status = ? WHERE id = ?',
      [status, registrationId]
    );
  }

  public async markCatchAttempt(
    eventId: string,
    userId: string,
    hasCaught: boolean
  ): Promise<void> {
    const db = await this.dbManager.getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE event_registrations
       SET status = 'attended',
           has_caught = CASE WHEN has_caught = 1 THEN 1 ELSE ? END,
           attempted_at = ?
       WHERE event_id = ? AND user_id = ?`,
      [hasCaught ? 1 : 0, now, eventId, userId]
    );
  }
}
