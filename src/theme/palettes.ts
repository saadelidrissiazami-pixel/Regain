// « Lumière du jour » : la palette de l'app suit le moment de la journée, comme le planning
// suit déjà les créneaux matin / après-midi / soir. Le soir passe en fond sombre.

export type DaySlot = 'matin' | 'apres_midi' | 'soir';

export type Palette = {
  paper: string;
  surface: string;
  ink: string;
  inkSoft: string;
  line: string;
  primary: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  calm: string;
  calmSoft: string;
  /** Haut du dégradé « ciel » des en-têtes. */
  sky: string;
  /** Bas du dégradé « ciel », qui se fond dans le fond de page. */
  skySoft: string;
  /** Barre d'état et fonds sombres : clair le jour, sombre le soir. */
  dark: boolean;
};

export const PALETTES: Record<DaySlot, Palette> = {
  matin: {
    paper: '#FFF8F2',
    surface: '#FFFFFF',
    ink: '#2A1F1A',
    inkSoft: '#7D6357',
    line: '#F2E2D6',
    primary: '#B84E25',
    primarySoft: '#FFE3D3',
    onPrimary: '#FFFFFF',
    accent: '#9A5B14',
    accentSoft: '#FCEACB',
    calm: '#1F7F74',
    calmSoft: '#DCEEEA',
    sky: '#FFC9A8',
    skySoft: '#FFF1E6',
    dark: false,
  },
  apres_midi: {
    paper: '#F4FAF8',
    surface: '#FFFFFF',
    ink: '#15302C',
    inkSoft: '#56736E',
    line: '#DCEBE7',
    primary: '#1F7F74',
    primarySoft: '#D3EEE8',
    onPrimary: '#FFFFFF',
    accent: '#9A5B14',
    accentSoft: '#FCEACB',
    calm: '#1F7F74',
    calmSoft: '#DCEEEA',
    sky: '#B4E3D9',
    skySoft: '#EEF8F5',
    dark: false,
  },
  soir: {
    paper: '#17162B',
    surface: '#242144',
    ink: '#EEEAFB',
    inkSoft: '#A39DC6',
    line: '#353163',
    primary: '#A99BFF',
    primarySoft: '#36306E',
    onPrimary: '#17162B',
    accent: '#F2B85B',
    accentSoft: '#3D3350',
    calm: '#7FD1C4',
    calmSoft: '#1F3B45',
    sky: '#3B3478',
    skySoft: '#1C1A36',
    dark: true,
  },
};

export const SLOT_LABELS: Record<DaySlot, string> = {
  matin: 'Matin',
  apres_midi: 'Après-midi',
  soir: 'Soir',
};

/** Matin de 5 h à midi, après-midi jusqu'à 18 h, soir ensuite (nuit comprise). */
export function slotForHour(hour: number): DaySlot {
  if (hour >= 5 && hour < 12) return 'matin';
  if (hour >= 12 && hour < 18) return 'apres_midi';
  return 'soir';
}

/** « #1F7F74 » → « 31 127 116 », le format attendu par rgb(var(--x) / <alpha-value>). */
export function toRgbTriplet(hex: string): string {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16)).join(' ');
}

const TOKEN_VARIABLES: Record<Exclude<keyof Palette, 'dark'>, string> = {
  paper: '--color-paper',
  surface: '--color-surface',
  ink: '--color-ink',
  inkSoft: '--color-ink-soft',
  line: '--color-line',
  primary: '--color-primary',
  primarySoft: '--color-primary-soft',
  onPrimary: '--color-on-primary',
  accent: '--color-accent',
  accentSoft: '--color-accent-soft',
  calm: '--color-calm',
  calmSoft: '--color-calm-soft',
  sky: '--color-sky',
  skySoft: '--color-sky-soft',
};

/** Variables CSS de la palette, pour vars() de NativeWind. */
export function themeVariables(palette: Palette): Record<string, string> {
  return Object.fromEntries(
    (Object.keys(TOKEN_VARIABLES) as (keyof typeof TOKEN_VARIABLES)[]).map((token) => [
      TOKEN_VARIABLES[token],
      toRgbTriplet(palette[token]),
    ])
  );
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

/** Rapport de contraste WCAG entre deux couleurs (1 à 21). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
