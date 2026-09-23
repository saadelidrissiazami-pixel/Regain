import { describe, expect, it } from 'vitest';

import { FREE_PROGRAM_SLUGS, isFreeProgram } from '../src/features/wellbeing/access';
import { parseFreeSlugsFromMigration, parseSeededCatalogue } from './helpers/catalogue';

describe('offre gratuite de la bibliothèque bien-être', () => {
  const catalogue = parseSeededCatalogue();
  const slugs = new Set(catalogue.map((program) => program.slug));

  it('dit la même chose que la migration', () => {
    // Les deux listes sont écrites à la main, dans deux langages : c'est ce test qui les tient
    // ensemble. Modifier l'une sans l'autre donnerait une application et une base en désaccord
    // sur qui a le droit d'ouvrir quoi.
    expect([...FREE_PROGRAM_SLUGS].sort()).toEqual(parseFreeSlugsFromMigration().sort());
  });

  it('ne nomme que des séances qui existent', () => {
    expect(FREE_PROGRAM_SLUGS.filter((slug) => !slugs.has(slug))).toEqual([]);
  });

  it('ne répète aucune séance', () => {
    expect(new Set(FREE_PROGRAM_SLUGS).size).toBe(FREE_PROGRAM_SLUGS.length);
  });

  it('laisse 18 séances sur 37 en accès libre', () => {
    expect(catalogue).toHaveLength(37);
    expect(FREE_PROGRAM_SLUGS).toHaveLength(18);
  });

  it('reprend exactement la répartition que la durée produisait', () => {
    // Preuve que le passage d'une règle calculée à une liste nommée n'a retiré l'accès à
    // personne. Ceci est la règle historique de 0021_premium_catalog.sql, conservée ici comme
    // témoin : on ne la rejoue plus en production.
    const parCategorie = new Map<string, typeof catalogue>();
    for (const program of catalogue) {
      parCategorie.set(program.category, [...(parCategorie.get(program.category) ?? []), program]);
    }
    const attendu = new Set<string>();
    for (const list of parCategorie.values()) {
      [...list]
        .sort((a, b) => a.duration_minutes - b.duration_minutes || a.slug.localeCompare(b.slug))
        .slice(0, 3)
        .forEach((program) => attendu.add(program.slug));
    }
    expect([...FREE_PROGRAM_SLUGS].sort()).toEqual([...attendu].sort());
  });

  it('garde gratuite la séance mise en avant', () => {
    expect(isFreeProgram('detachement-regard-autres')).toBe(true);
  });

  it('réserve les séances les plus longues à Premium', () => {
    expect(isFreeProgram('meditation-scan-corporel')).toBe(false);
    expect(isFreeProgram('sommeil-respiration-endormissement')).toBe(false);
    expect(isFreeProgram('coherence-cardiaque')).toBe(false);
  });

  it('ne connaît pas une séance inventée', () => {
    expect(isFreeProgram('seance-qui-nexiste-pas')).toBe(false);
  });
});
