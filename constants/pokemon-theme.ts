import { PokemonStatName, PokemonTypeName, TrainerTeam } from '@/types';

export const PokemonTypeColors: Record<PokemonTypeName, { primary: string; background: string; text: string }> = {
  normal: { primary: '#A8A878', background: '#C6C6A7', text: '#FFFFFF' },
  fire: { primary: '#EE8130', background: '#F5AC78', text: '#FFFFFF' },
  water: { primary: '#6390F0', background: '#9DB7F5', text: '#FFFFFF' },
  grass: { primary: '#7AC74C', background: '#A7DB8D', text: '#FFFFFF' },
  electric: { primary: '#F7D02C', background: '#FAE078', text: '#1E1E1E' },
  ice: { primary: '#96D9D6', background: '#BCE6E6', text: '#1E1E1E' },
  fighting: { primary: '#C22E28', background: '#D67873', text: '#FFFFFF' },
  poison: { primary: '#A33EA1', background: '#C183C1', text: '#FFFFFF' },
  ground: { primary: '#E2BF65', background: '#EBD69D', text: '#1E1E1E' },
  flying: { primary: '#A98FF3', background: '#C6B7F5', text: '#FFFFFF' },
  psychic: { primary: '#F95587', background: '#FA92B2', text: '#FFFFFF' },
  bug: { primary: '#A6B91A', background: '#C6D16E', text: '#FFFFFF' },
  rock: { primary: '#B6A136', background: '#D1C17D', text: '#FFFFFF' },
  ghost: { primary: '#735797', background: '#A292BC', text: '#FFFFFF' },
  dragon: { primary: '#6F35FC', background: '#A27DFA', text: '#FFFFFF' },
  steel: { primary: '#B7B7CE', background: '#D1D1E0', text: '#1E1E1E' },
  fairy: { primary: '#D685AD', background: '#F4BDC9', text: '#FFFFFF' },
  dark: { primary: '#705746', background: '#A29288', text: '#FFFFFF' },
};

export const TeamColors: Record<TrainerTeam, { primary: string; secondary: string; name: string }> = {
  valor: { primary: '#FF3B30', secondary: '#FFE5E5', name: 'Team Valor' },
  mystic: { primary: '#007AFF', secondary: '#E5F2FF', name: 'Team Mystic' },
  instinct: { primary: '#FFCC00', secondary: '#FFF9E5', name: 'Team Instinct' },
  none: { primary: '#8E8E93', secondary: '#F2F2F7', name: 'No Team' },
};

export const StatColors: Record<PokemonStatName, string> = {
  hp: '#48D0B0',
  attack: '#FB6C6C',
  defense: '#76BDFE',
  'special-attack': '#F85888',
  'special-defense': '#A890F0',
  speed: '#F5AC78',
};

export const ThrowRatingColors = {
  excellent: '#34C759',
  great: '#007AFF',
  nice: '#FF9500',
  miss: '#FF3B30',
};
