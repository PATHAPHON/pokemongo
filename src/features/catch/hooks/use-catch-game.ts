import { useState, useEffect, useCallback, useMemo } from 'react';
import { Animated, PanResponder, Easing, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  capitalizePokemonName,
  getKantoArtworkUrl,
} from '@/shared/constants/kanto-pokemon';
import { ThrowRatingColors } from '@/shared/constants/pokemon-theme';
import { useTrainer } from '@/shared/context/trainer-context';
import { sendCatchNotification } from '@/shared/services/notifications';
import { CaughtPokemon, PokemonTypeName } from '@/shared/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export type CatchState = 'AIMING' | 'THROWN' | 'WOBBLING' | 'CAUGHT' | 'BREAKOUT';

export interface UseCatchGameParams {
  pokemonId: number;
  pokemonName: string;
  pokemonCp: number;
  pokemonTypes: PokemonTypeName[];
}

export function useCatchGame({
  pokemonId,
  pokemonName,
  pokemonCp,
  pokemonTypes,
}: UseCatchGameParams) {
  const {
    inventory,
    useItem: consumeInventoryItem,
    catchPokemon,
    addExperience,
    addStardust,
  } = useTrainer();

  const [gameState, setGameState] = useState<CatchState>('AIMING');
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);

  // Animation values using state for React 19 compliance
  const [floatAnim] = useState(() => new Animated.Value(0));
  const [ringScaleAnim] = useState(() => new Animated.Value(1));
  const [ballX] = useState(() => new Animated.Value(0));
  const [ballY] = useState(() => new Animated.Value(0));
  const [ballScale] = useState(() => new Animated.Value(1));
  const [ballRotate] = useState(() => new Animated.Value(0));
  const [pokemonOpacity] = useState(() => new Animated.Value(1));

  // Difficulty calculation
  const catchDifficulty = Math.min(0.85, Math.max(0.2, pokemonCp / 600));
  const ringColor =
    catchDifficulty < 0.4
      ? ThrowRatingColors.excellent
      : catchDifficulty < 0.65
      ? ThrowRatingColors.nice
      : ThrowRatingColors.miss;

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

  // Target ring shrinking loop
  useEffect(() => {
    if (gameState === 'AIMING') {
      const ringLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(ringScaleAnim, {
            toValue: 0.35,
            duration: 1200,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(ringScaleAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      ringLoop.start();
      return () => ringLoop.stop();
    }
  }, [gameState, ringScaleAnim]);

  // Reset ball to bottom center
  const resetBall = useCallback(() => {
    ballX.setValue(0);
    ballY.setValue(0);
    ballScale.setValue(1);
    ballRotate.setValue(0);
    pokemonOpacity.setValue(1);
    setRatingMessage(null);
    setGameState('AIMING');
  }, [ballX, ballY, ballScale, ballRotate, pokemonOpacity]);

  // Execute catch wobble sequence
  const startCatchWobble = useCallback(async () => {
    setGameState('WOBBLING');
    pokemonOpacity.setValue(0); // Pokemon absorbed into ball

    const runShake = (count: number): Promise<boolean> => {
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

    const successThreshold = 1 - catchDifficulty + 0.35;
    const isSuccess = Math.random() < successThreshold;

    await new Promise((r) => setTimeout(r, 400));
    await runShake(1);
    await new Promise((r) => setTimeout(r, 300));
    await runShake(2);
    await new Promise((r) => setTimeout(r, 300));

    if (isSuccess) {
      await runShake(3);
      setGameState('CAUGHT');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      sendCatchNotification(capitalizePokemonName(pokemonName), pokemonCp);

      const instanceId = `poke-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newCaught: CaughtPokemon = {
        instanceId,
        pokemonId,
        name: pokemonName,
        nickname: capitalizePokemonName(pokemonName),
        artwork: getKantoArtworkUrl(pokemonId),
        types: pokemonTypes,
        cp: pokemonCp,
        level: Math.max(1, Math.round(pokemonCp / 40)),
        iv: {
          attack: Math.floor(Math.random() * 16),
          defense: Math.floor(Math.random() * 16),
          stamina: Math.floor(Math.random() * 16),
        },
        stats: [
          { name: 'hp', baseStat: Math.max(20, Math.round(pokemonCp / 6)) },
          { name: 'attack', baseStat: Math.max(20, Math.round(pokemonCp / 6)) },
          { name: 'defense', baseStat: Math.max(20, Math.round(pokemonCp / 6)) },
          { name: 'special-attack', baseStat: Math.max(20, Math.round(pokemonCp / 6)) },
          { name: 'special-defense', baseStat: Math.max(20, Math.round(pokemonCp / 6)) },
          { name: 'speed', baseStat: Math.max(20, Math.round(pokemonCp / 6)) },
        ],
        height: 10,
        weight: 100,
        caughtAt: new Date().toISOString(),
        favorite: false,
      };

      await catchPokemon(newCaught);
      await addExperience(120);
      await addStardust(100);
    } else {
      setGameState('BREAKOUT');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      pokemonOpacity.setValue(1);
      setTimeout(() => {
        resetBall();
      }, 1500);
    }
  }, [
    ballRotate,
    catchDifficulty,
    catchPokemon,
    addExperience,
    addStardust,
    pokemonId,
    pokemonName,
    pokemonCp,
    pokemonTypes,
    pokemonOpacity,
    resetBall,
  ]);

  // PanResponder for swiping Pokéball
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState === 'AIMING' && inventory.pokeballs > 0,
        onPanResponderMove: (_, gestureState) => {
          if (gameState !== 'AIMING') return;
          ballX.setValue(gestureState.dx * 0.4);
          ballY.setValue(Math.min(0, gestureState.dy * 0.6));
        },
        onPanResponderRelease: async (_, gestureState) => {
          if (gameState !== 'AIMING') return;

          if (gestureState.dy < -60) {
            const hasBall = await consumeInventoryItem('pokeballs', 1);
            if (!hasBall) {
              resetBall();
              return;
            }

            setGameState('THROWN');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

            const currentRingValue = (ringScaleAnim as any)._value || 0.6;
            if (currentRingValue < 0.45) {
              setRatingMessage('EXCELLENT!');
            } else if (currentRingValue < 0.7) {
              setRatingMessage('GREAT!');
            } else {
              setRatingMessage('NICE!');
            }

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
            Animated.spring(ballX, { toValue: 0, useNativeDriver: true }).start();
            Animated.spring(ballY, { toValue: 0, useNativeDriver: true }).start();
          }
        },
      }),
    [
      gameState,
      inventory.pokeballs,
      ballX,
      ballY,
      ballScale,
      consumeInventoryItem,
      resetBall,
      ringScaleAnim,
      startCatchWobble,
    ]
  );

  const ballRotation = ballRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-25deg', '0deg', '25deg'],
  });

  return {
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
    resetBall,
  };
}
