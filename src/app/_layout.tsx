import { useEffect, useRef } from 'react';
import {
  AppState,
  AppStateStatus,
  View,
  ActivityIndicator,
  Platform,
  LogBox,
} from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
  router,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { TrainerProvider, useTrainer } from '@/shared/context/trainer-context';
import {
  registerNotificationTapListener,
  scheduleBackgroundNotifications,
  cancelScheduledNotifications,
  setupNotificationChannels,
  configureNotificationHandler,
} from '@/shared/services/notifications/index';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Expected in Expo Go: push disabled, local notifications still work.
// Silence the library's informational notes, keep real errors visible.
LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'Push notifications are disabled in Expo Go',
]);

function NavigationStack() {
  const { isAuthenticated, isLoading } = useTrainer();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}
      >
        <ActivityIndicator size="large" color="#EE1515" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="catch"
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="pokemon/[id]"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 0. Initialize notification channel & handler
    configureNotificationHandler();
    setupNotificationChannels().catch(() => {});

    // 1. Observe notification taps (both Cold Start and Foreground/Background)
    const unsubscribeNotifications = registerNotificationTapListener(
      (pokemonId) => {
        const meta = getPokemonMetaById(pokemonId);
        router.replace({
          pathname: '/catch' as any,
          params: {
            id: String(pokemonId),
            name: meta?.name ?? 'pikachu',
            rarity: meta?.rarity ?? 'common',
            types: JSON.stringify(meta?.types ?? ['normal']),
          },
        });
      }
    );

    // 2. Observe AppState transitions (e.g. going to background, returning from System Settings)
    const subscriptionAppState = AppState.addEventListener(
      'change',
      (nextAppState) => {
        if (
          appState.current === 'active' &&
          nextAppState.match(/inactive|background/)
        ) {
          scheduleBackgroundNotifications().catch((err) => {
            console.warn('[RootLayout] Error scheduling background notifications:', err);
          });
        }

        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App returned to foreground, cancel pending background notifications
          cancelScheduledNotifications().catch(() => {});
        }
        appState.current = nextAppState;
      }
    );

    return () => {
      unsubscribeNotifications();
      subscriptionAppState.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TrainerProvider>
        <NavigationStack />
        <StatusBar style="auto" />
      </TrainerProvider>
    </ThemeProvider>
  );
}
