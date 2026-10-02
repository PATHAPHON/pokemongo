import { DatabaseManager } from './database-manager';
import { TrainerProfile } from '@/shared/types';

interface ITrainerRepository {
  getProfile(trainerId?: string): Promise<TrainerProfile | null>;
  saveProfile(profile: TrainerProfile): Promise<void>;
}

export class TrainerRepository implements ITrainerRepository {
  private readonly dbManager: DatabaseManager;

  public constructor(dbManager: DatabaseManager = DatabaseManager.getInstance()) {
    this.dbManager = dbManager;
  }

  public async getProfile(trainerId?: string): Promise<TrainerProfile | null> {
    const db = await this.dbManager.getDatabase();
    const row = trainerId
      ? await db.getFirstAsync<any>(
          'SELECT * FROM trainer_profile WHERE id = ? LIMIT 1',
          [trainerId]
        )
      : await db.getFirstAsync<any>(
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
      studentId: row.student_id ?? undefined,
      faculty: row.faculty ?? undefined,
      createdAt: row.created_at,
    };
  }

  public async saveProfile(profile: TrainerProfile): Promise<void> {
    const db = await this.dbManager.getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO trainer_profile (
        id, name, team, level, experience, next_level_experience,
        stardust, poke_coins, avatar_url, starter_pokemon_id, student_id, faculty, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        profile.studentId ?? null,
        profile.faculty ?? null,
        profile.createdAt,
      ]
    );
  }
}
