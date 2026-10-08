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
    let row: any = null;

    if (trainerId) {
      row = await db.getFirstAsync<any>(
        'SELECT * FROM trainer_profile WHERE id = ? LIMIT 1',
        [trainerId]
      );

      // Fallback matching by username/name if trainerId was formatted differently
      if (!row) {
        const cleanName = trainerId.replace(/^trainer-/, '');
        const baseUsername = cleanName.split('-')[0];
        row = await db.getFirstAsync<any>(
          'SELECT * FROM trainer_profile WHERE LOWER(id) = LOWER(?) OR LOWER(name) = LOWER(?) OR LOWER(name) = LOWER(?) OR LOWER(name) = LOWER(?) ORDER BY created_at DESC LIMIT 1',
          [trainerId, trainerId, cleanName, baseUsername]
        );
      }
    } else {
      row = await db.getFirstAsync<any>(
        'SELECT * FROM trainer_profile ORDER BY created_at DESC LIMIT 1'
      );
    }

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
      program: row.program ?? row.faculty ?? 'Computer and Information Science',
      interests: (() => {
        try {
          const parsed = row.interests_json ? JSON.parse(row.interests_json) : null;
          return Array.isArray(parsed) && parsed.length > 0
            ? parsed
            : ['Campus events', 'Mobile UX'];
        } catch {
          return ['Campus events', 'Mobile UX'];
        }
      })(),
      createdAt: row.created_at,
    };
  }

  public async saveProfile(profile: TrainerProfile): Promise<void> {
    const db = await this.dbManager.getDatabase();
    const interestsJson = JSON.stringify(
      profile.interests && profile.interests.length > 0
        ? profile.interests
        : ['Campus events', 'Mobile UX']
    );
    const program = profile.program ?? profile.faculty ?? 'Computer and Information Science';

    await db.runAsync(
      `INSERT OR REPLACE INTO trainer_profile (
        id, name, team, level, experience, next_level_experience,
        stardust, poke_coins, avatar_url, starter_pokemon_id, student_id, faculty, program, interests_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        profile.faculty ?? program,
        program,
        interestsJson,
        profile.createdAt,
      ]
    );
  }
}
