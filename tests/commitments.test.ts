import { describe, expect, it } from 'vitest';

import { shoppingCommitment, weekCommitments, workoutCommitments } from '../src/features/planning/commitments';
import type { WeekTrackerDay } from '../src/features/fitness/schedule';
import type { WorkoutSession } from '../src/features/fitness/types';

// The week of Monday 21 to Sunday 27 September 2026, training Monday / Wednesday / Friday.
const TRAINING_DAYS = [0, 2, 4];
const DATES = ['2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-26', '2026-09-27'];

function tracker(today: string, done: string[] = []): WeekTrackerDay[] {
  return DATES.map((date, dayIndex) => ({
    date,
    dayIndex,
    isTraining: TRAINING_DAYS.includes(dayIndex),
    done: done.includes(date),
    isToday: date === today,
  }));
}

const exercise = { name: 'Squat', sets: 3, reps: '8', rest_seconds: 90, tip: '' };
const PROGRAM = [
  { day_label: 'Session 1', focus: 'Full body A — legs', exercises: [exercise, exercise, exercise] },
  { day_label: 'Session 2', focus: 'Full body B — upper body', exercises: [exercise, exercise] },
  { day_label: 'Session 3', focus: 'Full body C — everything', exercises: [exercise] },
] as unknown as WorkoutSession[];

describe('sessions inside the plan', () => {
  it('places one session per training day, in programme order', () => {
    const seances = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'soir', today: '2026-09-21' });
    expect(seances.map((s) => [s.date, s.title])).toEqual([
      ['2026-09-21', 'Session 1 · Full body A'],
      ['2026-09-23', 'Session 2 · Full body B'],
      ['2026-09-25', 'Session 3 · Full body C'],
    ]);
  });

  it('takes the time from the slot that was declared', () => {
    const [premiere] = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'matin', today: '2026-09-21' });
    expect(premiere.startTime).toBe('09:00');
  });

  it('invents no time when the slot has not been given', () => {
    const [premiere] = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: null, today: '2026-09-21' });
    expect(premiere.startTime).toBeNull();
  });

  it('marks a session that was honoured as done', () => {
    const seances = workoutCommitments({
      tracker: tracker('2026-09-23', ['2026-09-21']),
      program: PROGRAM,
      slot: 'soir',
      today: '2026-09-23',
    });
    expect(seances[0].status).toBe('realise');
  });

  it('never declares a session failed, only unknown', () => {
    // Monday went by with nothing ticked. Somebody may well have trained without opening the
    // app: that is an unknown status, not a failure, and certainly not a debt to make up.
    const seances = workoutCommitments({ tracker: tracker('2026-09-23'), program: PROGRAM, slot: 'soir', today: '2026-09-23' });
    expect(seances[0].status).toBe('inconnu');
    expect(seances[1].status).toBe('a_faire');
  });

  it('points at the existing session rather than copying it', () => {
    const seances = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'soir', today: '2026-09-21' });
    expect(seances.map((s) => s.href)).toEqual(['/fitness/workout/0', '/fitness/workout/1', '/fitness/workout/2']);
  });

  it('ne propose rien sans programme', () => {
    expect(workoutCommitments({ tracker: tracker('2026-09-21'), program: [], slot: 'soir', today: '2026-09-21' })).toEqual([]);
  });

  it('allows more time than the session itself', () => {
    // Getting changed, setting up, recovering: the bare duration would overrun the slot.
    const [premiere] = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'soir', today: '2026-09-21' });
    expect(premiere.durationMinutes).toBeGreaterThan(30);
  });
});

describe('courses dans le planning', () => {
  it('avoids the training days', () => {
    // Lundi et mercredi sont pris : mardi est le premier jour libre.
    const courses = shoppingCommitment({ tracker: tracker('2026-09-21'), itemCount: 25, today: '2026-09-21' });
    expect(courses?.date).toBe('2026-09-22');
  });

  it('never goes back into the past', () => {
    const courses = shoppingCommitment({ tracker: tracker('2026-09-25'), itemCount: 25, today: '2026-09-25' });
    expect(courses?.date).toBe('2026-09-26');
  });

  it('accepts a training day when that is all there is left', () => {
    const vendrediSeul = tracker('2026-09-25').filter((day) => day.date === '2026-09-25');
    expect(shoppingCommitment({ tracker: vendrediSeul, itemCount: 25, today: '2026-09-25' })?.date).toBe('2026-09-25');
  });

  it('ne propose rien quand la liste est vide', () => {
    expect(shoppingCommitment({ tracker: tracker('2026-09-21'), itemCount: 0, today: '2026-09-21' })).toBeNull();
  });

  it('ne propose rien quand la semaine est finie', () => {
    expect(shoppingCommitment({ tracker: [], itemCount: 25, today: '2026-09-28' })).toBeNull();
  });

  it('states the number of items and points at the list', () => {
    const courses = shoppingCommitment({ tracker: tracker('2026-09-21'), itemCount: 25, today: '2026-09-21' });
    expect(courses?.subtitle).toBe('25 items for your meals');
    expect(courses?.href).toBe('/fitness/nutrition');
  });
});

describe('the whole week', () => {
  it('range tout dans l ordre chronologique', () => {
    const tout = weekCommitments({
      tracker: tracker('2026-09-21'),
      program: PROGRAM,
      slot: 'soir',
      shoppingItemCount: 25,
      today: '2026-09-21',
    });
    expect(tout.map((c) => `${c.date} ${c.kind}`)).toEqual([
      '2026-09-21 entrainement',
      '2026-09-22 courses',
      '2026-09-23 entrainement',
      '2026-09-25 entrainement',
    ]);
  });

  it('ne donne rien quand il n y a ni programme ni liste', () => {
    expect(
      weekCommitments({ tracker: tracker('2026-09-21'), program: [], slot: null, shoppingItemCount: 0, today: '2026-09-21' })
    ).toEqual([]);
  });
});
