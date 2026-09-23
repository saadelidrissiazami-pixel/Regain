// Offre freemium de la bibliothèque bien-être.
//
// Cette liste est nommée séance par séance, et c'est délibéré. Elle a d'abord été calculée :
// « les trois plus courtes de chaque catégorie restent gratuites », règle rejouée à l'identique
// en SQL et en TypeScript. Mais l'accès dépendait alors de la durée — réécrire un script un peu
// plus long suffisait à reverrouiller une séance qu'un abonné utilisait déjà, sans que personne
// ne s'en aperçoive. Une liste explicite ne change que lorsqu'on la change.
//
// La migration 0023_explicit_premium_catalog.sql applique exactement ces slugs en base, et
// tests/catalogue.test.ts vérifie que les deux ne divergent jamais.

/** Séances accessibles sans abonnement, telles qu'elles l'étaient au 23 septembre 2026. */
export const FREE_PROGRAM_SLUGS: readonly string[] = [
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

const FREE = new Set(FREE_PROGRAM_SLUGS);

/** Une séance est gratuite si elle figure dans la liste. Tout le reste demande Premium. */
export function isFreeProgram(slug: string): boolean {
  return FREE.has(slug);
}
