// Les séances SOS forment un thème à part : on ne les range pas dans la grille, on ne les
// « recommande » pas, et on ne les verrouille jamais.

/** Catégorie utilisée en base pour les séances d'urgence. */
export const SOS_CATEGORY = 'SOS';

/** Slugs des quatre séances SOS, dans l'ordre d'affichage. */
export const SOS_SLUGS = [
  'sos-angoisse',
  'sos-prise-de-parole',
  'sos-stress-travail',
  'sos-ruminations',
] as const;

/**
 * Affiché avant de lancer la séance d'angoisse.
 *
 * Une application de bien-être n'a pas à décider que ce qu'on ressent est de l'angoisse. Une
 * douleur thoracique nouvelle ou une vraie difficulté à respirer peuvent être tout autre chose,
 * et proposer une séance de respiration à la place d'un appel serait une faute.
 */
export const SOS_URGENCE =
  "Une douleur dans la poitrine, une vraie difficulté à respirer ou un malaise peuvent demander une aide urgente : appelle le 15, ou le 112.";
