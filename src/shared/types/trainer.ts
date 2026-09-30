export type TrainerTeam = 'valor' | 'mystic' | 'instinct' | 'none';

export interface TrainerProfile {
  id: string;
  name: string;
  team: TrainerTeam;
  level: number;
  experience: number;
  nextLevelExperience: number;
  stardust: number;
  pokeCoins: number;
  avatarUrl?: string;
  starterPokemonId?: number;
  createdAt: string;
}

export interface TrainerInventory {
  pokeballs: number;
  greatballs: number;
  ultraballs: number;
  razzberries: number;
  nanabberries: number;
  pinapberries: number;
  potions: number;
  revives: number;
}
