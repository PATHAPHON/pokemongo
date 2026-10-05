import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private dbInstance: SQLite.SQLiteDatabase | null = null;
  private initPromise: Promise<SQLite.SQLiteDatabase> | null = null;
  private readonly dbName: string;

  public constructor(dbName = 'pokemongo.db') {
    this.dbName = dbName;
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async getDatabase(): Promise<SQLite.SQLiteDatabase> {
    if (this.dbInstance) {
      return this.dbInstance;
    }
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        const db = await SQLite.openDatabaseAsync(this.dbName);
        await this.initDatabase(db);
        this.dbInstance = db;
        return db;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  public async initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
    if (Platform.OS !== 'web') {
      try {
        await db.execAsync('PRAGMA journal_mode = WAL;');
      } catch (err) {
        console.warn('Could not set WAL journal mode:', err);
      }
    }

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS caught_pokemon (
        instance_id TEXT PRIMARY KEY,
        pokemon_id INTEGER NOT NULL,
        nickname TEXT,
        name TEXT NOT NULL,
        artwork TEXT NOT NULL,
        types_json TEXT NOT NULL,
        rarity TEXT NOT NULL DEFAULT 'common',
        height REAL,
        weight REAL,
        caught_at TEXT NOT NULL,
        location_lat REAL,
        location_lng REAL,
        location_name TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS inventory (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS trainer_profile (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        team TEXT NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        experience INTEGER NOT NULL DEFAULT 0,
        next_level_experience INTEGER NOT NULL DEFAULT 1000,
        stardust INTEGER NOT NULL DEFAULT 1000,
        poke_coins INTEGER NOT NULL DEFAULT 100,
        avatar_url TEXT,
        starter_pokemon_id INTEGER,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pokemon_registry (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        types_json TEXT NOT NULL,
        bst INTEGER NOT NULL DEFAULT 0,
        rarity TEXT NOT NULL DEFAULT 'common',
        cached_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS campus_events (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        starts_at TEXT NOT NULL,
        ends_at TEXT,
        image_url TEXT,
        location_name TEXT NOT NULL,
        location_lat REAL NOT NULL,
        location_lng REAL NOT NULL,
        capacity INTEGER,
        registered_count INTEGER NOT NULL DEFAULT 0,
        organizer TEXT,
        organizer_id TEXT,
        featured_pokemon_id INTEGER,
        is_custom INTEGER NOT NULL DEFAULT 0,
        cached_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS event_registrations (
        id TEXT PRIMARY KEY,
        event_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        registered_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'registered',
        notes TEXT,
        photo_uri TEXT,
        has_caught INTEGER NOT NULL DEFAULT 0,
        attempted_at TEXT
      );
    `);

    try {
      // Check event_registrations columns
      const regTableInfo = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(event_registrations);'
      );
      if (!regTableInfo.some((col) => col.name === 'has_caught')) {
        await db.execAsync(`ALTER TABLE event_registrations ADD COLUMN has_caught INTEGER NOT NULL DEFAULT 0;`);
      }
      if (!regTableInfo.some((col) => col.name === 'attempted_at')) {
        await db.execAsync(`ALTER TABLE event_registrations ADD COLUMN attempted_at TEXT;`);
      }

      // Check campus_events columns
      const eventTableInfo = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(campus_events);'
      );
      if (!eventTableInfo.some((col) => col.name === 'organizer_id')) {
        await db.execAsync(`ALTER TABLE campus_events ADD COLUMN organizer_id TEXT;`);
      }
      if (!eventTableInfo.some((col) => col.name === 'featured_pokemon_id')) {
        await db.execAsync(`ALTER TABLE campus_events ADD COLUMN featured_pokemon_id INTEGER;`);
      }
      if (!eventTableInfo.some((col) => col.name === 'is_custom')) {
        await db.execAsync(`ALTER TABLE campus_events ADD COLUMN is_custom INTEGER NOT NULL DEFAULT 0;`);
      }

      // Check trainer_profile columns
      const trainerTableInfo = await db.getAllAsync<{ name: string }>(
        'PRAGMA table_info(trainer_profile);'
      );
      const hasStudentId = trainerTableInfo.some((col) => col.name === 'student_id');
      const hasFaculty = trainerTableInfo.some((col) => col.name === 'faculty');

      if (!hasStudentId) {
        await db.execAsync(`ALTER TABLE trainer_profile ADD COLUMN student_id TEXT;`);
      }
      if (!hasFaculty) {
        await db.execAsync(`ALTER TABLE trainer_profile ADD COLUMN faculty TEXT;`);
      }

      const tableInfo = await db.getAllAsync<{ name: string; notnull: number }>(
        'PRAGMA table_info(caught_pokemon);'
      );
      const hasLegacyColumns = tableInfo.some((col) =>
        [
          'cp',
          'level',
          'iv_attack',
          'iv_defense',
          'iv_stamina',
          'stats_json',
        ].includes(col.name)
      );
      const hasRarity = tableInfo.some((col) => col.name === 'rarity');

      if (hasLegacyColumns) {
        await db.execAsync(`
          DROP TABLE IF EXISTS caught_pokemon_migrated;

          CREATE TABLE caught_pokemon_migrated (
            instance_id TEXT PRIMARY KEY,
            pokemon_id INTEGER NOT NULL,
            nickname TEXT,
            name TEXT NOT NULL,
            artwork TEXT NOT NULL,
            types_json TEXT NOT NULL,
            rarity TEXT NOT NULL DEFAULT 'common',
            height REAL,
            weight REAL,
            caught_at TEXT NOT NULL,
            location_lat REAL,
            location_lng REAL,
            location_name TEXT,
            is_favorite INTEGER NOT NULL DEFAULT 0
          );

          INSERT OR REPLACE INTO caught_pokemon_migrated (
            instance_id, pokemon_id, nickname, name, artwork, types_json,
            rarity, height, weight, caught_at, location_lat, location_lng, location_name, is_favorite
          )
          SELECT
            instance_id,
            pokemon_id,
            nickname,
            name,
            artwork,
            types_json,
            ${hasRarity ? "COALESCE(rarity, 'common')" : "'common'"},
            height,
            weight,
            caught_at,
            location_lat,
            location_lng,
            location_name,
            is_favorite
          FROM caught_pokemon;

          DROP TABLE caught_pokemon;
          ALTER TABLE caught_pokemon_migrated RENAME TO caught_pokemon;
        `);
      } else if (!hasRarity) {
        await db.execAsync(
          `ALTER TABLE caught_pokemon ADD COLUMN rarity TEXT DEFAULT 'common';`
        );
      }
    } catch (err) {
      console.error('Error during database migration:', err);
    }
  }
}
