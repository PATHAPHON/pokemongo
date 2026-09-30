import { PokemonRarity, PokemonTypeName } from '@/shared/types';

export const PokemonRarityColors: Record<
  PokemonRarity,
  { primary: string; background: string; text: string; badgeBg: string }
> = {
  common: {
    primary: '#64748B',
    background: '#F1F5F9',
    badgeBg: 'rgba(100, 116, 139, 0.2)',
    text: '#334155',
  },
  rare: {
    primary: '#3B82F6',
    background: '#EFF6FF',
    badgeBg: 'rgba(59, 130, 246, 0.22)',
    text: '#1D4ED8',
  },
  ultra_rare: {
    primary: '#F59E0B',
    background: '#FFFBEB',
    badgeBg: 'rgba(245, 158, 11, 0.25)',
    text: '#B45309',
  },
};

export const PokemonTypeColors: Record<
  PokemonTypeName,
  { primary: string; background: string; text: string }
> = {
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
