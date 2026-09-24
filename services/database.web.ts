import { CaughtPokemon, TrainerInventory, TrainerProfile } from '@/types';

const STORAGE_KEY_CAUGHT = 'pokemon_go_web_caught_pokemon';
const STORAGE_KEY_INVENTORY = 'pokemon_go_web_inventory';
const STORAGE_KEY_TRAINER = 'pokemon_go_web_trainer_profile';

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

// In-memory fallback if localStorage is unavailable
const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {
    // Fallback to memory
  }
  return memoryStore.get(key) ?? null;
}

function setStorageItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {
    // Fallback to memory
  }
  memoryStore.set(key, value);
}

function removeStorageItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore
  }
  memoryStore.delete(key);
}

/**
 * Web Database Mock Interface
 */
export async function getDatabase(): Promise<{ execAsync: (sql: string) => Promise<void> }> {
  return {
    execAsync: async (sql: string) => {
      if (sql.includes('DELETE FROM')) {
        removeStorageItem(STORAGE_KEY_CAUGHT);
        removeStorageItem(STORAGE_KEY_INVENTORY);
        removeStorageItem(STORAGE_KEY_TRAINER);
      }
    },
  };
}

export async function initDatabase(_db?: any): Promise<void> {
  // No-op on web
}

// -------------------------------------------------------------
// Caught Pokémon Operations (Web LocalStorage)
// -------------------------------------------------------------

export async function getAllCaughtPokemon(): Promise<CaughtPokemon[]> {
  const raw = getStorageItem(STORAGE_KEY_CAUGHT);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function insertCaughtPokemon(pokemon: CaughtPokemon): Promise<void> {
  const current = await getAllCaughtPokemon();
  const index = current.findIndex((p) => p.instanceId === pokemon.instanceId);
  if (index >= 0) {
    current[index] = pokemon;
  } else {
    current.unshift(pokemon);
  }
  setStorageItem(STORAGE_KEY_CAUGHT, JSON.stringify(current));
}

export async function updatePokemonNickname(instanceId: string, nickname: string): Promise<void> {
  const current = await getAllCaughtPokemon();
  const updated = current.map((p) => (p.instanceId === instanceId ? { ...p, nickname } : p));
  setStorageItem(STORAGE_KEY_CAUGHT, JSON.stringify(updated));
}

export async function togglePokemonFavorite(instanceId: string, isFavorite: boolean): Promise<void> {
  const current = await getAllCaughtPokemon();
  const updated = current.map((p) => (p.instanceId === instanceId ? { ...p, favorite: isFavorite } : p));
  setStorageItem(STORAGE_KEY_CAUGHT, JSON.stringify(updated));
}

export async function deleteCaughtPokemon(instanceId: string): Promise<void> {
  const current = await getAllCaughtPokemon();
  const updated = current.filter((p) => p.instanceId !== instanceId);
  setStorageItem(STORAGE_KEY_CAUGHT, JSON.stringify(updated));
}

// -------------------------------------------------------------
// Inventory Operations (Web LocalStorage)
// -------------------------------------------------------------

export async function getTrainerInventory(): Promise<TrainerInventory> {
  const raw = getStorageItem(STORAGE_KEY_INVENTORY);
  if (!raw) {
    setStorageItem(STORAGE_KEY_INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
    return DEFAULT_INVENTORY;
  }
  try {
    return { ...DEFAULT_INVENTORY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_INVENTORY;
  }
}

export async function initInventory(_db?: any): Promise<void> {
  const current = getStorageItem(STORAGE_KEY_INVENTORY);
  if (!current) {
    setStorageItem(STORAGE_KEY_INVENTORY, JSON.stringify(DEFAULT_INVENTORY));
  }
}

export async function updateInventoryCount(
  itemKey: keyof TrainerInventory,
  count: number
): Promise<void> {
  const current = await getTrainerInventory();
  current[itemKey] = Math.max(0, count);
  setStorageItem(STORAGE_KEY_INVENTORY, JSON.stringify(current));
}

export async function adjustInventoryCount(
  itemKey: keyof TrainerInventory,
  delta: number
): Promise<number> {
  const current = await getTrainerInventory();
  const currentCount = current[itemKey] ?? (DEFAULT_INVENTORY[itemKey] ?? 0);
  const newCount = Math.max(0, currentCount + delta);
  current[itemKey] = newCount;
  setStorageItem(STORAGE_KEY_INVENTORY, JSON.stringify(current));
  return newCount;
}

// -------------------------------------------------------------
// Trainer Profile Operations (Web LocalStorage)
// -------------------------------------------------------------

export async function getStoredTrainerProfile(): Promise<TrainerProfile | null> {
  const raw = getStorageItem(STORAGE_KEY_TRAINER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveStoredTrainerProfile(profile: TrainerProfile): Promise<void> {
  setStorageItem(STORAGE_KEY_TRAINER, JSON.stringify(profile));
}
