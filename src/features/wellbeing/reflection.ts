import { t } from '../../lib/i18n';
export type MoodOption = { value: number; emoji: string; label: string };

/** How the session left you, compared with before: 1 = much worse … 5 = much better. */
export const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😣', label: t('Much worse') },
  { value: 2, emoji: '😕', label: t('A little worse') },
  { value: 3, emoji: '😐', label: t('The same') },
  { value: 4, emoji: '🙂', label: t('A little better') },
  { value: 5, emoji: '😊', label: t('Much better') },
];

export function moodOption(value: number | null | undefined): MoodOption | null {
  return MOOD_OPTIONS.find((option) => option.value === value) ?? null;
}

// Keyed by the stored `category`, which is an internal key rather than something to read.
const PROMPTS_BY_CATEGORY: Record<string, string[]> = {
  Respiration: [
    t('What changed in your body during the session?'),
    t('Where can you still feel tension?'),
  ],
  Méditation: [
    t('Which thoughts came back the most?'),
    t('What did you manage to let pass?'),
  ],
  Journaling: [
    t('What is taking up the most room in your mind today?'),
    t('What small thing was good today?'),
  ],
  'Confiance en soi': [
    t('What harsh thing did you say to yourself, and what would you say to a friend in the same spot?'),
    t('What are you pleased with today, however small?'),
  ],
  Sommeil: [
    t('What is stopping you letting go tonight?'),
    t('What can safely wait until tomorrow?'),
  ],
  'En public': [
    t('What did you notice around you, rather than about yourself?'),
    t('What turned out easier than you expected?'),
  ],
};

const DEFAULT_PROMPTS = [
  t('How are you feeling, right now?'),
  t('What are you taking away from this session?'),
];

export function promptsForCategory(category: string | undefined): string[] {
  return (category && PROMPTS_BY_CATEGORY[category]) || DEFAULT_PROMPTS;
}

export type Reflection = { prompt: string; answer: string };

/** Keeps only the questions that were actually answered. */
export function cleanReflections(answers: Reflection[]): Reflection[] {
  return answers
    .map(({ prompt, answer }) => ({ prompt, answer: answer.trim() }))
    .filter(({ answer }) => answer.length > 0);
}

/** The average of the ratings given, to one decimal place (null when there are none). */
export function averageMood(moods: (number | null | undefined)[]): number | null {
  const values = moods.filter((mood): mood is number => typeof mood === 'number');
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
