import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';

import {
  getKantoArtworkUrl,
  getKantoAnimatedSpriteUrl,
} from '@/shared/constants/kanto-pokemon';
import { PokemonTypeName } from '@/shared/types';
import { NicknameModal } from '@/features/pokemon';
import {
  useCatchGame,
  CatchHeader,
  GotchaModal,
  PokeballArena,
  TargetRing,
} from '@/features/catch';

export default function CatchScreen() {
  const router = useRouter();
  const { id, name, cp, types } = useLocalSearchParams<{
    id: string;
    name: string;
    cp: string;
    types?: string;
  }>();

  const pokemonId = Number(id) || 25;
  const pokemonName = name || 'pikachu';
  const pokemonCp = Number(cp) || 120;
  const pokemonTypes: PokemonTypeName[] = useMemo(
    () => (types ? JSON.parse(types) : ['electric']),
    [types]
  );

  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);
  const [spriteLoadFailed, setSpriteLoadFailed] = useState<boolean>(false);

  // Camera & AR mode permission
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  useEffect(() => {
    if (!cameraPermission?.granted) {
      requestCameraPermission().catch(() => {});
    }
  }, [cameraPermission, requestCameraPermission]);

  // Hook handles throw physics, animations, and state
  const {
    gameState,
    ratingMessage,
    ringColor,
    floatAnim,
    ringScaleAnim,
    ballX,
    ballY,
    ballScale,
    ballRotation,
    pokemonOpacity,
    inventory,
    panResponder,
  } = useCatchGame({
    pokemonId,
    pokemonName,
    pokemonCp,
    pokemonTypes,
  });

  return (
    <SafeAreaView
      className="flex-1 bg-[#87CEEB] relative"
      style={{ flex: 1 }}
      edges={['top', 'bottom']}
    >
      <Stack.Screen
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />

      {/* Background: Camera AR or Classic Meadow Field Fallback */}
      {cameraPermission?.granted ? (
        <CameraView className="absolute inset-0" facing="back" />
      ) : (
        <>
          <View className="absolute top-0 left-0 right-0 h-[60%] bg-[#70C5FF]">
            <View className="absolute w-20 h-7 rounded-full bg-white/70" style={{ top: 60, left: 30 }} />
            <View className="absolute w-[90px] h-8 rounded-full bg-white/70" style={{ top: 120, right: 40 }} />
          </View>
          <View className="absolute bottom-0 left-0 right-0 h-[45%] bg-[#48B04F] rounded-t-[180px] scale-x-[1.4]" />
        </>
      )}

      {/* Top Header Bar */}
      <CatchHeader
        pokemonName={pokemonName}
        pokemonCp={pokemonCp}
        ballCount={inventory.pokeballs}
        onRunPress={() => router.back()}
      />

      {/* Center Pokémon & Target Ring Area */}
      <View className="flex-1 items-center justify-center relative -mt-5">
        {ratingMessage && (
          <View className="absolute top-10 bg-[#34C759] px-4 py-1.5 rounded-2xl z-40 shadow-lg">
            <Text className="text-white text-base font-black tracking-widest">{ratingMessage}</Text>
          </View>
        )}

        <TargetRing
          visible={gameState === 'AIMING'}
          ringColor={ringColor}
          ringScaleAnim={ringScaleAnim}
        />

        <Animated.View
          className="w-[190px] h-[190px] items-center justify-center z-10"
          style={[
            {
              transform: [{ translateY: floatAnim }],
              opacity: pokemonOpacity,
            },
          ]}
        >
          <Image
            source={{
              uri: spriteLoadFailed
                ? getKantoArtworkUrl(pokemonId)
                : getKantoAnimatedSpriteUrl(pokemonId),
            }}
            className="w-full h-full"
            contentFit="contain"
            transition={200}
            onError={() => setSpriteLoadFailed(true)}
          />
        </Animated.View>
      </View>

      {/* Bottom Pokéball Throwing Arena */}
      <PokeballArena
        ballCount={inventory.pokeballs}
        isAiming={gameState === 'AIMING'}
        panHandlers={panResponder.panHandlers}
        ballX={ballX}
        ballY={ballY}
        ballScale={ballScale}
        ballRotation={ballRotation}
        onOutOfBallsPress={() => router.back()}
      />

      {/* Catch Success Overlay Modal */}
      {gameState === 'CAUGHT' && (
        <GotchaModal
          pokemonId={pokemonId}
          pokemonName={pokemonName}
          onSetNickname={() => setShowNicknameModal(true)}
          onDone={() => router.back()}
        />
      )}

      {/* Breakout Banner */}
      {gameState === 'BREAKOUT' && (
        <View className="absolute top-[90px] self-center bg-[#FF3B30] px-4 py-2 rounded-2xl z-40">
          <Text className="text-white font-extrabold text-[13px]">Oh no! The Pokémon broke free!</Text>
        </View>
      )}

      {/* Nickname Modal */}
      <NicknameModal
        visible={showNicknameModal}
        pokemonName={pokemonName}
        currentNickname=""
        onSave={() => {
          setShowNicknameModal(false);
          router.back();
        }}
        onCancel={() => setShowNicknameModal(false)}
      />
    </SafeAreaView>
  );
}
