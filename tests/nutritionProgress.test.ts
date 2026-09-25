import { describe, expect, it } from 'vitest';

import { INGREDIENTS, type IngredientId } from '../src/features/fitness/ingredients';
import { complementsFor, dayTotals, nutritionStatus } from '../src/features/fitness/nutritionProgress';

const entry = (
  calories: number,
  protein_g: number | null = null,
  carbs_g: number | null = null,
  fat_g: number | null = null
) => ({ calories, protein_g, carbs_g, fat_g });

describe('dayTotals', () => {
  it('adds every macronutrient, counting a missing one as zero', () => {
    expect(dayTotals([entry(400, 30, 20, 12), entry(250), entry(120, 8, 5, 2)])).toEqual({
      calories: 770,
      proteinG: 38,
      carbsG: 25,
      fatG: 14,
    });
  });

  it('is zero for a day with nothing in it', () => {
    expect(dayTotals([])).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });

  it('counts an entry noted before the app asked for carbohydrate and fat', () => {
    // Those rows have the two columns null, and must still add up rather than becoming NaN.
    expect(dayTotals([{ calories: 500, protein_g: 20 }])).toEqual({
      calories: 500,
      proteinG: 20,
      carbsG: 0,
      fatG: 0,
    });
  });
});

describe('nutritionStatus', () => {
  it('is empty with no entries, whatever the target', () => {
    expect(nutritionStatus(0, 2200, 0)).toBe('empty');
  });

  it('is empty rather than wrong when no target has been computed', () => {
    expect(nutritionStatus(500, 0, 3)).toBe('empty');
  });

  it('turns to close exactly at 80% of the target', () => {
    expect(nutritionStatus(1759, 2200, 4)).toBe('under');
    expect(nutritionStatus(1760, 2200, 4)).toBe('close');
  });

  it('counts the target as met from 100% to 110%, because the target is an estimate', () => {
    expect(nutritionStatus(2199, 2200, 5)).toBe('close');
    expect(nutritionStatus(2200, 2200, 5)).toBe('met');
    expect(nutritionStatus(2420, 2200, 5)).toBe('met');
    expect(nutritionStatus(2421, 2200, 5)).toBe('over');
  });
});

describe('complementsFor', () => {
  const base = { proteinTargetG: 120, allergens: [], diet: 'omnivore' as const };

  it('suggests nothing when the gap is too small to be worth a snack', () => {
    expect(complementsFor({ ...base, remainingKcal: 40, remainingProteinG: 5 })).toEqual([]);
  });

  it('never suggests a food the person is allergic to', () => {
    const withNuts = complementsFor({ ...base, remainingKcal: 400, remainingProteinG: 40, limit: 20 });
    expect(withNuts.some((c) => INGREDIENTS[c.id].allergens.includes('fruits_a_coque'))).toBe(true);

    const withoutNuts = complementsFor({
      ...base,
      remainingKcal: 400,
      remainingProteinG: 40,
      allergens: ['fruits_a_coque'],
      limit: 20,
    });
    expect(withoutNuts.some((c) => INGREDIENTS[c.id].allergens.includes('fruits_a_coque'))).toBe(false);
  });

  it('never suggests an animal product excluded by the diet', () => {
    const vegan = complementsFor({
      ...base,
      remainingKcal: 500,
      remainingProteinG: 40,
      diet: 'vegan',
      limit: 20,
    });
    expect(vegan.length).toBeGreaterThan(0);
    for (const c of vegan) expect(INGREDIENTS[c.id].animal).toBeUndefined();
  });

  it('leads with protein-dense food when protein is the gap', () => {
    const short = complementsFor({ ...base, remainingKcal: 400, remainingProteinG: 60 });
    const covered = complementsFor({ ...base, remainingKcal: 400, remainingProteinG: 2 });
    const density = (id: IngredientId) => INGREDIENTS[id].proteinPer100;
    expect(density(short[0].id)).toBeGreaterThan(density(covered[0].id));
  });

  it('keeps the suggested portions inside the calories that are left', () => {
    const remainingKcal = 600;
    const list = complementsFor({ ...base, remainingKcal, remainingProteinG: 50 });
    const total = list.reduce((sum, c) => sum + c.calories, 0);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeLessThanOrEqual(remainingKcal);
  });

  it('does not put 400g of a dense food on the plate', () => {
    const list = complementsFor({ ...base, remainingKcal: 2000, remainingProteinG: 100, limit: 20 });
    for (const c of list) {
      const dense = INGREDIENTS[c.id].kcalPer100 >= 500;
      if (dense && !INGREDIENTS[c.id].gramsPerPiece) expect(c.grams).toBeLessThanOrEqual(40);
    }
  });
});
