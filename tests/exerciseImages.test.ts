import { describe, expect, it } from 'vitest';

import { EXERCISES, IMAGE_KEY_BY_MUSCLE_GROUP, muscleGroupOf, photoSlug } from '../src/features/fitness/exercises';

describe('muscleGroupOf', () => {
  it('finds the group of every exercise in the catalogue', () => {
    for (const exercise of EXERCISES) {
      expect(muscleGroupOf(exercise.name), exercise.name).toBe(exercise.group);
    }
  });

  it('ignores case and surrounding spaces, which a stored name can carry', () => {
    const first = EXERCISES[0];
    expect(muscleGroupOf(`  ${first.name.toUpperCase()} `)).toBe(first.group);
  });

  it('returns null for a name it does not know, rather than guessing a group', () => {
    // The real case: a plan generated in French, read by a catalogue rendered in English. A wrong
    // group would silently put the legs photograph on a shoulder press.
    expect(muscleGroupOf('Squat sauté')).toBeNull();
    expect(muscleGroupOf('')).toBeNull();
  });
});

describe('IMAGE_KEY_BY_MUSCLE_GROUP', () => {
  it('covers every group the catalogue actually uses', () => {
    for (const exercise of EXERCISES) {
      expect(IMAGE_KEY_BY_MUSCLE_GROUP[exercise.group], exercise.group).toBeDefined();
    }
  });
});

describe('photoSlug', () => {
  it('gives every exercise a distinct file name', () => {
    const slugs = EXERCISES.map((exercise) => photoSlug(exercise.name));
    expect(slugs.filter((slug) => slug === null)).toEqual([]);
    expect(new Set(slugs).size).toBe(EXERCISES.length);
  });

  it('is null for a name the catalogue does not know', () => {
    // A renamed exercise loses its photograph rather than keeping the old movement's.
    expect(photoSlug('Squat sauté à une jambe')).toBeNull();
  });

  it('only uses characters that are safe in a file name', () => {
    for (const exercise of EXERCISES) {
      expect(photoSlug(exercise.name), exercise.name).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
