export const FITNESS_GOALS = [
  { value: 'bien_etre', label: 'General wellbeing' },
  { value: 'perte_poids', label: 'Lose weight' },
  { value: 'salle', label: 'Get to the gym regularly' },
  { value: 'prise_masse', label: 'Build muscle' },
  { value: 'tonifier', label: 'Tone up' },
  { value: 'endurance', label: 'Improve my endurance' },
] as const;

export const SEX_OPTIONS = [
  { value: 'femme', label: 'Female' },
  { value: 'homme', label: 'Male' },
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'sedentaire', label: 'Sedentary', hint: 'Desk work, not much walking' },
  { value: 'leger', label: 'Lightly active', hint: '1 to 3 sessions a week' },
  { value: 'modere', label: 'Moderately active', hint: '3 to 5 sessions a week' },
  { value: 'actif', label: 'Very active', hint: '6 to 7 sessions, or a physical job' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'debutant', label: 'Beginner' },
  { value: 'intermediaire', label: 'Intermediate' },
  { value: 'confirme', label: 'Advanced' },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: 'salle', label: 'A gym' },
  { value: 'halteres_maison', label: 'Dumbbells at home' },
  { value: 'poids_du_corps', label: 'Bodyweight only' },
] as const;

export const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarien', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarien', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number]['value'];
export type Sex = (typeof SEX_OPTIONS)[number]['value'];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['value'];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['value'];
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number]['value'];
export type Diet = (typeof DIET_OPTIONS)[number]['value'];
