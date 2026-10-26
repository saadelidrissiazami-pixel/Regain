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

/**
 * Categories where the music starts on its own, with the ambience offered by default.
 *
 * Breathing was left out at first and should not have been: a breathing session is done with the
 * eyes shut like a meditation, and starting it in silence reads as a session that has not begun.
 * The soft pad suits it — a chord that breathes at roughly the pace being asked for.
 */
const AUTO_START: Record<string, AmbienceId> = {
  Sommeil: 'pluie',
  Méditation: 'bol',
  Respiration: 'nappe',
};

const NEVER_AUTO = new Set(['En public']);

/**
 * The two levels the music sits at.
 *
 * It is a background, and a background that competes with a spoken instruction has stopped being
 * one: music is continuous and a voice is not, so a fixed level wins every sentence. The second
 * value is what it drops to while a clip is read — far enough below to leave the words alone,
 * not so far that the session falls silent between them.
 *
 * Both were lowered once the narration existed: 0.35 was chosen when nothing spoke over it.
 */
export const AMBIENCE_VOLUME = 0.22;
export const AMBIENCE_VOLUME_UNDER_VOICE = 0.07;

/**
 * The level the music should be at, right now.
 *
 * A function rather than three lines inside the player, because the two sentences above it were
 * true of the comment and false of the code for months: the ducking was described, never written,
 * and nothing could have noticed. This can be read back.
 */
export function ambienceVolume({
  choice,
  active,
  underVoice,
}: {
  choice: AmbienceChoice;
  active: boolean;
  underVoice: boolean;
}): number {
  if (!active || choice === 'off') return 0;
  return underVoice ? AMBIENCE_VOLUME_UNDER_VOICE : AMBIENCE_VOLUME;
}
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
