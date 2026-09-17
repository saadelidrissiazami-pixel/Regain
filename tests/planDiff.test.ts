import { describe, expect, it } from 'vitest';

import { countNewDishes, summarizeAdjustments } from '../src/features/fitness/planDiff';
import type { NutritionTargets } from '../src/features/fitness/nutrition';
import type { MealDay, WorkoutSession } from '../src/features/fitness/types';

const targets = (calories: number): NutritionTargets => ({
  bmr: 1700,
  maintenance: 2400,
  calories,
  proteinG: 120,
  carbsG: 250,
  fatG: 70,
  strategy: 'maintien',
  floorApplied: false,
});

const session = (minutes: number): WorkoutSession => ({
  day_label: 'Séance 1',
  focus: 'Corps entier',
  duration_minutes: minutes,
  warmup: '5 min',
  cooldown: '3 min',
  exercises: [],
});

const day = (label: string, dishes: string[]): MealDay => ({
  day_label: label,
  total_calories: 2000,
  meals: dishes.map((name) => ({ name, description: '', calories: 500, protein_g: 30 })),
});

const plan = (calories: number, dishes: string[], sessions = 3, shopping = 20) => ({
  targets: targets(calories),
  program: Array.from({ length: sessions }, () => session(45)),
  meals: [day('Journée A', dishes)],
  shopping_list: Array.from({ length: shopping }, (_, i) => i),
});

describe('countNewDishes', () => {
  it('compte les plats absents de la semaine précédente', () => {
    expect(countNewDishes([day('A', ['Dahl', 'Omelette'])], [day('A', ['Dahl', 'Curry', 'Poke'])])).toBe(2);
    expect(countNewDishes(undefined, [day('A', ['Dahl'])])).toBe(1);
    expect(countNewDishes([day('A', ['Dahl'])], [day('A', ['Dahl'])])).toBe(0);
  });
});

describe('summarizeAdjustments', () => {
  const base = { previous: plan(2200, ['Dahl']), next: plan(2200, ['Dahl']), daysPerWeek: 3 };

  it('allège la semaine après peu de séances ou une énergie basse', () => {
    const [first] = summarizeAdjustments({ ...base, checkin: { sessions_done: 0, energy: 2 } });
    expect(first.label).toBe('Semaine allégée');
  });

  it('renforce après une semaine complète en forme', () => {
    const [first] = summarizeAdjustments({ ...base, checkin: { sessions_done: 3, energy: 5 } });
    expect(first.label).toBe('Semaine plus soutenue');
  });

  it('annonce le changement de cible calorique et le poids', () => {
    const summary = summarizeAdjustments({
      previous: plan(2200, ['Dahl']),
      next: plan(2100, ['Curry']),
      daysPerWeek: 3,
      checkin: { sessions_done: 2, energy: 3 },
      previousWeightKg: 80,
      newWeightKg: 79.4,
    });
    const labels = summary.map((a) => a.label);

    expect(labels).toContain('Cible : 2200 → 2100 kcal');
    expect(summary.find((a) => a.label.startsWith('Cible'))?.detail).toContain('votre poids du jour');
    expect(labels).toContain('Poids : 80 → 79,4 kg');
    expect(labels).toContain('1 nouveau plat');
  });

  it('indique une cible inchangée et compte séances et courses', () => {
    const summary = summarizeAdjustments({ ...base, next: plan(2200, ['Dahl'], 4, 25), checkin: { sessions_done: 2, energy: 3 } });
    const labels = summary.map((a) => a.label);
    expect(labels).toContain('Cible inchangée : 2200 kcal par jour');
    expect(labels).toContain('4 séances cette semaine');
    expect(labels).toContain('Liste de courses mise à jour : 25 articles');
    expect(labels).toContain('Mêmes plats que la semaine passée');
  });

  it('ne parle pas du poids sans nouvelle pesée, et le dit autrement', () => {
    const summary = summarizeAdjustments({
      ...base,
      next: plan(2100, ['Dahl']),
      previousWeightKg: 80,
      newWeightKg: null,
    });
    expect(summary.some((a) => a.label.startsWith('Poids'))).toBe(false);
    expect(summary.find((a) => a.label.startsWith('Cible'))?.detail).toContain('votre profil à jour');
  });
});
