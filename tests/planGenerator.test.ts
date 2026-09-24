import { describe, expect, it } from 'vitest';

import { EXERCISES } from '../src/features/fitness/exercises';
import { INGREDIENTS } from '../src/features/fitness/ingredients';
import { ageFromBirthYear, computeNutritionTargets } from '../src/features/fitness/nutrition';
import type { Diet } from '../src/features/fitness/options';
import {
  affectsPlan,
  buildMealPlan,
  buildWorkoutProgram,
  detectJointIssues,
  formatQuantity,
  generateFitnessPlan,
  intensityFromCheckin,
  isRecipeCompatible,
  parseAllergies,
} from '../src/features/fitness/planGenerator';
import { RECIPES, type MealType } from '../src/features/fitness/recipes';
import type { FitnessProfileInput } from '../src/features/fitness/types';

const BASE: FitnessProfileInput = {
  goals: ['perte_poids'],
  sex: 'homme',
  birth_year: 1996,
  height_cm: 180,
  weight_kg: 80,
  activity_level: 'modere',
  experience: 'debutant',
  equipment: 'poids_du_corps',
  days_per_week: 3,
  session_minutes: 45,
  diet: 'omnivore',
  allergies: null,
  health_notes: null,
};

function targetsFor(profile: FitnessProfileInput) {
  return computeNutritionTargets({
    sex: profile.sex,
    age: ageFromBirthYear(profile.birth_year),
    heightCm: profile.height_cm,
    weightKg: profile.weight_kg,
    activityLevel: profile.activity_level,
    goals: profile.goals,
  });
}

function exerciseDef(name: string) {
  const def = EXERCISES.find((e) => e.name === name);
  if (!def) throw new Error(`Unknown exercise: ${name}`);
  return def;
}

describe('reading the free-text fields', () => {
  it('recognises the common allergies, whatever the case', () => {
    expect(parseAllergies('LACTOSE intolerant, allergic to nuts and to eggs')).toEqual(
      expect.arrayContaining(['lactose', 'fruits_a_coque', 'oeufs'])
    );
  });

  it('does not read an allergy into a word that merely contains one', () => {
    // A prefix match would have found `nut` in “nutrition”, `cod` in “codeine” and `egg` in
    // “eggplant”, and quietly stripped food out of the plan over none of them.
    expect(parseAllergies('no nutrition problems, I eat eggplant, I take codeine')).toEqual([]);
  });

  it('picks up the joint trouble reported', () => {
    expect(detectJointIssues('Bad back and an old injury to my right shoulder')).toEqual(['dos', 'epaule']);
  });

  it('does not read joint trouble into a word that merely contains one', () => {
    expect(detectJointIssues('some discomfort after a long day')).toEqual([]);
  });
});

describe('buildWorkoutProgram', () => {
  it('plans exactly one session per training day chosen', () => {
    for (let days = 1; days <= 6; days++) {
      expect(buildWorkoutProgram({ ...BASE, days_per_week: days })).toHaveLength(days);
    }
  });

  it('never exceeds the time available, even building mass in 30 min', () => {
    for (const minutes of [30, 45, 60, 90]) {
      for (const goals of [['prise_masse'], ['perte_poids'], ['endurance'], ['bien_etre']] as const) {
        const program = buildWorkoutProgram({ ...BASE, goals: [...goals], session_minutes: minutes, experience: 'confirme', equipment: 'salle' });
        for (const session of program) expect(session.duration_minutes).toBeLessThanOrEqual(minutes);
      }
    }
  });

  it('uses only the equipment available and the person’s level', () => {
    const program = buildWorkoutProgram({ ...BASE, days_per_week: 6, session_minutes: 90 });
    for (const exercise of program.flatMap((s) => s.exercises)) {
      const def = exerciseDef(exercise.name);
      expect(def.equipment).toBe('poids_du_corps');
      expect(def.minLevel).toBe('debutant');
    }
  });

  it('removes the exercises that load a joint that was reported', () => {
    const program = buildWorkoutProgram({
      ...BASE,
      experience: 'confirme',
      equipment: 'salle',
      days_per_week: 5,
      session_minutes: 90,
      health_notes: 'pain in my left knee',
    });
    for (const exercise of program.flatMap((s) => s.exercises)) {
      expect(exerciseDef(exercise.name).stress).not.toContain('genou');
    }
  });

  it('eases the volume off after a hard week', () => {
    const profile: FitnessProfileInput = { ...BASE, goals: ['salle'], experience: 'intermediaire', session_minutes: 90 };
    const normal = buildWorkoutProgram(profile, { intensity: 0 });
    const light = buildWorkoutProgram(profile, { intensity: -1 });
    expect(light[0].exercises[0].sets).toBe(normal[0].exercises[0].sets - 1);
  });
});

