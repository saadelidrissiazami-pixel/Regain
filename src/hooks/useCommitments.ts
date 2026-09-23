import { useMemo } from 'react';

import { weekCommitments, type PlanningCommitment } from '../features/planning/commitments';
import { useFitness } from './useFitness';

/**
 * Les séances et les courses de la semaine, prêtes à être affichées dans le planning.
 *
 * Elles se recalculent depuis le programme forme à chaque lecture : le planning n'en garde
 * aucune copie, et ne peut donc pas afficher une séance que le programme ne contient plus.
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
