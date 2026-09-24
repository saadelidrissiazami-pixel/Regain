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
    label: 'An easier week',
    detail: 'One set fewer per exercise, to get going again without forcing it.',
  },
  [0]: {
    label: 'Same rhythm',
    detail: 'The volume stays the same, with new exercises.',
  },
  [1]: {
    label: 'A harder week',
    detail: 'One extra set per exercise, since last week went well.',
  },
};

function oneDecimal(value: number): string {
  return String(Math.round(value * 10) / 10);
}

/** How many dishes in the new programme were not in the old one. */
export function countNewDishes(previous: MealDay[] | undefined, next: MealDay[]): number {
  const before = new Set((previous ?? []).flatMap((day) => day.meals.map((meal) => meal.name)));
  const after = new Set(next.flatMap((day) => day.meals.map((meal) => meal.name)));
  return [...after].filter((name) => !before.has(name)).length;
}

/** What the check-in changed, in plain words: intensity, sessions, calories, weight, meals, shopping. */
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
    label: `${next.program.length} session${next.program.length > 1 ? 's' : ''} this week`,
    detail: `${totalMinutes} min in total, warm-up and cool-down included.`,
  });

  const caloriesBefore = previous?.targets.calories;
  if (caloriesBefore !== undefined && caloriesBefore !== next.targets.calories) {
    const delta = next.targets.calories - caloriesBefore;
    adjustments.push({
      icon: '🔥',
      label: `Target: ${caloriesBefore} → ${next.targets.calories} kcal`,
      detail: `${delta > 0 ? '+' : ''}${delta} kcal a day, recalculated ${
        typeof newWeightKg === 'number' ? 'from today’s weight' : 'from your updated profile'
      }.`,
    });
  } else {
    adjustments.push({
      icon: '🔥',
      label: `Target unchanged: ${next.targets.calories} kcal a day`,
    });
  }

  if (typeof newWeightKg === 'number' && typeof previousWeightKg === 'number' && newWeightKg !== previousWeightKg) {
    const delta = newWeightKg - previousWeightKg;
    adjustments.push({
      icon: '⚖️',
      label: `Weight: ${oneDecimal(previousWeightKg)} → ${oneDecimal(newWeightKg)} kg`,
      detail: `${delta > 0 ? '+' : '−'}${oneDecimal(Math.abs(delta))} kg since the last check-in.`,
    });
  }

  const newDishes = countNewDishes(previous?.meals, next.meals);
  const totalDishes = next.meals.flatMap((day) => day.meals).length;
  adjustments.push({
    icon: '🍽️',
    label: newDishes > 0 ? `${newDishes} new dish${newDishes > 1 ? 'es' : ''}` : 'Same dishes as last week',
    detail: `${next.meals.length} sample days, ${totalDishes} meals in all.`,
  });

  adjustments.push({
    icon: '🛒',
    label: `Shopping list updated: ${next.shopping_list.length} items`,
  });

  return adjustments;
}
