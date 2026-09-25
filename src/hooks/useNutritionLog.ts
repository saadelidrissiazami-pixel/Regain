import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { parseAllergies } from '../features/fitness/planGenerator';
import {
  complementsFor,
  dayTotals,
  nutritionStatus,
  type Complement,
  type DayTotals,
  type NutritionStatus,
} from '../features/fitness/nutritionProgress';
import {
  addNutritionEntry,
  deleteNutritionEntry,
  fetchNutritionDay,
  type NewNutritionEntry,
  type NutritionEntry,
} from '../lib/nutritionLog';
import { useFitness } from './useFitness';

export type NutritionLog = {
  entries: NutritionEntry[];
  totals: DayTotals;
  target: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  status: NutritionStatus;
  /** What is left before the target. Never below zero: a gap is a gap, not a debt. */
  remainingKcal: number;
  remainingProteinG: number;
  /** Only ever filled once the day is close enough for it to mean something. */
  complements: Complement[];
  isLoading: boolean;
  isError: boolean;
  add: (entry: NewNutritionEntry) => void;
  remove: (id: string) => void;
  adding: boolean;
  addError: unknown;
  refetch: () => void;
};

/** One day of eating, read against the target the fitness profile already produces. */
export function useNutritionLog(date?: string): NutritionLog {
  const fitness = useFitness();
  const queryClient = useQueryClient();
  const { userId, profile, targets } = fitness;
  const day = date ?? fitness.today;

  const query = useQuery({
    queryKey: ['nutritionDay', userId, day],
    queryFn: () => fetchNutritionDay(userId!, day),
    enabled: !!userId,
  });

  const entries = useMemo(() => query.data ?? [], [query.data]);
  const totals = useMemo(() => dayTotals(entries), [entries]);
  const target = targets?.calories ?? 0;
  const proteinTarget = targets?.proteinG ?? 0;
  // Both already come out of computeNutritionTargets; nothing here needed working out.
  const carbsTarget = targets?.carbsG ?? 0;
  const fatTarget = targets?.fatG ?? 0;
  const status = nutritionStatus(totals.calories, target, entries.length);
  const remainingKcal = Math.max(0, target - totals.calories);
  const remainingProteinG = Math.max(0, proteinTarget - totals.proteinG);

  const complements = useMemo(
    () =>
      // Suggested only while there is still a gap worth closing. Once the target is met the app
      // has nothing to add, and once it is passed it says nothing at all.
      status === 'close' || status === 'under'
        ? complementsFor({
            remainingKcal,
            remainingProteinG,
            proteinTargetG: proteinTarget,
            allergens: parseAllergies(profile?.allergies ?? ''),
            diet: profile?.diet ?? 'omnivore',
          })
        : [],
    [status, remainingKcal, remainingProteinG, proteinTarget, profile?.allergies, profile?.diet]
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['nutritionDay', userId, day] });
    queryClient.invalidateQueries({ queryKey: ['nutritionRange', userId] });
  };

  const addMutation = useMutation({
    mutationFn: (entry: NewNutritionEntry) => addNutritionEntry(userId!, { date: day, ...entry }),
    onSuccess: invalidate,
  });

  const removeMutation = useMutation({ mutationFn: deleteNutritionEntry, onSuccess: invalidate });

  return {
    entries,
    totals,
    target,
    proteinTarget,
    carbsTarget,
    fatTarget,
    status,
    remainingKcal,
    remainingProteinG,
    complements,
    isLoading: query.isLoading,
    isError: query.isError,
    add: (entry) => addMutation.mutate(entry),
    remove: (id) => removeMutation.mutate(id),
    adding: addMutation.isPending,
    addError: addMutation.error,
    refetch: () => query.refetch(),
  };
}
