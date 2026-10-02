import { View, Animated, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

interface WildPokemonStageProps {
  floatAnim: Animated.Value;
  pokemonOpacity: Animated.Value;
  spriteUrl: string;
  fallbackArtworkUrl: string;
  onError?: () => void;
}

export function WildPokemonStage({
  floatAnim,
  pokemonOpacity,
  spriteUrl,
  fallbackArtworkUrl,
  onError,
}: WildPokemonStageProps) {
  return (
    <View style={styles.container} pointerEvents="box-none">
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
          source={{ uri: spriteUrl }}
          style={styles.sprite}
          contentFit="contain"
          transition={200}
          placeholder={{ uri: fallbackArtworkUrl }}
          onError={onError}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  pokemonWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sprite: {
    width: 210,
    height: 210,
  },
});
