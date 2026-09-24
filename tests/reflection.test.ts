import { describe, expect, it } from 'vitest';

import {
  averageMood,
  cleanReflections,
  moodOption,
  MOOD_OPTIONS,
  promptsForCategory,
} from '../src/features/wellbeing/reflection';

describe('the rating at the end of a session', () => {
  it('offers five levels, from “much worse” to “much better”', () => {
    expect(MOOD_OPTIONS.map((m) => m.value)).toEqual([1, 2, 3, 4, 5]);
    expect(moodOption(4)?.label).toBe('A little better');
    expect(moodOption(1)?.label).toBe('Much worse');
    expect(moodOption(null)).toBeNull();
    expect(moodOption(9)).toBeNull();
  });

  it('averages while ignoring the sessions with no rating', () => {
    expect(averageMood([5, 4, null, 3])).toBe(4);
    expect(averageMood([4, 5])).toBe(4.5);
    expect(averageMood([])).toBeNull();
    expect(averageMood([null, undefined])).toBeNull();
  });
});

describe('the reflection questions', () => {
  it('suits the questions to the category', () => {
    expect(promptsForCategory('Sommeil')[0]).toContain('letting go');
    expect(promptsForCategory('Respiration')).toHaveLength(2);
  });

  it('falls back to general questions for an unknown category', () => {
    expect(promptsForCategory('Something else')).toEqual(promptsForCategory(undefined));
  });

  it('keeps only the answers that were written, without stray spaces', () => {
    expect(
      cleanReflections([
        { prompt: 'A', answer: '  du calme  ' },
        { prompt: 'B', answer: '   ' },
        { prompt: 'C', answer: '' },
      ])
    ).toEqual([{ prompt: 'A', answer: 'du calme' }]);
  });
});
