import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, BackHandler, Platform, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  getKantoArtworkUrl,
  getKantoAnimatedSpriteUrl,
  getPokemonRarity,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import { PokemonRarity, PokemonTypeName } from '@/shared/types';
import {
  useCatchGame,
  CatchHeader,
  GotchaModal,
  PokeballArena,
  CameraPermissionGate,
  WildPokemonStage,
} from '@/features/catch';
import { useEventContext } from '@/shared/context/event-context';

export default function CatchScreen() {
  const router = useRouter();
  const { markCatchAttempt, registrations } = useEventContext();
  const {
    id,
    name,
    rarity: paramRarity,
    types,
    eventId,
  } = useLocalSearchParams<{
    id: string;
    name?: string;
    rarity?: string;
    types?: string;
    eventId?: string;
  }>();

  const pokemonId = Number(id) || 25;
  const pokemonName =
    name ?? getPokemonMetaById(pokemonId)?.name ?? 'pikachu';
  const rarity: PokemonRarity =
    (paramRarity as PokemonRarity) || getPokemonRarity(pokemonId);

  const pokemonTypes: PokemonTypeName[] = useMemo(() => {
    if (types) {
      try {
        return JSON.parse(types);
      } catch {
        return getPokemonMetaById(pokemonId)?.types ?? ['normal'];
      }
    }
    return getPokemonMetaById(pokemonId)?.types ?? ['electric'];
  }, [types, pokemonId]);

  const registration = useMemo(
    () => (eventId ? registrations.find((r) => r.eventId === eventId) : undefined),
    [eventId, registrations]
  );
  const alreadyCaught = Boolean(registration?.hasCaught);

  // Entry guard: if already caught, show alert and redirect back without entering encounter
  useEffect(() => {
    if (eventId && alreadyCaught) {
      Alert.alert(
        'คุณได้จับโปเกมอนแล้ว',
        'คุณได้จับโปเกมอนประจำกิจกรรมนี้ไปแล้ว',
        [
          {
            text: 'ตกลง',
            onPress: () => {
              router.replace({
                pathname: '/events/[id]' as any,
                params: { id: eventId },
              });
            },
          },
        ],
        {
          cancelable: false,
          onDismiss: () => {
            router.replace({
              pathname: '/events/[id]' as any,
              params: { id: eventId },
            });
          },
        }
      );
    }
  }, [eventId, alreadyCaught, router]);

  const [spriteLoadFailed, setSpriteLoadFailed] = useState<boolean>(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const hasExitedRef = useRef(false);

  // Consume catch attempt upon entering encounter (Single Catch Rule)
  useEffect(() => {
    if (eventId && !alreadyCaught) {
      markCatchAttempt(eventId, false);
    }
  }, [eventId, alreadyCaught, markCatchAttempt]);

  // Request camera permission on mount if needed
  useEffect(() => {
    if (
      cameraPermission &&
      !cameraPermission.granted &&
      cameraPermission.canAskAgain
    ) {
      requestCameraPermission().catch(() => {});
    }
  }, [cameraPermission, requestCameraPermission]);

  const returnToEvent = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    if (eventId) {
      // Drop map from history and return directly to Event Detail
      router.replace({
        pathname: '/events/[id]' as any,
        params: { id: eventId },
      });
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router, eventId]);

  // Android Hardware Back button listener
  useEffect(() => {
    const onBackPress = () => {
      returnToEvent();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backHandler.remove();
  }, [returnToEvent]);

  const {
    gameState,
    floatAnim,
    ballX,
    ballY,
    ballScale,
    ballRotation,
    pokemonOpacity,
    panResponder,
  } = useCatchGame({
    pokemonId,
    pokemonName,
    pokemonRarity: rarity,
    pokemonTypes,
  });

  // Auto-dismiss Gotcha feedback after 1.8s and return directly to Event Detail
  useEffect(() => {
    if (gameState === 'CAUGHT') {
      if (eventId) {
        markCatchAttempt(eventId, true);
      }
      const timer = setTimeout(() => {
        returnToEvent();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [gameState, eventId, markCatchAttempt, returnToEvent]);

  const spriteUrl = spriteLoadFailed
    ? getKantoArtworkUrl(pokemonId)
    : getKantoAnimatedSpriteUrl(pokemonId);

  if (eventId && alreadyCaught) {
    return (
      <View style={styles.container}>
        <Stack.Screen
          options={{
            presentation: 'fullScreenModal',
            headerShown: false,
            animation: 'fade',
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'fade',
        }}
      />

      {/* 1. Camera Feed Layer (full screen without occlusion on Native) */}
      {Platform.OS !== 'web' && cameraPermission?.granted && (
        <CameraView style={StyleSheet.absoluteFill} facing="back" />
      )}

      {/* 2. Interactive UI Layer (Safe Area, transparent background) */}
      <SafeAreaView
        style={StyleSheet.absoluteFill}
        edges={['top', 'bottom']}
        pointerEvents="box-none"
      >
        <CatchHeader
          pokemonName={pokemonName}
          rarity={rarity}
          onRunPress={returnToEvent}
        />

        {Platform.OS !== 'web' && !cameraPermission?.granted ? (
          <CameraPermissionGate
            pokemonId={pokemonId}
            pokemonName={pokemonName}
            canAskAgain={cameraPermission?.canAskAgain}
            onRequestPermission={() => requestCameraPermission().catch(() => {})}
            onRunPress={returnToEvent}
          />
        ) : (
          <>
            <WildPokemonStage
              floatAnim={floatAnim}
              pokemonOpacity={pokemonOpacity}
              spriteUrl={spriteUrl}
              fallbackArtworkUrl={getKantoArtworkUrl(pokemonId)}
              onError={() => setSpriteLoadFailed(true)}
            />

            <PokeballArena
              isAiming={gameState === 'AIMING'}
              panHandlers={panResponder.panHandlers}
              ballX={ballX}
              ballY={ballY}
              ballScale={ballScale}
              ballRotation={ballRotation}
            />
          </>
        )}
      </SafeAreaView>

      {/* 3. Catch Success Overlay Modal */}
      {gameState === 'CAUGHT' && (
        <GotchaModal
          pokemonId={pokemonId}
          pokemonName={pokemonName}
          rarity={rarity}
          onDone={returnToEvent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
