export const GOAL_OPTIONS = [
  { value: 'reduire_ecrans', label: 'Cut down on screen time' },
  { value: 'plus_energie', label: 'Get my energy back' },
  { value: 'plus_mouvement', label: 'Move more' },
  { value: 'plus_social', label: 'Reconnect with people' },
  { value: 'mieux_dormir', label: 'Sleep better' },
  { value: 'confiance_en_soi', label: 'Build self-confidence' },
  { value: 'gerer_stress', label: 'Handle stress better' },
  { value: 'routine_stable', label: 'Build a steady routine' },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'gratuit', label: 'Free' },
  { value: 'modere', label: 'Moderate' },
  { value: 'confortable', label: 'Comfortable' },
] as const;

export const ENERGY_SLOTS = [
  { key: 'matin', label: 'Morning' },
  { key: 'apres_midi', label: 'Afternoon' },
  { key: 'soir', label: 'Evening' },
] as const;

export const ENERGY_LEVELS = [
  { value: 'bas', label: 'Low' },
  { value: 'moyen', label: 'Medium' },
  { value: 'eleve', label: 'High' },
] as const;

/** Usual sleep: 5 h to 10 h, in half-hour steps. */
export const SLEEP_OPTIONS = Array.from({ length: 11 }, (_, i) => {
  const minutes = 300 + i * 30;
  return { value: minutes, label: formatSleep(minutes) };
});

/** 450 → “7h 30”, 480 → “8h”. */
export function formatSleep(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${String(m).padStart(2, '0')}`;
}
