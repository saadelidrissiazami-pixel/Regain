import { intensityFromCheckin } from './planGenerator';
import type { FitnessCheckinInput, MealDay, WorkoutSession } from './types';
import type { NutritionTargets } from './nutrition';

export type PlanAdjustment = { icon: string; label: string; detail?: string };

type PlanLike = {
  targets: NutritionTargets;
  program: WorkoutSession[];
  meals: MealDay[];
  shopping_list: unknown[];
};

const INTENSITY_LABEL: Record<-1 | 0 | 1, { label: string; detail: string }> = {
  [-1]: {
    label: 'Semaine allégée',
    detail: 'Une série de moins par exercice, pour repartir sans forcer.',
  },
  [0]: {
    label: 'Même rythme',
    detail: 'Le volume reste le même, avec de nouveaux exercices.',
  },
  [1]: {
    label: 'Semaine plus soutenue',
    detail: 'Une série de plus par exercice, puisque la semaine est bien passée.',
  },
};

function frenchNumber(value: number): string {
  return String(Math.round(value * 10) / 10).replace('.', ',');
}

/** Nombre de plats du nouveau programme absents de l'ancien. */
export function countNewDishes(previous: MealDay[] | undefined, next: MealDay[]): number {
  const before = new Set((previous ?? []).flatMap((day) => day.meals.map((meal) => meal.name)));
  const after = new Set(next.flatMap((day) => day.meals.map((meal) => meal.name)));
  return [...after].filter((name) => !before.has(name)).length;
}

/** Ce que le bilan a changé, en clair : intensité, séances, calories, poids, menus, courses. */
export function summarizeAdjustments({
  previous,
  next,
  checkin,
  daysPerWeek,
  previousWeightKg,
  newWeightKg,
}: {
  previous: PlanLike | null;
  next: PlanLike;
  checkin?: Pick<FitnessCheckinInput, 'sessions_done' | 'energy'>;
  daysPerWeek: number;
  previousWeightKg?: number | null;
  newWeightKg?: number | null;
}): PlanAdjustment[] {
  const adjustments: PlanAdjustment[] = [];

  const intensity = intensityFromCheckin(checkin, daysPerWeek);
  const { label, detail } = INTENSITY_LABEL[intensity];
  adjustments.push({ icon: '🏋️', label, detail });

  const totalMinutes = next.program.reduce((sum, session) => sum + session.duration_minutes, 0);
  adjustments.push({
    icon: '📅',
    label: `${next.program.length} séance${next.program.length > 1 ? 's' : ''} cette semaine`,
    detail: `${totalMinutes} min au total, échauffement et retour au calme compris.`,
  });

  const caloriesBefore = previous?.targets.calories;
  if (caloriesBefore !== undefined && caloriesBefore !== next.targets.calories) {
    const delta = next.targets.calories - caloriesBefore;
    adjustments.push({
      icon: '🔥',
      label: `Cible : ${caloriesBefore} → ${next.targets.calories} kcal`,
      detail: `${delta > 0 ? '+' : ''}${delta} kcal par jour, recalculé ${
        typeof newWeightKg === 'number' ? 'avec votre poids du jour' : 'avec votre profil à jour'
      }.`,
    });
  } else {
    adjustments.push({
      icon: '🔥',
      label: `Cible inchangée : ${next.targets.calories} kcal par jour`,
    });
  }

  if (typeof newWeightKg === 'number' && typeof previousWeightKg === 'number' && newWeightKg !== previousWeightKg) {
    const delta = newWeightKg - previousWeightKg;
    adjustments.push({
      icon: '⚖️',
      label: `Poids : ${frenchNumber(previousWeightKg)} → ${frenchNumber(newWeightKg)} kg`,
      detail: `${delta > 0 ? '+' : '−'}${frenchNumber(Math.abs(delta))} kg depuis le dernier bilan.`,
    });
  }

  const newDishes = countNewDishes(previous?.meals, next.meals);
  const totalDishes = next.meals.flatMap((day) => day.meals).length;
  adjustments.push({
    icon: '🍽️',
    label: newDishes > 0 ? `${newDishes} nouveau${newDishes > 1 ? 'x' : ''} plat${newDishes > 1 ? 's' : ''}` : 'Mêmes plats que la semaine passée',
    detail: `${next.meals.length} journées types, ${totalDishes} repas en tout.`,
  });

  adjustments.push({
    icon: '🛒',
    label: `Liste de courses mise à jour : ${next.shopping_list.length} articles`,
  });

  return adjustments;
}
