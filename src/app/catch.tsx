import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, BackHandler, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  getKantoArtworkUrl,
  getKantoAnimatedSpriteUrl,
  getPokemonRarity,
} from '@/shared/constants/kanto-pokemon';
import { PokemonRarity, PokemonTypeName } from '@/shared/types';
import {
  useCatchGame,
  CatchHeader,
  GotchaModal,
  PokeballArena,
  CameraPermissionGate,
  WildPokemonStage,
} from '@/features/catch';

export default function CatchScreen() {
  const router = useRouter();
  const {
    id,
    name,
    rarity: paramRarity,
    types,
  } = useLocalSearchParams<{
    id: string;
    name: string;
    rarity?: string;
    types?: string;
  }>();

  const pokemonId = Number(id) || 25;
  const pokemonName = name || 'pikachu';
  const rarity: PokemonRarity =
    (paramRarity as PokemonRarity) || getPokemonRarity(pokemonId);

  const pokemonTypes: PokemonTypeName[] = useMemo(
    () => (types ? JSON.parse(types) : ['electric']),
    [types]
  );

  const [spriteLoadFailed, setSpriteLoadFailed] = useState<boolean>(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const hasExitedRef = useRef(false);

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

  const returnToMap = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  }, [router]);

  // Android Hardware Back button listener
  useEffect(() => {
    const onBackPress = () => {
      returnToMap();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress
    );
    return () => backHandler.remove();
  }, [returnToMap]);

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

  // Auto-dismiss Gotcha feedback after 1.8s and return to Map
  useEffect(() => {
    if (gameState === 'CAUGHT') {
      const timer = setTimeout(() => {
        returnToMap();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [gameState, returnToMap]);

  const spriteUrl = spriteLoadFailed
    ? getKantoArtworkUrl(pokemonId)
    : getKantoAnimatedSpriteUrl(pokemonId);

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
          onRunPress={returnToMap}
        />

        {Platform.OS !== 'web' && !cameraPermission?.granted ? (
          <CameraPermissionGate
            pokemonId={pokemonId}
            pokemonName={pokemonName}
            canAskAgain={cameraPermission?.canAskAgain}
            onRequestPermission={() => requestCameraPermission().catch(() => {})}
            onRunPress={returnToMap}
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
          onDone={returnToMap}
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
