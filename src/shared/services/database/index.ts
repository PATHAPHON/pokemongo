import * as SQLite from 'expo-sqlite';
import { CaughtPokemon, TrainerInventory, TrainerProfile } from '@/shared/types';
import { DatabaseManager } from './database-manager';
import { PokemonRepository } from './pokemon-repository';
import { TrainerRepository } from './trainer-repository';
import { InventoryRepository } from './inventory-repository';
import { EventRepository } from './event-repository';

export * from './database-manager';
export * from './pokemon-repository';
export * from './trainer-repository';
export * from './inventory-repository';
export * from './event-repository';

// Default Singleton Instances
export const defaultDbManager = DatabaseManager.getInstance();
export const defaultPokemonRepository = new PokemonRepository(defaultDbManager);
export const defaultTrainerRepository = new TrainerRepository(defaultDbManager);
export const defaultInventoryRepository = new InventoryRepository(defaultDbManager);
export const defaultEventRepository = new EventRepository(defaultDbManager);

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return defaultDbManager.getDatabase();
}

export async function getAllCaughtPokemon(userId?: string): Promise<CaughtPokemon[]> {
  return defaultPokemonRepository.getAll(userId);
}

export async function insertCaughtPokemon(
  pokemon: CaughtPokemon,
  userId?: string
): Promise<void> {
  return defaultPokemonRepository.insert(pokemon, userId);
}

export async function deleteCaughtPokemon(instanceId: string): Promise<void> {
  return defaultPokemonRepository.delete(instanceId);
}

export async function getTrainerInventory(): Promise<TrainerInventory> {
  return defaultInventoryRepository.getInventory();
}

export async function getStoredTrainerProfile(
  trainerId?: string
): Promise<TrainerProfile | null> {
  return defaultTrainerRepository.getProfile(trainerId);
}

export async function saveStoredTrainerProfile(profile: TrainerProfile): Promise<void> {
  return defaultTrainerRepository.saveProfile(profile);
}
