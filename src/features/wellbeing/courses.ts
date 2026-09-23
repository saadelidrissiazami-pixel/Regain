// Les parcours : une suite de jours qui enseignent une technique, au lieu de séances isolées.
//
// La base sait déjà les porter — `wellbeing_programs` gagne simplement un `course_slug` et un
// `course_day`. Un jour de parcours *est* une séance : rien n'est dupliqué, et la progression se
// déduit des séances déjà faites plutôt que d'être tenue à jour dans une table à part.
//
// Un parcours interrompu ne se remet jamais à zéro. Reprendre au jour 4 après deux semaines
// d'absence doit être exactement aussi simple que d'y revenir le lendemain : transformer une
// pause en échec est le meilleur moyen de ne jamais reprendre.

import type { WellbeingProgram } from './types';

/** Catégorie utilisée en base pour les jours de parcours. */
export const COURSE_CATEGORY = 'Parcours';

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  /** Ce qu'on apprend vraiment, par-delà la liste des jours. */
  promise: string;
  dayCount: number;
};

export const COURSES: Course[] = [
  {
    slug: 'decouvrir-meditation',
    title: 'Découvrir la méditation',
    subtitle: '10 jours, de 2 à 6 minutes',
    promise:
      "On part d'un repère concret et on va vers un choix autonome. La vraie compétence n'est pas de rester concentré : c'est de remarquer qu'on est parti ailleurs, et de revenir.",
    dayCount: 10,
  },
  {
    slug: 'mieux-dormir',
    title: 'Mieux dormir',
    subtitle: '10 jours, de 3 à 7 minutes',
    promise:
      "On apprend à réduire l'effort autour du coucher. Aucun de ces jours ne promet l'endormissement : vérifier si le sommeil arrive est précisément ce qui l'empêche.",
    dayCount: 10,
  },
];

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((course) => course.slug === slug);
}

export type CourseDay = {
  day: number;
  program: WellbeingProgram;
  done: boolean;
};

export type CourseProgress = {
  days: CourseDay[];
  doneCount: number;
  /** Le premier jour pas encore fait : celui qu'on propose de reprendre. */
  nextDay: CourseDay | null;
  complete: boolean;
};

/**
 * L'avancement d'un parcours, déduit des séances complétées.
 * Les jours se suivent mais ne se verrouillent pas : quelqu'un qui saute le jour 3 peut faire
 * le 4, et le 3 restera disponible.
 */
export function courseProgress(
  course: Course,
  programs: WellbeingProgram[],
  completedIds: Set<string>
): CourseProgress {
  const days = programs
    .filter((program) => program.course_slug === course.slug && program.course_day !== null)
    .sort((a, b) => (a.course_day ?? 0) - (b.course_day ?? 0))
    .map((program) => ({ day: program.course_day ?? 0, program, done: completedIds.has(program.id) }));

  const doneCount = days.filter((day) => day.done).length;
  return {
    days,
    doneCount,
    nextDay: days.find((day) => !day.done) ?? null,
    complete: days.length > 0 && doneCount === days.length,
  };
}

/** « Jour 4 sur 10 », ou l'invitation à commencer. */
export function courseStatusLabel(progress: CourseProgress, course: Course): string {
  if (progress.days.length === 0) return 'Bientôt disponible';
  if (progress.complete) return `Terminé · ${course.dayCount} jours`;
  if (progress.doneCount === 0) return `${course.dayCount} jours, à ton rythme`;
  return `Jour ${progress.nextDay?.day ?? progress.doneCount + 1} sur ${course.dayCount}`;
}
