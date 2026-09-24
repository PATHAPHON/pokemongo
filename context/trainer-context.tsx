import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  CaughtPokemon,
  TrainerInventory,
  TrainerProfile,
  TrainerTeam,
} from '@/types';
import {
  getDatabase,
  getAllCaughtPokemon,
  insertCaughtPokemon,
  updatePokemonNickname,
  togglePokemonFavorite,
  deleteCaughtPokemon,
  getTrainerInventory,
  updateInventoryCount,
  adjustInventoryCount,
  getStoredTrainerProfile,
  saveStoredTrainerProfile,
} from '@/services/database';
import { saveActiveTrainerId, clearAuthSession } from '@/services/auth';
import { getKantoArtworkUrl } from '@/constants/kanto-pokemon';

export interface TrainerContextValue {
  trainer: TrainerProfile | null;
  inventory: TrainerInventory;
  caughtPokemon: CaughtPokemon[];
  isLoading: boolean;
  updateTrainer: (updates: Partial<TrainerProfile>) => Promise<void>;
  setTeam: (team: TrainerTeam) => Promise<void>;
  addExperience: (amount: number) => Promise<void>;
  addStardust: (amount: number) => Promise<void>;
  addPokeCoins: (amount: number) => Promise<void>;
  useItem: (itemKey: keyof TrainerInventory, amount?: number) => Promise<boolean>;
  addItem: (itemKey: keyof TrainerInventory, amount?: number) => Promise<void>;
  catchPokemon: (pokemon: CaughtPokemon) => Promise<void>;
  releasePokemon: (instanceId: string) => Promise<void>;
  renamePokemon: (instanceId: string, nickname: string) => Promise<void>;
  toggleFavorite: (instanceId: string) => Promise<void>;
  refreshTrainerData: () => Promise<void>;
  resetTrainerData: () => Promise<void>;
}

const DEFAULT_INVENTORY_FALLBACK: TrainerInventory = {
  pokeballs: 50,
  greatballs: 20,
  ultraballs: 10,
  razzberries: 15,
  nanabberries: 10,
  pinapberries: 10,
  potions: 20,
  revives: 10,
};

const TrainerContext = createContext<TrainerContextValue | undefined>(undefined);

function calculateNextLevelExp(level: number): number {
  return Math.round(1000 * Math.pow(1.25, level - 1));
}

