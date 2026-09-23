// Les engagements de la semaine : les séances d'entraînement et le passage aux courses.
//
// Ils viennent du programme forme, qui existe déjà. Rien n'est recopié ni enregistré une seconde
// fois : on les recalcule à la lecture, et chaque carte renvoie à l'écran qui fait autorité. Une
// deuxième version du programme dans le planning finirait fatalement par diverger de la première.
//
// Ils se distinguent des activités proposées par le moteur de règles : une activité est une
// suggestion, qui disparaît sans rien devoir si on l'ignore ; une séance est quelque chose que la
// personne s'est engagée à faire. Le statut et la nature sont deux choses différentes, et une
// séance passée sans retour n'est pas une séance ratée — c'est une séance dont on ne sait rien.

import { DEFAULT_SLOT_START } from './schedule';
import { sessionTitle } from '../fitness/schedule';
import type { WeekTrackerDay } from '../fitness/schedule';
import type { WorkoutSession } from '../fitness/types';

type TimeSlot = keyof typeof DEFAULT_SLOT_START;

export type CommitmentStatus = 'a_faire' | 'realise' | 'inconnu';

export type PlanningCommitment = {
  id: string;
  kind: 'entrainement' | 'courses';
  date: string;
  /** « 19:00 », ou null quand la personne n'a pas dit à quelle heure elle s'entraîne. */
  startTime: string | null;
  title: string;
  subtitle: string;
  durationMinutes: number;
  /** L'écran qui fait autorité : le planning ne fait que pointer vers lui. */
  href: string;
  status: CommitmentStatus;
};

/** Temps réservé pour les courses : le trajet et le rangement comptent autant que le magasin. */
export const SHOPPING_MINUTES = 60;

function workoutMinutes(session: WorkoutSession | undefined): number {
  // Prévoir un peu plus que la séance elle-même : on se change, on s'installe, on récupère.
  const exercises = session?.exercises.length ?? 5;
  return 15 + exercises * 6;
}

/**
 * Les séances de la semaine, une par jour d'entraînement.
 * `tracker` vient de buildWeekTracker : il sait déjà quels jours sont des jours d'entraînement et
 * lesquels ont été honorés.
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
        subtitle: `${session.exercises.length} exercices`,
        durationMinutes: workoutMinutes(session),
        href: `/fitness/workout/${sessionIndex}`,
        // Un jour passé sans validation reste « inconnu » : on ne décrète pas un échec à la
        // place de quelqu'un qui a peut-être fait sa séance sans ouvrir l'application.
        status: day.done ? ('realise' as const) : day.date < today ? ('inconnu' as const) : ('a_faire' as const),
      };
    });
}

/**
 * Le passage aux courses, une fois dans la semaine.
 *
 * Il n'y a pas de bon jour universel : ce qui compte, c'est d'acheter avant le premier repas qui
 * en dépend, et de ne pas empiler les courses sur un jour d'entraînement. On prend donc le
 * prochain jour libre à venir ; s'il n'y en a plus, le prochain jour tout court.
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
    title: 'Faire les courses',
    subtitle: `${itemCount} articles pour tes menus`,
    durationMinutes: SHOPPING_MINUTES,
    href: '/fitness/nutrition',
    status: 'a_faire',
  };
}

/** Tous les engagements de la semaine, dans l'ordre chronologique. */
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
