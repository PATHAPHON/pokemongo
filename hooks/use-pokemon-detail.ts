import { useState, useEffect, useCallback } from 'react';
import { Pokemon } from '@/types';
import { getPokemonDetail } from '@/services/pokeapi';

export interface UsePokemonDetailResult {
  pokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function usePokemonDetail(idOrName: number | string | undefined): UsePokemonDetailResult {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!idOrName) {
      setPokemon(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await getPokemonDetail(idOrName);
      setPokemon(data);
    } catch (err: any) {
      setError(err?.message || `Failed to load Pokémon #${idOrName}`);
    } finally {
      setIsLoading(false);
    }
  }, [idOrName]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return {
    pokemon,
    isLoading,
    error,
    reload: loadDetail,
  };
}
