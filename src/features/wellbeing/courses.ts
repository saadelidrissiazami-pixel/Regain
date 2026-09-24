// Courses: a run of days that teach a technique, instead of sessions that stand alone.
//
// The database already carries them — `wellbeing_programs` simply gains a `course_slug` and a
// `course_day`. A course day *is* a session: nothing is duplicated, and progress is derived from
// the sessions already done rather than kept up to date in a table of its own.
//
// An interrupted course never resets. Picking up at day 4 after two weeks away has to be exactly
// as easy as coming back the next day: turning a pause into a failure is the surest way to make
// sure nobody ever comes back.

import type { WellbeingProgram } from './types';
import { t } from '../../lib/i18n';

/** The category the database uses for course days. */
export const COURSE_CATEGORY = 'Parcours';

export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  /** What is actually learnt, beyond the list of days. */
  promise: string;
  dayCount: number;
};

export const COURSES: Course[] = [
  {
    slug: 'decouvrir-meditation',
    title: t('Discovering meditation'),
    subtitle: t('10 days, 2 to 6 minutes'),
    promise:
      t('We start from something concrete and work towards a choice of your own. The real skill is not staying focused: it is noticing that you have wandered off, and coming back.'),
    dayCount: 10,
  },
  {
    slug: 'mieux-dormir',
    title: t('Sleeping better'),
    subtitle: t('10 days, 3 to 7 minutes'),
    promise:
      t('You learn to take the effort out of going to bed. None of these days promises sleep: checking whether sleep is coming is precisely what keeps it away.'),
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
  /** The first day not yet done: the one offered to pick up from. */
  nextDay: CourseDay | null;
  complete: boolean;
};

/**
 * A course's progress, derived from the sessions completed.
 * The days follow one another but do not lock: someone who skips day 3 can do day 4, and day 3
 * stays available.
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

/** “Day 4 of 10”, or the invitation to begin. */
export function courseStatusLabel(progress: CourseProgress, course: Course): string {
  if (progress.days.length === 0) return t('Coming soon');
  if (progress.complete) return t('Finished · {count} days', { count: course.dayCount });
  if (progress.doneCount === 0) return t('{count} days, at your own pace', { count: course.dayCount });
  return t('Day {day} of {count}', { day: progress.nextDay?.day ?? progress.doneCount + 1, count: course.dayCount });
}
