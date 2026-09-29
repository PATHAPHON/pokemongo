/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        pokemon: {
          normal: '#A8A878',
          fire: '#EE8130',
          water: '#6390F0',
          grass: '#7AC74C',
          electric: '#F7D02C',
          ice: '#96D9D6',
          fighting: '#C22E28',
          poison: '#A33EA1',
          ground: '#E2BF65',
          flying: '#A98FF3',
          psychic: '#F95587',
          bug: '#A6B91A',
          rock: '#B6A136',
          ghost: '#735797',
          dragon: '#6F35FC',
          steel: '#B7B7CE',
          fairy: '#D685AD',
          dark: '#705746',
        },
        team: {
          valor: '#FF3B30',
          mystic: '#007AFF',
          instinct: '#FFCC00',
          none: '#8E8E93',
        },
        stat: {
          hp: '#48D0B0',
          attack: '#FB6C6C',
          defense: '#76BDFE',
          'special-attack': '#F85888',
          'special-defense': '#A890F0',
          speed: '#F5AC78',
        },
        rating: {
          excellent: '#34C759',
          great: '#007AFF',
          nice: '#FF9500',
          miss: '#FF3B30',
        },
      },
    },
  },
  plugins: [],
};
