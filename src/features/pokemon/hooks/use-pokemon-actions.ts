import { useCallback } from 'react';
import { Alert } from 'react-native';
import { CaughtPokemon } from '@/shared/types';
import { capitalizePokemonName } from '@/shared/constants/kanto-pokemon';

interface UsePokemonActionsOptions {
  releasePokemon: (instanceId: string) => Promise<void>;
}

export function usePokemonActions({
  releasePokemon,
}: UsePokemonActionsOptions) {
  const handleRelease = useCallback(
    (pokemon: CaughtPokemon) => {
      const displayName =
        pokemon.nickname || capitalizePokemonName(pokemon.name);

      Alert.alert(
        'Release Pokémon',
        `Are you sure you want to release ${displayName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Release',
            style: 'destructive',
            onPress: () => releasePokemon(pokemon.instanceId),
          },
        ]
      );
    },
    [releasePokemon]
  );

  return {
    handleRelease,
  };
}
