import { useState, useEffect, useMemo, useCallback } from 'react';
import { PokemonListItem, PokemonTypeName } from '@/types';
import { getPokemonList } from '@/services/pokeapi';
import { getKantoPokemonById } from '@/constants/kanto-pokemon';

export interface EnhancedPokemonListItem extends PokemonListItem {
  types: PokemonTypeName[];
}

export interface UsePokemonsResult {
  pokemons: EnhancedPokemonListItem[];
  filteredPokemons: EnhancedPokemonListItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedType: PokemonTypeName | null;
  setSearchQuery: (query: string) => void;
  setSelectedType: (type: PokemonTypeName | null) => void;
  refetch: () => Promise<void>;
}

export function usePokemons(): UsePokemonsResult {
  const [pokemons, setPokemons] = useState<EnhancedPokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<PokemonTypeName | null>(null);

  const fetchList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await getPokemonList(151, 0);
      const enhanced: EnhancedPokemonListItem[] = items.map((item) => {
        const meta = getKantoPokemonById(item.id);
        return {
          ...item,
          types: meta ? meta.types : ['normal'],
        };
      });
      setPokemons(enhanced);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Pokédex catalog');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const filteredPokemons = useMemo(() => {
    return pokemons.filter((p) => {
      // Name or ID search match
      const query = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        String(p.id).includes(query) ||
        `#${p.id}`.includes(query);

      // Type filter match
      const matchesType = !selectedType || p.types.includes(selectedType);

      return matchesQuery && matchesType;
    });
  }, [pokemons, searchQuery, selectedType]);

  return {
    pokemons,
    filteredPokemons,
    isLoading,
    error,
    searchQuery,
    selectedType,
    setSearchQuery,
    setSelectedType,
    refetch: fetchList,
  };
}
