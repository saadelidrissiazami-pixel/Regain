import { describe, expect, it } from 'vitest';

import { FREE_PROGRAM_SLUGS, isFreeProgram } from '../src/features/wellbeing/access';
import { recommendWellbeing } from '../src/features/wellbeing/recommend';
import { COURSE_CATEGORY } from '../src/features/wellbeing/courses';
import { SOS_CATEGORY, SOS_SLUGS } from '../src/features/wellbeing/sos';
import { parseFreeSlugsFromMigration, parseSeededCatalogue } from './helpers/catalogue';

describe('offre gratuite de la bibliothèque bien-être', () => {
  const catalogue = parseSeededCatalogue();
  const slugs = new Set(catalogue.map((program) => program.slug));
  // La bibliothèque au sens strict : ni les SOS, ni les jours de parcours, qui ont leurs
  // propres règles d'accès.
  const bibliothequeLibre = FREE_PROGRAM_SLUGS.filter(
    (slug) => !SOS_SLUGS.includes(slug as never) && !slug.startsWith('parcours-')
  );

  it('dit la même chose que la migration', () => {
    // Les deux listes sont écrites à la main, dans deux langages : c'est ce test qui les tient
    // ensemble. Modifier l'une sans l'autre donnerait une application et une base en désaccord
    // sur qui a le droit d'ouvrir quoi.
    expect([...bibliothequeLibre].sort()).toEqual(parseFreeSlugsFromMigration().sort());
  });

  it('laisse les SOS gratuites, sans exception', () => {
    // Mettre du contenu de détresse derrière un paywall ne se défend pas. Ce test est là pour
    // que personne ne puisse le faire par inadvertance en réorganisant l'offre.
    expect(SOS_SLUGS.every((slug) => isFreeProgram(slug))).toBe(true);
  });

  it('ne nomme que des séances qui existent', () => {
    expect(FREE_PROGRAM_SLUGS.filter((slug) => !slugs.has(slug))).toEqual([]);
  });

  it('ne répète aucune séance', () => {
    expect(new Set(FREE_PROGRAM_SLUGS).size).toBe(FREE_PROGRAM_SLUGS.length);
  });

  it('compte 18 séances libres de bibliothèque, 4 SOS et 6 jours de parcours', () => {
    expect(catalogue).toHaveLength(61);
    expect(bibliothequeLibre).toHaveLength(18);
    expect(FREE_PROGRAM_SLUGS).toHaveLength(28);
  });

  it('ouvre les trois premiers jours de chaque parcours', () => {
    for (const parcours of ['parcours-meditation', 'parcours-sommeil']) {
      expect([1, 2, 3].every((day) => isFreeProgram(`${parcours}-j${day}`))).toBe(true);
      expect([4, 10].some((day) => isFreeProgram(`${parcours}-j${day}`))).toBe(false);
    }
  });

  it('reprend exactement la répartition que la durée produisait', () => {
    // Preuve que le passage d'une règle calculée à une liste nommée n'a retiré l'accès à
    // personne. Ceci est la règle historique de 0021_premium_catalog.sql, conservée ici comme
    // témoin : on ne la rejoue plus en production.
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

describe('les séances SOS restent à part', () => {
  const catalogue = parseSeededCatalogue();

  it('ne sont jamais recommandées spontanément', () => {
    // Proposer une séance d'urgence à quelqu'un qui n'a rien demandé, c'est lui suggérer que
    // ça ne va pas. Elles se déclenchent, elles ne se suggèrent pas.
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
    const sos = catalogue.filter((p) => p.category === SOS_CATEGORY);
    expect(sos).toHaveLength(4);
    expect(sos.every((p) => p.duration_minutes === 2)).toBe(true);
  });
});
