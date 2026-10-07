import { readFileSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { localiseActivity } from '../src/features/activities/catalogue';
import { bothLanguages, stepsFor, TITLES_WITH_STEPS, type ActivityStep } from '../src/features/activities/steps';

/** What the database holds for a row 0024 inserted: the column defaults to an empty array. */
const NO_STEPS: ActivityStep[] = [];

/**
 * The titles the catalogue actually offers, read from the migrations that insert them.
 *
 * 0024 deactivates everything then inserts its own list; 0031 adds the three walks. Reading the
 * SQL rather than keeping a copy here is what makes this test worth running: an activity added to
 * a migration without steps fails, instead of shipping a detail screen with no “How to do it”.
 */
function offeredTitles(): string[] {
  const titles: string[] = [];
  for (const file of ['0024_activities_first_action', '0031_walks']) {
    const sql = readFileSync(`supabase/migrations/${file}.sql`, 'utf8');
    for (const match of sql.matchAll(/^\('((?:''|[^'])+)',/gm)) titles.push(match[1].replace(/''/g, "'"));
  }
  return titles;
}

describe('the steps of an activity', () => {
  const offered = offeredTitles();

  it('reads the catalogue it is checked against', () => {
    // If the regex ever stops matching the migrations, every assertion below passes vacuously.
    expect(offered.length).toBe(48);
    expect(offered).toContain('Bouger sur une chanson');
    expect(offered).toContain('Marcher une boucle près de chez soi');
  });

  it('exist for every activity the catalogue offers', () => {
    expect(offered.filter((title) => !TITLES_WITH_STEPS.includes(title))).toEqual([]);
  });

  it('are not written for an activity nobody is offered', () => {
    // The other direction: steps left behind by a renamed row are never shown, so they would rot
    // unnoticed. Legacy rows get their wording from catalogue.ts, not steps from here.
    expect(TITLES_WITH_STEPS.filter((title) => !offered.includes(title))).toEqual([]);
  });

  it('say the same number of things in both languages', () => {
    for (const title of TITLES_WITH_STEPS) {
      const entry = bothLanguages(title)!;
      expect(entry.en.length, title).toBe(entry.fr.length);
      expect(entry.fr.length, title).toBeGreaterThanOrEqual(3);
    }
  });

  it('are never half-written', () => {
    for (const title of TITLES_WITH_STEPS) {
      const entry = bothLanguages(title)!;
      for (const [icon, stepTitle, description] of [...entry.fr, ...entry.en]) {
        expect(icon.length, `${title}: icon`).toBeGreaterThan(0);
        // A step title is a handful of words; a description is a sentence. Both exist on purpose,
        // and a step that repeats its own title says nothing the person did not already read.
        expect(stepTitle.trim().length, `${title}: ${stepTitle}`).toBeGreaterThan(2);
        expect(description.trim().length, `${title}: ${stepTitle}`).toBeGreaterThan(20);
        expect(description, `${title}: ${stepTitle}`).not.toBe(stepTitle);
      }
    }
  });

  it('come back in English on an English phone', () => {
    const steps = stepsFor('Bouger sur une chanson')!;
    expect(steps[0].title).toBe('Put the song on');
    expect(stepsFor('Une activité qui n’existe pas')).toBeNull();
  });
});

describe('the extra panel an activity opens', () => {
  it('is found from the stored title, so it survives the language', () => {
    // The bug this locks down is the one the exercise photographs had: the screen matched three
    // arrays of t()'d titles against a database row. Here the English name of the walk is
    // different from the stored one, and the route map has to appear either way.
    const walk = localiseActivity({ title: 'Marcher une boucle près de chez soi' });
    expect(walk.extra).toBe('walking-loop');
    expect(localiseActivity({ title: "Découvrir une rue qu'on ne prend jamais" }).extra).toBe('neighbourhood');
    expect(localiseActivity({ title: 'Lire deux pages' }).extra).toBe('book');
    expect(localiseActivity({ title: 'Préparer quelque chose de chaud' }).extra).toBeNull();
  });

  it('still opens for a plan made before the catalogue changed', () => {
    // 0024 deactivated these, but a week planned before it still points at them.
    expect(localiseActivity({ title: 'Marche rapide 30 min' }).extra).toBe('walking-loop');
    expect(localiseActivity({ title: 'Explorer un nouveau quartier' }).extra).toBe('neighbourhood');
  });
});

describe('an activity read on a French phone', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode: 'fr' }] }));
  });
  afterEach(() => vi.doUnmock('expo-localization'));

  it('keeps its stored wording but gains its steps and its panel', async () => {
    // French rows are already French, so localiseActivity used to return them untouched — which
    // would have meant no steps at all in the language most people read the app in.
    const fr = await import('../src/features/activities/catalogue');
    const walk = fr.localiseActivity({ title: 'Marcher une boucle près de chez soi', steps: NO_STEPS });
    expect(walk.title).toBe('Marcher une boucle près de chez soi');
    expect(walk.extra).toBe('walking-loop');
    expect(walk.steps[0].title).toBe('Laisse l’application proposer la boucle');
  });

  it('overrides the French-only steps the database still holds', async () => {
    // 0012 and 0016 wrote steps as SQL, in French. Where the bundle has its own they win, so the
    // same row reads English in an English build.
    const fr = await import('../src/features/activities/catalogue');
    const fromDatabase = [{ icon: '🚶', title: 'Échauffement', description: 'Marchez à allure normale.' }];
    const walk = fr.localiseActivity({ title: 'Marcher trente minutes en accélérant', steps: fromDatabase });
    expect(walk.steps[0].title).toBe('Cinq minutes tranquilles');
  });
});
