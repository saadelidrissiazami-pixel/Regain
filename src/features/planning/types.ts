export type ActivityCategory =
  | 'physique'
  | 'outdoor'
  | 'indoor'
  | 'social'
  | 'relaxation'
  | 'meditation'
  | 'dev_perso'
  | 'recuperation'
  | 'temps_libre';

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  physique: 'Exercise',
  outdoor: 'Outdoors',
  indoor: 'At home',
  social: 'Social',
  relaxation: 'Relaxation',
  meditation: 'Meditation',
  dev_perso: 'Personal growth',
  recuperation: 'Recovery',
  temps_libre: 'Free time',
};

// Accent colours (the dot before a category, the bars in tracking): muted, taken from the palette.
export const CATEGORY_COLORS: Record<ActivityCategory, string> = {
  physique: '#E9A23B',
  outdoor: '#3C927F',
  indoor: '#D5AA35',
  social: '#D96C6C',
  relaxation: '#8B78D1',
  meditation: '#4D9DE0',
  dev_perso: '#8B78D1',
  recuperation: '#3C927F',
  temps_libre: '#D5AA35',
};

/** Fallback icon (Ionicons) for an activity with no photo. */
export const CATEGORY_ICONS: Record<ActivityCategory, string> = {
  physique: 'barbell-outline',
  outdoor: 'trail-sign-outline',
  indoor: 'home-outline',
  social: 'people-outline',
  relaxation: 'cafe-outline',
  meditation: 'flower-outline',
  dev_perso: 'book-outline',
  recuperation: 'bed-outline',
  temps_libre: 'sunny-outline',
};
