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
} from '@/shared/types';
import {
  getDatabase,
  getAllCaughtPokemon,
  insertCaughtPokemon,
  deleteCaughtPokemon,
  getTrainerInventory,
  getStoredTrainerProfile,
} from '@/shared/services/database/index';
import { initPokemonRegistry } from '@/shared/services/pokemon-registry';
import {
  restoreSessionState,
  loginWithCredentials,
  registerAccount,
  clearAuthSession,
} from '@/shared/services/auth';

interface TrainerContextValue {
  trainer: TrainerProfile | null;
  inventory: TrainerInventory;
  caughtPokemon: CaughtPokemon[];
  isLoading: boolean;
  isAuthenticated: boolean;
  catchPokemon: (pokemon: CaughtPokemon) => Promise<void>;
  releasePokemon: (instanceId: string) => Promise<void>;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
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

const TrainerContext = createContext<TrainerContextValue | undefined>(
  undefined
);

export function TrainerProvider({ children }: { children: ReactNode }) {
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
  const [inventory, setInventory] = useState<TrainerInventory>(
    DEFAULT_INVENTORY_FALLBACK
  );
  const [caughtPokemon, setCaughtPokemon] = useState<CaughtPokemon[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  /**
   * Initialize and restore session from SecureStore
   */
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      await getDatabase();
      await initPokemonRegistry();

      const session = await restoreSessionState();

      if (session.status === 'authenticated') {
        let currentProfile = await getStoredTrainerProfile();
        let pokemonList = await getAllCaughtPokemon();
        const inv = await getTrainerInventory();

        if (currentProfile) {
          setTrainer(currentProfile);
          setInventory(inv);
          setCaughtPokemon(pokemonList);
          setIsAuthenticated(true);
        } else {
          // If token exists but no profile, clear stale session
          await clearAuthSession();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[TrainerContext] Failed to initialize state:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Login handler
   */
  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginWithCredentials(username, password);
      if (res.success && res.user) {
        await loadData();
        return { success: true };
      }
      return { success: false, error: res.error || 'เข้าสู่ระบบไม่สำเร็จ' };
    },
    [loadData]
  );

  /**
   * Register handler
   */
  const register = useCallback(
    async (username: string, password: string) => {
      const res = await registerAccount(username, password);
      if (res.success && res.user) {
        await loadData();
        return { success: true };
      }
      return { success: false, error: res.error || 'ลงทะเบียนไม่สำเร็จ' };
    },
    [loadData]
  );

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    await clearAuthSession();
    setTrainer(null);
    setCaughtPokemon([]);
    setIsAuthenticated(false);
  }, []);

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
      setCaughtPokemon((prev) =>
        prev.filter((p) => p.instanceId !== instanceId)
      );
    },
    []
  );

  const value: TrainerContextValue = {
    trainer,
    inventory,
    caughtPokemon,
    isLoading,
    isAuthenticated,
    catchPokemon,
    releasePokemon,
    login,
    register,
    logout,
  };

  return (
    <TrainerContext.Provider value={value}>{children}</TrainerContext.Provider>
  );
}

export function useTrainer(): TrainerContextValue {
  const context = useContext(TrainerContext);
  if (!context) {
    throw new Error('useTrainer must be used within a TrainerProvider');
  }
  return context;
}
