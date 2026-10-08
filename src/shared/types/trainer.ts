export type TrainerTeam = 'valor' | 'mystic' | 'instinct' | 'none';

export interface StudentProfile {
  name: string;
  program: string;
  interests: string[];
  studentId?: string;
  faculty?: string;
  avatarUrl?: string;
}

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
  studentId?: string;
  faculty?: string;
  program?: string;
  interests?: string[];
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
