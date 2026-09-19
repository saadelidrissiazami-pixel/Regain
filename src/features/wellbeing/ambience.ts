// Musiques d'ambiance des séances : quatre boucles originales (assets/audio), composées pour
// Regain et donc libres de droit. Règles de lancement : automatique en Sommeil et Méditation,
// jamais en « En public » (un son surprise dans les transports), au choix ailleurs.

export type AmbienceId = 'nappe' | 'pluie' | 'vagues' | 'bol';
export type AmbienceChoice = AmbienceId | 'off';

export const AMBIENCES: { id: AmbienceId; label: string; description: string }[] = [
  { id: 'nappe', label: 'Nappe douce', description: 'Un accord qui respire lentement' },
  { id: 'pluie', label: 'Pluie légère', description: 'Un rideau de pluie fine' },
  { id: 'vagues', label: 'Vagues', description: 'Une houle lente, une vague toutes les dix secondes' },
  { id: 'bol', label: 'Bol chantant', description: 'Une résonance toutes les seize secondes' },
];

/** Catégories où la musique démarre d'elle-même, avec l'ambiance proposée par défaut. */
const AUTO_START: Record<string, AmbienceId> = {
  Sommeil: 'pluie',
  Méditation: 'bol',
};

const NEVER_AUTO = new Set(['En public']);

/** Volume de base, et volume abaissé pendant que la voix guide. */
export const AMBIENCE_VOLUME = 0.35;
export const AMBIENCE_DUCKED_VOLUME = 0.12;

export function ambienceLabel(choice: AmbienceChoice): string | null {
  return AMBIENCES.find((ambience) => ambience.id === choice)?.label ?? null;
}

/**
 * Ambiance au début d'une séance.
 * `saved` est le dernier choix de la personne : une ambiance (qu'on réutilise quand la musique
 * démarre d'elle-même), « off » (elle a coupé la musique : on ne la relance plus), ou null.
 */
export function initialAmbience(category: string, saved: AmbienceChoice | null): AmbienceChoice {
  if (NEVER_AUTO.has(category)) return 'off';
  if (saved === 'off') return 'off';
  const auto = AUTO_START[category];
  if (!auto) return 'off';
  return saved ?? auto;
}

export function isAmbienceChoice(value: unknown): value is AmbienceChoice {
  return value === 'off' || AMBIENCES.some((ambience) => ambience.id === value);
}
