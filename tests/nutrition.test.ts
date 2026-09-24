import { describe, expect, it } from 'vitest';

import {
  ageFromBirthYear,
  computeBmr,
  computeNutritionTargets,
  strategyForGoals,
} from '../src/features/fitness/nutrition';

describe('computeBmr (Mifflin-St Jeor)', () => {
  it('applique la formule homme', () => {
    expect(computeBmr({ sex: 'homme', age: 30, heightCm: 180, weightKg: 80 })).toBe(1780);
  });

  it('applique la formule femme', () => {
    expect(computeBmr({ sex: 'femme', age: 22, heightCm: 155, weightKg: 45 })).toBeCloseTo(1147.75, 2);
  });
});

describe('strategyForGoals', () => {
  it('a deficit for losing weight, a surplus for building mass', () => {
    expect(strategyForGoals(['perte_poids'])).toBe('deficit');
    expect(strategyForGoals(['prise_masse', 'salle'])).toBe('surplus');
  });

  it('stays at maintenance when the goals conflict, or with no weight goal', () => {
    expect(strategyForGoals(['perte_poids', 'prise_masse'])).toBe('maintien');
    expect(strategyForGoals(['bien_etre'])).toBe('maintien');
  });
});

describe('computeNutritionTargets', () => {
  it('caps the deficit at 500 kcal for losing weight', () => {
    const targets = computeNutritionTargets({
      sex: 'homme',
      age: 30,
      heightCm: 180,
      weightKg: 80,
      activityLevel: 'modere',
      goals: ['perte_poids'],
    });

    expect(targets.maintenance).toBe(2760);
    expect(targets.calories).toBe(2260);
    expect(targets.strategy).toBe('deficit');
    expect(targets.floorApplied).toBe(false);
    expect(targets.proteinG).toBe(144);
    expect(targets.fatG).toBe(70);
    expect(targets.carbsG).toBe(264);
  });

  it('never goes below the safety floor', () => {
    const targets = computeNutritionTargets({
      sex: 'femme',
      age: 22,
      heightCm: 155,
      weightKg: 45,
      activityLevel: 'sedentaire',
      goals: ['perte_poids'],
    });

    expect(targets.calories).toBe(1200);
    expect(targets.floorApplied).toBe(true);
  });

  it('never goes below basal metabolic rate, even above the fixed floor', () => {
    const targets = computeNutritionTargets({
      sex: 'homme',
      age: 30,
      heightCm: 190,
      weightKg: 110,
      activityLevel: 'sedentaire',
      goals: ['perte_poids'],
    });

    expect(targets.calories).toBeGreaterThanOrEqual(targets.bmr);
  });

  it('limits the surplus to +10% (300 kcal at most) for building mass', () => {
    const targets = computeNutritionTargets({
      sex: 'homme',
      age: 25,
      heightCm: 175,
      weightKg: 65,
      activityLevel: 'leger',
      goals: ['prise_masse'],
    });

    expect(targets.strategy).toBe('surplus');
    expect(targets.calories).toBe(2460);
    expect(targets.proteinG).toBe(117);
  });

  it('aims for less protein when the goal is not about muscle', () => {
    const targets = computeNutritionTargets({
      sex: 'femme',
      age: 40,
      heightCm: 165,
      weightKg: 60,
      activityLevel: 'leger',
      goals: ['bien_etre'],
    });

    expect(targets.strategy).toBe('maintien');
    expect(targets.proteinG).toBe(84);
  });

  it('splits every calorie between the macros', () => {
    const t = computeNutritionTargets({
      sex: 'femme',
      age: 35,
      heightCm: 168,
      weightKg: 68,
      activityLevel: 'modere',
      goals: ['tonifier'],
    });

    const fromMacros = t.proteinG * 4 + t.fatG * 9 + t.carbsG * 4;
    expect(Math.abs(fromMacros - t.calories)).toBeLessThanOrEqual(10);
  });
});

describe('ageFromBirthYear', () => {
  it('works out the age from the year of birth', () => {
    expect(ageFromBirthYear(1996, new Date(2026, 8, 15))).toBe(30);
  });
});
