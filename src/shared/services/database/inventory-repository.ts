import { DatabaseManager } from './database-manager';
import { TrainerInventory } from '@/shared/types';

export const DEFAULT_INVENTORY: TrainerInventory = {
  pokeballs: 50,
  greatballs: 20,
  ultraballs: 10,
  razzberries: 15,
  nanabberries: 10,
  pinapberries: 10,
  potions: 20,
  revives: 10,
};

interface IInventoryRepository {
  getInventory(): Promise<TrainerInventory>;
  initInventory(): Promise<void>;
}

export class InventoryRepository implements IInventoryRepository {
  private readonly dbManager: DatabaseManager;

  public constructor(dbManager: DatabaseManager = DatabaseManager.getInstance()) {
    this.dbManager = dbManager;
  }

  public async getInventory(): Promise<TrainerInventory> {
    const db = await this.dbManager.getDatabase();
    const rows = await db.getAllAsync<{ key: string; count: number }>(
      'SELECT key, count FROM inventory'
    );

    if (rows.length === 0) {
      await this.initInventory();
      return { ...DEFAULT_INVENTORY };
    }

    const inventory: TrainerInventory = { ...DEFAULT_INVENTORY };
    for (const row of rows) {
      if (row.key in inventory) {
        (inventory as any)[row.key] = row.count;
      }
    }
    return inventory;
  }

  public async initInventory(): Promise<void> {
    const db = await this.dbManager.getDatabase();
    for (const [key, count] of Object.entries(DEFAULT_INVENTORY)) {
      await db.runAsync(
        'INSERT OR IGNORE INTO inventory (key, count) VALUES (?, ?)',
        [key, count]
      );
    }
  }
}
