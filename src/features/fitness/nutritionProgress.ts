import { INGREDIENTS, type Allergen, type IngredientId } from './ingredients';
import type { Diet } from './options';
import { EXCLUDED_ANIMALS } from './planGenerator';

/**
 * The day against the target, and what could close the gap.
 *
 * Two rules run through this file. Nothing here ever tells somebody they ate too much: an app
 * that comments on food can do real harm, and a number above the target is information, not a
 * verdict. And a suggestion is only ever made from food the person can actually eat — the
 * allergens and the diet on their profile filter the list before anything is proposed.
 */

export type DayTotals = { calories: number; proteinG: number; carbsG: number; fatG: number };

type CountableEntry = {
  calories: number;
  protein_g: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
};

/**
 * A macronutrient nobody recorded counts as zero.
 *
 * It understates the day rather than guessing, which is the right way round: a total that invents
 * carbohydrate nobody ate would make the bars lie. Entries noted before the app asked for
 * carbohydrate and fat are exactly this case, and they stay readable.
 */
export function dayTotals(entries: CountableEntry[]): DayTotals {
  return entries.reduce<DayTotals>(
    (total, entry) => ({
      calories: total.calories + entry.calories,
      proteinG: total.proteinG + (entry.protein_g ?? 0),
      carbsG: total.carbsG + (entry.carbs_g ?? 0),
      fatG: total.fatG + (entry.fat_g ?? 0),
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );
}

export type NutritionStatus = 'empty' | 'under' | 'close' | 'met' | 'over';

/**
 * `close` starts at 80% — near enough that naming what is left is useful, rather than a whole
 * meal away. `met` keeps a 10% band above the target, because a calorie target is an estimate
 * and landing at 103% is landing on it.
 */
export function nutritionStatus(consumed: number, target: number, entryCount: number): NutritionStatus {
  if (entryCount === 0) return 'empty';
  if (target <= 0) return 'empty';
  const ratio = consumed / target;
  if (ratio < 0.8) return 'under';
  if (ratio < 1) return 'close';
  if (ratio <= 1.1) return 'met';
  return 'over';
}

export type Complement = { id: IngredientId; name: string; grams: number; calories: number; proteinG: number };

/** Denser food gets a smaller plate: 60g of nut butter is a portion, 60g of yoghurt is not. */
function maxPortion(kcalPer100: number): number {
  if (kcalPer100 >= 500) return 40;
  if (kcalPer100 >= 300) return 90;
  if (kcalPer100 >= 150) return 180;
  return 250;
}

function portionOf(id: IngredientId, targetKcal: number): Complement | null {
  const ingredient = INGREDIENTS[id];
  if (ingredient.kcalPer100 <= 0) return null;
  const wanted = (targetKcal / ingredient.kcalPer100) * 100;
  let grams: number;
  if (ingredient.gramsPerPiece) {
    const step = ingredient.allowHalfPiece ? 0.5 : 1;
    const pieces = Math.round(wanted / ingredient.gramsPerPiece / step) * step;
    if (pieces < step) return null;
    grams = pieces * ingredient.gramsPerPiece;
  } else {
    grams = Math.round(Math.min(wanted, maxPortion(ingredient.kcalPer100)) / 10) * 10;
  }
  if (grams <= 0) return null;
  return {
    id,
    name: ingredient.name,
    grams,
    calories: Math.round((grams * ingredient.kcalPer100) / 100),
    proteinG: Math.round((grams * ingredient.proteinPer100) / 100),
  };
}

/**
 * What to eat to reach the target, chosen from the app's own ingredients.
 *
 * When protein is further from its target than calories are from theirs, the protein-dense foods
 * come first — otherwise the gap closes on calories and leaves the protein where it was.
 */
export function complementsFor(input: {
  remainingKcal: number;
  remainingProteinG: number;
  proteinTargetG: number;
  allergens: Allergen[];
  diet: Diet;
  limit?: number;
}): Complement[] {
  const { remainingKcal, remainingProteinG, proteinTargetG, allergens, diet } = input;
  if (remainingKcal < 50) return [];

  const excluded = EXCLUDED_ANIMALS[diet];
  const eligible = (Object.keys(INGREDIENTS) as IngredientId[]).filter((id) => {
    const ingredient = INGREDIENTS[id];
    if (ingredient.animal && excluded.includes(ingredient.animal)) return false;
    return !ingredient.allergens.some((a) => allergens.includes(a));
  });

  const proteinShort = proteinTargetG > 0 && remainingProteinG / proteinTargetG > 0.15;
  const ranked = eligible.sort((a, b) =>
    proteinShort
      ? INGREDIENTS[b].proteinPer100 - INGREDIENTS[a].proteinPer100
      : INGREDIENTS[a].name.localeCompare(INGREDIENTS[b].name)
  );

  // Each suggestion covers half of what is left, so a pair of them lands near the target rather
  // than sailing past it. This is deliberately not tied to `limit`: that caps how many are
  // returned, and dividing the gap by it would shrink every portion to nothing on a long list.
  const share = remainingKcal / 2;
  const out: Complement[] = [];
  for (const id of ranked) {
    if (out.length >= (input.limit ?? 2)) break;
    const portion = portionOf(id, share);
    if (portion && portion.calories >= 40) out.push(portion);
  }
  return out;
}
