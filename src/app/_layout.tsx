import { useEffect } from 'react';
import {
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
import { TrainerProvider, useTrainer, useSession } from '@/shared/context/trainer-context';
import { EventProvider } from '@/shared/context/event-context';

import {
  registerNotificationTapListener,
  setupNotificationChannels,
  configureNotificationHandler,
} from '@/shared/services/notifications/index';

export const unstable_settings = {
  anchor: 'index',
};

// Expected in Expo Go: push disabled, local notifications still work.
// Silence the library's informational notes, keep real errors visible.
LogBox.ignoreLogs([
  '`expo-notifications` functionality is not fully supported in Expo Go',
  'expo-notifications functionality is not fully supported in Expo Go',
  'Push notifications are disabled in Expo Go',
]);

function NavigationStack() {
  const { session } = useSession();
  const isLoading = session.status === 'loading';
  const isAuthenticated = session.status === 'authenticated';

  useEffect(() => {
    if (Platform.OS === 'web' || isLoading || !isAuthenticated) return;

    // Observe notification taps once session is restored and authenticated
    const unsubscribeNotifications = registerNotificationTapListener(
      (eventId) => {
        router.push({
          pathname: '/events/[id]' as any,
          params: { id: eventId },
        });
      }
    );

    return () => {
      unsubscribeNotifications();
    };
  }, [isLoading, isAuthenticated]);

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
      <Stack.Screen name="index" options={{ headerShown: false }} />

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
        <Stack.Screen
          name="bag"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="events/[id]"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="events/register"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="events/create"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="events/map"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="events/pick-location"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="profile/admin"
          options={{
            presentation: 'card',
            headerShown: false,
          }}
        />
      </Stack.Protected>

      <Stack.Screen
        name="+not-found"
        options={{
          headerShown: false,
          title: 'Oops!',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 0. Initialize notification channel & handler
    configureNotificationHandler();
    setupNotificationChannels().catch(() => {});
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TrainerProvider>
        <EventProvider>
          <NavigationStack />
          <StatusBar style="auto" />
        </EventProvider>
      </TrainerProvider>
    </ThemeProvider>
  );
}
