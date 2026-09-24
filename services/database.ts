import * as SQLite from 'expo-sqlite';
import { CaughtPokemon, TrainerInventory, TrainerProfile } from '@/types';

const DB_NAME = 'pokemongo.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  await initDatabase(dbInstance);
  return dbInstance;
}

export async function initDatabase(db: SQLite.SQLiteDatabase): Promise<void> {
  // PRAGMA journal_mode = WAL for better concurrency & performance
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS caught_pokemon (
      instance_id TEXT PRIMARY KEY,
      pokemon_id INTEGER NOT NULL,
      nickname TEXT,
      name TEXT NOT NULL,
      artwork TEXT NOT NULL,
      types_json TEXT NOT NULL,
      cp INTEGER NOT NULL,
      level INTEGER NOT NULL,
      iv_attack INTEGER NOT NULL,
      iv_defense INTEGER NOT NULL,
      iv_stamina INTEGER NOT NULL,
      stats_json TEXT NOT NULL,
      height REAL NOT NULL,
      weight REAL NOT NULL,
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
  `);
}

// -------------------------------------------------------------
// Caught Pokémon Operations
// -------------------------------------------------------------

export async function getAllCaughtPokemon(): Promise<CaughtPokemon[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM caught_pokemon ORDER BY caught_at DESC'
  );

  return rows.map((row) => ({
    instanceId: row.instance_id,
    pokemonId: row.pokemon_id,
    nickname: row.nickname ?? undefined,
    name: row.name,
    artwork: row.artwork,
    types: JSON.parse(row.types_json),
    cp: row.cp,
    level: row.level,
    iv: {
      attack: row.iv_attack,
      defense: row.iv_defense,
      stamina: row.iv_stamina,
    },
    stats: JSON.parse(row.stats_json),
    height: row.height,
    weight: row.weight,
    caughtAt: row.caught_at,
    location:
      row.location_lat != null && row.location_lng != null
        ? {
            latitude: row.location_lat,
            longitude: row.location_lng,
            name: row.location_name ?? undefined,
          }
        : undefined,
    favorite: Boolean(row.is_favorite),
  }));
}

export async function insertCaughtPokemon(pokemon: CaughtPokemon): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO caught_pokemon (
      instance_id, pokemon_id, nickname, name, artwork, types_json,
      cp, level, iv_attack, iv_defense, iv_stamina, stats_json,
      height, weight, caught_at, location_lat, location_lng, location_name, is_favorite
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      pokemon.instanceId,
      pokemon.pokemonId,
      pokemon.nickname ?? null,
      pokemon.name,
      pokemon.artwork,
      JSON.stringify(pokemon.types),
      pokemon.cp,
      pokemon.level,
      pokemon.iv.attack,
      pokemon.iv.defense,
      pokemon.iv.stamina,
      JSON.stringify(pokemon.stats),
      pokemon.height,
      pokemon.weight,
      pokemon.caughtAt,
      pokemon.location?.latitude ?? null,
      pokemon.location?.longitude ?? null,
      pokemon.location?.name ?? null,
      pokemon.favorite ? 1 : 0,
    ]
  );
}

export async function updatePokemonNickname(instanceId: string, nickname: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE caught_pokemon SET nickname = ? WHERE instance_id = ?',
    [nickname, instanceId]
  );
}

export async function togglePokemonFavorite(instanceId: string, isFavorite: boolean): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE caught_pokemon SET is_favorite = ? WHERE instance_id = ?',
    [isFavorite ? 1 : 0, instanceId]
  );
}

export async function deleteCaughtPokemon(instanceId: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'DELETE FROM caught_pokemon WHERE instance_id = ?',
    [instanceId]
  );
}

// -------------------------------------------------------------
// Inventory Operations
// -------------------------------------------------------------

const DEFAULT_INVENTORY: TrainerInventory = {
  pokeballs: 50,
  greatballs: 20,
  ultraballs: 10,
  razzberries: 15,
  nanabberries: 10,
  pinapberries: 10,
  potions: 20,
  revives: 10,
};

export async function getTrainerInventory(): Promise<TrainerInventory> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ key: string; count: number }>(
    'SELECT key, count FROM inventory'
  );

  if (rows.length === 0) {
    // Seed initial inventory
    await initInventory(db);
    return DEFAULT_INVENTORY;
  }

  const inventory: TrainerInventory = { ...DEFAULT_INVENTORY };
  for (const row of rows) {
    if (row.key in inventory) {
      (inventory as any)[row.key] = row.count;
    }
  }
  return inventory;
}

export async function initInventory(db: SQLite.SQLiteDatabase): Promise<void> {
  for (const [key, count] of Object.entries(DEFAULT_INVENTORY)) {
    await db.runAsync(
      'INSERT OR IGNORE INTO inventory (key, count) VALUES (?, ?)',
      [key, count]
    );
  }
}

export async function updateInventoryCount(
  itemKey: keyof TrainerInventory,
  count: number
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT OR REPLACE INTO inventory (key, count) VALUES (?, ?)',
    [itemKey, Math.max(0, count)]
  );
}

export async function adjustInventoryCount(
  itemKey: keyof TrainerInventory,
  delta: number
): Promise<number> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT count FROM inventory WHERE key = ?',
    [itemKey]
  );
  const currentCount = row ? row.count : (DEFAULT_INVENTORY[itemKey] ?? 0);
  const newCount = Math.max(0, currentCount + delta);
  await db.runAsync(
    'INSERT OR REPLACE INTO inventory (key, count) VALUES (?, ?)',
    [itemKey, newCount]
  );
  return newCount;
}

// -------------------------------------------------------------
// Trainer Profile Operations
// -------------------------------------------------------------

export async function getStoredTrainerProfile(): Promise<TrainerProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM trainer_profile LIMIT 1'
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    team: row.team,
    level: row.level,
    experience: row.experience,
    nextLevelExperience: row.next_level_experience,
    stardust: row.stardust,
    pokeCoins: row.poke_coins,
    avatarUrl: row.avatar_url ?? undefined,
    starterPokemonId: row.starter_pokemon_id ?? undefined,
    createdAt: row.created_at,
  };
}

export async function saveStoredTrainerProfile(profile: TrainerProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT OR REPLACE INTO trainer_profile (
      id, name, team, level, experience, next_level_experience,
      stardust, poke_coins, avatar_url, starter_pokemon_id, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profile.id,
      profile.name,
      profile.team,
      profile.level,
      profile.experience,
      profile.nextLevelExperience,
      profile.stardust,
      profile.pokeCoins,
      profile.avatarUrl ?? null,
      profile.starterPokemonId ?? null,
      profile.createdAt,
    ]
  );
}
