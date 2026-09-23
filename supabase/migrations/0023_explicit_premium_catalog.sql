-- Regain — l'offre freemium ne se déduit plus de la durée, elle se nomme.
--
-- 0021_premium_catalog.sql classait les séances par durée et verrouillait au-delà de la
-- troisième de chaque catégorie. La règle était élégante mais l'accès devenait un effet de bord
-- du contenu : allonger un script d'une minute reverrouillait une séance déjà utilisée par des
-- abonnés, silencieusement. Cette migration remplace la règle par la liste exacte des séances
-- gratuites, identique à FREE_PROGRAM_SLUGS dans src/features/wellbeing/access.ts.
--
-- Elle reproduit à l'identique la répartition obtenue par 0021 au 23 septembre 2026
-- (18 gratuites, 19 Premium) : personne ne perd ni ne gagne d'accès en l'appliquant.
--
-- Rejouable : recalcule la colonne entière à chaque exécution. Une séance ajoutée plus tard sans
-- être inscrite ici sera donc Premium par défaut.

update public.wellbeing_programs
set premium_only = slug <> all (array[
  -- Respiration
  'respiration-express',
  'respiration-4-7-8',
  'respiration-soupir-physiologique',
  -- Méditation
  'meditation-pause-1min',
  'meditation-matin',
  'meditation-5-sens',
  -- Journaling
  'journaling-gratitude-express',
  'journaling-clarifier',
  'journaling-vider-tete',
  -- Confiance en soi
  'confiance-trois-qualites',
  'confiance-posture-presence',
  'confiance-reussite',
  -- Sommeil
  'sommeil-ralentir',
  'sommeil-relacher',
  'sommeil-scan-corporel',
  -- En public
  'public-ancrage-rapide',
  'public-kit-urgence',
  'detachement-regard-autres'
]);
