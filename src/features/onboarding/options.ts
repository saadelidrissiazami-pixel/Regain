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

/** Sommeil habituel : de 5 h à 10 h, par demi-heure. */
export const SLEEP_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const minutes = 300 + i * 30;
  return { value: minutes, label: formatSleep(minutes) };
});

/** 450 → « 7 h 30 », 480 → « 8 h ». */
export function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, '0')}`;
}
