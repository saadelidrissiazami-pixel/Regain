import { describe, expect, it } from 'vitest';

import { FREE_PROGRAM_SLUGS, isFreeProgram } from '../src/features/wellbeing/access';
import { contentDuration } from '../src/features/wellbeing/narration';
import { recommendWellbeing } from '../src/features/wellbeing/recommend';
import { CONTENT_BY_SLUG } from '../src/features/wellbeing/content';
import { COURSE_CATEGORY } from '../src/features/wellbeing/courses';
import { SOS_CATEGORY, SOS_SLUGS } from '../src/features/wellbeing/sos';
import { parseFreeSlugsFromMigration, parseSeededCatalogue } from './helpers/catalogue';

describe('the wellbeing library’s free offer', () => {
  const catalogue = parseSeededCatalogue();
  // The library in the strict sense: neither the SOS sessions nor the course days, which have
  // access rules of their own.
  const bibliothequeLibre = FREE_PROGRAM_SLUGS.filter(
    (slug) => !SOS_SLUGS.includes(slug as never) && !slug.startsWith('parcours-')
  );

  it('says the same thing as the migration', () => {
    // Both lists are written by hand, in two languages: this test is what holds them together.
    // Changing one without the other would leave the app and the database disagreeing
    // about who is allowed to open what.
    expect([...bibliothequeLibre].sort()).toEqual(parseFreeSlugsFromMigration().sort());
  });

  it('leaves the SOS sessions free, without exception', () => {
    // Putting content for distress behind a paywall is not defensible. This test is here so
    // nobody can do it by accident while reshuffling the offer.
    expect(SOS_SLUGS.every((slug) => isFreeProgram(slug))).toBe(true);
  });

  it('names only sessions the app knows how to play', () => {
    // We compare against the content, not the database: a session can be written and declared
    // free before it is inserted; the other way round would promise access to nothing.
    expect(FREE_PROGRAM_SLUGS.filter((slug) => !CONTENT_BY_SLUG[slug])).toEqual([]);
  });

  it('repeats no session', () => {
    expect(new Set(FREE_PROGRAM_SLUGS).size).toBe(FREE_PROGRAM_SLUGS.length);
  });

  it('counts 18 free library sessions, 4 SOS and 6 course days', () => {
    expect(bibliothequeLibre).toHaveLength(18);
    expect(FREE_PROGRAM_SLUGS).toHaveLength(28);
  });

  it('opens the first three days of each course', () => {
    for (const parcours of ['parcours-meditation', 'parcours-sommeil']) {
      expect([1, 2, 3].every((day) => isFreeProgram(`${parcours}-j${day}`))).toBe(true);
      expect([4, 10].some((day) => isFreeProgram(`${parcours}-j${day}`))).toBe(false);
    }
  });

  it('reproduces exactly the split that duration used to produce', () => {
    // Proof that moving from a computed rule to a named list took access away from nobody.
    // This is the historical rule from 0021_premium_catalog.sql, kept here as a witness: it is
    // no longer replayed in production.
    const parCategorie = new Map<string, typeof catalogue>();
    for (const program of catalogue.filter(
      (p) => p.category !== SOS_CATEGORY && p.category !== COURSE_CATEGORY
    )) {
      parCategorie.set(program.category, [...(parCategorie.get(program.category) ?? []), program]);
    }
    const attendu = new Set<string>();
    for (const list of parCategorie.values()) {
      [...list]
        .sort((a, b) => a.duration_minutes - b.duration_minutes || a.slug.localeCompare(b.slug))
        .slice(0, 3)
        .forEach((program) => attendu.add(program.slug));
    }
    expect([...bibliothequeLibre].sort()).toEqual([...attendu].sort());
  });

  it('keeps the featured session free', () => {
    expect(isFreeProgram('detachement-regard-autres')).toBe(true);
  });

  it('reserves the longest sessions for Premium', () => {
    expect(isFreeProgram('meditation-scan-corporel')).toBe(false);
    expect(isFreeProgram('sommeil-respiration-endormissement')).toBe(false);
    expect(isFreeProgram('coherence-cardiaque')).toBe(false);
  });

  it('does not know a made-up session', () => {
    expect(isFreeProgram('a-session-that-does-not-exist')).toBe(false);
  });
});

describe('the SOS sessions stay apart', () => {
  const catalogue = parseSeededCatalogue();

  it('are never recommended unprompted', () => {
    // Offering an emergency session to somebody who did not ask is a way of suggesting
    // something is wrong. They are reached for, not suggested.
    const programs = catalogue.map((p, i) => ({
      id: String(i),
      slug: p.slug,
      title: p.slug,
      category: p.category,
      session_count: 1,
      premium_only: !isFreeProgram(p.slug),
      duration_minutes: p.duration_minutes,
      course_slug: null,
      course_day: null,
    }));
    for (const hour of [3, 8, 14, 22]) {
      for (const energy of ['bas', 'moyen', 'eleve'] as const) {
        const reco = recommendWellbeing({ programs, completedIds: new Set(), hour, energy, isPremium: true });
        expect(reco.filter((r) => r.program.category === SOS_CATEGORY)).toEqual([]);
      }
    }
  });

  it('durent toutes deux minutes', () => {
    expect(SOS_SLUGS).toHaveLength(4);
    expect(SOS_SLUGS.every((slug) => contentDuration(CONTENT_BY_SLUG[slug]) === 120)).toBe(true);
  });
});
