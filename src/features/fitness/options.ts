export const FITNESS_GOALS = [
  { value: 'bien_etre', label: 'Bien-être général' },
  { value: 'perte_poids', label: 'Perdre du poids' },
  { value: 'salle', label: 'Aller à la salle régulièrement' },
  { value: 'prise_masse', label: 'Prendre de la masse' },
  { value: 'tonifier', label: 'Me tonifier' },
  { value: 'endurance', label: 'Améliorer mon endurance' },
] as const;

export const SEX_OPTIONS = [
  { value: 'femme', label: 'Femme' },
  { value: 'homme', label: 'Homme' },
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'sedentaire', label: 'Sédentaire', hint: 'Travail assis, peu de marche' },
  { value: 'leger', label: 'Légèrement actif', hint: '1 à 3 séances par semaine' },
  { value: 'modere', label: 'Modérément actif', hint: '3 à 5 séances par semaine' },
  { value: 'actif', label: 'Très actif', hint: '6 à 7 séances ou métier physique' },
] as const;

export const EXPERIENCE_LEVELS = [
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'confirme', label: 'Confirmé' },
] as const;

export const EQUIPMENT_OPTIONS = [
  { value: 'salle', label: 'Salle de sport' },
  { value: 'halteres_maison', label: 'Haltères à la maison' },
  { value: 'poids_du_corps', label: 'Poids du corps uniquement' },
] as const;

export const DIET_OPTIONS = [
  { value: 'omnivore', label: 'Omnivore' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescetarien', label: 'Pescétarien' },
  { value: 'halal', label: 'Halal' },
] as const;

export type FitnessGoal = (typeof FITNESS_GOALS)[number]['value'];
export type Sex = (typeof SEX_OPTIONS)[number]['value'];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['value'];
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number]['value'];
export type Equipment = (typeof EQUIPMENT_OPTIONS)[number]['value'];
export type Diet = (typeof DIET_OPTIONS)[number]['value'];
