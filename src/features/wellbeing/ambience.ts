import { t } from '../../lib/i18n';
// Background music for sessions: four original loops (assets/audio), written for Regain and so
// free of any licence. When they start: automatically for Sleep and Meditation, never for
// “In public” (a surprise sound on a crowded train), and by choice everywhere else.

export type AmbienceId = 'nappe' | 'pluie' | 'vagues' | 'bol';
export type AmbienceChoice = AmbienceId | 'off';

export const AMBIENCES: { id: AmbienceId; label: string; description: string }[] = [
  { id: 'nappe', label: t('Soft pad'), description: t('A chord that breathes slowly') },
  { id: 'pluie', label: t('Light rain'), description: t('A curtain of fine rain') },
  { id: 'vagues', label: t('Waves'), description: t('A slow swell, one wave every ten seconds') },
  { id: 'bol', label: t('Singing bowl'), description: t('One resonance every sixteen seconds') },
];

/** Categories where the music starts on its own, with the ambience offered by default. */
const AUTO_START: Record<string, AmbienceId> = {
  Sommeil: 'pluie',
  Méditation: 'bol',
};

const NEVER_AUTO = new Set(['En public']);

/** The normal volume, and the lowered volume while the voice is speaking. */
export const AMBIENCE_VOLUME = 0.35;
export const AMBIENCE_DUCKED_VOLUME = 0.12;

export function ambienceLabel(choice: AmbienceChoice): string | null {
  return AMBIENCES.find((ambience) => ambience.id === choice)?.label ?? null;
}

/**
 * The ambience at the start of a session.
 * `saved` is the person's last choice: an ambience (reused when the music starts on its own),
 * “off” (they turned the music off, so we do not start it again), or null.
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