describe('intensityFromCheckin', () => {
  it('eases off when energy is low, or fewer than half the sessions were done', () => {
    expect(intensityFromCheckin({ sessions_done: 3, energy: 2 }, 3)).toBe(-1);
    expect(intensityFromCheckin({ sessions_done: 1, energy: 4 }, 4)).toBe(-1);
  });

  it('progresses after a full week in good shape', () => {
    expect(intensityFromCheckin({ sessions_done: 3, energy: 4 }, 3)).toBe(1);
  });

  it('keeps the rhythm otherwise, and with no check-in', () => {
    expect(intensityFromCheckin({ sessions_done: 2, energy: 3 }, 3)).toBe(0);
    expect(intensityFromCheckin(undefined, 3)).toBe(0);
  });
});

describe('the recipe library', () => {
  const mealTypes: MealType[] = ['petit_dejeuner', 'dejeuner', 'diner', 'collation'];
  const diets: Diet[] = ['omnivore', 'vegetarien', 'vegan', 'pescetarien', 'halal'];

  it('offers at least one recipe per meal for every diet', () => {
    for (const diet of diets) {
      for (const type of mealTypes) {
        expect(RECIPES.some((r) => r.mealType === type && isRecipeCompatible(r, diet, []))).toBe(true);
      }
    }
  });

  it('offers variety (3 recipes or more per meal) to omnivores', () => {
    for (const type of mealTypes) {
      expect(RECIPES.filter((r) => r.mealType === type).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('buildMealPlan', () => {
  it('scales the portions to stay close to the calorie target', () => {
    const profiles: FitnessProfileInput[] = [
      BASE,
      { ...BASE, sex: 'femme', birth_year: 2004, height_cm: 155, weight_kg: 45, activity_level: 'sedentaire' },
      { ...BASE, goals: ['prise_masse'], birth_year: 2001, height_cm: 175, weight_kg: 65, activity_level: 'leger' },
    ];
    for (const profile of profiles) {
      const targets = targetsFor(profile);
      for (const day of buildMealPlan(profile, targets).days) {
        expect(Math.abs(day.total_calories - targets.calories) / targets.calories).toBeLessThanOrEqual(0.12);
      }
    }
  });

  it('uses no animal product on a vegan diet', () => {
    const profile = { ...BASE, diet: 'vegan' as const };
    const { usedIngredientIds } = buildMealPlan(profile, targetsFor(profile));
    for (const id of usedIngredientIds) expect(INGREDIENTS[id].animal).toBeUndefined();
  });

  it('excludes the allergens that were reported', () => {
    const profile = { ...BASE, allergies: 'lactose and peanuts' };
    const plan = buildMealPlan(profile, targetsFor(profile));
    for (const id of plan.usedIngredientIds) {
      expect(INGREDIENTS[id].allergens).not.toContain('lactose');
      expect(INGREDIENTS[id].allergens).not.toContain('arachides');
    }
    expect(plan.warnings.join(' ')).toContain('lactose, peanuts');
  });

  it('warns when an allergy could not be recognised', () => {
    const profile = { ...BASE, allergies: 'kiwi' };
    expect(buildMealPlan(profile, targetsFor(profile)).warnings.join(' ')).toContain('could not be recognised');
  });

  it('reminds halal eaters to choose certified meat', () => {
    const profile = { ...BASE, diet: 'halal' as const };
    expect(buildMealPlan(profile, targetsFor(profile)).warnings).toContain('Choose certified halal meat and poultry.');
  });

  it('writes portions with their unit, and counts the things sold by the piece', () => {
    const profile = { ...BASE, diet: 'vegan' as const };
    const descriptions = [0, 1, 2, 3].flatMap((seed) =>
      buildMealPlan(profile, targetsFor(profile), seed).days.flatMap((d) => d.meals.map((m) => m.description))
    );
    const all = descriptions.join(' | ');
    expect(all).toMatch(/\d+ g plain soya yoghurt/);
    expect(all).toMatch(/\d+ ml olive oil/);
    // Bananas are bought by the piece, so they are counted rather than weighed.
    expect(all).toMatch(/\d+ bananas?/);
    expect(all).not.toMatch(/\d+ g bananas/);
  });

  it('builds a shopping list for the whole week', () => {
    const plan = buildMealPlan(BASE, targetsFor(BASE));
    expect(plan.shoppingList.length).toBeGreaterThan(5);
    expect(new Set(plan.shoppingList.map((i) => i.item)).size).toBe(plan.shoppingList.length);
  });
});

describe('formatQuantity', () => {
  it('converts to kg / L and rounds up', () => {
    expect(formatQuantity(1250, INGREDIENTS.riz_basmati)).toBe('1.25 kg');
    expect(formatQuantity(1500, INGREDIENTS.lait_demi_ecreme)).toBe('1.5 L');
    expect(formatQuantity(137, INGREDIENTS.brocoli)).toBe('140 g');
  });

  it('counts by the piece whatever is bought by the piece', () => {
    expect(formatQuantity(360, INGREDIENTS.oeuf)).toBe('6');
    expect(formatQuantity(225, INGREDIENTS.avocat)).toBe('2');
  });
});

describe('generateFitnessPlan', () => {
  it('is deterministic for a given seed and varies from week to week', () => {
    const targets = targetsFor(BASE);
    const a = generateFitnessPlan(BASE, targets, { seed: 1 });
    expect(generateFitnessPlan(BASE, targets, { seed: 1 })).toEqual(a);
    expect(generateFitnessPlan(BASE, targets, { seed: 2 }).meals).not.toEqual(a.meals);
  });

  it('explains the adjustment in the coach’s note after a check-in', () => {
    const plan = generateFitnessPlan(BASE, targetsFor(BASE), { checkin: { sessions_done: 0, energy: 1 } });
    expect(plan.coach_notes).toContain('An easier week');
  });
});

describe('protein intake', () => {
  it('favours the highest-protein recipes when the protein target is high', () => {
    const profile: FitnessProfileInput = {
      ...BASE,
      sex: 'femme',
      diet: 'vegetarien',
      height_cm: 165,
      weight_kg: 68,
      activity_level: 'leger',
    };
    const targets = targetsFor(profile);
    const averageProtein = (t: ReturnType<typeof targetsFor>) => {
      const days = buildMealPlan(profile, t).days;
      return days.reduce((sum, d) => sum + d.meals.reduce((s, m) => s + m.protein_g, 0), 0) / days.length;
    };

    const highProtein = averageProtein({ ...targets, proteinG: Math.round((targets.calories * 0.3) / 4) });
    const lowProtein = averageProtein({ ...targets, proteinG: Math.round((targets.calories * 0.15) / 4) });
    expect(highProtein).toBeGreaterThan(lowProtein);
  });
});

describe('affectsPlan', () => {
  it('flags the changes that make the plan on screen wrong', () => {
    expect(affectsPlan(BASE, { ...BASE, allergies: 'peanuts' })).toBe(true);
    expect(affectsPlan(BASE, { ...BASE, diet: 'vegetarien' })).toBe(true);
    expect(affectsPlan(BASE, { ...BASE, equipment: 'salle' })).toBe(true);
    expect(affectsPlan(BASE, { ...BASE, health_notes: 'sore knee' })).toBe(true);
    expect(affectsPlan(BASE, { ...BASE, days_per_week: 5 })).toBe(true);
    expect(affectsPlan(BASE, { ...BASE, weight_kg: 84 })).toBe(true);
    expect(affectsPlan(BASE, { ...BASE, goals: ['prise_masse'] })).toBe(true);
  });

  it('ignores the columns the database adds around the profile', () => {
    // fetchFitnessProfile does select('*'), so the profile read back holds columns the form
    // never rebuilds. Counting those as vanished made every save look
    // “changed”, and regenerated a programme nobody had asked to change.
    const fromDatabase = {
      ...BASE,
      user_id: 'abc',
      created_at: '2026-09-20T10:00:00Z',
      training_slot: 'soir',
      training_days: [0, 2, 4],
    } as unknown as FitnessProfileInput;
    expect(affectsPlan(fromDatabase, { ...BASE })).toBe(false);
    expect(affectsPlan(fromDatabase, { ...BASE, diet: 'vegan' })).toBe(true);
  });

  it('ignores what does not change the plan produced', () => {
    expect(affectsPlan(BASE, { ...BASE })).toBe(false);
    // The order of the goals has no effect on the generation.
    const twoGoals: FitnessProfileInput = { ...BASE, goals: ['perte_poids', 'endurance'] };
    expect(affectsPlan(twoGoals, { ...twoGoals, goals: ['endurance', 'perte_poids'] })).toBe(false);
    // Free-text fields: a space, or a field emptied rather than left null, must regenerate nothing.
    expect(affectsPlan({ ...BASE, allergies: 'peanuts' }, { ...BASE, allergies: ' peanuts ' })).toBe(false);
    expect(affectsPlan({ ...BASE, health_notes: null }, { ...BASE, health_notes: '  ' })).toBe(false);
  });

  it('with the same seed the plan is identical: correcting your profile does not reshuffle it', () => {
    const targets = targetsFor(BASE);
    const first = generateFitnessPlan(BASE, targets, { seed: 3 });
    const second = generateFitnessPlan(BASE, targets, { seed: 3 });
    expect(second).toEqual(first);
    expect(generateFitnessPlan(BASE, targets, { seed: 4 })).not.toEqual(first);
  });
});
