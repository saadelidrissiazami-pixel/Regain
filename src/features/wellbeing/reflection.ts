export type MoodOption = { value: number; emoji: string; label: string };

/** Ressenti de fin de séance : 1 = très difficile … 5 = très bien. */
export const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😣', label: 'Très difficile' },
  { value: 2, emoji: '😕', label: 'Difficile' },
  { value: 3, emoji: '😐', label: 'Neutre' },
  { value: 4, emoji: '🙂', label: 'Apaisé' },
  { value: 5, emoji: '😊', label: 'Très bien' },
];

export function moodOption(value: number | null | undefined): MoodOption | null {
  return MOOD_OPTIONS.find((option) => option.value === value) ?? null;
}

const PROMPTS_BY_CATEGORY: Record<string, string[]> = {
  Respiration: [
    "Qu'est-ce qui a changé dans votre corps pendant la séance ?",
    'Où sentez-vous encore de la tension ?',
  ],
  Méditation: [
    'Quelles pensées sont revenues le plus souvent ?',
    "Qu'avez-vous réussi à laisser passer ?",
  ],
  Journaling: [
    "Qu'est-ce qui occupe le plus votre esprit aujourd'hui ?",
    'Quelle petite chose a été agréable aujourd’hui ?',
  ],
  'Confiance en soi': [
    "Qu'est-ce que vous vous êtes dit de dur, et que diriez-vous à un ami dans la même situation ?",
    'De quoi êtes-vous fier aujourd’hui, même de petit ?',
  ],
  Sommeil: [
    "Qu'est-ce qui vous empêche de lâcher prise ce soir ?",
    'Que pouvez-vous reporter à demain sans risque ?',
  ],
  'En public': [
    "Qu'avez-vous remarqué autour de vous, plutôt que sur vous ?",
    "Qu'est-ce qui a été plus facile que prévu ?",
  ],
};

const DEFAULT_PROMPTS = [
  'Comment vous sentez-vous, là, maintenant ?',
  "Qu'est-ce que vous retenez de cette séance ?",
];

export function promptsForCategory(category: string | undefined): string[] {
  return (category && PROMPTS_BY_CATEGORY[category]) || DEFAULT_PROMPTS;
}

export type Reflection = { prompt: string; answer: string };

/** Ne garde que les questions auxquelles l'utilisateur a répondu. */
export function cleanReflections(answers: Reflection[]): Reflection[] {
  return answers
    .map(({ prompt, answer }) => ({ prompt, answer: answer.trim() }))
    .filter(({ answer }) => answer.length > 0);
}

/** Moyenne des ressentis renseignés, arrondie au dixième (null si aucun). */
export function averageMood(moods: (number | null | undefined)[]): number | null {
  const values = moods.filter((mood): mood is number => typeof mood === 'number');
  if (values.length === 0) return null;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
