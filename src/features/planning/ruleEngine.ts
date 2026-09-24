import type { AvailabilitySlot, TimeSlot } from '../availability/types';
import { energyMeetsRequirement, fitsBudget, type BudgetLevel, type CatalogActivity, type EnergyLevel } from './catalog';
import { getDateForDayOfWeek } from '../../lib/week';
import { durationMinutes } from '../../lib/time';
import type { CategoryAffinity } from '../../lib/personalization';

export type EnergyBySlot = Partial<Record<TimeSlot, EnergyLevel>>;

export type GeneratedItem = {
  date: string;
  timeSlot: TimeSlot;
  activity: CatalogActivity;
};

const SLOT_ORDER: TimeSlot[] = ['matin', 'apres_midi', 'soir'];

function resolveSlotDate(slot: AvailabilitySlot, weekStart: string, weekEnd: string): string | null {
  if (slot.is_recurring && slot.day_of_week !== null) {
    return getDateForDayOfWeek(weekStart, slot.day_of_week);
  }
  if (!slot.is_recurring && slot.specific_date) {
    return slot.specific_date >= weekStart && slot.specific_date <= weekEnd ? slot.specific_date : null;
  }
  return null;
}

export function generateWeeklyPlan(params: {
  availability: AvailabilitySlot[];
  catalog: CatalogActivity[];
  primaryGoals: string[];
  energyBySlot: EnergyBySlot;
  budgetLevel: BudgetLevel;
  weekStart: string;
  categoryAffinity?: CategoryAffinity;
  /** Activities already done this week: their slot is taken and must not be regenerated. */
  keptItems?: GeneratedItem[];
}): GeneratedItem[] {
  const {
    availability,
    catalog,
    primaryGoals,
    energyBySlot,
    budgetLevel,
    weekStart,
    categoryAffinity = {},
    keptItems = [],
  } = params;
  const weekEnd = getDateForDayOfWeek(weekStart, 6);

  const resolvedSlots = availability
    .map((slot) => ({ slot, date: resolveSlotDate(slot, weekStart, weekEnd) }))
    .filter((s): s is { slot: AvailabilitySlot; date: string } => s.date !== null)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return SLOT_ORDER.indexOf(a.slot.time_slot) - SLOT_ORDER.indexOf(b.slot.time_slot);
    });

  const categoryCounts: Record<string, number> = {};
  const usedActivityIds = new Set<string>();
  const occupiedSlots = new Set<string>();
  const results: GeneratedItem[] = [];

  for (const item of keptItems) {
    categoryCounts[item.activity.category] = (categoryCounts[item.activity.category] ?? 0) + 1;
    usedActivityIds.add(item.activity.id);
    occupiedSlots.add(`${item.date}|${item.timeSlot}`);
  }

  for (const { slot, date } of resolvedSlots) {
    if (occupiedSlots.has(`${date}|${slot.time_slot}`)) continue;
    const userEnergy = energyBySlot[slot.time_slot] ?? 'moyen';
    const availableMinutes = durationMinutes(slot.start_time, slot.end_time);

    const eligible = catalog.filter(
      (a) =>
        energyMeetsRequirement(userEnergy, a.energy_required) &&
        fitsBudget(a.cost_level, budgetLevel) &&
        a.duration_minutes <= availableMinutes
    );
    if (eligible.length === 0) continue;

    let best: CatalogActivity | null = null;
    let bestScore = -Infinity;
    for (const activity of eligible) {
      const tagScore = activity.tags.filter((t) => primaryGoals.includes(t)).length * 2;
      const varietyBonus = -(categoryCounts[activity.category] ?? 0);
      const repeatPenalty = usedActivityIds.has(activity.id) ? -3 : 0;
      // Categories the user often finishes are nudged up; the ones often skipped are nudged
      // down, without ever being excluded.
      const affinityBonus = ((categoryAffinity[activity.category] ?? 0.5) - 0.5) * 4;
      const score = tagScore + varietyBonus + repeatPenalty + affinityBonus + Math.random() * 0.3;
      if (score > bestScore) {
        bestScore = score;
        best = activity;
      }
    }
    if (!best) continue;

    categoryCounts[best.category] = (categoryCounts[best.category] ?? 0) + 1;
    usedActivityIds.add(best.id);
    results.push({ date, timeSlot: slot.time_slot, activity: best });
  }

  return results;
}
