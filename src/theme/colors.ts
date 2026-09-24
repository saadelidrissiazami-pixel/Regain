// Regain's colours: pale sage by day, night green in dark mode. Each key becomes a
// CSS variable (read by the Tailwind classes) and stays reachable from JS through useTheme().

export type ColorScheme = 'light' | 'dark';

export type Palette = {
  /** The ground behind screens. */
  bg: string;
  /** Cartes, barre d'onglets, feuilles. */
  surface: string;
  /** Texte principal. */
  ink: string;
  /** Texte secondaire. */
  ink2: string;
  /** Tertiary text, captions that are not essential. */
  ink3: string;
  /** The thin border on cards and fields. */
  line: string;
  /** The divider between rows of a list. */
  divider: string;
  /** Primary buttons (dark green). */
  primary: string;
  /** Text and icons sitting on `primary`. */
  onPrimary: string;
  primary900: string;
  primary700: string;
  /** The active accent (a tab, a link, a selection). */
  primary600: string;
  primary500: string;
  sage100: string;
  sage200: string;
  sage300: string;
  blue: string;
  yellow: string;
  orange: string;
  red: string;
  purple: string;
  /** Error text, readable on a light ground. */
  danger: string;
  protein: string;
  carbs: string;
  fat: string;
  /** The Premium card: cream and gold. */
  premium: string;
  premiumInk: string;
  /** The scrim over photos that keeps text readable. */
  scrim: string;
};

export const PALETTES: Record<ColorScheme, Palette> = {
  light: {
    bg: '#F5FAF8',
    surface: '#FFFFFF',
    ink: '#102D27',
    ink2: '#56706A',
    ink3: '#7A8F89',
    line: '#DCE9E5',
    divider: '#E7EFEC',
    primary: '#17483E',
    onPrimary: '#FFFFFF',
    primary900: '#123B33',
    primary700: '#1F6254',
    primary600: '#287B69',
    primary500: '#3C927F',
    sage100: '#E8F4F0',
    sage200: '#D7ECE6',
    sage300: '#C5E3DB',
    blue: '#4D9DE0',
    yellow: '#D5AA35',
    orange: '#E9A23B',
    red: '#D96C6C',
    purple: '#8B78D1',
    danger: '#A8423F',
    protein: '#EAF5F2',
    carbs: '#FFF3DF',
    fat: '#FBE7E7',
    premium: '#FBF1DE',
    premiumInk: '#7A5410',
    scrim: '#F5FAF8',
  },
  dark: {
    bg: '#0B1815',
    surface: '#13241F',
    ink: '#E6F2EE',
    ink2: '#A3BAB3',
    ink3: '#869C96',
    line: '#22382F',
    divider: '#1B2F29',
    primary: '#8FD3BF',
    onPrimary: '#0B1815',
    primary900: '#CFEDE4',
    primary700: '#A6DCCC',
    primary600: '#7CC7B1',
    primary500: '#5FB29B',
    sage100: '#172E27',
    sage200: '#1E3A32',
    sage300: '#27493F',
    blue: '#7AB8EC',
    yellow: '#E2BD55',
    orange: '#F0B259',
    red: '#E58A8A',
    purple: '#A895E6',
    danger: '#F2A09C',
    protein: '#16302A',
    carbs: '#33291A',
    fat: '#35201F',
    premium: '#2C2516',
    premiumInk: '#E7C27A',
    scrim: '#0B1815',
  },
};

/** “#1F7F74” → “31 127 116”, the form rgb(var(--x) / <alpha-value>) expects. */
export function toRgbTriplet(hex: string): string {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)).join(' ');
}

/** `primary600` → `--color-primary-600`, `ink2` → `--color-ink-2`. */
export function variableName(token: keyof Palette): string {
  return `--color-${token.replace(/([A-Z])/g, '-$1').replace(/(\d+)/, '-$1').toLowerCase()}`;
}

/** The palette as CSS variables, for NativeWind's vars(). */
export function themeVariables(palette: Palette): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(palette) as (keyof Palette)[]).map((token) => [variableName(token), toRgbTriplet(palette[token])])
  );
}

/** `#RRGGBB` plus opacity → `rgba(...)`, for scrims and one-off tints. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = toRgbTriplet(hex).split(' ');
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function luminance(hex: string): number {
  const [r, g, b] = toRgbTriplet(hex)
    .split(' ')
    .map((channel) => {
      const c = Number(channel) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The WCAG contrast ratio between two colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
