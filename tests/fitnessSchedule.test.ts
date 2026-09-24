import { describe, expect, it } from 'vitest';

import {
  buildWeekTracker,
  isDeloadWeek,
  nextWorkout,
  programPhase,
  sessionTitle,
  trainingDays,
  uniqueExercises,
} from '../src/features/fitness/schedule';

// The week of Monday 14 to Sunday 20 September 2026; today is Saturday the 19th.
const WEEK = '2026-09-14';
const at = (date: string, time = '18:30') => ({ completed_at: new Date(`${date}T${time}:00`).toISOString() });

describe('training days', () => {
  it('keeps the days chosen, sorted and without duplicates', () => {
    expect(trainingDays([4, 0, 4, 2], 3)).toEqual([0, 2, 4]);
  });
  it('spreads them by default according to the number of sessions', () => {
    expect(trainingDays(null, 3)).toEqual([0, 2, 4]);
    expect(trainingDays([], 2)).toEqual([0, 3]);
    expect(trainingDays([9], 1)).toEqual([2]);
  });
});

describe('the next session', () => {
  it('offers today when it is a training day with no session done', () => {
    const next = nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0, 2, 5], slot: 'soir', sessionsCount: 3, logsThisWeek: [at('2026-09-14'), at('2026-09-16')] });
    expect(next).toEqual({ sessionIndex: 2, date: '2026-09-19', startTime: '19:00', isToday: true });
  });

  it('moves to the next training day once today’s session is done', () => {
    const next = nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0, 5], slot: null, sessionsCount: 2, logsThisWeek: [at('2026-09-19')] });
    expect(next?.date).toBe('2026-09-21');
    expect(next?.startTime).toBeNull();
    expect(next?.sessionIndex).toBe(1);
  });

  it('carries into the following week once this one’s days have gone', () => {
    expect(nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0, 2], slot: 'matin', sessionsCount: 2, logsThisWeek: [] })?.date).toBe('2026-09-21');
  });

  it('offers nothing without a programme', () => {
    expect(nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0], slot: null, sessionsCount: 0, logsThisWeek: [] })).toBeNull();
  });
});

describe('tracking the week', () => {
  it('marks the planned days, the sessions done, and today', () => {
    const days = buildWeekTracker({ weekStart: WEEK, today: '2026-09-17', days: [0, 3], logs: [at('2026-09-14')] });
    expect(days).toHaveLength(7);
    expect(days[0]).toMatchObject({ date: '2026-09-14', isTraining: true, done: true, isToday: false });
    expect(days[3]).toMatchObject({ isTraining: true, done: false, isToday: true });
    expect(days[6]).toMatchObject({ date: '2026-09-20', isTraining: false });
  });
});

describe('programme', () => {
  it('names the phase after the nutrition strategy', () => {
    expect(programPhase('surplus')).toBe('Building mass');
    expect(programPhase('deficit')).toBe('Gradual loss');
  });

  it('shortens the session title', () => {
    expect(sessionTitle({ day_label: 'Session 1', focus: 'Push — chest, shoulders, triceps' })).toBe('Session 1 · Push');
  });

  it('spots the easier week only when the programme follows the check-in', () => {
    const checkin = { created_at: '2026-09-13T10:00:00Z', sessions_done: 1, energy: 2 };
    expect(isDeloadWeek({ created_at: '2026-09-13T10:05:00Z' }, checkin, 3)).toBe(true);
    expect(isDeloadWeek({ created_at: '2026-09-12T10:00:00Z' }, checkin, 3)).toBe(false);
    expect(isDeloadWeek({ created_at: '2026-09-13T10:05:00Z' }, { ...checkin, sessions_done: 3, energy: 4 }, 3)).toBe(false);
  });

  it('lists each exercise once, with the sessions it appears in', () => {
    const ex = { sets: 3, reps: '10', rest_seconds: 60, tip: '' };
    const program = [
      { day_label: 'Session 1', focus: 'A', duration_minutes: 40, warmup: '', cooldown: '', exercises: [{ ...ex, name: 'Squat' }, { ...ex, name: 'Push-ups' }] },
      { day_label: 'Session 2', focus: 'B', duration_minutes: 40, warmup: '', cooldown: '', exercises: [{ ...ex, name: 'Squat' }] },
    ];
    const list = uniqueExercises(program);
    expect(list.map((e) => e.name)).toEqual(['Squat', 'Push-ups']);
    expect(list[0].sessions).toEqual(['Session 1', 'Session 2']);
  });
});
