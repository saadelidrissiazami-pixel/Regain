export type MoodOption = { value: number; emoji: string; label: string };

/** Ressenti de fin de séance, comparé à avant : 1 = beaucoup moins bien … 5 = beaucoup mieux. */
export const MOOD_OPTIONS: MoodOption[] = [
  { value: 1, emoji: '😣', label: 'Beaucoup moins bien' },
  { value: 2, emoji: '😕', label: 'Un peu moins bien' },
  { value: 3, emoji: '😐', label: 'Pareil' },
  { value: 4, emoji: '🙂', label: 'Un peu mieux' },
  { value: 5, emoji: '😊', label: 'Beaucoup mieux' },
];

export function moodOption(value: number | null | undefined): MoodOption | null {
  return MOOD_OPTIONS.find((option) => option.value === value) ?? null;
}

const PROMPTS_BY_CATEGORY: Record<string, string[]> = {
  Respiration: [
    "Qu'est-ce qui a changé dans ton corps pendant la séance ?",
    'Où sens-tu encore de la tension ?',
  ],
  Méditation: [
    'Quelles pensées sont revenues le plus souvent ?',
    "Qu'as-tu réussi à laisser passer ?",
  ],
  Journaling: [
    "Qu'est-ce qui occupe le plus ton esprit aujourd'hui ?",
    'Quelle petite chose a été agréable aujourd’hui ?',
  ],
  'Confiance en soi': [
    "Qu'est-ce que tu t'es dit de dur, et que dirais-tu à un ami dans la même situation ?",
    'De quoi es-tu fier aujourd’hui, même de petit ?',
  ],
  Sommeil: [
    "Qu'est-ce qui t'empêche de lâcher prise ce soir ?",
    'Que peux-tu reporter à demain sans risque ?',
  ],
  'En public': [
    "Qu'as-tu remarqué autour de toi, plutôt que sur toi ?",
    "Qu'est-ce qui a été plus facile que prévu ?",
  ],
};

const DEFAULT_PROMPTS = [
  'Comment te sens-tu, là, maintenant ?',
  "Qu'est-ce que tu retiens de cette séance ?",
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
