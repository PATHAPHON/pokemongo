import {
  View,
  Text,
  Animated,
  GestureResponderHandlers,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';

interface PokeballArenaProps {
  isAiming: boolean;
  panHandlers: GestureResponderHandlers;
  ballX: Animated.Value;
  ballY: Animated.Value;
  ballScale: Animated.Value;
  ballRotation: Animated.AnimatedInterpolation<string | number>;
}

const POKEBALL_IMAGE_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export function PokeballArena({
  isAiming,
  panHandlers,
  ballX,
  ballY,
  ballScale,
  ballRotation,
}: PokeballArenaProps) {
  return (
    <View style={styles.arenaContainer}>
      <View style={styles.touchArea} {...panHandlers}>
        <Animated.View
          style={[
            styles.pokeballWrapper,
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
          <Image
            source={{ uri: POKEBALL_IMAGE_URL }}
            style={styles.pokeballImage}
            contentFit="contain"
            transition={150}
          />
        </Animated.View>
        {isAiming && (
          <Text style={styles.instructionText}>Swipe up to throw</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  arenaContainer: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  touchArea: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeballWrapper: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
  },
  pokeballImage: {
    width: 72,
    height: 72,
  },
  instructionText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
