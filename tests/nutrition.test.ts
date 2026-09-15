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
  it('déficit pour une perte de poids, surplus pour une prise de masse', () => {
    expect(strategyForGoals(['perte_poids'])).toBe('deficit');
    expect(strategyForGoals(['prise_masse', 'salle'])).toBe('surplus');
  });

  it("reste à l'équilibre quand les objectifs se contredisent ou sans objectif de poids", () => {
    expect(strategyForGoals(['perte_poids', 'prise_masse'])).toBe('maintien');
    expect(strategyForGoals(['bien_etre'])).toBe('maintien');
  });
});

describe('computeNutritionTargets', () => {
  it('plafonne le déficit à 500 kcal pour une perte de poids', () => {
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

  it('ne descend jamais sous le plancher de sécurité', () => {
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

  it('ne descend jamais sous le métabolisme de base, même au-dessus du plancher fixe', () => {
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

  it('limite le surplus à +10 % (300 kcal max) pour une prise de masse', () => {
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

  it("vise moins de protéines quand l'objectif n'est pas musculaire", () => {
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

  it('répartit toutes les calories entre les macros', () => {
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
  it("calcule l'âge à partir de l'année de naissance", () => {
    expect(ageFromBirthYear(1996, new Date(2026, 8, 15))).toBe(30);
  });
});
