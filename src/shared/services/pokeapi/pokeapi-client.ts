import {
  Pokemon,
  PokemonListItem,
  PokemonStat,
  PokemonStatName,
  PokemonTypeName,
} from '@/shared/types';
import {
  getArtworkUrl,
  getSpriteUrl,
  getKantoArtworkUrl,
  getKantoSpriteUrl,
  getKantoPokemonById,
} from '@/shared/constants/kanto-pokemon';
import {
  getPokemonMetaById,
  getAllPokemonMeta,
} from '@/shared/services/pokemon-registry';

interface RawPokeApiListItem {
  name: string;
  url: string;
}

interface RawPokeApiListResponse {
  count: number;
  results: RawPokeApiListItem[];
}

function isPokeApiListResponse(
  value: unknown
): value is RawPokeApiListResponse {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.count === 'number' &&
    Array.isArray(obj.results) &&
    obj.results.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.name === 'string' &&
        typeof item.url === 'string'
    )
  );
}

function isPokeApiDetailResponse(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    Array.isArray(obj.types) &&
    Array.isArray(obj.stats)
  );
}

const DEFAULT_POKEAPI_BASE_URL =
  process.env.EXPO_PUBLIC_POKEAPI_URL || 'https://pokeapi.co/api/v2';

export class PokeApiClient {
  private static instance: PokeApiClient | null = null;
  private readonly baseUrl: string;
  private readonly defaultTimeoutMs: number;
  private listCache: PokemonListItem[] | null = null;
  private readonly detailCache = new Map<string | number, Pokemon>();

  public constructor(
    baseUrl = DEFAULT_POKEAPI_BASE_URL,
    timeoutMs = 8000
  ) {
    this.baseUrl = baseUrl;
    this.defaultTimeoutMs = timeoutMs;
  }

  public static getInstance(): PokeApiClient {
    if (!PokeApiClient.instance) {
      PokeApiClient.instance = new PokeApiClient();
    }
    return PokeApiClient.instance;
  }

  private async fetchWithTimeout(
    url: string,
    timeoutMs = this.defaultTimeoutMs,
    signal?: AbortSignal
  ): Promise<Response> {
    if (signal?.aborted) {
      const abortErr = new Error('The operation was aborted');
      abortErr.name = 'AbortError';
      throw abortErr;
    }

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    const onExternalAbort = () => controller.abort();
    signal?.addEventListener('abort', onExternalAbort, { once: true });

    try {
      const response = await fetch(url, { signal: controller.signal });
      return response;
    } finally {
      clearTimeout(id);
      signal?.removeEventListener('abort', onExternalAbort);
    }
  }

  private getKantoFallbackList(): PokemonListItem[] {
    const list = getAllPokemonMeta();
    return list.map((meta) => ({
      id: meta.id,
      name: meta.name,
      url: `${this.baseUrl}/pokemon/${meta.id}/`,
      artwork: getArtworkUrl(meta.id),
    }));
  }

