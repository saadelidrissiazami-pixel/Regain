import { describe, expect, it } from 'vitest';

import { CONTENT_BY_SLUG } from '../src/features/wellbeing/content';
import { contentDuration } from '../src/features/wellbeing/narration';
import { parseSeededCatalogue } from './helpers/catalogue';

// Adding a session takes three steps that have to agree: writing its content, listing it in
// CONTENT_BY_SLUG, and inserting it into the database by a migration. Nothing checked that. A
// mistyped slug passed the types, passed review, and only showed up when the session was opened.

describe('the wellbeing catalogue', () => {
  const seeded = parseSeededCatalogue();
  const seededSlugs = seeded.map((program) => program.slug).sort();
  const contentSlugs = Object.keys(CONTENT_BY_SLUG).sort();

  it('lit bien les migrations', () => {
    // Si ce test tombe seul, c'est le parseur qu'il faut corriger, pas le catalogue.
    expect(seeded.length).toBeGreaterThan(0);
    expect(seeded.every((program) => program.category && program.duration_minutes > 0)).toBe(true);
  });

  it('knows how to play every session in the database', () => {
    // C'est le sens qui fait mal. Une ligne en base sans texte dans l'application donne
    // “Session not found” to somebody who tapped on it, which is exactly what build 3 lived
    // through when the SOS sessions arrived before it did.
    expect(seededSlugs.filter((slug) => !CONTENT_BY_SLUG[slug])).toEqual([]);
  });

  it('tolerates text that runs ahead of the database', () => {
    // L'autre sens est sans danger : fetchPrograms ne renvoie que ce qu'il sait jouer, donc une
    // a session written but not yet inserted simply stays invisible. That is what makes it
    // possible to write 1.1 while 1.0 is in review.
    const enAvance = contentSlugs.filter((slug) => !seededSlugs.includes(slug));
    expect(enAvance.every((slug) => slug.startsWith('sos-') || slug.startsWith('parcours-'))).toBe(true);
  });

  it('states the real length of the sessions that run on their own', () => {
    // The “5′” badge in the list comes from the database; the real length comes from the blocks.
    // While the two were independent, the first was a promise. Twenty seconds of margin, no
    // more than that: beyond it, you are announcing a different session.
    const ecarts = seeded.flatMap((program) => {
      const content = CONTENT_BY_SLUG[program.slug];
      if (!content) return [];
      const reelle = contentDuration(content);
      // `guided` and `grounding` move at the person's pace, so their length stays indicative.
      if (reelle === null) return [];
      const annoncee = program.duration_minutes * 60;
      return Math.abs(annoncee - reelle) > 20 ? [{ slug: program.slug, annoncee, reelle }] : [];
    });
    expect(ecarts).toEqual([]);
  });
});
