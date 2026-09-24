/**
 * The names of the app's images, kept apart from the images themselves.
 *
 * images.ts require()s every JPEG, which only Metro can resolve — importing it from a module
 * under test pulls those requires in with it. Anything that needs to name an image without
 * loading one imports this instead.
 */
export type ImageKey =
  | 'wellbeingHero'
  | 'sessionLake'
  | 'meditation'
  | 'sport'
  | 'nature'
  | 'social'
  | 'reading'
  | 'rest'
  | 'fitLegs'
  | 'fitPush'
  | 'fitPull'
  | 'fitCore'
  | 'nutrition';
