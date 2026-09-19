import type { ImageSourcePropType } from 'react-native';

import type { ActivityCategory } from '../features/planning/types';

// Photos d'ambiance (assets/images), générées pour Regain dans un même style : lumière douce,
// sauge et crème. Une clé absente ici affiche le dégradé de secours de <Thumbnail>.
export type ImageKey =
  | 'wellbeingHero'
  | 'sessionLake'
  | 'meditation'
  | 'sport'
  | 'nature'
  | 'social'
  | 'reading'
  | 'rest'
  | 'fitLegs'
  | 'fitPush'
  | 'fitPull'
  | 'fitCore'
  | 'nutrition';

export const IMAGES: Partial<Record<ImageKey, ImageSourcePropType>> = {
  wellbeingHero: require('../../assets/images/wellbeing-hero.jpg'),
  sessionLake: require('../../assets/images/session-lake.jpg'),
  meditation: require('../../assets/images/meditation.jpg'),
  sport: require('../../assets/images/sport.jpg'),
  nature: require('../../assets/images/nature.jpg'),
  social: require('../../assets/images/social.jpg'),
  reading: require('../../assets/images/reading.jpg'),
  rest: require('../../assets/images/rest.jpg'),
  fitLegs: require('../../assets/images/fit-legs.jpg'),
  fitPush: require('../../assets/images/fit-push.jpg'),
  fitPull: require('../../assets/images/fit-pull.jpg'),
  fitCore: require('../../assets/images/fit-core.jpg'),
  nutrition: require('../../assets/images/nutrition.jpg'),
};

const BY_ACTIVITY_CATEGORY: Record<ActivityCategory, ImageKey> = {
  physique: 'sport',
  outdoor: 'nature',
  indoor: 'reading',
  social: 'social',
  relaxation: 'rest',
  meditation: 'meditation',
  dev_perso: 'reading',
  recuperation: 'rest',
  temps_libre: 'nature',
};

export function imageForActivity(category: ActivityCategory): ImageSourcePropType | undefined {
  return IMAGES[BY_ACTIVITY_CATEGORY[category]];
}

/** Photo d'une séance de musculation selon son intitulé (« Jambes — … », « Poussée — … »). */
export function imageForWorkout(focus: string): ImageSourcePropType | undefined {
  const f = focus.toLowerCase();
  if (/jambe|squat|fessier|bas du corps|inférieur/.test(f)) return IMAGES.fitLegs;
  if (/tirage|dos|biceps|soulevé/.test(f)) return IMAGES.fitPull;
  if (/gainage|abdo|core|cardio/.test(f)) return IMAGES.fitCore;
  if (/poussée|pector|épaule|triceps|haut du corps/.test(f)) return IMAGES.fitPush;
  return IMAGES.fitLegs ?? IMAGES.sport;
}

const BY_WELLBEING_CATEGORY: Record<string, ImageKey> = {
  Respiration: 'sessionLake',
  Méditation: 'meditation',
  Journaling: 'reading',
  'Confiance en soi': 'wellbeingHero',
  Sommeil: 'rest',
  'En public': 'wellbeingHero',
};

export function imageForWellbeing(category: string): ImageSourcePropType | undefined {
  return IMAGES[BY_WELLBEING_CATEGORY[category] ?? 'sessionLake'];
}
