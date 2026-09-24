import { Platform, type TextStyle } from 'react-native';

export type FontWeight = 400 | 500 | 600 | 700 | 800;

const INTER: Record<FontWeight, string> = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
};

/**
 * SF Pro (the system font) on iOS, Inter elsewhere. On iOS the weight goes through fontWeight;
 * with Inter, each weight is a separate family.
 */
export function font(weight: FontWeight = 400): TextStyle {
  if (Platform.OS === 'ios') return { fontFamily: 'System', fontWeight: String(weight) as TextStyle['fontWeight'] };
  return { fontFamily: INTER[weight], fontWeight: 'normal' };
}

type Variant = {
  size: number;
  lineHeight: number;
  weight: FontWeight;
  letterSpacing?: number;
  uppercase?: boolean;
  /** A Dynamic Type ceiling: large titles grow less than running text does. */
  maxScale: number;
};

export const TEXT_VARIANTS = {
  display: { size: 34, lineHeight: 38, weight: 800, letterSpacing: -0.6, maxScale: 1.25 },
  title: { size: 30, lineHeight: 35, weight: 800, letterSpacing: -0.5, maxScale: 1.25 },
  headline: { size: 22, lineHeight: 27, weight: 700, letterSpacing: -0.3, maxScale: 1.35 },
  section: { size: 19, lineHeight: 24, weight: 700, letterSpacing: -0.2, maxScale: 1.4 },
  cardTitle: { size: 17, lineHeight: 22, weight: 700, letterSpacing: -0.1, maxScale: 1.5 },
  bodyStrong: { size: 16, lineHeight: 23, weight: 600, maxScale: 1.6 },
  body: { size: 16, lineHeight: 23, weight: 400, maxScale: 1.6 },
  bodySm: { size: 15, lineHeight: 21, weight: 400, maxScale: 1.6 },
  label: { size: 15, lineHeight: 20, weight: 600, maxScale: 1.5 },
  caption: { size: 13, lineHeight: 18, weight: 500, maxScale: 1.6 },
  overline: { size: 12, lineHeight: 16, weight: 600, letterSpacing: 0.6, uppercase: true, maxScale: 1.5 },
  cta: { size: 16, lineHeight: 20, weight: 700, maxScale: 1.4 },
  metric: { size: 32, lineHeight: 36, weight: 800, letterSpacing: -0.6, maxScale: 1.25 },
} as const satisfies Record<string, Variant>;

export type TextVariant = keyof typeof TEXT_VARIANTS;

export function variantStyle(variant: TextVariant): TextStyle {
  const v: Variant = TEXT_VARIANTS[variant];
  return {
    ...font(v.weight),
    fontSize: v.size,
    lineHeight: v.lineHeight,
    letterSpacing: v.letterSpacing,
    textTransform: v.uppercase ? 'uppercase' : undefined,
  };
}

export function variantMaxScale(variant: TextVariant): number {
  return TEXT_VARIANTS[variant].maxScale;
}

/** Tabular figures: times and counters do not jump about as they change. */
export const TABULAR: TextStyle = { fontVariant: ['tabular-nums'] };
