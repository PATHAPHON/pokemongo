import {
  Pokemon,
  PokemonListItem,
  PokemonStat,
  PokemonStatName,
  PokemonTypeName,
} from '@/types';
import {
  KANTO_POKEMON_LIST,
  getKantoArtworkUrl,
  getKantoSpriteUrl,
  getKantoPokemonById,
} from '@/constants/kanto-pokemon';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const DEFAULT_TIMEOUT_MS = 8000;

// In-memory cache
let listCache: PokemonListItem[] | null = null;
const detailCache = new Map<string | number, Pokemon>();

/**
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Helper to construct fallback PokemonListItem from Kanto metadata
 */
function getKantoFallbackList(): PokemonListItem[] {
  return KANTO_POKEMON_LIST.map((meta) => ({
    id: meta.id,
    name: meta.name,
    url: `${POKEAPI_BASE_URL}/pokemon/${meta.id}/`,
    artwork: getKantoArtworkUrl(meta.id),
  }));
}

/**
 * Fetch Kanto 151 Pokémon list with In-Memory Caching and Offline Fallback
 */
export async function getPokemonList(limit = 151, offset = 0): Promise<PokemonListItem[]> {
  if (listCache && limit === 151 && offset === 0) {
    return listCache;
  }

  try {
    const response = await fetchWithTimeout(
      `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
    );

    if (!response.ok) {
      throw new Error(`PokéAPI HTTP error: ${response.status}`);
    }

    const data = await response.json();
    const items: PokemonListItem[] = data.results.map((item: { name: string; url: string }, index: number) => {
      // Extract Pokémon ID from URL e.g. "https://pokeapi.co/api/v2/pokemon/25/"
      const parts = item.url.split('/').filter(Boolean);
      const id = parseInt(parts[parts.length - 1], 10) || offset + index + 1;
      return {
        id,
        name: item.name,
        url: item.url,
        artwork: getKantoArtworkUrl(id),
      };
    });

    if (limit === 151 && offset === 0) {
      listCache = items;
    }

    return items;
  } catch (error) {
    console.warn('[PokéAPI] Failed to fetch live list, using Kanto offline fallback:', error);
    const fallback = getKantoFallbackList().slice(offset, offset + limit);
    if (limit === 151 && offset === 0) {
      listCache = fallback;
    }
    return fallback;
  }
}

/**
 * Parse raw PokeAPI stats into typed PokemonStat[]
 */
function parsePokeApiStats(rawStats: any[]): PokemonStat[] {
  const statNameMap: Record<string, PokemonStatName> = {
    hp: 'hp',
    attack: 'attack',
    defense: 'defense',
    'special-attack': 'special-attack',
    'special-defense': 'special-defense',
    speed: 'speed',
  };

  return rawStats
    .filter((s) => s.stat?.name in statNameMap)
    .map((s) => ({
      name: statNameMap[s.stat.name],
      baseStat: s.base_stat,
    }));
}

/**
 * Parse raw PokeAPI types into typed PokemonTypeName[]
 */
function parsePokeApiTypes(rawTypes: any[]): PokemonTypeName[] {
  return rawTypes
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name as PokemonTypeName);
}

/**
 * Fetch description / flavor text from pokemon-species endpoint
 */
async function fetchFlavorText(idOrName: string | number): Promise<string | undefined> {
  try {
    const res = await fetchWithTimeout(
      `${POKEAPI_BASE_URL}/pokemon-species/${idOrName}`
    );
    if (!res.ok) return undefined;
    const speciesData = await res.json();
    const entry = speciesData.flavor_text_entries?.find(
      (e: any) => e.language?.name === 'en'
    );
    if (!entry?.flavor_text) return undefined;
    // Replace form-feed and newline characters with clean spaces
    return entry.flavor_text.replace(/[\f\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return undefined;
  }
}

/**
 * Fetch detailed Pokémon data by ID or name with caching & fallback
 */
export async function getPokemonDetail(idOrName: string | number): Promise<Pokemon> {
  const cacheKey = typeof idOrName === 'string' ? idOrName.toLowerCase() : idOrName;

  if (detailCache.has(cacheKey)) {
    return detailCache.get(cacheKey)!;
  }

  try {
    const response = await fetchWithTimeout(
      `${POKEAPI_BASE_URL}/pokemon/${idOrName}`
    );

    if (!response.ok) {
      throw new Error(`PokéAPI Detail error: ${response.status}`);
    }

    const raw = await response.json();
    const id = raw.id as number;
    const description = await fetchFlavorText(id);

    const pokemon: Pokemon = {
      id,
      name: raw.name,
      types: parsePokeApiTypes(raw.types),
      sprite: raw.sprites?.front_default || getKantoSpriteUrl(id),
      artwork:
        raw.sprites?.other?.['official-artwork']?.front_default ||
        getKantoArtworkUrl(id),
      height: raw.height, // decimeters
      weight: raw.weight, // hectograms
      stats: parsePokeApiStats(raw.stats),
      description,
    };

    detailCache.set(id, pokemon);
    detailCache.set(pokemon.name.toLowerCase(), pokemon);

    return pokemon;
  } catch (error) {
    console.warn(`[PokéAPI] Failed to fetch detail for ${idOrName}, using local fallback:`, error);
    const numId = typeof idOrName === 'number' ? idOrName : parseInt(idOrName, 10);
    const meta = !isNaN(numId) ? getKantoPokemonById(numId) : undefined;

    const fallbackId = meta ? meta.id : (!isNaN(numId) ? numId : 1);
    const fallbackName = meta ? meta.name : String(idOrName);
    const fallbackTypes = meta ? meta.types : (['normal'] as PokemonTypeName[]);

    const fallbackPokemon: Pokemon = {
      id: fallbackId,
      name: fallbackName,
      types: fallbackTypes,
      sprite: getKantoSpriteUrl(fallbackId),
      artwork: getKantoArtworkUrl(fallbackId),
      height: 10,
      weight: 100,
      stats: [
        { name: 'hp', baseStat: 50 },
        { name: 'attack', baseStat: 50 },
        { name: 'defense', baseStat: 50 },
        { name: 'special-attack', baseStat: 50 },
        { name: 'special-defense', baseStat: 50 },
        { name: 'speed', baseStat: 50 },
      ],
      description: 'A wild Pokémon discovered in the Kanto region.',
    };

    return fallbackPokemon;
  }
}

/**
 * Clear cached data (useful during refresh or testing)
 */
export function clearPokeApiCache(): void {
  listCache = null;
  detailCache.clear();
}
