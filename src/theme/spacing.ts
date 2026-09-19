/** Grille de 4 px. `screen` = marge latérale des écrans, `section` = écart entre grandes sections. */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
  screen: 20,
  section: 28,
  card: 18,
} as const;

/** Taille minimale d'une cible tactile (Apple HIG). */
export const MIN_TOUCH = 44;
