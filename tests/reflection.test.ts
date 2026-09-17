import { describe, expect, it } from 'vitest';

import {
  averageMood,
  cleanReflections,
  moodOption,
  MOOD_OPTIONS,
  promptsForCategory,
} from '../src/features/wellbeing/reflection';

describe('ressenti de fin de séance', () => {
  it('propose cinq niveaux, du plus difficile au meilleur', () => {
    expect(MOOD_OPTIONS.map((m) => m.value)).toEqual([1, 2, 3, 4, 5]);
    expect(moodOption(4)?.label).toBe('Apaisé');
    expect(moodOption(null)).toBeNull();
    expect(moodOption(9)).toBeNull();
  });

  it('fait la moyenne en ignorant les séances sans ressenti', () => {
    expect(averageMood([5, 4, null, 3])).toBe(4);
    expect(averageMood([4, 5])).toBe(4.5);
    expect(averageMood([])).toBeNull();
    expect(averageMood([null, undefined])).toBeNull();
  });
});

describe('questions de réflexion', () => {
  it('adapte les questions à la catégorie', () => {
    expect(promptsForCategory('Sommeil')[0]).toContain('lâcher prise');
    expect(promptsForCategory('Respiration')).toHaveLength(2);
  });

  it('retombe sur des questions générales pour une catégorie inconnue', () => {
    expect(promptsForCategory('Autre chose')).toEqual(promptsForCategory(undefined));
  });

  it('ne garde que les réponses écrites, sans espaces inutiles', () => {
    expect(
      cleanReflections([
        { prompt: 'A', answer: '  du calme  ' },
        { prompt: 'B', answer: '   ' },
        { prompt: 'C', answer: '' },
      ])
    ).toEqual([{ prompt: 'A', answer: 'du calme' }]);
  });
});
