// Offre freemium de la bibliothèque bien-être.
//
// Cette liste est nommée séance par séance, et c'est délibéré. Elle a d'abord été calculée :
// « les trois plus courtes de chaque catégorie restent gratuites », règle rejouée à l'identique
// en SQL et en TypeScript. Mais l'accès dépendait alors de la durée — réécrire un script un peu
// plus long suffisait à reverrouiller une séance qu'un abonné utilisait déjà, sans que personne
// ne s'en aperçoive. Une liste explicite ne change que lorsqu'on la change.
//
// La migration 0023_explicit_premium_catalog.sql applique la liste de la bibliothèque, et
// 0025_wellbeing_sos.sql force les SOS en gratuit. tests/access.test.ts tient les deux ensemble.

import { SOS_SLUGS } from './sos';

/** Les trois premiers jours de chaque parcours, comme les trois séances libres d'un thème. */
const PARCOURS_LIBRES = [
  'parcours-meditation-j1',
  'parcours-meditation-j2',
  'parcours-meditation-j3',
  'parcours-sommeil-j1',
  'parcours-sommeil-j2',
  'parcours-sommeil-j3',
];

/** Séances libres de la bibliothèque, telles qu'elles l'étaient au 23 septembre 2026. */
const BIBLIOTHEQUE_LIBRE: readonly string[] = [
  // Respiration
  'respiration-express',
  'respiration-4-7-8',
  'respiration-soupir-physiologique',
  // Méditation
  'meditation-pause-1min',
  'meditation-matin',
  'meditation-5-sens',
  // Journaling
  'journaling-gratitude-express',
  'journaling-clarifier',
  'journaling-vider-tete',
  // Confiance en soi
  'confiance-trois-qualites',
  'confiance-posture-presence',
  'confiance-reussite',
  // Sommeil
  'sommeil-ralentir',
  'sommeil-relacher',
  'sommeil-scan-corporel',
  // En public
  'public-ancrage-rapide',
  'public-kit-urgence',
  'detachement-regard-autres',
];

/**
 * Les séances accessibles sans abonnement.
 * Les SOS s'y ajoutent en bloc : elles ne sont pas un échantillon gratuit qu'on pourrait
 * réduire un jour, elles sont gratuites par nature.
 */
export const FREE_PROGRAM_SLUGS: readonly string[] = [...BIBLIOTHEQUE_LIBRE, ...SOS_SLUGS, ...PARCOURS_LIBRES];

const FREE = new Set(FREE_PROGRAM_SLUGS);

/** Une séance est gratuite si elle figure dans la liste. Tout le reste demande Premium. */
export function isFreeProgram(slug: string): boolean {
  return FREE.has(slug);
}
