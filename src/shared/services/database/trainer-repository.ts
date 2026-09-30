import { DatabaseManager } from './database-manager';
import { TrainerProfile } from '@/shared/types';

interface ITrainerRepository {
  getProfile(): Promise<TrainerProfile | null>;
  saveProfile(profile: TrainerProfile): Promise<void>;
}

export class TrainerRepository implements ITrainerRepository {
  private readonly dbManager: DatabaseManager;

  public constructor(dbManager: DatabaseManager = DatabaseManager.getInstance()) {
    this.dbManager = dbManager;
  }

  public async getProfile(): Promise<TrainerProfile | null> {
    const db = await this.dbManager.getDatabase();
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

  public async saveProfile(profile: TrainerProfile): Promise<void> {
    const db = await this.dbManager.getDatabase();
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
}
