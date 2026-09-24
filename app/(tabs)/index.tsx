import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  KANTO_POKEMON_LIST,
  getKantoArtworkUrl,
  capitalizePokemonName,
  KantoPokemonMeta,
} from '@/constants/kanto-pokemon';
import { PokemonTypeColors } from '@/constants/pokemon-theme';
import { useTrainer } from '@/context/trainer-context';

interface WildPokemon {
  instanceId: string;
  id: number;
  name: string;
  cp: number;
  x: number; // percentage offset -50% to 50%
  y: number; // percentage offset -50% to 50%
  types: string[];
}

function createRandomWildPokemon(trainerLevel: number = 1): WildPokemon {
  const randomIndex = Math.floor(Math.random() * KANTO_POKEMON_LIST.length);
  const meta: KantoPokemonMeta = KANTO_POKEMON_LIST[randomIndex];
  const angle = Math.random() * Math.PI * 2;
  const dist = 0.15 + Math.random() * 0.25;
  const x = Math.cos(angle) * dist;
  const y = Math.sin(angle) * dist;

  const minCP = 10;
  const maxCP = Math.max(100, trainerLevel * 75);
  const cp = Math.floor(minCP + Math.random() * (maxCP - minCP));

  return {
    instanceId: `${meta.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    id: meta.id,
    name: meta.name,
    cp,
    x,
    y,
    types: meta.types,
  };
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const RADAR_SIZE = Math.min(SCREEN_WIDTH * 0.9, 360);

export default function MapScreen() {
  const router = useRouter();
  const { trainer } = useTrainer();

  const [walkedDistance, setWalkedDistance] = useState(0.4);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 3 | 5>(1);

  // Wild Pokémon state with initial items
  const [wildList, setWildList] = useState<WildPokemon[]>(() => [
    createRandomWildPokemon(1),
    createRandomWildPokemon(1),
    createRandomWildPokemon(1),
  ]);

  // Radar Pulse Animation using state for React 19 safety
  const [pulseAnim] = useState(() => new Animated.Value(0));
  const [pulseOpacity] = useState(() => new Animated.Value(1));

  // Spawns a random Pokemon from Kanto 151
  const spawnRandomPokemon = useCallback((count = 1) => {
    setWildList((prev) => {
      const newSpawns: WildPokemon[] = [];
      for (let i = 0; i < count; i++) {
        newSpawns.push(createRandomWildPokemon(trainer?.level || 1));
      }
      return [...prev.slice(-3), ...newSpawns];
    });
  }, [trainer?.level]);

  // Radar pulse loop
  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 2400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, [pulseAnim, pulseOpacity]);

  // Move handler (D-Pad)
  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    setWalkedDistance((prev) => parseFloat((prev + 0.02 * speedMultiplier).toFixed(2)));

    // Shift wild Pokémon positions inversely to simulate moving world
    setWildList((prev) =>
      prev
        .map((p) => {
          const shift = 0.04 * speedMultiplier;
          let nx = p.x;
          let ny = p.y;
          if (direction === 'up') ny += shift;
          if (direction === 'down') ny -= shift;
          if (direction === 'left') nx += shift;
          if (direction === 'right') nx -= shift;
          return { ...p, x: nx, y: ny };
        })
        // Despawn if walked far away
        .filter((p) => Math.hypot(p.x, p.y) < 0.6)
    );

    // 25% chance to trigger wild encounter when walking
    if (Math.random() < 0.25) {
      spawnRandomPokemon(1);
    }
  }, [speedMultiplier, spawnRandomPokemon]);

  // Web keyboard support
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleMove('up');
        if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleMove('down');
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleMove('left');
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleMove('right');
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleMove]);

  // Start encounter
  const handleEncounter = (pokemon: WildPokemon) => {
    // Remove from map
    setWildList((prev) => prev.filter((p) => p.instanceId !== pokemon.instanceId));

    // Route to catch modal screen
    router.push({
      pathname: '/catch',
      params: {
        id: String(pokemon.id),
        name: pokemon.name,
        cp: String(pokemon.cp),
        types: JSON.stringify(pokemon.types),
      },
    });
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Status Bar */}
      <View style={styles.header}>
        <View style={styles.statusPill}>
          <Ionicons name="sunny" size={16} color="#F7D02C" />
          <Text style={styles.statusPillText}>Sunny</Text>
        </View>

        <View style={styles.statusPill}>
          <Ionicons name="walk" size={16} color="#007AFF" />
          <Text style={styles.statusPillText}>{walkedDistance.toFixed(2)} km</Text>
        </View>

        <View style={styles.statusPill}>
          <Ionicons name="navigate" size={16} color="#34C759" />
          <Text style={styles.statusPillText}>
            Nearby: {wildList.length}
          </Text>
        </View>
      </View>

      {/* Main Radar Viewport */}
      <View style={styles.radarContainer}>
        <View style={styles.radar}>
          {/* Radar Circles */}
          <View style={[styles.radarRing, styles.ringOuter]} />
          <View style={[styles.radarRing, styles.ringMid]} />
          <View style={[styles.radarRing, styles.ringInner]} />

          {/* Radar Crosshairs */}
          <View style={styles.crosshairH} />
          <View style={styles.crosshairV} />

          {/* Animated Expanding Pulse Ring */}
          <Animated.View
            style={[
              styles.pulseCircle,
              {
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              },
            ]}
          />

          {/* Player Avatar at Center */}
          <View style={styles.playerAvatar}>
            <View style={styles.playerInner}>
              <Ionicons name="person" size={18} color="#FFFFFF" />
            </View>
            <View style={styles.playerPulseDot} />
          </View>

          {/* Wild Pokémon Pins on Radar */}
          {wildList.map((pokemon) => {
            const posX = RADAR_SIZE / 2 + pokemon.x * RADAR_SIZE - 28;
            const posY = RADAR_SIZE / 2 + pokemon.y * RADAR_SIZE - 32;
            const primaryType = (pokemon.types[0] || 'normal') as keyof typeof PokemonTypeColors;
            const badgeColor = PokemonTypeColors[primaryType]?.primary || '#A8A878';

            return (
              <TouchableOpacity
                key={pokemon.instanceId}
                style={[
                  styles.wildPin,
                  {
                    left: posX,
                    top: posY,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleEncounter(pokemon)}
              >
                <View style={[styles.wildPinGlow, { backgroundColor: badgeColor }]} />
                <Image
                  source={{ uri: getKantoArtworkUrl(pokemon.id) }}
                  style={styles.wildPokemonImage}
                  contentFit="contain"
                  transition={200}
                />
                <View style={styles.cpBadge}>
                  <Text style={styles.cpText}>CP {pokemon.cp}</Text>
                </View>
                <Text style={styles.nameLabel} numberOfLines={1}>
                  {capitalizePokemonName(pokemon.name)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Simulator D-Pad & Controls Dock */}
      <View style={styles.controlsDock}>
        <View style={styles.dockHeader}>
          <TouchableOpacity
            style={styles.spawnButton}
            activeOpacity={0.8}
            onPress={() => spawnRandomPokemon(2)}
          >
            <Ionicons name="sparkles" size={16} color="#FFFFFF" />
            <Text style={styles.spawnButtonText}>Spawn Nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.speedButton}
            activeOpacity={0.7}
            onPress={() =>
              setSpeedMultiplier((curr) => (curr === 1 ? 3 : curr === 3 ? 5 : 1))
            }
          >
            <Text style={styles.speedButtonText}>{speedMultiplier}x Speed</Text>
          </TouchableOpacity>
        </View>

        {/* D-Pad Buttons */}
        <View style={styles.dpadContainer}>
          <TouchableOpacity
            style={[styles.dpadBtn, styles.dpadUp]}
            onPress={() => handleMove('up')}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-up" size={24} color="#11181C" />
          </TouchableOpacity>

          <View style={styles.dpadMiddleRow}>
            <TouchableOpacity
              style={[styles.dpadBtn, styles.dpadLeft]}
              onPress={() => handleMove('left')}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={24} color="#11181C" />
            </TouchableOpacity>

            <View style={styles.dpadCenter}>
              <View style={styles.dpadCenterDot} />
            </View>

            <TouchableOpacity
              style={[styles.dpadBtn, styles.dpadRight]}
              onPress={() => handleMove('right')}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-forward" size={24} color="#11181C" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.dpadBtn, styles.dpadDown]}
            onPress={() => handleMove('down')}
            activeOpacity={0.6}
          >
            <Ionicons name="chevron-down" size={24} color="#11181C" />
          </TouchableOpacity>
        </View>

        {Platform.OS === 'web' && (
          <Text style={styles.webTipText}>
            Keyboard: WASD or Arrow Keys to walk
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F1A24',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  radarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radar: {
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: 'rgba(10, 126, 164, 0.08)',
    borderWidth: 2,
    borderColor: 'rgba(10, 126, 164, 0.4)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  radarRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(10, 126, 164, 0.25)',
  },
  ringOuter: {
    width: RADAR_SIZE * 0.85,
    height: RADAR_SIZE * 0.85,
  },
  ringMid: {
    width: RADAR_SIZE * 0.6,
    height: RADAR_SIZE * 0.6,
  },
  ringInner: {
    width: RADAR_SIZE * 0.35,
    height: RADAR_SIZE * 0.35,
  },
  crosshairH: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: 1,
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
  },
  crosshairV: {
    position: 'absolute',
    width: 1,
    height: RADAR_SIZE,
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
  },
  pulseCircle: {
    position: 'absolute',
    width: RADAR_SIZE,
    height: RADAR_SIZE,
    borderRadius: RADAR_SIZE / 2,
    backgroundColor: 'rgba(0, 122, 255, 0.12)',
    borderWidth: 2,
    borderColor: 'rgba(0, 122, 255, 0.6)',
  },
  playerAvatar: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 122, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  playerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  playerPulseDot: {
    position: 'absolute',
    bottom: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  wildPin: {
    position: 'absolute',
    width: 56,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    cursor: Platform.OS === 'web' ? 'pointer' : 'auto',
  },
  wildPinGlow: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    opacity: 0.25,
  },
  wildPokemonImage: {
    width: 44,
    height: 44,
  },
  cpBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginTop: -2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cpText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  nameLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  controlsDock: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  dockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 320,
    marginBottom: 12,
  },
  spawnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 6,
    boxShadow: '0px 4px 12px rgba(52, 199, 89, 0.3)',
    elevation: 3,
  },
  spawnButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  speedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  speedButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dpadContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadMiddleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dpadBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.2)',
    elevation: 4,
  },
  dpadUp: {
    marginBottom: 4,
  },
  dpadDown: {
    marginTop: 4,
  },
  dpadLeft: {
    marginRight: 4,
  },
  dpadRight: {
    marginLeft: 4,
  },
  dpadCenter: {
    width: 36,
    height: 36,
    backgroundColor: '#E1E4E8',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dpadCenterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#687076',
  },
  webTipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
    marginTop: 8,
  },
});
