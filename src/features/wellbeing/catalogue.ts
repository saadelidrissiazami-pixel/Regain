// English wording for the wellbeing library.
//
// `wellbeing_programs` holds the catalogue: which sessions exist, what they cost, which course
// day they are. The words a person reads live here instead, keyed by slug — the same split as
// the session scripts themselves, which have always been in the bundle rather than the database.
//
// Keeping it this way means the language of the library follows the installed build. Translating
// the rows instead would change them for every version at once, including builds already on the
// App Store, which is how a French build once ended up listing sessions it could not play.
//
// `category` stays exactly as the database spells it. It is an internal key — it picks the
// theme's icon, colour and illustration, and it routes — so it is never shown as-is: THEME_LABELS
// turns it into something to read.

import { lang } from '../../lib/i18n';
import type { WellbeingProgram } from './types';

const TITLE_BY_SLUG: Record<string, string> = {
  // Breathing
  'respiration-express': 'Quick breathing',
  'respiration-4-7-8': '4-7-8 breathing',
  'coherence-cardiaque': 'Coherent breathing',
  'respiration-4-6': '4-6 breathing',
  'respiration-soupir-physiologique': 'The physiological sigh',
  'respiration-escalier': 'Staircase breathing',

  // Meditation
  'meditation-pause-1min': 'One-minute pause',
  'meditation-matin': 'Morning anchor',
  'meditation-soir': 'Evening meditation',
  'meditation-5-sens': 'Five senses',
  'meditation-observer-pensees': 'Watching your thoughts',
  'meditation-scan-corporel': 'Body scan',

  // Journaling
  'journaling-gratitude-express': 'Quick gratitude',
  'journaling-clarifier': 'Clear your day',
  'journaling-vider-tete': 'Empty your head',
  'journaling-dechargement-mental': 'The mental offload',
  'journaling-confiance': 'The confidence journal',
  'journaling-peur-en-plan': 'Turn a fear into a plan',

  // Confidence
  'confiance-trois-qualites': 'Three qualities',
  'confiance-reussite': 'Remember something you did well',
  'confiance-preparation': 'Prepare for a hard moment',
  'confiance-posture-presence': 'The posture of presence',
  'confiance-micro-defi-social': 'The small social challenge',
  'confiance-trois-victoires': 'The proof of three wins',

  // Sleep
  'sommeil-ralentir': 'Slow down before sleep',
  'sommeil-relacher': 'Release the tension before sleep',
  'sommeil-scan-corporel': 'Full body scan',
  'sommeil-respiration-endormissement': 'Breathing towards sleep',
  'sommeil-cerveau-en-veille': 'Putting the mind on standby',
  'sommeil-voyage-mental': 'The monotonous journey',

  // In public
  'public-ancrage-rapide': 'Quick grounding',
  'detachement-regard-autres': 'Letting go of being watched',
  'public-respirer-foule': 'Breathing in a crowd',
  'public-sortie-3-minutes': 'The three-minute outing',
  'public-mode-observateur': 'Observer mode',
  'public-bouton-pause': 'The pause button',
  'public-kit-urgence': 'The two-minute emergency kit',

  // SOS
  'sos-angoisse': 'Panic rising',
  'sos-prise-de-parole': 'Before you speak up',
  'sos-stress-travail': 'A spike of stress at work',
  'sos-ruminations': 'Night-time rumination',

  // Course — Discovering meditation
  'parcours-meditation-j1': 'Find an anchor',
  'parcours-meditation-j2': 'Follow one movement',
  'parcours-meditation-j3': 'Just come back',
  'parcours-meditation-j4': 'A small count',
  'parcours-meditation-j5': 'Drop the count',
  'parcours-meditation-j6': 'Recognise a thought',
  'parcours-meditation-j7': 'Make room for what is here',
  'parcours-meditation-j8': 'Come back through sound',
  'parcours-meditation-j9': 'Choose your anchor',
  'parcours-meditation-j10': 'A pause that fits you',

  // Course — Sleeping better
  'parcours-sommeil-j1': 'End the day',
  'parcours-sommeil-j2': 'Feel the bed hold you',
  'parcours-sommeil-j3': 'Let it breathe',
  'parcours-sommeil-j4': 'Loosen gently',
  'parcours-sommeil-j5': 'Travel through the body',
  'parcours-sommeil-j6': 'Put down what is left',
  'parcours-sommeil-j7': 'Recognise the script',
  'parcours-sommeil-j8': 'Return to a familiar place',
  'parcours-sommeil-j9': 'Let sleep come',
  'parcours-sommeil-j10': 'Build your own ritual',
};

/**
 * What a theme is called on screen.
 * The keys are the stored `category` values, which stay put: they are how a theme is identified
 * everywhere else in the app.
 */
export const THEME_LABELS: Record<string, string> = {
  Respiration: 'Breathing',
  Méditation: 'Meditation',
  Journaling: 'Journaling',
  'Confiance en soi': 'Confidence',
  Sommeil: 'Sleep',
  'En public': 'In public',
  SOS: 'SOS',
  Parcours: 'Courses',
};

/** A session's title, in this build's language. Falls back to what the database holds. */
export function programTitle(program: Pick<WellbeingProgram, 'slug' | 'title'>): string {
  // The rows are French already, so French reads them as they are.
  if (lang === 'fr') return program.title;
  return TITLE_BY_SLUG[program.slug] ?? program.title;
}

/** A title from a slug alone, for the journal, where only the stored title came back. */
export function titleForSlug(slug: string, fallback: string): string {
  if (lang === 'fr') return fallback;
  return TITLE_BY_SLUG[slug] ?? fallback;
}

/** A theme's name on screen. An unknown category is shown as the database spells it. */
export function themeLabel(category: string): string {
  if (lang === 'fr') return category;
  return THEME_LABELS[category] ?? category;
}

/** The slugs this build has English wording for. */
export const LOCALISED_PROGRAM_SLUGS = Object.keys(TITLE_BY_SLUG);
