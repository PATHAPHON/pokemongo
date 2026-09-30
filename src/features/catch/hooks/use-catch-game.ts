import { useState, useEffect, useCallback, useMemo } from 'react';
import { Animated, PanResponder, Easing, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  capitalizePokemonName,
  getArtworkUrl,
  getPokemonRarity,
} from '@/shared/constants/kanto-pokemon';
import { getPokemonMetaById } from '@/shared/services/pokemon-registry';
import { useTrainer } from '@/shared/context/trainer-context';
import { CaughtPokemon, PokemonRarity, PokemonTypeName } from '@/shared/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type CatchState = 'AIMING' | 'THROWN' | 'WOBBLING' | 'CAUGHT';

interface UseCatchGameParams {
  pokemonId: number;
  pokemonName: string;
  pokemonRarity?: PokemonRarity;
  pokemonTypes: PokemonTypeName[];
}

export function useCatchGame({
  pokemonId,
  pokemonName,
  pokemonRarity,
  pokemonTypes,
}: UseCatchGameParams) {
  const { catchPokemon } = useTrainer();

  const [gameState, setGameState] = useState<CatchState>('AIMING');

  // Animation values using state for React 19 compliance
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [ballX] = useState(() => new Animated.Value(0));
  const [ballY] = useState(() => new Animated.Value(0));
  const [ballScale] = useState(() => new Animated.Value(1));
  const [ballRotate] = useState(() => new Animated.Value(0));
  const [pokemonOpacity] = useState(() => new Animated.Value(1));

  const rarity: PokemonRarity =
    pokemonRarity ||
    getPokemonMetaById(pokemonId)?.rarity ||
    getPokemonRarity(pokemonId);

  // Floating bobbing animation
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -12,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, [floatAnim]);

  // Execute catch wobble sequence - 100% Guaranteed Catch
  const startCatchWobble = useCallback(async () => {
    setGameState('WOBBLING');
    pokemonOpacity.setValue(0); // Pokemon absorbed into ball

    const runShake = (): Promise<boolean> => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      return new Promise((resolve) => {
        Animated.sequence([
          Animated.timing(ballRotate, {
            toValue: -1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(ballRotate, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(ballRotate, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          resolve(true);
        });
      });
    };

    await new Promise((r) => setTimeout(r, 350));
    await runShake();
    await new Promise((r) => setTimeout(r, 250));
    await runShake();
    await new Promise((r) => setTimeout(r, 250));
    await runShake();

    // 100% Catch Success
    setGameState('CAUGHT');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );

    const instanceId = `poke-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newCaught: CaughtPokemon = {
      instanceId,
      pokemonId,
      name: pokemonName,
      nickname: capitalizePokemonName(pokemonName),
      artwork: getArtworkUrl(pokemonId),
      types: pokemonTypes,
      rarity,
      caughtAt: new Date().toISOString(),
      favorite: false,
    };

    await catchPokemon(newCaught);
  }, [
    ballRotate,
    catchPokemon,
    pokemonId,
    pokemonName,
    pokemonTypes,
    pokemonOpacity,
    rarity,
  ]);

  // PanResponder for swiping Pokéball (Infinite Pokéballs)
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState === 'AIMING',
        onPanResponderMove: (_, gestureState) => {
          if (gameState !== 'AIMING') return;
          ballX.setValue(gestureState.dx * 0.4);
          ballY.setValue(Math.min(0, gestureState.dy * 0.6));
        },
        onPanResponderRelease: async (_, gestureState) => {
          if (gameState !== 'AIMING') return;

          if (gestureState.dy < -60) {
            setGameState('THROWN');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
              () => {}
            );

            const targetY = -SCREEN_HEIGHT * 0.38;
            Animated.parallel([
              Animated.timing(ballY, {
                toValue: targetY,
                duration: 550,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(ballX, {
                toValue: gestureState.dx * 0.8,
                duration: 550,
                useNativeDriver: true,
              }),
              Animated.timing(ballScale, {
                toValue: 0.4,
                duration: 550,
                useNativeDriver: true,
              }),
            ]).start(() => {
              startCatchWobble();
            });
          } else {
            Animated.spring(ballX, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
            Animated.spring(ballY, {
              toValue: 0,
              useNativeDriver: true,
            }).start();
          }
        },
      }),
    [gameState, ballX, ballY, ballScale, startCatchWobble]
  );

  const ballRotation = ballRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-25deg', '0deg', '25deg'],
  });

  return {
    gameState,
    rarity,
    floatAnim,
    ballX,
    ballY,
    ballScale,
    ballRotation,
    pokemonOpacity,
    panResponder,
  };
}
