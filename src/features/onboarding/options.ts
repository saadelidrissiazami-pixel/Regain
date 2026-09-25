import { t } from '../../lib/i18n';

export const GOAL_OPTIONS = [
  { value: 'reduire_ecrans', label: t('Cut down on screen time') },
  { value: 'plus_energie', label: t('Get my energy back') },
  { value: 'plus_mouvement', label: t('Move more') },
  { value: 'plus_social', label: t('Reconnect with people') },
  { value: 'mieux_dormir', label: t('Sleep better') },
  { value: 'confiance_en_soi', label: t('Build self-confidence') },
  { value: 'gerer_stress', label: t('Handle stress better') },
  { value: 'routine_stable', label: t('Build a steady routine') },
] as const;

export const BUDGET_OPTIONS = [
  { value: 'gratuit', label: t('Free') },
  { value: 'modere', label: t('Moderate') },
  { value: 'confortable', label: t('Comfortable') },
] as const;

export const ENERGY_SLOTS = [
  { key: 'matin', label: t('Morning') },
  { key: 'apres_midi', label: t('Afternoon') },
  { key: 'soir', label: t('Evening') },
] as const;

export const ENERGY_LEVELS = [
  { value: 'bas', label: t('Low') },
  { value: 'moyen', label: t('Medium') },
  { value: 'eleve', label: t('High') },
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
  // French writes “7 h 30”, English “7h 30”, so the shape of the hour belongs in the dictionary.
  return m === 0 ? t('{hours}h', { hours: h }) : t('{hours}h {minutes}', { hours: h, minutes: String(m).padStart(2, '0') });
}
