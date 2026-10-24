import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { localiseActivity } from '../src/features/activities/catalogue';
import { ACTIVITY_PHOTOS } from '../src/features/activities/photos';

/** The titles the catalogue offers, read from the migrations that insert them. */
function offeredTitles(): string[] {
  return ['0024_activities_first_action', '0031_walks'].flatMap((file) =>
    [...readFileSync(`supabase/migrations/${file}.sql`, 'utf8').matchAll(/^\('((?:''|[^'])+)',/gm)].map((m) =>
      m[1].replace(/''/g, "'")
    )
  );
}

describe('the photograph of an activity', () => {
  const offered = offeredTitles();

  it('reads the catalogue it is checked against', () => {
    expect(offered.length).toBe(48);
  });

  it('is named for every activity the catalogue offers', () => {
    expect(offered.filter((title) => !ACTIVITY_PHOTOS[title])).toEqual([]);
  });

  it('is not named for an activity nobody is offered', () => {
    expect(Object.keys(ACTIVITY_PHOTOS).filter((title) => !offered.includes(title))).toEqual([]);
  });

  it('gives each activity a distinct file, safe to write to disk', () => {
    const slugs = Object.values(ACTIVITY_PHOTOS);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('is found from the stored title, so the translated one cannot lose it', () => {
    // The same shape as the exercise photographs' bug: a key derived from a name that goes
    // through t() misses on a French phone, silently, and every row falls back.
    expect(localiseActivity({ title: 'Bouger sur une chanson' }).photo).toBe('move-to-one-song');
    expect(localiseActivity({ title: 'Marcher une boucle près de chez soi' }).photo).toBe('walk-a-loop-near-home');
  });

  it('is null for a row this build has never heard of', () => {
    // A row added to the catalogue after this build shipped keeps its category picture rather
    // than pointing at a file that is not in the bundle.
    expect(localiseActivity({ title: 'Quelque chose ajouté plus tard' }).photo).toBeNull();
  });

  it('only lists files the manifest can actually require', () => {
    // The manifest is generated from the directory, not from this map, so the app builds at zero
    // photographs exactly as it will at forty-eight. What it must never contain is a key this
    // map does not know: that would be a picture nothing can reach.
    const manifest = readFileSync('src/theme/activityPhotos.ts', 'utf8');
    const keys = [...manifest.matchAll(/^ {2}'([a-z0-9-]+)':/gm)].map((m) => m[1]);
    const known = new Set(Object.values(ACTIVITY_PHOTOS));
    expect(keys.filter((slug) => !known.has(slug))).toEqual([]);
  });
});
