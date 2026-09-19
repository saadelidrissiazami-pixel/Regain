import { describe, expect, it } from 'vitest';

import { freeProgramSlugs } from '../src/features/wellbeing/access';

// Catalogue réel (37 séances, durées en minutes), tel qu'en base au 19 sept. 2026.
const CATALOG: [string, string, number][] = [
  ['Confiance en soi', 'confiance-trois-qualites', 1],
  ['Confiance en soi', 'confiance-posture-presence', 3],
  ['Confiance en soi', 'confiance-reussite', 3],
  ['Confiance en soi', 'confiance-preparation', 4],
  ['Confiance en soi', 'confiance-trois-victoires', 4],
  ['Confiance en soi', 'confiance-micro-defi-social', 7],
  ['En public', 'public-ancrage-rapide', 1],
  ['En public', 'public-kit-urgence', 2],
  ['En public', 'detachement-regard-autres', 3],
  ['En public', 'public-sortie-3-minutes', 3],
  ['En public', 'public-respirer-foule', 4],
  ['En public', 'public-mode-observateur', 4],
  ['En public', 'public-bouton-pause', 4],
  ['Journaling', 'journaling-gratitude-express', 1],
  ['Journaling', 'journaling-clarifier', 3],
  ['Journaling', 'journaling-vider-tete', 4],
  ['Journaling', 'journaling-confiance', 6],
  ['Journaling', 'journaling-dechargement-mental', 7],
  ['Journaling', 'journaling-peur-en-plan', 8],
  ['Méditation', 'meditation-pause-1min', 1],
  ['Méditation', 'meditation-matin', 3],
  ['Méditation', 'meditation-soir', 5],
  ['Méditation', 'meditation-5-sens', 5],
  ['Méditation', 'meditation-observer-pensees', 8],
  ['Méditation', 'meditation-scan-corporel', 9],
  ['Respiration', 'respiration-express', 1],
  ['Respiration', 'respiration-4-7-8', 2],
  ['Respiration', 'respiration-soupir-physiologique', 3],
  ['Respiration', 'respiration-4-6', 4],
  ['Respiration', 'coherence-cardiaque', 5],
  ['Respiration', 'respiration-escalier', 6],
  ['Sommeil', 'sommeil-ralentir', 1],
  ['Sommeil', 'sommeil-relacher', 3],
  ['Sommeil', 'sommeil-scan-corporel', 6],
  ['Sommeil', 'sommeil-voyage-mental', 7],
  ['Sommeil', 'sommeil-cerveau-en-veille', 7],
  ['Sommeil', 'sommeil-respiration-endormissement', 8],
];
const programs = CATALOG.map(([category, slug, duration_minutes]) => ({ category, slug, duration_minutes }));

describe('offre gratuite de la bibliothèque bien-être', () => {
  const free = freeProgramSlugs(programs);

  it('laisse 3 séances par catégorie en accès libre', () => {
    expect(programs).toHaveLength(37);
    expect(free.size).toBe(18);
    expect(programs.length - free.size).toBe(19);
  });

  it('garde la séance mise en avant gratuite', () => {
    expect(free.has('detachement-regard-autres')).toBe(true);
  });

  it('réserve les séances les plus longues à Premium', () => {
    expect(free.has('meditation-scan-corporel')).toBe(false);
    expect(free.has('sommeil-respiration-endormissement')).toBe(false);
    expect(free.has('coherence-cardiaque')).toBe(false);
  });

  it('départage les durées égales par nom, comme la migration', () => {
    // 3 min toutes les deux, pour la 3e place d'« En public » : « detachement » passe avant « public-sortie ».
    expect(free.has('detachement-regard-autres')).toBe(true);
    expect(free.has('public-sortie-3-minutes')).toBe(false);
  });
});
