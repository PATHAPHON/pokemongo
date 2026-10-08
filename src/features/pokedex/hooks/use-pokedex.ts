import { useState, useMemo } from 'react';
import { useTrainer } from '@/shared/context/trainer-context';
import { getAllPokemonMeta } from '@/shared/services/pokemon-registry';
import {
  PokedexEntry,
  PokedexStatusFilter,
  PokedexStats,
} from '../types';

export function usePokedex() {
  const { caughtPokemon, isLoading } = useTrainer();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PokedexStatusFilter>('all');

  // Map caught pokemon by pokemonId -> count
  const caughtStatsMap = useMemo(() => {
    const map = new Map<number, { count: number }>();
    for (const item of caughtPokemon) {
      const existing = map.get(item.pokemonId);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(item.pokemonId, { count: 1 });
      }
    }
    return map;
  }, [caughtPokemon]);

  // Build full registry entries with caught state (Gen 1 only: 1 to 151)
  const allEntries: PokedexEntry[] = useMemo(() => {
    const registryList = getAllPokemonMeta();
    const gen1List = registryList.filter((meta) => meta.id >= 1 && meta.id <= 151);
    return gen1List.map((meta) => {
      const stat = caughtStatsMap.get(meta.id);
      return {
        id: meta.id,
        name: meta.name,
        types: meta.types,
        rarity: meta.rarity,
        isCaught: Boolean(stat && stat.count > 0),
        caughtCount: stat ? stat.count : 0,
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
      // 1. Status filter
      if (statusFilter === 'caught' && !entry.isCaught) {
        return false;
      }
      if (statusFilter === 'uncaught' && entry.isCaught) {
        return false;
      }

      // 2. Search query filter
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
  }, [allEntries, statusFilter, searchQuery]);

  return {
    entries: filteredEntries,
    stats,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  };
}
