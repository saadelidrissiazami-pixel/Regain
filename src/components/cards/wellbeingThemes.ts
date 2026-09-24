import type { Palette } from '../../theme/colors';

type Themed = Palette & { dark: boolean };

export type WellbeingTheme = { icon: string; color: (p: Themed) => string; tint: (p: Themed) => string };

/**
 * The wellbeing library's themes: icon and accent colour.
 * The keys are the `category` values as the database stores them — an internal key, never shown.
 * `themeLabel` in features/wellbeing/catalogue turns one into something to read.
 */
export const WELLBEING_THEMES: Record<string, WellbeingTheme> = {
  Respiration: { icon: 'leaf', color: (p) => p.primary600, tint: (p) => p.sage100 },
  Méditation: { icon: 'flower', color: (p) => p.purple, tint: (p) => (p.dark ? p.sage200 : '#F0EDFA') },
  Journaling: { icon: 'create', color: (p) => p.orange, tint: (p) => p.carbs },
  'Confiance en soi': { icon: 'star', color: (p) => p.yellow, tint: (p) => p.carbs },
  Sommeil: { icon: 'moon', color: (p) => p.purple, tint: (p) => (p.dark ? p.sage200 : '#F0EDFA') },
  'En public': { icon: 'headset', color: (p) => p.ink, tint: (p) => p.sage100 },
};

export const WELLBEING_ORDER = Object.keys(WELLBEING_THEMES);

export function wellbeingTheme(category: string): WellbeingTheme {
  return WELLBEING_THEMES[category] ?? { icon: 'sparkles', color: (p) => p.primary600, tint: (p) => p.sage100 };
}
