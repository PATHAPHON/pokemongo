import { useEffect } from 'react';
import { View, ActivityIndicator, Platform, LogBox } from 'react-native';
import {
  DefaultTheme,
  ThemeProvider,
  Stack,
  router,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import {
  TrainerProvider,
  useTrainer,
  useSession,
} from '@/shared/context/trainer-context';
import { EventProvider } from '@/shared/context/event-context';

import {
  registerNotificationTapListener,
  setupNotificationChannels,
  configureNotificationHandler,
} from '@/shared/services/notifications/index';

import { Ionicons } from '@expo/vector-icons';
import {
  useFonts,
  Prompt_300Light,
  Prompt_400Regular,
  Prompt_500Medium,
  Prompt_600SemiBold,
  Prompt_700Bold,
  Prompt_800ExtraBold,
  Prompt_900Black,
} from '@expo-google-fonts/prompt';
import * as SplashScreen from 'expo-splash-screen';
import { applyGlobalFont } from '@/shared/utils/apply-global-font';

// Apply Prompt font globally across Text and TextInput components
applyGlobalFont();

// Prevent splash screen from auto-hiding while fonts load
SplashScreen.preventAutoHideAsync().catch(() => {});

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

  const [fontsLoaded, fontError] = useFonts({
    ...Ionicons.font,
    Prompt_300Light,
    Prompt_400Regular,
    Prompt_500Medium,
    Prompt_600SemiBold,
    Prompt_700Bold,
    Prompt_800ExtraBold,
    Prompt_900Black,
    Prompt: Prompt_400Regular,
    'Prompt-Light': Prompt_300Light,
    'Prompt-Regular': Prompt_400Regular,
    'Prompt-Medium': Prompt_500Medium,
    'Prompt-SemiBold': Prompt_600SemiBold,
    'Prompt-Bold': Prompt_700Bold,
    'Prompt-ExtraBold': Prompt_800ExtraBold,
    'Prompt-Black': Prompt_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    // 0. Initialize notification channel & handler
    configureNotificationHandler();
    setupNotificationChannels().catch(() => {});
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        <ActivityIndicator size="large" color="#EE1515" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <TrainerProvider>
        <EventProvider>
          <NavigationStack />
          <StatusBar style="dark" />
        </EventProvider>
      </TrainerProvider>
    </ThemeProvider>
  );
}
