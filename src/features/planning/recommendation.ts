import { ENERGY_SLOTS, GOAL_OPTIONS } from '../onboarding/options';
import { energyMeetsRequirement, fitsBudget, type CatalogActivity } from './catalog';
import type { UserPreferences } from '../../lib/planning';

export type ActivityFit = {
  matchedGoalLabels: string[];
  goodEnergySlotLabels: string[];
  budgetFits: boolean;
};

export function computeActivityFit(activity: CatalogActivity, prefs: UserPreferences): ActivityFit {
  const matchedGoalLabels = GOAL_OPTIONS.filter((g) => activity.tags.includes(g.value)).map((g) => g.label);

  const goodEnergySlotLabels = ENERGY_SLOTS.filter((slot) => {
    const userEnergy = prefs.typical_energy_by_slot[slot.key] ?? 'moyen';
    return energyMeetsRequirement(userEnergy, activity.energy_required);
  }).map((slot) => slot.label);

  const budgetFits = fitsBudget(activity.cost_level, prefs.budget_level);

  return { matchedGoalLabels, goodEnergySlotLabels, budgetFits };
}

export function pickComplementaryActivities(
  activity: CatalogActivity,
  catalog: CatalogActivity[],
  prefs: UserPreferences,
  count = 2
): CatalogActivity[] {
  return catalog
    .filter((a) => a.id !== activity.id)
    .map((a) => ({ a, score: a.tags.filter((t) => prefs.primary_goals.includes(t)).length }))
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, count)
    .map((x) => x.a);
}
