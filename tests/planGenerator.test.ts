import { describe, expect, it } from 'vitest';

import { EXERCISES } from '../src/features/fitness/exercises';
import { INGREDIENTS } from '../src/features/fitness/ingredients';
import { ageFromBirthYear, computeNutritionTargets } from '../src/features/fitness/nutrition';
import type { Diet } from '../src/features/fitness/options';
import {
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
  if (!def) throw new Error(`Exercice inconnu : ${name}`);
  return def;
}

describe('lecture des textes libres', () => {
  it('reconnaît les allergies courantes, accents et majuscules compris', () => {
    expect(parseAllergies('Intolérant au LACTOSE, allergique aux noix et aux œufs')).toEqual(
      expect.arrayContaining(['lactose', 'fruits_a_coque', 'oeufs'])
    );
  });

  it("ne confond pas « problème » avec le blé ni « bœuf » avec les œufs", () => {
    expect(parseAllergies('aucun problème, je mange du bœuf')).toEqual([]);
  });

  it('repère les gênes articulaires signalées', () => {
    expect(detectJointIssues('Mal de dos et une vieille blessure à l’épaule droite')).toEqual(['dos', 'epaule']);
  });
});

describe('buildWorkoutProgram', () => {
  it('prévoit exactement une séance par jour d’entraînement choisi', () => {
    for (let days = 1; days <= 6; days++) {
      expect(buildWorkoutProgram({ ...BASE, days_per_week: days })).toHaveLength(days);
    }
  });

  it('ne dépasse jamais le temps disponible, même en prise de masse sur 30 min', () => {
    for (const minutes of [30, 45, 60, 90]) {
      for (const goals of [['prise_masse'], ['perte_poids'], ['endurance'], ['bien_etre']] as const) {
        const program = buildWorkoutProgram({ ...BASE, goals: [...goals], session_minutes: minutes, experience: 'confirme', equipment: 'salle' });
        for (const session of program) expect(session.duration_minutes).toBeLessThanOrEqual(minutes);
      }
    }
  });

  it("n'utilise que le matériel disponible et le niveau de la personne", () => {
    const program = buildWorkoutProgram({ ...BASE, days_per_week: 6, session_minutes: 90 });
    for (const exercise of program.flatMap((s) => s.exercises)) {
      const def = exerciseDef(exercise.name);
      expect(def.equipment).toBe('poids_du_corps');
      expect(def.minLevel).toBe('debutant');
    }
  });

  it('retire les exercices qui sollicitent une articulation signalée', () => {
    const program = buildWorkoutProgram({
      ...BASE,
      experience: 'confirme',
      equipment: 'salle',
      days_per_week: 5,
      session_minutes: 90,
      health_notes: 'douleur au genou gauche',
    });
    for (const exercise of program.flatMap((s) => s.exercises)) {
      expect(exerciseDef(exercise.name).stress).not.toContain('genou');
    }
  });

  it('allège le volume après une semaine difficile', () => {
    const profile: FitnessProfileInput = { ...BASE, goals: ['salle'], experience: 'intermediaire', session_minutes: 90 };
    const normal = buildWorkoutProgram(profile, { intensity: 0 });
    const light = buildWorkoutProgram(profile, { intensity: -1 });
    expect(light[0].exercises[0].sets).toBe(normal[0].exercises[0].sets - 1);
  });
});

describe('intensityFromCheckin', () => {
  it('allège quand l’énergie est basse ou que moins de la moitié des séances a été faite', () => {
    expect(intensityFromCheckin({ sessions_done: 3, energy: 2 }, 3)).toBe(-1);
    expect(intensityFromCheckin({ sessions_done: 1, energy: 4 }, 4)).toBe(-1);
  });

  it('fait progresser après une semaine complète en forme', () => {
    expect(intensityFromCheckin({ sessions_done: 3, energy: 4 }, 3)).toBe(1);
  });

  it('garde le rythme sinon, et sans bilan', () => {
    expect(intensityFromCheckin({ sessions_done: 2, energy: 3 }, 3)).toBe(0);
    expect(intensityFromCheckin(undefined, 3)).toBe(0);
  });
});

