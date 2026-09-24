import { useMemo } from 'react';

import { weekCommitments, type PlanningCommitment } from '../features/planning/commitments';
import { useFitness } from './useFitness';

/**
 * The week's sessions and shopping, ready to show in the plan.
 *
 * They are recomputed from the fitness programme on every read: the plan keeps no copy of them,
 * and so cannot show a session the programme no longer contains.
 */
export function useCommitments(): PlanningCommitment[] {
  const { isPremium, plan, tracker, schedule, today } = useFitness();

  return useMemo(() => {
    if (!isPremium || !plan) return [];
    return weekCommitments({
      tracker,
      program: plan.program,
      slot: schedule.training_slot,
      shoppingItemCount: plan.shopping_list.length,
      today,
    });
  }, [isPremium, plan, tracker, schedule.training_slot, today]);
}
