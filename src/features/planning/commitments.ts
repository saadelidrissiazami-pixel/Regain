// The week's commitments: the training sessions and the trip to the shops.
//
// They come from the fitness programme, which already exists. Nothing is copied or stored a
// second time: they are recomputed on read, and every row points back to the screen that owns
// them. A second copy of the programme inside the plan would eventually disagree with the first.
//
// They are not the same thing as the activities the rule engine suggests. An activity is a
// suggestion, and ignoring it costs nothing; a session is something the person committed to.
// Status and nature are two different things, and a past session with no feedback is not a failed
// session — it is a session nobody knows anything about.

import { DEFAULT_SLOT_START } from './schedule';
import { sessionTitle } from '../fitness/schedule';
import type { WeekTrackerDay } from '../fitness/schedule';
import type { WorkoutSession } from '../fitness/types';
import { t } from '../../lib/i18n';

type TimeSlot = keyof typeof DEFAULT_SLOT_START;

export type CommitmentStatus = 'a_faire' | 'realise' | 'inconnu';

export type PlanningCommitment = {
  id: string;
  kind: 'entrainement' | 'courses';
  date: string;
  /** “19:00”, or null when the person has not said what time they train. */
  startTime: string | null;
  title: string;
  subtitle: string;
  durationMinutes: number;
  /** The screen that owns this: the plan only points at it. */
  href: string;
  status: CommitmentStatus;
};

/** Time set aside for shopping: getting there and putting it away count as much as the shop. */
export const SHOPPING_MINUTES = 60;

function workoutMinutes(session: WorkoutSession | undefined): number {
  // Allow a little more than the session itself: getting changed, setting up, recovering.
  const exercises = session?.exercises.length ?? 5;
  return 15 + exercises * 6;
}

/**
 * The week's sessions, one per training day.
 * `tracker` comes from buildWeekTracker, which already knows which days are training days and
 * which ones were honoured.
 */
export function workoutCommitments({
  tracker,
  program,
  slot,
  today,
}: {
  tracker: WeekTrackerDay[];
  program: WorkoutSession[];
  slot: TimeSlot | null;
  today: string;
}): PlanningCommitment[] {
  if (program.length === 0) return [];
  const startTime = slot ? DEFAULT_SLOT_START[slot] : null;
  let order = 0;

  return tracker
    .filter((day) => day.isTraining)
    .map((day) => {
      const session = program[order % program.length];
      const sessionIndex = order % program.length;
      order += 1;
      return {
        id: `entrainement-${day.date}`,
        kind: 'entrainement' as const,
        date: day.date,
        startTime,
        title: sessionTitle(session),
        subtitle: `${session.exercises.length} exercises`,
        durationMinutes: workoutMinutes(session),
        href: `/fitness/workout/${sessionIndex}`,
        // A past day with nothing ticked stays “unknown”. We do not declare a failure on behalf
        // of someone who may well have trained without opening the app.
        status: day.done ? ('realise' as const) : day.date < today ? ('inconnu' as const) : ('a_faire' as const),
      };
    });
}

/**
 * The trip to the shops, once in the week.
 *
 * There is no universally right day: what matters is buying before the first meal that depends on
 * it, and not stacking the shopping on top of a training day. So we take the next free day
 * coming up, and failing that simply the next day.
 */
export function shoppingCommitment({
  tracker,
  itemCount,
  today,
}: {
  tracker: WeekTrackerDay[];
  itemCount: number;
  today: string;
}): PlanningCommitment | null {
  if (itemCount === 0) return null;
  const upcoming = tracker.filter((day) => day.date >= today);
  if (upcoming.length === 0) return null;
  const day = upcoming.find((candidate) => !candidate.isTraining) ?? upcoming[0];

  return {
    id: `courses-${day.date}`,
    kind: 'courses',
    date: day.date,
    startTime: null,
    title: t('Do the shopping'),
    subtitle: t('{count} items for your meals', { count: itemCount }),
    durationMinutes: SHOPPING_MINUTES,
    href: '/fitness/nutrition',
    status: 'a_faire',
  };
}

/** Every commitment of the week, in chronological order. */
export function weekCommitments(input: {
  tracker: WeekTrackerDay[];
  program: WorkoutSession[];
  slot: TimeSlot | null;
  shoppingItemCount: number;
  today: string;
}): PlanningCommitment[] {
  const shopping = shoppingCommitment({
    tracker: input.tracker,
    itemCount: input.shoppingItemCount,
    today: input.today,
  });
  return [...workoutCommitments(input), ...(shopping ? [shopping] : [])].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '99').localeCompare(b.startTime ?? '99')
  );
}
