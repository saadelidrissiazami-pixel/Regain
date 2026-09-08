export const GOAL_OPTIONS = [
  { value: 'reduire_ecrans', label: 'Réduire le temps d’écran' },
  { value: 'plus_energie', label: 'Retrouver de l’énergie' },
  { value: 'plus_mouvement', label: 'Bouger davantage' },
  { value: 'plus_social', label: 'Reconnecter avec les autres' },
  { value: 'mieux_dormir', label: 'Mieux dormir' },
  { value: 'confiance_en_soi', label: 'Développer la confiance en soi' },
  { value: 'gerer_stress', label: 'Mieux gérer le stress' },
  { value: 'routine_stable', label: 'Construire une routine stable' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'gratuit', label: 'Gratuit' },
  { value: 'modere', label: 'Modéré' },
  { value: 'confortable', label: 'Confortable' },
] as const;

export const ENERGY_SLOTS = [
  { key: 'matin', label: 'Matin' },
  { key: 'apres_midi', label: 'Après-midi' },
  { key: 'soir', label: 'Soir' },
] as const;

export const ENERGY_LEVELS = [
  { value: 'bas', label: 'Basse' },
  { value: 'moyen', label: 'Moyenne' },
  { value: 'eleve', label: 'Élevée' },
] as const;