export function TrainerProvider({ children }: { children: ReactNode }) {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [inventory, setInventory] = useState<TrainerInventory>(DEFAULT_INVENTORY_FALLBACK);
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Initialize or Seed starter data if first launch
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      await getDatabase();

      let currentProfile = await getStoredTrainerProfile();
      let pokemonList = await getAllCaughtPokemon();

      // If no trainer profile exists, seed default starter profile & starter Pikachu
      if (!currentProfile) {
        currentProfile = {
          id: 'trainer-red-001',
          name: 'Trainer Red',
          team: 'valor',
          level: 1,
          experience: 0,
          nextLevelExperience: 1000,
          stardust: 1000,
          pokeCoins: 100,
          starterPokemonId: 25,
          createdAt: new Date().toISOString(),
        };

        const starterPikachu: CaughtPokemon = {
          instanceId: `starter-pikachu-${Date.now()}`,
          pokemonId: 25,
          nickname: 'Pikachu',
          name: 'pikachu',
          artwork: getKantoArtworkUrl(25),
          types: ['electric'],
          cp: 450,
          level: 5,
          iv: {
            attack: 15,
            defense: 12,
            stamina: 13,
          },
          stats: [
            { name: 'hp', baseStat: 35 },
            { name: 'attack', baseStat: 55 },
            { name: 'defense', baseStat: 40 },
            { name: 'special-attack', baseStat: 50 },
            { name: 'special-defense', baseStat: 50 },
            { name: 'speed', baseStat: 90 },
          ],
          height: 4,
          weight: 60,
          caughtAt: new Date().toISOString(),
          location: {
            latitude: 13.7563,
            longitude: 100.5018,
            name: 'Pallet Town',
          },
          favorite: true,
        };

        await saveStoredTrainerProfile(currentProfile);
        await saveActiveTrainerId(currentProfile.id);
        await insertCaughtPokemon(starterPikachu);
        pokemonList = [starterPikachu];
      }

      const inv = await getTrainerInventory();

      setTrainer(currentProfile);
      setInventory(inv);
      setCaughtPokemon(pokemonList);
    } catch (error) {
      console.error('[TrainerContext] Failed to initialize state:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Update Trainer Profile fields
   */
  const updateTrainer = useCallback(
    async (updates: Partial<TrainerProfile>) => {
      if (!trainer) return;
      const updated: TrainerProfile = { ...trainer, ...updates };
      setTrainer(updated);
      await saveStoredTrainerProfile(updated);
    },
    [trainer]
  );

  /**
   * Set Trainer Team
   */
  const setTeam = useCallback(
    async (team: TrainerTeam) => {
      await updateTrainer({ team });
    },
    [updateTrainer]
  );

  /**
   * Add Experience & calculate level up
   */
  const addExperience = useCallback(
    async (amount: number) => {
      if (!trainer) return;
      let newExp = trainer.experience + amount;
      let newLevel = trainer.level;
      let nextExp = trainer.nextLevelExperience;

      while (newExp >= nextExp) {
        newExp -= nextExp;
        newLevel += 1;
        nextExp = calculateNextLevelExp(newLevel);
      }

      await updateTrainer({
        experience: newExp,
        level: newLevel,
        nextLevelExperience: nextExp,
      });
    },
    [trainer, updateTrainer]
  );

  /**
   * Add Stardust
   */
  const addStardust = useCallback(
    async (amount: number) => {
      if (!trainer) return;
      await updateTrainer({ stardust: Math.max(0, trainer.stardust + amount) });
    },
    [trainer, updateTrainer]
  );

  /**
   * Add PokéCoins
   */
  const addPokeCoins = useCallback(
    async (amount: number) => {
      if (!trainer) return;
      await updateTrainer({ pokeCoins: Math.max(0, trainer.pokeCoins + amount) });
    },
    [trainer, updateTrainer]
  );

  /**
   * Use an item from inventory (returns false if insufficient)
   */
  const useItem = useCallback(
    async (itemKey: keyof TrainerInventory, amount = 1): Promise<boolean> => {
      const current = inventory[itemKey] ?? 0;
      if (current < amount) return false;

      const newCount = current - amount;
      setInventory((prev) => ({ ...prev, [itemKey]: newCount }));
      await updateInventoryCount(itemKey, newCount);
      return true;
    },
    [inventory]
  );

  /**
   * Add items to inventory
   */
  const addItem = useCallback(
    async (itemKey: keyof TrainerInventory, amount = 1): Promise<void> => {
      const current = inventory[itemKey] ?? 0;
      const newCount = current + amount;
      setInventory((prev) => ({ ...prev, [itemKey]: newCount }));
      await updateInventoryCount(itemKey, newCount);
    },
    [inventory]
  );

  /**
   * Catch a new Pokémon
   */
  const catchPokemon = useCallback(
    async (pokemon: CaughtPokemon): Promise<void> => {
      await insertCaughtPokemon(pokemon);
      setCaughtPokemon((prev) => [pokemon, ...prev]);
    },
    []
  );

  /**
   * Release a caught Pokémon
   */
  const releasePokemon = useCallback(
    async (instanceId: string): Promise<void> => {
      await deleteCaughtPokemon(instanceId);
      setCaughtPokemon((prev) => prev.filter((p) => p.instanceId !== instanceId));
    },
    []
  );

  /**
   * Rename a caught Pokémon
   */
  const renamePokemon = useCallback(
    async (instanceId: string, nickname: string): Promise<void> => {
      await updatePokemonNickname(instanceId, nickname);
      setCaughtPokemon((prev) =>
        prev.map((p) => (p.instanceId === instanceId ? { ...p, nickname } : p))
      );
    },
    []
  );

  /**
   * Toggle favorite status
   */
  const toggleFavorite = useCallback(
    async (instanceId: string): Promise<void> => {
      const target = caughtPokemon.find((p) => p.instanceId === instanceId);
      if (!target) return;

      const nextFav = !target.favorite;
      await togglePokemonFavorite(instanceId, nextFav);
      setCaughtPokemon((prev) =>
        prev.map((p) => (p.instanceId === instanceId ? { ...p, favorite: nextFav } : p))
      );
    },
    [caughtPokemon]
  );

  /**
   * Reset all trainer data (for testing / development)
   */
  const resetTrainerData = useCallback(async () => {
    try {
      const db = await getDatabase();
      await db.execAsync(`
        DELETE FROM caught_pokemon;
        DELETE FROM inventory;
        DELETE FROM trainer_profile;
      `);
      await clearAuthSession();
      await loadData();
    } catch (error) {
      console.error('[TrainerContext] Failed to reset data:', error);
    }
  }, [loadData]);

  const value: TrainerContextValue = {
    trainer,
    inventory,
    caughtPokemon,
    isLoading,
    updateTrainer,
    setTeam,
    addExperience,
    addStardust,
    addPokeCoins,
    useItem,
    addItem,
    catchPokemon,
    releasePokemon,
    renamePokemon,
    toggleFavorite,
    refreshTrainerData: loadData,
    resetTrainerData,
  };

  return <TrainerContext.Provider value={value}>{children}</TrainerContext.Provider>;
}

export function useTrainer(): TrainerContextValue {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error('useTrainer must be used within a TrainerProvider');
  }
  return context;
}
