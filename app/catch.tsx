import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  PanResponder,
  Easing,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getKantoArtworkUrl,
  capitalizePokemonName,
} from '@/constants/kanto-pokemon';
import { ThrowRatingColors } from '@/constants/pokemon-theme';
import { useTrainer } from '@/context/trainer-context';
import { NicknameModal } from '@/components/pokemon/nickname-modal';
import { CaughtPokemon, PokemonTypeName } from '@/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type CatchState = 'AIMING' | 'THROWN' | 'WOBBLING' | 'CAUGHT' | 'BREAKOUT';

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

  const {
    inventory,
    useItem: consumeInventoryItem,
    catchPokemon,
    addExperience,
    addStardust,
  } = useTrainer();

  const [gameState, setGameState] = useState<CatchState>('AIMING');
  const [ratingMessage, setRatingMessage] = useState<string | null>(null);
  const [showNicknameModal, setShowNicknameModal] = useState<boolean>(false);

  // Animation values using state to comply with React 19 rules
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

  // Pokemon floating bobbing animation
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

    // Wobble sequence (3 shakes)
    const runShake = (count: number): Promise<boolean> => {
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

    // Calculate success probability based on difficulty and throw
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

      // Create caught pokemon record
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
      // Breakout!
      setGameState('BREAKOUT');
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

  // PanResponder for swiping the Pokéball
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => gameState === 'AIMING' && inventory.pokeballs > 0,
        onPanResponderMove: (_, gestureState) => {
          if (gameState !== 'AIMING') return;
          // Follow touch slightly while dragging
          ballX.setValue(gestureState.dx * 0.4);
          ballY.setValue(Math.min(0, gestureState.dy * 0.6));
        },
        onPanResponderRelease: async (_, gestureState) => {
          if (gameState !== 'AIMING') return;

          // Verify upward swipe velocity and distance
          if (gestureState.dy < -60) {
            const hasBall = await consumeInventoryItem('pokeballs', 1);
            if (!hasBall) {
              resetBall();
              return;
            }

            setGameState('THROWN');

            // Evaluate accuracy based on ring size
            const currentRingValue = (ringScaleAnim as any)._value || 0.6;
            if (currentRingValue < 0.45) {
              setRatingMessage('EXCELLENT!');
            } else if (currentRingValue < 0.7) {
              setRatingMessage('GREAT!');
            } else {
              setRatingMessage('NICE!');
            }

            // Animate ball fly towards the Pokémon
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
            // Snap back if swipe was too weak
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
        }}
      />

      {/* Classic Meadow Field Background */}
      <View style={styles.skyBackground}>
        <View style={[styles.cloud, { top: 60, left: 30 }]} />
        <View style={[styles.cloud, { top: 120, right: 40, width: 90, height: 32 }]} />
      </View>
      <View style={styles.greenMeadow} />

      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.runAwayButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          <Text style={styles.runAwayText}>Run</Text>
        </TouchableOpacity>

        <View style={styles.pokemonInfoCard}>
          <Text style={styles.pokemonNameText}>
            {capitalizePokemonName(pokemonName)}
          </Text>
          <View style={styles.cpBadge}>
            <Text style={styles.cpText}>CP {pokemonCp}</Text>
          </View>
        </View>

        <View style={styles.ballCountPill}>
          <Ionicons name="disc" size={16} color="#FF3B30" />
          <Text style={styles.ballCountText}>{inventory.pokeballs}</Text>
        </View>
      </View>

      {/* Center Pokémon & Target Ring Area */}
      <View style={styles.centerStage}>
        {/* Rating Banner Popup */}
        {ratingMessage && (
          <View style={styles.ratingPopup}>
            <Text style={styles.ratingText}>{ratingMessage}</Text>
          </View>
        )}

        {/* Target Ring */}
        {gameState === 'AIMING' && (
          <Animated.View
            style={[
              styles.targetRing,
              {
                borderColor: ringColor,
                transform: [{ scale: ringScaleAnim }],
              },
            ]}
          />
        )}

        {/* Wild Pokémon Artwork */}
        <Animated.View
          style={[
            styles.pokemonWrapper,
            {
              transform: [{ translateY: floatAnim }],
              opacity: pokemonOpacity,
            },
          ]}
        >
          <Image
            source={{ uri: getKantoArtworkUrl(pokemonId) }}
            style={styles.pokemonArtwork}
            contentFit="contain"
            transition={300}
          />
        </Animated.View>
      </View>

      {/* Bottom Pokéball Throwing Arena */}
      <View style={styles.bottomArena}>
        {inventory.pokeballs <= 0 && gameState === 'AIMING' ? (
          <View style={styles.outOfBallsBox}>
            <Text style={styles.outOfBallsText}>Out of Pokéballs!</Text>
            <TouchableOpacity
              style={styles.fleeBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.fleeBtnText}>Return to Map</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.ballContainer} {...panResponder.panHandlers}>
            <Animated.View
              style={[
                styles.pokeball,
                {
                  transform: [
                    { translateX: ballX },
                    { translateY: ballY },
                    { scale: ballScale },
                    { rotate: ballRotation },
                  ],
                },
              ]}
            >
              <View style={styles.pokeballTop} />
              <View style={styles.pokeballBand}>
                <View style={styles.pokeballButtonCenter} />
              </View>
              <View style={styles.pokeballBottom} />
            </Animated.View>
            {gameState === 'AIMING' && (
              <Text style={styles.swipePrompt}>Swipe up to throw</Text>
            )}
          </View>
        )}
      </View>

      {/* Catch Success Overlay Modal */}
      {gameState === 'CAUGHT' && (
        <View style={styles.successOverlay}>
          <View style={styles.successDialog}>
            <Ionicons name="sparkles" size={44} color="#F7D02C" />
            <Text style={styles.successTitle}>Gotcha!</Text>
            <Text style={styles.successSubtitle}>
              {capitalizePokemonName(pokemonName)} was caught!
            </Text>

            <Image
              source={{ uri: getKantoArtworkUrl(pokemonId) }}
              style={styles.capturedPreview}
              contentFit="contain"
            />

            <View style={styles.rewardRow}>
              <View style={styles.rewardBadge}>
                <Ionicons name="ribbon" size={16} color="#007AFF" />
                <Text style={styles.rewardText}>+120 XP</Text>
              </View>
              <View style={styles.rewardBadge}>
                <Ionicons name="star" size={16} color="#F7D02C" />
                <Text style={styles.rewardText}>+100 Stardust</Text>
              </View>
            </View>

            <View style={styles.actionButtonsCol}>
              <TouchableOpacity
                style={styles.nicknameButton}
                activeOpacity={0.8}
                onPress={() => setShowNicknameModal(true)}
              >
                <Text style={styles.nicknameButtonText}>Set Nickname</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneButton}
                activeOpacity={0.8}
                onPress={() => router.back()}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Breakout Banner */}
      {gameState === 'BREAKOUT' && (
        <View style={styles.breakoutBanner}>
          <Text style={styles.breakoutText}>Oh no! The Pokémon broke free!</Text>
        </View>
      )}

      {/* Nickname Modal */}
      <NicknameModal
        visible={showNicknameModal}
        pokemonName={pokemonName}
        onSave={() => {
          setShowNicknameModal(false);
          router.back();
        }}
        onCancel={() => setShowNicknameModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#87CEEB',
    position: 'relative',
  },
  skyBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#70C5FF',
  },
  cloud: {
    position: 'absolute',
    width: 80,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  greenMeadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
    backgroundColor: '#48B04F',
    borderTopLeftRadius: 180,
    borderTopRightRadius: 180,
    transform: [{ scaleX: 1.4 }],
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 30,
  },
  runAwayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
  },
  runAwayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  pokemonInfoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  pokemonNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#11181C',
  },
  cpBadge: {
    backgroundColor: '#11181C',
    paddingHorizontal: 8,
    paddingVertical: 1,
    borderRadius: 10,
    marginTop: 2,
  },
  cpText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  ballCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 6,
  },
  ballCountText: {
    color: '#11181C',
    fontWeight: '800',
    fontSize: 13,
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -20,
  },
  ratingPopup: {
    position: 'absolute',
    top: 40,
    backgroundColor: '#34C759',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 40,
    boxShadow: '0px 4px 12px rgba(52, 199, 89, 0.4)',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  targetRing: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 3,
    zIndex: 15,
  },
  pokemonWrapper: {
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  pokemonArtwork: {
    width: '100%',
    height: '100%',
  },
  bottomArena: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 25,
  },
  ballContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  pokeball: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 3,
    borderColor: '#11181C',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    boxShadow: '0px 6px 14px rgba(0, 0, 0, 0.3)',
    elevation: 6,
  },
  pokeballTop: {
    height: '50%',
    backgroundColor: '#FF3B30',
  },
  pokeballBand: {
    position: 'absolute',
    top: '44%',
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: '#11181C',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  pokeballButtonCenter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#11181C',
  },
  pokeballBottom: {
    height: '50%',
    backgroundColor: '#FFFFFF',
  },
  swipePrompt: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  outOfBallsBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
  outOfBallsText: {
    color: '#FF3B30',
    fontWeight: '800',
    fontSize: 15,
  },
  fleeBtn: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fleeBtnText: {
    color: '#11181C',
    fontWeight: '700',
    fontSize: 13,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    padding: 24,
  },
  successDialog: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.25)',
    elevation: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#11181C',
    marginTop: 8,
  },
  successSubtitle: {
    fontSize: 14,
    color: '#687076',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  capturedPreview: {
    width: 100,
    height: 100,
    marginVertical: 12,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  rewardText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#11181C',
  },
  actionButtonsCol: {
    width: '100%',
    gap: 10,
  },
  nicknameButton: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#0A7EA4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nicknameButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  doneButton: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F4F6F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#11181C',
    fontWeight: '700',
    fontSize: 14,
  },
  breakoutBanner: {
    position: 'absolute',
    top: 90,
    alignSelf: 'center',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 40,
  },
  breakoutText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
