import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  CaughtPokemon,
  TrainerProfile,
} from '@/shared/types';
import {
  getDatabase,
  getAllCaughtPokemon,
  insertCaughtPokemon,
  deleteCaughtPokemon,
  getStoredTrainerProfile,
  saveStoredTrainerProfile,
} from '@/shared/services/database/index';
import { initPokemonRegistry } from '@/shared/services/pokemon-registry';
import {
  restoreSession,
  restoreSessionState,
  loginWithCredentials,
  registerAccount,
  clearAuthSession,
  loginWithBiometrics,
  SessionState,
  User,
} from '@/shared/services/auth';
import { cancelAllNotifications } from '@/shared/services/notifications';

interface TrainerContextValue {
  session: SessionState;
  trainer: TrainerProfile | null;
  caughtPokemon: CaughtPokemon[];
  isLoading: boolean;
  isAuthenticated: boolean;
  catchPokemon: (pokemon: CaughtPokemon) => Promise<void>;
  releasePokemon: (instanceId: string) => Promise<void>;
  updateTrainer: (partial: Partial<TrainerProfile>) => Promise<void>;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    password: string,
    studentId?: string,
    faculty?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginBiometrics: (
    targetUsername?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const TrainerContext = createContext<TrainerContextValue | undefined>(
  undefined
);

export function TrainerProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({ status: 'loading' });
  const [trainer, setTrainer] = useState<TrainerProfile | null>(null);
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
      setSession(session);

      if (session.status === 'authenticated') {
        let currentProfile = await getStoredTrainerProfile(session.trainerId);
        if (!currentProfile && session.user) {
          currentProfile = {
            id: session.user.id,
            name: session.user.name,
            team: session.user.team || 'valor',
            level: session.user.level || 1,
            experience: 0,
            nextLevelExperience: 1000,
            stardust: 1000,
            pokeCoins: 100,
            starterPokemonId: 25,
            studentId: session.user.studentId || '65010001',
            faculty: session.user.faculty || 'Computer and Information Science',
            program: session.user.program || session.user.faculty || 'Computer and Information Science',
            interests: ['Campus events', 'Mobile UX', 'Pokémon GO'],
            createdAt: new Date().toISOString(),
          };
          await saveStoredTrainerProfile(currentProfile);
        }
        let pokemonList = await getAllCaughtPokemon(session.trainerId);

        if (currentProfile) {
          setTrainer(currentProfile);
          setCaughtPokemon(pokemonList);
          setIsAuthenticated(true);
        } else {
          // If token exists but no profile, clear stale session
          await clearAuthSession();
          setSession({ status: 'anonymous' });
          setIsAuthenticated(false);
        }
      } else {
        setTrainer(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[TrainerContext] Failed to initialize state:', error);
      setSession({ status: 'anonymous' });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /**
   * Directly synchronize trainer profile upon successful auth without keychain round-trip delay
   */
  const applyAuthenticatedUser = useCallback(
    async (userId: string, authUser?: User, token?: string) => {
      try {
        setIsLoading(true);
        let currentProfile = await getStoredTrainerProfile(userId);
        if (!currentProfile && authUser) {
          currentProfile = {
            id: authUser.id,
            name: authUser.name,
            team: authUser.team || 'valor',
            level: authUser.level || 1,
            experience: 0,
            nextLevelExperience: 1000,
            stardust: 1000,
            pokeCoins: 100,
            starterPokemonId: 25,
            studentId: authUser.studentId || '65010001',
            faculty: authUser.faculty || 'Computer and Information Science',
            program: authUser.program || authUser.faculty || 'Computer and Information Science',
            interests: ['Campus events', 'Mobile UX', 'Pokémon GO'],
            createdAt: new Date().toISOString(),
          };
          await saveStoredTrainerProfile(currentProfile);
        }
        const pokemonList = await getAllCaughtPokemon(userId);

        if (currentProfile) {
          setTrainer(currentProfile);
          setCaughtPokemon(pokemonList);
          setIsAuthenticated(true);
          setSession({
            status: 'authenticated',
            accessToken: token || '',
            token: token || '',
            trainerId: currentProfile.id,
            user: {
              id: currentProfile.id,
              username: currentProfile.name,
              name: currentProfile.name,
              studentId: currentProfile.studentId,
              faculty: currentProfile.faculty,
              program: currentProfile.program,
              team: currentProfile.team,
              level: currentProfile.level,
              avatarUrl: currentProfile.avatarUrl,
            },
          });
        } else {
          await loadData();
        }
      } catch (err) {
        console.error('[TrainerContext] Failed to apply user profile:', err);
        await loadData();
      } finally {
        setIsLoading(false);
      }
    },
    [loadData]
  );

  /**
   * Login handler
   */
  const login = useCallback(
    async (username: string, password: string) => {
      const res = await loginWithCredentials(username, password);
      if (res.success && res.user) {
        await applyAuthenticatedUser(res.user.id, res.user, res.token);
        return { success: true };
      }
      return { success: false, error: res.error || 'เข้าสู่ระบบไม่สำเร็จ' };
    },
    [applyAuthenticatedUser]
  );

  /**
   * Register handler
   */
  const register = useCallback(
    async (
      username: string,
      password: string,
      studentId?: string,
      faculty?: string
    ) => {
      const res = await registerAccount(
        username,
        password,
        studentId,
        faculty
      );
      if (res.success && res.user) {
        await applyAuthenticatedUser(res.user.id, res.user, res.token);
        return { success: true };
      }
      return { success: false, error: res.error || 'ลงทะเบียนไม่สำเร็จ' };
    },
    [applyAuthenticatedUser]
  );

  /**
   * Biometric login handler
   */
  const loginBiometrics = useCallback(
    async (targetUsername?: string) => {
      const res = await loginWithBiometrics(targetUsername);
      if (res.success && res.user) {
        await applyAuthenticatedUser(res.user.id, res.user, res.token);
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'เข้าสู่ระบบด้วยชีวมิติไม่สำเร็จ',
      };
    },
    [applyAuthenticatedUser]
  );

  /**
   * Logout handler
   */
  const logout = useCallback(async () => {
    // 1. Immediately clear authentication session and local trainer state
    await clearAuthSession();
    setSession({ status: 'anonymous' });
    setTrainer(null);
    setCaughtPokemon([]);
    setIsAuthenticated(false);

    // 2. Cancel OS notifications with timeout protection so native calls never hang logout
    try {
      await Promise.race([
        cancelAllNotifications(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (err) {
      console.warn('[TrainerContext] Failed to cancel notifications on logout:', err);
    }
  }, []);

  /**
   * Catch a new Pokémon
   */
  const catchPokemon = useCallback(
    async (pokemon: CaughtPokemon): Promise<void> => {
      const activeUserId =
        trainer?.id ||
        (session.status === 'authenticated' ? session.trainerId : undefined);
      await insertCaughtPokemon(pokemon, activeUserId);
      setCaughtPokemon((prev) => [pokemon, ...prev]);
    },
    [trainer?.id, session]
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

  /**
   * Update trainer profile fields and persist to SQLite
   */
  const updateTrainer = useCallback(
    async (updates: Partial<TrainerProfile>): Promise<void> => {
      if (!trainer) return;
      const next = { ...trainer, ...updates };
      setTrainer(next);
      try {
        await saveStoredTrainerProfile(next);
      } catch (err) {
        console.error('[TrainerContext] Failed to save trainer:', err);
      }
    },
    [trainer]
  );

  const value: TrainerContextValue = {
    session,
    trainer,
    caughtPokemon,
    isLoading,
    isAuthenticated,
    catchPokemon,
    releasePokemon,
    updateTrainer,
    login,
    register,
    loginBiometrics,
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

export function useSession() {
  const context = useTrainer();
  return {
    session: context.session,
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    user: context.session.status === 'authenticated' ? context.session.user : null,
    login: context.login,
    register: context.register,
    logout: context.logout,
    loginBiometrics: context.loginBiometrics,
  };
}
