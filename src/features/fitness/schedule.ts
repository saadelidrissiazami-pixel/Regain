import { DEFAULT_SLOT_START } from '../planning/schedule';
import { fromLocalISODate, getDateForDayOfWeek, toLocalISODate } from '../../lib/week';
import type { NutritionTargets } from './nutrition';
import { intensityFromCheckin } from './planGenerator';
import type { FitnessCheckin, FitnessPlan, WorkoutSession } from './types';

type TimeSlot = keyof typeof DEFAULT_SLOT_START;

/** The default spread of sessions across the week (0 = Monday), with a rest day in between. */
const DEFAULT_DAYS: Record<number, number[]> = {
  1: [2],
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 3, 4],
  6: [0, 1, 2, 3, 4, 5],
};

/** Training days: the ones chosen in the questionnaire, otherwise a default spread. */
export function trainingDays(saved: number[] | null | undefined, daysPerWeek: number): number[] {
  const valid = Array.from(new Set((saved ?? []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))).sort();
  if (valid.length > 0) return valid;
  return DEFAULT_DAYS[Math.min(6, Math.max(1, daysPerWeek))];
}

/** “Session 1 · Push” out of “Session 1” and “Push — chest, shoulders”. */
export function sessionTitle(session: Pick<WorkoutSession, 'day_label' | 'focus'>): string {
  return `${session.day_label} · ${shortFocus(session.focus)}`;
}

export function shortFocus(focus: string): string {
  return focus.split(/\s+[—-]\s+/)[0].trim();
}

type LogLike = { completed_at: string };

function logDates(logs: LogLike[]): Set<string> {
  return new Set(logs.map((log) => toLocalISODate(new Date(log.completed_at))));
}

export type WeekTrackerDay = {
  date: string;
  dayIndex: number;
  isTraining: boolean;
  done: boolean;
  isToday: boolean;
};

/** The seven days of the week: a training day planned, a session done, today. */
export function buildWeekTracker({
  weekStart,
  today,
  days,
  logs,
}: {
  weekStart: string;
  today: string;
  days: number[];
  logs: LogLike[];
}): WeekTrackerDay[] {
  const doneDates = logDates(logs);
  return Array.from({ length: 7 }, (_, dayIndex) => {
    const date = getDateForDayOfWeek(weekStart, dayIndex);
    return { date, dayIndex, isTraining: days.includes(dayIndex), done: doneDates.has(date), isToday: date === today };
  });
}

export type NextWorkout = {
  sessionIndex: number;
  date: string;
  /** « 19:00 », ou null si l'utilisateur n'a pas indiqué quand il s'entraîne. */
  startTime: string | null;
  isToday: boolean;
};

/**
 * Prochaine séance : la suivante dans l'ordre du programme (selon les séances déjà faites cette
 * semaine), au prochain jour d'entraînement où rien n'a encore été fait.
 */
export function nextWorkout({
  weekStart,
  today,
  days,
  slot,
  sessionsCount,
  logsThisWeek,
}: {
  weekStart: string;
  today: string;
  days: number[];
  slot: TimeSlot | null;
  sessionsCount: number;
  logsThisWeek: LogLike[];
}): NextWorkout | null {
  if (sessionsCount === 0 || days.length === 0) return null;
  const doneDates = logDates(logsThisWeek);
  const sessionIndex = logsThisWeek.length % sessionsCount;
  const startTime = slot ? DEFAULT_SLOT_START[slot] : null;

  const candidates = [
    ...days.map((d) => getDateForDayOfWeek(weekStart, d)),
    ...days.map((d) => getDateForDayOfWeek(weekStart, d + 7)),
  ];
  const date = candidates.find((candidate) => candidate >= today && !doneDates.has(candidate));
  if (!date) return null;
  return { sessionIndex, date, startTime, isToday: date === today };
}

const PHASES: Record<NutritionTargets['strategy'], string> = {
  surplus: 'Prise de masse',
  deficit: 'Perte progressive',
  maintien: 'Équilibre',
};

export function programPhase(strategy: NutritionTargets['strategy']): string {
  return PHASES[strategy];
}

/** Le programme en cours a été allégé par le dernier bilan (une série de moins par exercice). */
export function isDeloadWeek(
  plan: Pick<FitnessPlan, 'created_at'> | null | undefined,
  lastCheckin: Pick<FitnessCheckin, 'created_at' | 'sessions_done' | 'energy'> | null | undefined,
  daysPerWeek: number
): boolean {
  if (!plan || !lastCheckin || plan.created_at <= lastCheckin.created_at) return false;
  return intensityFromCheckin(lastCheckin, daysPerWeek) === -1;
}

export type ExerciseSummary = {
  name: string;
  sets: number;
  reps: string;
  rest_seconds: number;
  tip: string;
  sessions: string[];
};

/** Tous les exercices du programme, une fois chacun, avec les séances où ils apparaissent. */
export function uniqueExercises(program: WorkoutSession[]): ExerciseSummary[] {
  const byName = new Map<string, ExerciseSummary>();
  for (const session of program) {
    for (const exercise of session.exercises) {
      const existing = byName.get(exercise.name);
      if (existing) {
        if (!existing.sessions.includes(session.day_label)) existing.sessions.push(session.day_label);
      } else {
        byName.set(exercise.name, { ...exercise, sessions: [session.day_label] });
      }
    }
  }
  return [...byName.values()];
}

/** Libellé relatif d'une date : « Aujourd'hui », « Demain », sinon « Lundi 21 sept. ». */
export function relativeDayLabel(date: string, today: string, format: (date: string) => string): string {
  if (date === today) return "Aujourd'hui";
  const tomorrow = fromLocalISODate(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === toLocalISODate(tomorrow)) return 'Demain';
  return format(date);
}
