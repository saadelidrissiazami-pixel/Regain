// The SOS sessions are a theme apart: they are not filed in the grid, they are never
// “recommended”, and they are never locked.

/** The category the database uses for the emergency sessions. */
export const SOS_CATEGORY = 'SOS';

/** The slugs of the four SOS sessions, in the order they are shown. */
export const SOS_SLUGS = [
  'sos-angoisse',
  'sos-prise-de-parole',
  'sos-stress-travail',
  'sos-ruminations',
] as const;

/**
 * Shown before the anxiety session starts.
 *
 * A wellbeing app does not get to decide that what someone is feeling is anxiety. New chest pain
 * or real difficulty breathing can be something else entirely, and offering a breathing session
 * in place of a phone call would be a serious mistake.
 */
//
// The number is deliberately not named. The French wording said “call 15, or 112”, which is
// right in France and wrong everywhere else; an English build has no way of knowing which
// country the reader is in, and a wrong number in this particular sentence is worse than no
// number at all.
export const SOS_URGENCE =
  'Chest pain, real difficulty breathing or feeling faint can need urgent help. Call your local emergency number.';
