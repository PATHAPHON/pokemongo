import { useState, useMemo } from 'react';
import { useTrainer } from '@/shared/context/trainer-context';
import { getAllPokemonMeta } from '@/shared/services/pokemon-registry';
import {
  PokedexEntry,
  PokedexStatusFilter,
  PokedexGenFilter,
  PokedexStats,
  isPokemonInGen,
} from '../types';

export function usePokedex() {
  const { caughtPokemon, isLoading } = useTrainer();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PokedexStatusFilter>('all');
  const [genFilter, setGenFilter] = useState<PokedexGenFilter>('all');

  // Map caught pokemon by pokemonId -> count and first caught date
  const caughtStatsMap = useMemo(() => {
    const map = new Map<number, { count: number; firstCaughtAt?: string }>();
    for (const item of caughtPokemon) {
      const existing = map.get(item.pokemonId);
      if (existing) {
        existing.count += 1;
        if (
          item.caughtAt &&
          (!existing.firstCaughtAt || item.caughtAt < existing.firstCaughtAt)
        ) {
          existing.firstCaughtAt = item.caughtAt;
        }
      } else {
        map.set(item.pokemonId, {
          count: 1,
          firstCaughtAt: item.caughtAt,
        });
      }
    }
    return map;
  }, [caughtPokemon]);

  // Build full registry entries with caught state
  const allEntries: PokedexEntry[] = useMemo(() => {
    const registryList = getAllPokemonMeta();
    return registryList.map((meta) => {
      const stat = caughtStatsMap.get(meta.id);
      return {
        id: meta.id,
        name: meta.name,
        types: meta.types,
        rarity: meta.rarity,
        bst: meta.bst,
        isCaught: Boolean(stat && stat.count > 0),
        caughtCount: stat ? stat.count : 0,
        firstCaughtAt: stat?.firstCaughtAt,
      };
    });
  }, [caughtStatsMap]);

  // Overall statistics
  const stats: PokedexStats = useMemo(() => {
    const total = allEntries.length;
    const caught = allEntries.filter((e) => e.isCaught).length;
    const uncaught = total - caught;
    const percentage = total > 0 ? (caught / total) * 100 : 0;
    return {
      total,
      caught,
      uncaught,
      percentage,
    };
  }, [allEntries]);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase().replace(/^#/, '');

    return allEntries.filter((entry) => {
      // 1. Generation filter
      if (!isPokemonInGen(entry.id, genFilter)) {
        return false;
      }

      // 2. Status filter
      if (statusFilter === 'caught' && !entry.isCaught) {
        return false;
      }
      if (statusFilter === 'uncaught' && entry.isCaught) {
        return false;
      }

      // 3. Search query filter
      if (query.length > 0) {
        const matchesName = entry.name.toLowerCase().includes(query);
        const matchesId = String(entry.id).includes(query);
        const matchesPaddedId = String(entry.id)
          .padStart(3, '0')
          .includes(query);
        if (!matchesName && !matchesId && !matchesPaddedId) {
          return false;
        }
      }

      return true;
    });
  }, [allEntries, genFilter, statusFilter, searchQuery]);

  return {
    entries: filteredEntries,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    genFilter,
    setGenFilter,
  };
}
