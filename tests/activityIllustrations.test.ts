import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { localiseActivity } from '../src/features/activities/catalogue';
import { ACTIVITY_SLUGS } from '../src/features/activities/slugs';

/** The titles the catalogue offers, read from the migrations that insert them. */
function offeredTitles(): string[] {
  return ['0024_activities_first_action', '0031_walks'].flatMap((file) =>
    [...readFileSync(`supabase/migrations/${file}.sql`, 'utf8').matchAll(/^\('((?:''|[^'])+)',/gm)].map((m) =>
      m[1].replace(/''/g, "'")
    )
  );
}

/**
 * The motif names, read as text rather than imported.
 *
 * motifs.tsx pulls in react-native-svg, which does not load in a node environment — and what
 * matters here is the key set, not the drawings. The catalogue is read from SQL for the same
 * reason: the check is about two lists agreeing, not about running either side.
 */
function drawnSlugs(): string[] {
  const source = readFileSync('src/components/illustrations/motifs.tsx', 'utf8');
  return [...source.matchAll(/^ {2}'([a-z0-9-]+)': \(p\)/gm)].map((m) => m[1]);
}

describe("an activity's identifier", () => {
  const offered = offeredTitles();

  it('reads the catalogue it is checked against', () => {
    expect(offered.length).toBe(48);
  });

  it('exists for every activity the catalogue offers', () => {
    expect(offered.filter((title) => !ACTIVITY_SLUGS[title])).toEqual([]);
  });

  it('is not kept for an activity nobody is offered', () => {
    expect(Object.keys(ACTIVITY_SLUGS).filter((title) => !offered.includes(title))).toEqual([]);
  });

  it('is distinct, and readable to someone scanning the list', () => {
    const slugs = Object.values(ACTIVITY_SLUGS);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('is found from the stored title, so the translated one cannot lose it', () => {
    // The same shape as the exercise photographs' bug: a key derived from a name that goes
    // through t() misses on a French phone, silently, and every row falls back.
    expect(localiseActivity({ title: 'Bouger sur une chanson' }).slug).toBe('move-to-one-song');
    expect(localiseActivity({ title: 'Marcher une boucle près de chez soi' }).slug).toBe('walk-a-loop-near-home');
  });

  it('is null for a row this build has never heard of', () => {
    // A row added to the catalogue after this build shipped keeps its category icon rather than
    // pointing at a drawing that does not exist.
    expect(localiseActivity({ title: 'Quelque chose ajouté plus tard' }).slug).toBeNull();
  });
});

describe('the drawing on an activity card', () => {
  const drawn = drawnSlugs();
  const slugs = Object.values(ACTIVITY_SLUGS);

  it('exists for every activity, so no card falls back to an icon', () => {
    expect(slugs.filter((slug) => !drawn.includes(slug))).toEqual([]);
  });

  it('is never drawn for an identifier nothing uses', () => {
    // A typo on either side shows up here, rather than as one card quietly looking different.
    expect(drawn.filter((slug) => !slugs.includes(slug))).toEqual([]);
  });

  it('stays inside the band the wide header does not crop', () => {
    // The detail header shows this 64×64 square at roughly 1.9:1 with `slice`, which keeps only
    // y 16‥48. A coordinate outside that is invisible on that one screen and nowhere else.
    const source = readFileSync('src/components/illustrations/motifs.tsx', 'utf8');
    const body = source.slice(source.indexOf('export const MOTIFS'));
    const offenders = [...body.matchAll(/\b(?:cy|y|y1|y2)=\{(-?\d+(?:\.\d+)?)\}/g)]
      .map((m) => Number(m[1]))
      .filter((y) => y !== 0 && (y < 15 || y > 49));
    expect(offenders).toEqual([]);
  });
});
