import type { CatalogActivity } from '../../features/planning/catalog';
import { computeActivityFit } from '../../features/planning/recommendation';
import type { UserPreferences } from '../../lib/planning';

/** Pourquoi cette activité est proposée, en une phrase (null si on n'a rien de précis à dire). */
export function activityReason(activity: CatalogActivity, prefs: UserPreferences | undefined): string | null {
  if (!prefs) return null;
  const fit = computeActivityFit(activity, prefs);
  if (fit.matchedGoalLabels.length > 0) {
    return `Chosen for your goal: ${fit.matchedGoalLabels[0].toLowerCase()}.`;
  }
  if (fit.goodEnergySlotLabels.length > 0 && fit.goodEnergySlotLabels.length < 3) {
    return `Suits your usual energy in the ${fit.goodEnergySlotLabels[0].toLowerCase()}.`;
  }
  return null;
}
