import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { bothLanguages, cuesFor, SLUGS_WITH_CUES } from '../src/features/fitness/exerciseCues';
import { EXERCISES } from '../src/features/fitness/exercises';

describe('the execution cues of an exercise', () => {
  it('exist for every exercise in the catalogue', () => {
    expect(EXERCISES.filter((e) => !SLUGS_WITH_CUES.includes(e.slug)).map((e) => e.slug)).toEqual([]);
  });

  it('are not written for an exercise nobody is given', () => {
    const catalogue = new Set(EXERCISES.map((e) => e.slug));
    expect(SLUGS_WITH_CUES.filter((slug) => !catalogue.has(slug))).toEqual([]);
  });

  it('say three things in both languages, and never the same thing twice', () => {
    for (const slug of SLUGS_WITH_CUES) {
      const entry = bothLanguages(slug)!;
      expect(entry.fr.length, slug).toBe(3);
      expect(entry.en.length, slug).toBe(3);
      for (const cue of [...entry.fr, ...entry.en]) {
        expect(cue.trim().length, `${slug}: "${cue}"`).toBeGreaterThan(25);
      }
      // A setup line repeated as the execution line is a copy-paste, not a cue.
      expect(new Set(entry.fr).size, slug).toBe(3);
      expect(new Set(entry.en).size, slug).toBe(3);
    }
  });

  it('are not shared between two exercises', () => {
    // Fifty-six entries written by hand: the same paragraph landing on two movements is the
    // mistake to expect, and it is the one that teaches somebody the wrong thing.
    const all = SLUGS_WITH_CUES.map((slug) => bothLanguages(slug)!.fr[1]);
    expect(new Set(all).size).toBe(all.length);
  });

  it('comes back in English on an English phone', () => {
    expect(cuesFor('plank')!.setup).toMatch(/Forearms on the floor/);
    expect(cuesFor('un-exercice-qui-nexiste-pas')).toBeNull();
  });
});

describe('the cues on a French phone', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'fr' }] }));
  });
  afterEach(() => vi.doUnmock('expo-localization'));

  it('are found by slug, so the translated name cannot lose them', () => {
    // The bug this locks down is the photographs': a key derived from a name that goes through
    // t() misses every time the phone is French, and nothing fails — it just goes quiet.
    return import('../src/features/fitness/exerciseCues').then(async (fr) => {
      const catalogue = await import('../src/features/fitness/exercises');
      for (const exercise of catalogue.EXERCISES) {
        expect(fr.cuesFor(exercise.slug), exercise.slug).not.toBeNull();
      }
      expect(fr.cuesFor('plank')!.setup).toMatch(/Avant-bras au sol/);
    });
  });
});
