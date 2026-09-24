import { t } from '../../lib/i18n';
export const FITNESS_GOALS = [
  { value: 'bien_etre', label: t('General wellbeing') },
  { value: 'perte_poids', label: t('Lose weight') },
  { value: 'salle', label: t('Get to the gym regularly') },
  { value: 'prise_masse', label: t('Build muscle') },
  { value: 'tonifier', label: t('Tone up') },
  { value: 'endurance', label: t('Improve my endurance') },
] as const;

export const SEX_OPTIONS = [
  { value: 'femme', label: t('Female') },
  { value: 'homme', label: t('Male') },
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'sedentaire', label: t('Sedentary'), hint: t('Desk work, not much walking') },
  { value: 'leger', label: t('Lightly active'), hint: t('1 to 3 sessions a week') },
  { value: 'modere', label: t('Moderately active'), hint: t('3 to 5 sessions a week') },
  { value: 'actif', label: t('Very active'), hint: t('6 to 7 sessions, or a physical job') },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'debutant', label: t('Beginner') },
  { value: 'intermediaire', label: t('Intermediate') },
  { value: 'confirme', label: t('Advanced') },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: 'salle', label: t('A gym') },
  { value: 'halteres_maison', label: t('Dumbbells at home') },
  { value: 'poids_du_corps', label: t('Bodyweight only') },
] as const;

export const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarien', label: t('Vegetarian') },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarien', label: t('Pescatarian') },
  { value: 'halal', label: 'Halal' },
] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number]['value'];
export type Sex = (typeof SEX_OPTIONS)[number]['value'];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['value'];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['value'];
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number]['value'];
export type Diet = (typeof DIET_OPTIONS)[number]['value'];
