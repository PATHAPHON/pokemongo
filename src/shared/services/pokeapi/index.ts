import { Pokemon } from '@/shared/types';
import { defaultPokeApiClient } from './pokeapi-client';

export * from './pokeapi-client';

export async function getPokemonDetail(
  idOrName: string | number,
  signal?: AbortSignal
): Promise<Pokemon> {
  return defaultPokeApiClient.getPokemonDetail(idOrName, signal);
}
