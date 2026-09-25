import { describe, expect, it } from 'vitest';

import { amountsFor, FOODS, FOOD_CATEGORIES, searchFoods, type Food } from '../src/features/fitness/foods';

/** The energy 100 g of a food implies, from its own macronutrients (4/4/9). */
function atwater(food: Food): number {
  return 4 * food.protein + 4 * food.carbs + 9 * food.fat;
}

// Energy that protein, carbohydrate and fat cannot account for, legitimately: alcohol carries
// 7 kcal/g, and fibre about 2 — negligible in most foods, but a third of chia seeds by weight.
const ENERGY_BEYOND_MACROS = new Set(['beer', 'red-wine', 'white-wine', 'champagne', 'chia-seeds']);

describe('the food table', () => {
  it('has a unique id per food', () => {
    const ids = FOODS.map((food) => food.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names every food in both languages', () => {
    for (const food of FOODS) {
      expect(food.fr.length, food.id).toBeGreaterThan(1);
      expect(food.en.length, food.id).toBeGreaterThan(1);
    }
  });

  it('declares an energy its own macronutrients can account for', () => {
    // This is the check that catches a mistyped digit — the mistake a hand-written table of 250
    // rows actually makes. The band is wide on purpose: fibre, sugar alcohols and rounding all
    // move the sum, and a composition table is an average in the first place.
    // Every offending row is reported at once: asserting inside the loop would name the first
    // one and hide the rest, which is the wrong shape for a check over 250 hand-written rows.
    const off = FOODS.filter((food) => {
      if (ENERGY_BEYOND_MACROS.has(food.id)) return false;
      const implied = atwater(food);
      if (food.kcal < 20 && implied < 20) return false;
      const ratio = food.kcal / implied;
      return ratio < 0.8 || ratio > 1.25;
    }).map((food) => `${food.id}: ${food.kcal} kcal declared, ${atwater(food).toFixed(0)} implied`);
    expect(off).toEqual([]);
  });

  it('keeps every figure inside what the database will accept', () => {
    for (const food of FOODS) {
      expect(food.kcal, food.id).toBeGreaterThanOrEqual(0);
      expect(food.kcal, food.id).toBeLessThanOrEqual(1000);
      expect(food.portion, food.id).toBeGreaterThan(0);
      for (const macro of [food.protein, food.carbs, food.fat]) {
        expect(macro, food.id).toBeGreaterThanOrEqual(0);
        expect(macro, food.id).toBeLessThanOrEqual(100);
      }
    }
  });

  it('puts every food in a category that has a label', () => {
    for (const food of FOODS) expect(FOOD_CATEGORIES[food.category], food.id).toBeDefined();
  });
});

describe('amountsFor', () => {
  it('scales from the per-100 figures', () => {
    const egg = FOODS.find((food) => food.id === 'egg')!;
    expect(amountsFor(egg, 100)).toEqual({ calories: 143, proteinG: 13, carbsG: 1, fatG: 10 });
    expect(amountsFor(egg, 60).calories).toBe(86);
    expect(amountsFor(egg, 0)).toEqual({ calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  });
});

describe('searchFoods', () => {
  it('says nothing for a single letter', () => {
    expect(searchFoods('p')).toEqual([]);
  });

  it('finds a food by the start of its French name', () => {
    expect(searchFoods('poul').map((food) => food.en)).toContain('Chicken breast');
  });

  it('finds the same food by its English name', () => {
    expect(searchFoods('chicken br').map((food) => food.en)).toContain('Chicken breast');
  });

  it('ignores accents and case', () => {
    expect(searchFoods('EPINARDS').map((food) => food.en)).toContain('Spinach');
    expect(searchFoods('pates').map((food) => food.fr)).toContain('Pâtes cuites');
  });

  it('puts a match at the start of a word before one buried in the middle', () => {
    // "Pain complet" and "Pain au chocolat" start with it; "Pain" also sits inside nothing else,
    // so the ordering that matters here is prefix over substring.
    const names = searchFoods('riz').map((food) => food.fr);
    expect(names[0]?.startsWith('Riz')).toBe(true);
  });

  it('returns nothing for a food it does not have', () => {
    expect(searchFoods('zzzzz')).toEqual([]);
  });

  it('never returns more than the limit', () => {
    expect(searchFoods('pa', 5).length).toBeLessThanOrEqual(5);
  });
});
