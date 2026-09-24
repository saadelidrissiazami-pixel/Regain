import type { CatalogActivity } from '../../features/planning/catalog';
import { computeActivityFit } from '../../features/planning/recommendation';
import { t } from '../../lib/i18n';
import type { UserPreferences } from '../../lib/planning';

/** Why this activity is suggested, in one sentence (null when there is nothing specific to say). */
export function activityReason(activity: CatalogActivity, prefs: UserPreferences | undefined): string | null {
  if (!prefs) return null;
  const fit = computeActivityFit(activity, prefs);
  if (fit.matchedGoalLabels.length > 0) {
    return t('Chosen for your goal: {goal}.', { goal: fit.matchedGoalLabels[0].toLowerCase() });
  }
  if (fit.goodEnergySlotLabels.length > 0 && fit.goodEnergySlotLabels.length < 3) {
    return t('Suits your usual energy in the {slot}.', { slot: fit.goodEnergySlotLabels[0].toLowerCase() });
  }
  return null;
}
