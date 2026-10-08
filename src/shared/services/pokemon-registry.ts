import { DatabaseManager } from './database/database-manager';
import {
  DEFAULT_POKEMON_REGISTRY_LIST,
  PokemonMeta,
  computeRarityFromBST,
  safeParsePokemonTypes,
} from '../constants/pokemon-registry-data';
import type { PokemonRarity, PokemonTypeName } from '../types';

export { PokemonMeta, safeParsePokemonTypes };

class PokemonRegistryService {
  private static instance: PokemonRegistryService | null = null;
  private readonly dbManager: DatabaseManager;
  private pokemonList: PokemonMeta[] = [...DEFAULT_POKEMON_REGISTRY_LIST];
  private pokemonMap = new Map<number, PokemonMeta>(
    DEFAULT_POKEMON_REGISTRY_LIST.map((p) => [p.id, p])
  );
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  public constructor(dbManager = DatabaseManager.getInstance()) {
    this.dbManager = dbManager;
  }

  public static getInstance(): PokemonRegistryService {
    if (!PokemonRegistryService.instance) {
      PokemonRegistryService.instance = new PokemonRegistryService();
    }
    return PokemonRegistryService.instance;
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const db = await this.dbManager.getDatabase();
        const rows = await db.getAllAsync<{
          id: number;
          name: string;
          types_json: string;
          bst: number;
          rarity: string;
        }>('SELECT id, name, types_json, bst, rarity FROM pokemon_registry ORDER BY id ASC');

        if (rows && rows.length >= 386) {
          this.pokemonList = rows.map((r) => ({
            id: r.id,
            name: r.name,
            types: safeParsePokemonTypes(r.types_json),
            bst: r.bst,
            rarity: (r.rarity as PokemonRarity) || computeRarityFromBST(r.bst),
          }));
          this.pokemonMap = new Map(this.pokemonList.map((p) => [p.id, p]));
        } else {
          // Seed SQLite cache from DEFAULT_POKEMON_REGISTRY_LIST
          const now = new Date().toISOString();
          await db.withTransactionAsync(async () => {
            for (const item of DEFAULT_POKEMON_REGISTRY_LIST) {
              await db.runAsync(
                `INSERT OR REPLACE INTO pokemon_registry (
                  id, name, types_json, bst, rarity, cached_at
                ) VALUES (?, ?, ?, ?, ?, ?)`,
                [
                  item.id,
                  item.name,
                  JSON.stringify(item.types),
                  item.bst,
                  item.rarity,
                  now,
                ]
              );
            }
          });
          this.pokemonList = [...DEFAULT_POKEMON_REGISTRY_LIST];
          this.pokemonMap = new Map(this.pokemonList.map((p) => [p.id, p]));
        }
        this.isInitialized = true;
      } catch (err) {
        console.warn('[PokemonRegistry] Failed to initialize from SQLite, using in-memory default list:', err);
        this.pokemonList = [...DEFAULT_POKEMON_REGISTRY_LIST];
        this.pokemonMap = new Map(this.pokemonList.map((p) => [p.id, p]));
        this.isInitialized = true;
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  public getAll(): PokemonMeta[] {
    return this.pokemonList;
  }

  public getById(id: number): PokemonMeta | undefined {
    return this.pokemonMap.get(id);
  }

  public getTotalCount(): number {
    return this.pokemonList.length;
  }
}

export const defaultPokemonRegistry = PokemonRegistryService.getInstance();

export async function initPokemonRegistry(): Promise<void> {
  return defaultPokemonRegistry.init();
}

export function getAllPokemonMeta(): PokemonMeta[] {
  return defaultPokemonRegistry.getAll();
}

export function getPokemonMetaById(id: number): PokemonMeta | undefined {
  return defaultPokemonRegistry.getById(id);
}

export function getTotalPokemonCount(): number {
  return defaultPokemonRegistry.getTotalCount();
}
