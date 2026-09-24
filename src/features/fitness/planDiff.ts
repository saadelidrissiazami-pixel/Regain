import { intensityFromCheckin } from './planGenerator';
import type { FitnessCheckinInput, MealDay, WorkoutSession } from './types';
import type { NutritionTargets } from './nutrition';
import { locale, t } from '../../lib/i18n';

export type PlanAdjustment = { icon: string; label: string; detail?: string };

type PlanLike = {
  targets: NutritionTargets;
  program: WorkoutSession[];
  meals: MealDay[];
  shopping_list: unknown[];
};

const INTENSITY_LABEL: Record<-1 | 0 | 1, { label: string; detail: string }> = {
  [-1]: {
    label: t('An easier week'),
    detail: t('One set fewer per exercise, to get going again without forcing it.'),
  },
  [0]: {
    label: t('Same rhythm'),
    detail: t('The volume stays the same, with new exercises.'),
  },
  [1]: {
    label: t('A harder week'),
    detail: t('One extra set per exercise, since last week went well.'),
  },
};

function oneDecimal(value: number): string {
  return (Math.round(value * 10) / 10).toLocaleString(locale);
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
    label:
      next.program.length > 1
        ? t('{count} sessions this week', { count: next.program.length })
        : t('{count} session this week', { count: next.program.length }),
    detail: t('{minutes} min in total, warm-up and cool-down included.', { minutes: totalMinutes }),
  });

  const caloriesBefore = previous?.targets.calories;
  if (caloriesBefore !== undefined && caloriesBefore !== next.targets.calories) {
    const delta = next.targets.calories - caloriesBefore;
    adjustments.push({
      icon: '🔥',
      label: t('Target: {before} → {after} kcal', { before: caloriesBefore, after: next.targets.calories }),
      detail: t('{delta} kcal a day, recalculated {source}.', {
        delta: `${delta > 0 ? '+' : ''}${delta}`,
        source: typeof newWeightKg === 'number' ? t('from today’s weight') : t('from your updated profile'),
      }),
    });
  } else {
    adjustments.push({
      icon: '🔥',
      label: t('Target unchanged: {calories} kcal a day', { calories: next.targets.calories }),
    });
  }

  if (typeof newWeightKg === 'number' && typeof previousWeightKg === 'number' && newWeightKg !== previousWeightKg) {
    const delta = newWeightKg - previousWeightKg;
    adjustments.push({
      icon: '⚖️',
      label: t('Weight: {before} → {after} kg', { before: oneDecimal(previousWeightKg), after: oneDecimal(newWeightKg) }),
      detail: t('{delta} kg since the last check-in.', { delta: `${delta > 0 ? '+' : '−'}${oneDecimal(Math.abs(delta))}` }),
    });
  }

  const newDishes = countNewDishes(previous?.meals, next.meals);
  const totalDishes = next.meals.flatMap((day) => day.meals).length;
  adjustments.push({
    icon: '🍽️',
    label:
      newDishes > 1
        ? t('{count} new dishes', { count: newDishes })
        : newDishes === 1
          ? t('{count} new dish', { count: newDishes })
          : t('Same dishes as last week'),
    detail: t('{days} sample days, {meals} meals in all.', { days: next.meals.length, meals: totalDishes }),
  });

  adjustments.push({
    icon: '🛒',
    label: t('Shopping list updated: {count} items', { count: next.shopping_list.length }),
  });

  return adjustments;
}
