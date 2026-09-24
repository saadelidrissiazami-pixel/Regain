import type { ImageSourcePropType } from 'react-native';

import { IMAGE_KEY_BY_MUSCLE_GROUP, muscleGroupOf } from '../features/fitness/exercises';
import type { ImageKey } from './imageKeys';
import type { ActivityCategory } from '../features/planning/types';

// Mood photography (assets/images), generated for Regain in one style: soft light, sage and
// cream. A key missing here shows <Thumbnail>'s fallback gradient instead.

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

/** A photo for a strength session, chosen from its focus (“Legs …”, “Push — …”). */
export function imageForWorkout(focus: string): ImageSourcePropType | undefined {
  const f = focus.toLowerCase();
  if (/leg|squat|glute|lower body/.test(f)) return IMAGES.fitLegs;
  if (/pull|back|biceps|deadlift/.test(f)) return IMAGES.fitPull;
  if (/plank|abs|core|cardio/.test(f)) return IMAGES.fitCore;
  if (/push|chest|shoulder|triceps|upper body/.test(f)) return IMAGES.fitPush;
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

export function imageForExercise(name: string, fallbackFocus?: string): ImageSourcePropType | undefined {
  const group = muscleGroupOf(name);
  if (group) return IMAGES[IMAGE_KEY_BY_MUSCLE_GROUP[group]];
  return fallbackFocus ? imageForWorkout(fallbackFocus) : undefined;
}

export function imageForWellbeing(category: string): ImageSourcePropType | undefined {
  return IMAGES[BY_WELLBEING_CATEGORY[category] ?? 'sessionLake'];
}