describe('bibliothèque de recettes', () => {
  const mealTypes: MealType[] = ['petit_dejeuner', 'dejeuner', 'diner', 'collation'];
  const diets: Diet[] = ['omnivore', 'vegetarien', 'vegan', 'pescetarien', 'halal'];

  it('propose au moins une recette par repas pour chaque régime', () => {
    for (const diet of diets) {
      for (const type of mealTypes) {
        expect(RECIPES.some((r) => r.mealType === type && isRecipeCompatible(r, diet, []))).toBe(true);
      }
    }
  });

  it('offre de la variété (3 recettes ou plus par repas) aux omnivores', () => {
    for (const type of mealTypes) {
      expect(RECIPES.filter((r) => r.mealType === type).length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('buildMealPlan', () => {
  it('ajuste les portions pour rester proche de la cible calorique', () => {
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

  it("n'utilise aucun produit animal pour un régime vegan", () => {
    const profile = { ...BASE, diet: 'vegan' as const };
    const { usedIngredientIds } = buildMealPlan(profile, targetsFor(profile));
    for (const id of usedIngredientIds) expect(INGREDIENTS[id].animal).toBeUndefined();
  });

  it('exclut les allergènes signalés', () => {
    const profile = { ...BASE, allergies: 'lactose et arachides' };
    const plan = buildMealPlan(profile, targetsFor(profile));
    for (const id of plan.usedIngredientIds) {
      expect(INGREDIENTS[id].allergens).not.toContain('lactose');
      expect(INGREDIENTS[id].allergens).not.toContain('arachides');
    }
    expect(plan.warnings.join(' ')).toContain('lactose, arachides');
  });

  it("prévient quand une allergie n'est pas reconnue automatiquement", () => {
    const profile = { ...BASE, allergies: 'kiwi' };
    expect(buildMealPlan(profile, targetsFor(profile)).warnings.join(' ')).toContain("n'a pas pu être reconnue");
  });

  it('rappelle de choisir des viandes halal', () => {
    const profile = { ...BASE, diet: 'halal' as const };
    expect(buildMealPlan(profile, targetsFor(profile)).warnings).toContain('Choisissez des viandes et volailles certifiées halal.');
  });

  it('écrit des quantités en bon français (« de yaourt », « d’huile »)', () => {
    const profile = { ...BASE, diet: 'vegan' as const };
    const descriptions = [0, 1, 2, 3].flatMap((seed) =>
      buildMealPlan(profile, targetsFor(profile), seed).days.flatMap((d) => d.meals.map((m) => m.description))
    );
    const all = descriptions.join(' | ');
    expect(all).not.toMatch(/d'y/);
    expect(all).toMatch(/de yaourt/);
    expect(all).toMatch(/d'huile/);
  });

  it('construit une liste de courses pour toute la semaine', () => {
    const plan = buildMealPlan(BASE, targetsFor(BASE));
    expect(plan.shoppingList.length).toBeGreaterThan(5);
    expect(new Set(plan.shoppingList.map((i) => i.item)).size).toBe(plan.shoppingList.length);
  });
});

describe('formatQuantity', () => {
  it('convertit en kg / L et arrondit vers le haut', () => {
    expect(formatQuantity(1250, INGREDIENTS.riz_basmati)).toBe('1,25 kg');
    expect(formatQuantity(1500, INGREDIENTS.lait_demi_ecreme)).toBe('1,5 L');
    expect(formatQuantity(137, INGREDIENTS.brocoli)).toBe('140 g');
  });

  it('compte à la pièce ce qui s’achète à la pièce', () => {
    expect(formatQuantity(360, INGREDIENTS.oeuf)).toBe('6');
    expect(formatQuantity(225, INGREDIENTS.avocat)).toBe('2');
  });
});

describe('generateFitnessPlan', () => {
  it('est déterministe pour un même seed et varie d’une semaine à l’autre', () => {
    const targets = targetsFor(BASE);
    const a = generateFitnessPlan(BASE, targets, { seed: 1 });
    expect(generateFitnessPlan(BASE, targets, { seed: 1 })).toEqual(a);
    expect(generateFitnessPlan(BASE, targets, { seed: 2 }).meals).not.toEqual(a.meals);
  });

  it('explique l’ajustement dans le mot du coach après un bilan', () => {
    const plan = generateFitnessPlan(BASE, targetsFor(BASE), { checkin: { sessions_done: 0, energy: 1 } });
    expect(plan.coach_notes).toContain('Semaine allégée');
  });
});

describe('apport en protéines', () => {
  it('privilégie les recettes les plus protéinées quand la cible protéique est élevée', () => {
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
