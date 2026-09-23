import { describe, expect, it } from 'vitest';

import { shoppingCommitment, weekCommitments, workoutCommitments } from '../src/features/planning/commitments';
import type { WeekTrackerDay } from '../src/features/fitness/schedule';
import type { WorkoutSession } from '../src/features/fitness/types';

// Semaine du lundi 21 au dimanche 27 septembre 2026, entraînement lundi / mercredi / vendredi.
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
  { day_label: 'Séance 1', focus: 'Corps entier A — jambes', exercises: [exercise, exercise, exercise] },
  { day_label: 'Séance 2', focus: 'Corps entier B — haut du corps', exercises: [exercise, exercise] },
  { day_label: 'Séance 3', focus: 'Corps entier C — complet', exercises: [exercise] },
] as unknown as WorkoutSession[];

describe('séances dans le planning', () => {
  it('place une séance par jour d entraînement, dans l ordre du programme', () => {
    const seances = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'soir', today: '2026-09-21' });
    expect(seances.map((s) => [s.date, s.title])).toEqual([
      ['2026-09-21', 'Séance 1 · Corps entier A'],
      ['2026-09-23', 'Séance 2 · Corps entier B'],
      ['2026-09-25', 'Séance 3 · Corps entier C'],
    ]);
  });

  it('reprend l heure du créneau déclaré', () => {
    const [premiere] = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'matin', today: '2026-09-21' });
    expect(premiere.startTime).toBe('09:00');
  });

  it('n invente pas d heure quand le créneau n est pas renseigné', () => {
    const [premiere] = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: null, today: '2026-09-21' });
    expect(premiere.startTime).toBeNull();
  });

  it('marque faite une séance honorée', () => {
    const seances = workoutCommitments({
      tracker: tracker('2026-09-23', ['2026-09-21']),
      program: PROGRAM,
      slot: 'soir',
      today: '2026-09-23',
    });
    expect(seances[0].status).toBe('realise');
  });

  it('ne déclare jamais une séance ratée, seulement inconnue', () => {
    // Lundi est passé sans validation. Quelqu'un a pu s'entraîner sans ouvrir l'application :
    // c'est un statut inconnu, pas un échec, et surtout pas une dette à rattraper.
    const seances = workoutCommitments({ tracker: tracker('2026-09-23'), program: PROGRAM, slot: 'soir', today: '2026-09-23' });
    expect(seances[0].status).toBe('inconnu');
    expect(seances[1].status).toBe('a_faire');
  });

  it('pointe vers la séance existante, sans la recopier', () => {
    const seances = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'soir', today: '2026-09-21' });
    expect(seances.map((s) => s.href)).toEqual(['/fitness/workout/0', '/fitness/workout/1', '/fitness/workout/2']);
  });

  it('ne propose rien sans programme', () => {
    expect(workoutCommitments({ tracker: tracker('2026-09-21'), program: [], slot: 'soir', today: '2026-09-21' })).toEqual([]);
  });

  it('prévoit plus long que la séance elle-même', () => {
    // On se change, on s'installe, on récupère : annoncer la durée nue ferait déborder le créneau.
    const [premiere] = workoutCommitments({ tracker: tracker('2026-09-21'), program: PROGRAM, slot: 'soir', today: '2026-09-21' });
    expect(premiere.durationMinutes).toBeGreaterThan(30);
  });
});

describe('courses dans le planning', () => {
  it('évite les jours d entraînement', () => {
    // Lundi et mercredi sont pris : mardi est le premier jour libre.
    const courses = shoppingCommitment({ tracker: tracker('2026-09-21'), itemCount: 25, today: '2026-09-21' });
    expect(courses?.date).toBe('2026-09-22');
  });

  it('ne remonte jamais dans le passé', () => {
    const courses = shoppingCommitment({ tracker: tracker('2026-09-25'), itemCount: 25, today: '2026-09-25' });
    expect(courses?.date).toBe('2026-09-26');
  });

  it('accepte un jour d entraînement s il ne reste que ça', () => {
    const vendrediSeul = tracker('2026-09-25').filter((day) => day.date === '2026-09-25');
    expect(shoppingCommitment({ tracker: vendrediSeul, itemCount: 25, today: '2026-09-25' })?.date).toBe('2026-09-25');
  });

  it('ne propose rien quand la liste est vide', () => {
    expect(shoppingCommitment({ tracker: tracker('2026-09-21'), itemCount: 0, today: '2026-09-21' })).toBeNull();
  });

  it('ne propose rien quand la semaine est finie', () => {
    expect(shoppingCommitment({ tracker: [], itemCount: 25, today: '2026-09-28' })).toBeNull();
  });

  it('annonce le nombre d articles et renvoie à la liste', () => {
    const courses = shoppingCommitment({ tracker: tracker('2026-09-21'), itemCount: 25, today: '2026-09-21' });
    expect(courses?.subtitle).toBe('25 articles pour tes menus');
    expect(courses?.href).toBe('/fitness/nutrition');
  });
});

describe('la semaine entière', () => {
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
