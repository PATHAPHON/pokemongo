import '../../global.css';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { TrainerProvider } from '@/shared/context/trainer-context';
import { registerNotificationTapListener, ensureNotificationPermission } from '@/shared/services/notifications';
import { KANTO_POKEMON_LIST } from '@/shared/constants/kanto-pokemon';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    // 1. Observe notification taps (both Cold Start and Foreground/Background)
    const unsubscribeNotifications = registerNotificationTapListener((pokemonId) => {
      const meta = KANTO_POKEMON_LIST.find((p) => p.id === pokemonId);
      router.push({
        pathname: '/catch' as any,
        params: {
          id: String(pokemonId),
          name: meta?.name ?? 'pikachu',
          cp: String(Math.floor(120 + Math.random() * 280)),
          types: JSON.stringify(meta?.types ?? ['normal']),
        },
      });
    });

    // 2. Observe AppState transitions (e.g. returning from System Settings)
    const subscriptionAppState = AppState.addEventListener('change', (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App returned to foreground, sync permission state
        ensureNotificationPermission().catch(() => {});
      }
      appState.current = nextAppState;
    });

    return () => {
      unsubscribeNotifications();
      subscriptionAppState.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TrainerProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </TrainerProvider>
    </ThemeProvider>
  );
}
