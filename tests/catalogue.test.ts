import { describe, expect, it } from 'vitest';

import { CONTENT_BY_SLUG } from '../src/features/wellbeing/content';
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

  it('a exactement les mêmes séances en base et dans l application', () => {
    expect(contentSlugs).toEqual(seededSlugs);
  });

  it('nomme les séances manquantes de chaque côté', () => {
    // Redondant avec le test précédent, mais son échec se lit sans comparer deux listes de 37.
    const sansContenu = seededSlugs.filter((slug) => !CONTENT_BY_SLUG[slug]);
    const sansLigneEnBase = contentSlugs.filter((slug) => !seededSlugs.includes(slug));
    expect({ sansContenu, sansLigneEnBase }).toEqual({ sansContenu: [], sansLigneEnBase: [] });
  });

});
