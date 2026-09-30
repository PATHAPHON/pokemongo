import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState, Linking } from 'react-native';
import {
  ensureNotificationPermission,
  getNotificationPermissionStatus,
  isNotificationsEnabled,
  setNotificationsEnabled,
  sendSpawnNotification,
} from '@/shared/services/notifications/index';
import { WildPokemon } from '../services/spawn-engine';

export function useSpawnNotifications(caughtPokemonIds: Set<number>) {
  const [notificationsEnabled, setNotificationsEnabledState] =
    useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] =
    useState<boolean>(false);
  const [canAskAgain, setCanAskAgain] = useState<boolean>(true);

  const notifiedSpawnsRef = useRef<Set<string>>(new Set());
  const lastNotificationTimeRef = useRef<number>(0);
  const hasPromptedInitialRef = useRef<boolean>(false);

  const checkPermissionAndSync = useCallback(async (autoPrompt = false) => {
    try {
      const status = await getNotificationPermissionStatus();
      setCanAskAgain(status.canAskAgain);

      if (status.granted) {
        const enabled = await isNotificationsEnabled();
        setNotificationsEnabledState(enabled);
      } else {
        setNotificationsEnabledState(false);
        // Show prompt on first visit if permission was never requested
        if (autoPrompt && status.status === 'undetermined' && !hasPromptedInitialRef.current) {
          hasPromptedInitialRef.current = true;
          setShowPermissionModal(true);
        }
      }
    } catch {
      // fallback safe
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    void (async () => {
      if (!isMounted) return;
      await checkPermissionAndSync(true);
    })();

    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void checkPermissionAndSync(false);
      }
    });

    return () => {
      isMounted = false;
      sub.remove();
    };
  }, [checkPermissionAndSync]);

  const toggleNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const status = await getNotificationPermissionStatus();
      if (!status.granted) {
        setCanAskAgain(status.canAskAgain);
        setShowPermissionModal(true);
        return;
      }
      await setNotificationsEnabled(true);
      setNotificationsEnabledState(true);
    } else {
      await setNotificationsEnabled(false);
      setNotificationsEnabledState(false);
    }
  }, [notificationsEnabled]);

  const handleAllowPermission = useCallback(async () => {
    try {
      const granted = await ensureNotificationPermission();
      const status = await getNotificationPermissionStatus();
      setCanAskAgain(status.canAskAgain);

      if (granted) {
        await setNotificationsEnabled(true);
        setNotificationsEnabledState(true);
        setShowPermissionModal(false);
      } else if (!status.canAskAgain) {
        // Can't ask again via system dialog: user must open settings
        setCanAskAgain(false);
      } else {
        setShowPermissionModal(false);
      }
    } catch {
      setShowPermissionModal(false);
    }
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => {});
    setShowPermissionModal(false);
  }, []);

  const handleDismissPermissionModal = useCallback(() => {
    setShowPermissionModal(false);
  }, []);

  const checkAndNotifySpawn = useCallback(
    (pokemon: WildPokemon) => {
      if (!notificationsEnabled) return;
      if (notifiedSpawnsRef.current.has(pokemon.instanceId)) return;

      const now = Date.now();
      // Cooldown: at least 25 seconds between notifications
      if (now - lastNotificationTimeRef.current < 25000) return;

      const isNew = !caughtPokemonIds.has(pokemon.id);

      if (isNew) {
        notifiedSpawnsRef.current.add(pokemon.instanceId);
        lastNotificationTimeRef.current = now;
        sendSpawnNotification(
          pokemon.name,
          pokemon.id,
          pokemon.rarity,
          pokemon.instanceId
        );
      }
    },
    [notificationsEnabled, caughtPokemonIds]
  );

  return {
    notificationsEnabled,
    showPermissionModal,
    canAskAgain,
    toggleNotifications,
    handleAllowPermission,
    handleDismissPermissionModal,
    handleOpenSettings,
    checkAndNotifySpawn,
  };
}
