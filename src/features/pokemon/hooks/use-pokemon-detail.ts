import { useState, useEffect, useCallback, useRef } from 'react';
import { Pokemon } from '@/shared/types';
import { getPokemonDetail } from '@/shared/services/pokeapi/index';

interface UsePokemonDetailResult {
  pokemon: Pokemon | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function usePokemonDetail(
  idOrName: number | string | undefined
): UsePokemonDetailResult {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadDetail = useCallback(
    async (signal?: AbortSignal) => {
      if (!idOrName) {
        setPokemon(null);
        setIsLoading(false);
        return;
      }

      // Avoid redundant setState if already loading
      setIsLoading((prev) => (prev ? prev : true));
      setError(null);
      try {
        const data = await getPokemonDetail(idOrName, signal);
        if (!signal?.aborted) {
          setPokemon(data);
        }
      } catch (err: any) {
        if (err?.name === 'AbortError' || signal?.aborted) {
          return;
        }
        setError(err?.message || `Failed to load Pokémon #${idOrName}`);
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [idOrName]
  );

  useEffect(() => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    loadDetail(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadDetail]);

  const reload = useCallback(async () => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    await loadDetail(controller.signal);
  }, [loadDetail]);

  return {
    pokemon,
    isLoading,
    error,
    reload,
  };
}
