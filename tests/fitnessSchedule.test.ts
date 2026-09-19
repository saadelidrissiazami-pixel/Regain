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

// Semaine du lundi 14 au dimanche 20 septembre 2026 ; aujourd'hui = samedi 19.
const WEEK = '2026-09-14';
const at = (date: string, time = '18:30') => ({ completed_at: new Date(`${date}T${time}:00`).toISOString() });

describe("jours d'entraînement", () => {
  it('garde les jours choisis, triés et sans doublon', () => {
    expect(trainingDays([4, 0, 4, 2], 3)).toEqual([0, 2, 4]);
  });
  it('répartit par défaut selon le nombre de séances', () => {
    expect(trainingDays(null, 3)).toEqual([0, 2, 4]);
    expect(trainingDays([], 2)).toEqual([0, 3]);
    expect(trainingDays([9], 1)).toEqual([2]);
  });
});

describe('prochaine séance', () => {
  it("propose aujourd'hui si c'est un jour d'entraînement sans séance faite", () => {
    const next = nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0, 2, 5], slot: 'soir', sessionsCount: 3, logsThisWeek: [at('2026-09-14'), at('2026-09-16')] });
    expect(next).toEqual({ sessionIndex: 2, date: '2026-09-19', startTime: '19:00', isToday: true });
  });

  it("passe au prochain jour d'entraînement quand la séance du jour est faite", () => {
    const next = nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0, 5], slot: null, sessionsCount: 2, logsThisWeek: [at('2026-09-19')] });
    expect(next?.date).toBe('2026-09-21');
    expect(next?.startTime).toBeNull();
    expect(next?.sessionIndex).toBe(1);
  });

  it('continue la semaine suivante quand les jours de celle-ci sont passés', () => {
    expect(nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0, 2], slot: 'matin', sessionsCount: 2, logsThisWeek: [] })?.date).toBe('2026-09-21');
  });

  it('ne propose rien sans programme', () => {
    expect(nextWorkout({ weekStart: WEEK, today: '2026-09-19', days: [0], slot: null, sessionsCount: 0, logsThisWeek: [] })).toBeNull();
  });
});

describe('suivi de la semaine', () => {
  it("marque les jours prévus, les séances faites et aujourd'hui", () => {
    const days = buildWeekTracker({ weekStart: WEEK, today: '2026-09-17', days: [0, 3], logs: [at('2026-09-14')] });
    expect(days).toHaveLength(7);
    expect(days[0]).toMatchObject({ date: '2026-09-14', isTraining: true, done: true, isToday: false });
    expect(days[3]).toMatchObject({ isTraining: true, done: false, isToday: true });
    expect(days[6]).toMatchObject({ date: '2026-09-20', isTraining: false });
  });
});

describe('programme', () => {
  it('nomme la phase selon la stratégie nutritionnelle', () => {
    expect(programPhase('surplus')).toBe('Prise de masse');
    expect(programPhase('deficit')).toBe('Perte progressive');
  });

  it('raccourcit le titre de séance', () => {
    expect(sessionTitle({ day_label: 'Séance 1', focus: 'Poussée — pectoraux, épaules, triceps' })).toBe('Séance 1 · Poussée');
  });

  it("détecte la semaine allégée seulement si le programme suit le bilan", () => {
    const checkin = { created_at: '2026-09-13T10:00:00Z', sessions_done: 1, energy: 2 };
    expect(isDeloadWeek({ created_at: '2026-09-13T10:05:00Z' }, checkin, 3)).toBe(true);
    expect(isDeloadWeek({ created_at: '2026-09-12T10:00:00Z' }, checkin, 3)).toBe(false);
    expect(isDeloadWeek({ created_at: '2026-09-13T10:05:00Z' }, { ...checkin, sessions_done: 3, energy: 4 }, 3)).toBe(false);
  });

  it('liste chaque exercice une fois avec ses séances', () => {
    const ex = { sets: 3, reps: '10', rest_seconds: 60, tip: '' };
    const program = [
      { day_label: 'Séance 1', focus: 'A', duration_minutes: 40, warmup: '', cooldown: '', exercises: [{ ...ex, name: 'Squat' }, { ...ex, name: 'Pompes' }] },
      { day_label: 'Séance 2', focus: 'B', duration_minutes: 40, warmup: '', cooldown: '', exercises: [{ ...ex, name: 'Squat' }] },
    ];
    const list = uniqueExercises(program);
    expect(list.map((e) => e.name)).toEqual(['Squat', 'Pompes']);
    expect(list[0].sessions).toEqual(['Séance 1', 'Séance 2']);
  });
});