  private parsePokeApiStats(rawStats: any[]): PokemonStat[] {
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

  private parsePokeApiTypes(rawTypes: any[]): PokemonTypeName[] {
    return rawTypes
      .sort((a, b) => a.slot - b.slot)
      .map((t) => t.type.name as PokemonTypeName);
  }

  private async fetchFlavorText(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<string | undefined> {
    try {
      const res = await this.fetchWithTimeout(
        `${this.baseUrl}/pokemon-species/${idOrName}`,
        this.defaultTimeoutMs,
        signal
      );
      if (!res.ok) return undefined;
      const speciesData = await res.json();
      const entry = speciesData.flavor_text_entries?.find(
        (e: any) => e.language?.name === 'en'
      );
      if (!entry?.flavor_text) return undefined;
      return entry.flavor_text
        .replace(/[\f\n\r\t]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch (err: any) {
      if (err?.name === 'AbortError' || signal?.aborted) {
        throw err;
      }
      return undefined;
    }
  }

  public async getPokemonList(
    limit = 386,
    offset = 0,
    signal?: AbortSignal
  ): Promise<PokemonListItem[]> {
    if (this.listCache && limit === 386 && offset === 0) {
      return this.listCache;
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`,
        this.defaultTimeoutMs,
        signal
      );

      if (!response.ok) {
        throw new Error(
          `PokéAPI HTTP error: ${response.status} (${response.statusText || 'Failed to fetch'})`
        );
      }

      const data: unknown = await response.json();
      if (!isPokeApiListResponse(data)) {
        throw new Error('รูปแบบข้อมูลรายการโปเกมอนจาก API ไม่ถูกต้อง (Malformed JSON)');
      }

      const items: PokemonListItem[] = data.results.map(
        (item: { name: string; url: string }, index: number) => {
          const parts = item.url.split('/').filter(Boolean);
          const id =
            parseInt(parts[parts.length - 1], 10) || offset + index + 1;
          return {
            id,
            name: item.name,
            url: item.url,
            artwork: getArtworkUrl(id),
          };
        }
      );

      if (limit === 386 && offset === 0) {
        this.listCache = items;
      }

      return items;
    } catch (error: any) {
      if (error?.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      console.warn(
        '[PokéAPI] Failed to fetch live list, using offline fallback:',
        error
      );
      const fallback = this.getKantoFallbackList().slice(offset, offset + limit);
      if (limit === 386 && offset === 0) {
        this.listCache = fallback;
      }
      return fallback;
    }
  }

  public async getPokemonDetail(
    idOrName: string | number,
    signal?: AbortSignal
  ): Promise<Pokemon> {
    const cacheKey =
      typeof idOrName === 'string' ? idOrName.toLowerCase() : idOrName;

    if (this.detailCache.has(cacheKey)) {
      return this.detailCache.get(cacheKey)!;
    }

    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/pokemon/${idOrName}`,
        this.defaultTimeoutMs,
        signal
      );

      if (!response.ok) {
        throw new Error(
          `PokéAPI Detail error: ${response.status} (${response.statusText || 'Failed to fetch'})`
        );
      }

      const raw: unknown = await response.json();
      if (!isPokeApiDetailResponse(raw)) {
        throw new Error(
          `รูปแบบข้อมูลรายละเอียดโปเกมอน #${idOrName} จาก API ไม่ถูกต้อง`
        );
      }

      const validRaw = raw as any;
      const id = validRaw.id as number;
      const description = await this.fetchFlavorText(id, signal);

      const pokemon: Pokemon = {
        id,
        name: validRaw.name,
        types: this.parsePokeApiTypes(validRaw.types),
        sprite: validRaw.sprites?.front_default || getKantoSpriteUrl(id),
        artwork:
          validRaw.sprites?.other?.['official-artwork']?.front_default ||
          getKantoArtworkUrl(id),
        height: validRaw.height,
        weight: validRaw.weight,
        stats: this.parsePokeApiStats(validRaw.stats),
        description,
      };

      this.detailCache.set(id, pokemon);
      this.detailCache.set(pokemon.name.toLowerCase(), pokemon);

      return pokemon;
    } catch (error: any) {
      if (error?.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      console.warn(
        `[PokéAPI] Failed to fetch detail for ${idOrName}, using local fallback:`,
        error
      );
      const numId =
        typeof idOrName === 'number' ? idOrName : parseInt(idOrName, 10);
      const meta = !isNaN(numId)
        ? getPokemonMetaById(numId) || getKantoPokemonById(numId)
        : undefined;

      const fallbackId = meta ? meta.id : !isNaN(numId) ? numId : 1;
      const fallbackName = meta ? meta.name : String(idOrName);
      const fallbackTypes = meta ? meta.types : (['normal'] as PokemonTypeName[]);

      const fallbackPokemon: Pokemon = {
        id: fallbackId,
        name: fallbackName,
        types: fallbackTypes,
        sprite: getSpriteUrl(fallbackId),
        artwork: getArtworkUrl(fallbackId),
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
        description: 'A wild Pokémon discovered in the Pokémon world.',
      };

      return fallbackPokemon;
    }
  }
}

export const defaultPokeApiClient = PokeApiClient.getInstance();
