import { DatabaseManager } from './database-manager';
import { CaughtPokemon, PokemonRarity } from '@/shared/types';
import { getPokemonRarity } from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById, safeParsePokemonTypes } from '@/shared/services/pokemon-registry';

export { safeParsePokemonTypes };

interface IPokemonRepository {
  getAll(userId?: string): Promise<CaughtPokemon[]>;
  insert(pokemon: CaughtPokemon, userId?: string): Promise<void>;
  delete(instanceId: string): Promise<void>;
}

export class PokemonRepository implements IPokemonRepository {
  private readonly dbManager: DatabaseManager;

  public constructor(dbManager: DatabaseManager = DatabaseManager.getInstance()) {
    this.dbManager = dbManager;
  }

  public async getAll(userId?: string): Promise<CaughtPokemon[]> {
    const db = await this.dbManager.getDatabase();
    const rows = userId
      ? await db.getAllAsync<any>(
          'SELECT * FROM caught_pokemon WHERE user_id = ? ORDER BY caught_at DESC',
          [userId]
        )
      : await db.getAllAsync<any>(
          'SELECT * FROM caught_pokemon ORDER BY caught_at DESC'
        );

    return rows.map((row) => ({
      instanceId: row.instance_id,
      pokemonId: row.pokemon_id,
      nickname: row.nickname ?? undefined,
      name: row.name,
      artwork: row.artwork,
      types: safeParsePokemonTypes(row.types_json),
      rarity:
        (row.rarity as PokemonRarity) ||
        getPokemonMetaById(row.pokemon_id)?.rarity ||
        getPokemonRarity(row.pokemon_id),
      height: row.height ?? undefined,
      weight: row.weight ?? undefined,
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

  public async insert(pokemon: CaughtPokemon, userId?: string): Promise<void> {
    const db = await this.dbManager.getDatabase();
    const targetUserId =
      userId ||
      (pokemon.instanceId.startsWith('starter-pikachu-')
        ? pokemon.instanceId.replace('starter-pikachu-', '')
        : null);
    const params = [
      pokemon.instanceId,
      targetUserId,
      pokemon.pokemonId,
      pokemon.nickname ?? null,
      pokemon.name,
      pokemon.artwork,
      JSON.stringify(pokemon.types),
      pokemon.rarity ?? 'common',
      pokemon.height ?? null,
      pokemon.weight ?? null,
      pokemon.caughtAt,
      pokemon.location?.latitude ?? null,
      pokemon.location?.longitude ?? null,
      pokemon.location?.name ?? null,
      pokemon.favorite ? 1 : 0,
    ];

    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO caught_pokemon (
          instance_id, user_id, pokemon_id, nickname, name, artwork, types_json,
          rarity, height, weight, caught_at, location_lat, location_lng, location_name, is_favorite
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
      );
    } catch (err: any) {
      if (err?.message?.includes('NOT NULL constraint failed') || err?.message?.includes('no column named user_id')) {
        await this.dbManager.initDatabase(db);
        await db.runAsync(
          `INSERT OR REPLACE INTO caught_pokemon (
            instance_id, user_id, pokemon_id, nickname, name, artwork, types_json,
            rarity, height, weight, caught_at, location_lat, location_lng, location_name, is_favorite
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          params
        );
      } else {
        throw err;
      }
    }
  }

  public async delete(instanceId: string): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync('DELETE FROM caught_pokemon WHERE instance_id = ?', [
      instanceId,
    ]);
  }
}
