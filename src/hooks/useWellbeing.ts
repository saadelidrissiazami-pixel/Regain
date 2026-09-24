import { useQuery } from '@tanstack/react-query';

import type { WellbeingProgram } from '../features/wellbeing/types';
import { usePremium } from '../lib/premium';
import { fetchCompletedProgramIds, fetchPrograms, fetchWellbeingJournal } from '../lib/wellbeing';
import { useAuthStore } from '../store/authStore';

/** The wellbeing library: sessions, sessions done, the journal, and Premium access. */
export function useWellbeing() {
  const userId = useAuthStore((s) => s.session?.user.id);
  // Until the Premium entitlement resolves, no padlock is shown: otherwise a subscriber would
  // see their sessions locked while it resolves.
  const { isPremium, isLoading: premiumLoading } = usePremium();

  const programsQuery = useQuery({ queryKey: ['wellbeingPrograms'], queryFn: fetchPrograms });
  const completedQuery = useQuery({
    queryKey: ['completedPrograms', userId],
    queryFn: () => fetchCompletedProgramIds(userId!),
    enabled: !!userId,
  });
  const journalQuery = useQuery({
    queryKey: ['wellbeingJournal', userId],
    queryFn: () => fetchWellbeingJournal(userId!, 20),
    enabled: !!userId,
  });

  const completed = completedQuery.data ?? new Set<string>();
  return {
    userId,
    isPremium,
    programs: programsQuery.data ?? [],
    programsQuery,
    completed,
    journal: journalQuery.data ?? [],
    isLocked: (program: WellbeingProgram) => program.premium_only && !isPremium && !premiumLoading,
    hrefFor: (program: WellbeingProgram) =>
      program.premium_only && !isPremium && !premiumLoading ? '/paywall?source=locked' : `/wellbeing/${program.slug}`,
    refetch: () => Promise.all([programsQuery.refetch(), completedQuery.refetch(), journalQuery.refetch()]),
    isRefetching: programsQuery.isRefetching,
  };
}
