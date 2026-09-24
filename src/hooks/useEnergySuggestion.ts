import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { EnergyLevel } from '../features/planning/catalog';
import { recommendWellbeing } from '../features/wellbeing/recommend';
import type { WellbeingProgram } from '../features/wellbeing/types';
import { usePremium } from '../lib/premium';
import { fetchCompletedProgramIds, fetchPrograms } from '../lib/wellbeing';
import { useAuthStore } from '../store/authStore';

export type EnergySuggestion = { program: WellbeingProgram; reason: string; href: string };

/**
 * One session to offer once somebody has said how their energy is, so the answer leads somewhere
 * instead of only being recorded.
 *
 * It comes from the recommender the Wellbeing screen already uses, rather than a slug fixed here:
 * that one prefers short sessions on a low day, skips what has been done, reads the time of day,
 * and never returns a locked session to a free account — so whatever comes back can be started.
 */
export function useEnergySuggestion(level: EnergyLevel | null): EnergySuggestion | null {
  const userId = useAuthStore((s) => s.session?.user.id);
  const { isPremium, isLoading: premiumLoading } = usePremium();
  // The query keys the Wellbeing screen uses, so this reads its cache instead of fetching again.
  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const completedQuery = useQuery({
    queryKey: ['completedPrograms', userId],
    queryFn: () => fetchCompletedProgramIds(userId!),
    enabled: !!userId,
  });
  // Fixed for as long as the card is mounted: the suggestion must not change under the reader
  // because an hour happened to tick over.
  const [hour] = useState(() => new Date().getHours());

  const programs = programsQuery.data ?? [];
  // While Premium is still resolving, a subscriber would be offered only the free sessions.
  if (!level || premiumLoading || programs.length === 0) return null;

  const [best] = recommendWellbeing(
    { programs, completedIds: completedQuery.data ?? new Set<string>(), hour, energy: level, isPremium },
    1
  );
  return best ? { program: best.program, reason: best.reason, href: `/wellbeing/${best.program.slug}` } : null;
}
