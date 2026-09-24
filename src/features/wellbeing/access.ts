// The freemium offer for the wellbeing library.
//
// This list names every session, and that is deliberate. It used to be computed — “the three
// shortest in each category stay free”, a rule replayed identically in SQL and in TypeScript.
// But access then depended on duration, so rewriting a script slightly longer was enough to
// re-lock a session a subscriber was already using, without anyone noticing. An explicit list
// only changes when somebody changes it.
//
// Migration 0023_explicit_premium_catalog.sql applies the library's list, and
// 0025_wellbeing_sos.sql forces the SOS sessions free. tests/access.test.ts holds the two
// together.

import { SOS_SLUGS } from './sos';

/** The first three days of each course, like the three free sessions in a theme. */
const PARCOURS_LIBRES = [
  'parcours-meditation-j1',
  'parcours-meditation-j2',
  'parcours-meditation-j3',
  'parcours-sommeil-j1',
  'parcours-sommeil-j2',
  'parcours-sommeil-j3',
];

/** The library's free sessions, as they stood on 23 September 2026. */
const BIBLIOTHEQUE_LIBRE: readonly string[] = [
  // Breathing
  'respiration-express',
  'respiration-4-7-8',
  'respiration-soupir-physiologique',
  // Meditation
  'meditation-pause-1min',
  'meditation-matin',
  'meditation-5-sens',
  // Journaling
  'journaling-gratitude-express',
  'journaling-clarifier',
  'journaling-vider-tete',
  // Confidence
  'confiance-trois-qualites',
  'confiance-posture-presence',
  'confiance-reussite',
  // Sleep
  'sommeil-ralentir',
  'sommeil-relacher',
  'sommeil-scan-corporel',
  // In public
  'public-ancrage-rapide',
  'public-kit-urgence',
  'detachement-regard-autres',
];

/**
 * The sessions available without a subscription.
 * The SOS sessions join them as a block: they are not a free sample that might be trimmed one
 * day, they are free by their nature.
 */
export const FREE_PROGRAM_SLUGS: readonly string[] = [...BIBLIOTHEQUE_LIBRE, ...SOS_SLUGS, ...PARCOURS_LIBRES];

const FREE = new Set(FREE_PROGRAM_SLUGS);

/** A session is free if it appears in the list. Everything else needs Premium. */
export function isFreeProgram(slug: string): boolean {
  return FREE.has(slug);
}
