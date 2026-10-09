/**
 * Pokémon Theme Colors (White & Poké Ball Red with Electric Pikachu Yellow accents).
 * Single theme only; Dark Mode removed per product specification.
 */

export const PokemonPalette = {
  red: '#EE1515',
  crimson: '#DC2626',
  redTint: '#FEF2F2',
  yellow: '#FFCB05',
  amber: '#F59E0B',
  yellowTint: '#FFFBEB',
  white: '#FFFFFF',
  offWhite: '#F8FAFC',
  cardBorder: '#E2E8F0',
  text: '#11181C',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
};

const tintColor = PokemonPalette.red;

export const Colors = {
  light: {
    text: PokemonPalette.text,
    background: PokemonPalette.white,
    tint: tintColor,
    icon: '#687076',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColor,
    card: PokemonPalette.white,
    border: PokemonPalette.cardBorder,
  },
  // Dark mode removed: alias light theme to prevent crashes on legacy lookups
  dark: {
    text: PokemonPalette.text,
    background: PokemonPalette.white,
    tint: tintColor,
    icon: '#687076',
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColor,
    card: PokemonPalette.white,
    border: PokemonPalette.cardBorder,
  },
};

/**
 * Google Fonts: Prompt typography configuration
 */
export const Fonts = {
  light: 'Prompt_300Light',
  regular: 'Prompt_400Regular',
  medium: 'Prompt_500Medium',
  semiBold: 'Prompt_600SemiBold',
  bold: 'Prompt_700Bold',
  extraBold: 'Prompt_800ExtraBold',
  black: 'Prompt_900Black',
  family: 'Prompt_400Regular',
  sans: 'Prompt',
};

/**
 * Helper to map font weights to Prompt font families
 */
export function getFontFamily(weight?: string | number): string {
  switch (weight) {
    case '100':
    case '200':
    case '300':
      return Fonts.light;
    case '400':
    case 'normal':
      return Fonts.regular;
    case '500':
      return Fonts.medium;
    case '600':
      return Fonts.semiBold;
    case '700':
    case 'bold':
      return Fonts.bold;
    case '800':
      return Fonts.extraBold;
    case '900':
      return Fonts.black;
    default:
      return Fonts.regular;
  }
}

/**
 * Typography Scale as defined in design.md § 2.2
 */
export const Typography = {
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: Fonts.extraBold,
    fontWeight: '800' as const,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Fonts.bold,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.regular,
    fontWeight: '400' as const,
  },
  callout: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.medium,
    fontWeight: '500' as const,
  },
  micro: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: Fonts.semiBold,
    fontWeight: '600' as const,
  },
};

export * from './pokemon-theme';
