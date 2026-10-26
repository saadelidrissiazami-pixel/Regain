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
 * How loud the music and the voice are, from one control.
 *
 * There used to be two fixed numbers, chosen by me and judged by nobody: a background that was
 * right for one person's room, one pair of headphones and one hearing. A guided session is
 * listened to in bed, on a train, and at arm's length on a kitchen table — no single pair of
 * numbers is right for all three. Headspace puts a single slider between the two, and that is
 * the shape this takes.
 *
 * 0 is music alone, 1 is voice alone, and the middle is both at the levels that were fixed
 * before: nobody who never touches it hears a change.
 */
export const BALANCE_MIDDLE = 0.5;

/** The loudest the music ever gets, at the far end of the slider. */
const AMBIENCE_CEILING = 0.44;
/** What it sits at in the middle — the level the sessions were mixed at. */
export const AMBIENCE_VOLUME = 0.22;
/** And under a spoken sentence: music is continuous, a voice is not, so a fixed level wins. */
export const AMBIENCE_VOLUME_UNDER_VOICE = 0.07;

const DUCK_RATIO = AMBIENCE_VOLUME_UNDER_VOICE / AMBIENCE_VOLUME;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** The balance, kept inside its range whatever is handed to it. */
export function normaliseBalance(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? clamp01(value) : BALANCE_MIDDLE;
}

/**
 * The voice's level. Full from the middle of the slider onwards, fading only as the slider is
 * pushed all the way towards the music — a voice at half volume under music is not a mix, it is
 * a session you cannot follow.
 */
export function voiceVolume(balance: number): number {
  return clamp01(normaliseBalance(balance) * 2);
}

/** The music's level, lower while a sentence is being read. */
export function ambienceVolume({
  choice,
  active,
  underVoice,
  balance = BALANCE_MIDDLE,
}: {
  choice: AmbienceChoice;
  active: boolean;
  underVoice: boolean;
  balance?: number;
}): number {
  if (!active || choice === 'off') return 0;
  // Linear from the ceiling down to silence, so the middle lands on the level the sessions were
  // mixed at — 0.44 halved — and the far end is genuinely silent rather than merely quiet.
  const level = (1 - normaliseBalance(balance)) * AMBIENCE_CEILING;
  return underVoice ? level * DUCK_RATIO : level;
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
