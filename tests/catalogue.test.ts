import { describe, expect, it } from 'vitest';

import { CONTENT_BY_SLUG } from '../src/features/wellbeing/content';
import { contentDuration } from '../src/features/wellbeing/narration';
import { parseSeededCatalogue } from './helpers/catalogue';

// Ajouter une séance demande trois gestes qui doivent s'accorder : écrire son contenu, l'inscrire
// dans CONTENT_BY_SLUG, et l'insérer en base par une migration. Rien ne le vérifiait. Un slug mal
// recopié passait le typage, passait la revue, et ne se manifestait qu'à l'ouverture de la séance.

describe('catalogue bien-être', () => {
  const seeded = parseSeededCatalogue();
  const seededSlugs = seeded.map((program) => program.slug).sort();
  const contentSlugs = Object.keys(CONTENT_BY_SLUG).sort();

  it('lit bien les migrations', () => {
    // Si ce test tombe seul, c'est le parseur qu'il faut corriger, pas le catalogue.
    expect(seeded.length).toBeGreaterThan(0);
    expect(seeded.every((program) => program.category && program.duration_minutes > 0)).toBe(true);
  });

  it('sait jouer toute séance présente en base', () => {
    // C'est le sens qui fait mal. Une ligne en base sans texte dans l'application donne
    // « Séance introuvable » à quelqu'un qui a cliqué dessus, et c'est exactement ce que le
    // build 3 a vécu quand les SOS sont arrivées avant lui.
    expect(seededSlugs.filter((slug) => !CONTENT_BY_SLUG[slug])).toEqual([]);
  });

  it('tolère du texte en avance sur la base', () => {
    // L'autre sens est sans danger : fetchPrograms ne renvoie que ce qu'il sait jouer, donc une
    // séance écrite mais pas encore insérée reste simplement invisible. C'est ce qui permet
    // d'écrire la 1.1 pendant que la 1.0 est en revue.
    const enAvance = contentSlugs.filter((slug) => !seededSlugs.includes(slug));
    expect(enAvance.every((slug) => slug.startsWith('sos-') || slug.startsWith('parcours-'))).toBe(true);
  });

  it('annonce la vraie durée des séances qui se déroulent seules', () => {
    // La pastille « 5′ » de la liste vient de la base ; la durée réelle vient des blocs. Tant que
    // les deux étaient indépendantes, la première était une promesse. Vingt secondes de marge,
    // pas davantage : au-delà, c'est une autre séance qu'on annonce.
    const ecarts = seeded.flatMap((program) => {
      const content = CONTENT_BY_SLUG[program.slug];
      if (!content) return [];
      const reelle = contentDuration(content);
      // `guided` et `grounding` avancent au rythme de la personne : leur durée reste indicative.
      if (reelle === null) return [];
      const annoncee = program.duration_minutes * 60;
      return Math.abs(annoncee - reelle) > 20 ? [{ slug: program.slug, annoncee, reelle }] : [];
    });
    expect(ecarts).toEqual([]);
  });
});
