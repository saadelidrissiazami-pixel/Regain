import { useQuery } from '@tanstack/react-query';

import { summarizeAdjustments } from '../features/fitness/planDiff';
import { buildWeekTracker, isDeloadWeek, nextWorkout, trainingDays } from '../features/fitness/schedule';
import {
  countFitnessPlans,
  fetchFitnessProfile,
  fetchLatestFitnessPlans,
  fetchRecentCheckins,
  fetchTrainingSchedule,
  fetchWorkoutLogs,
  targetsForProfile,
} from '../lib/fitness';
import { usePremium } from '../lib/premium';
import { useToday, useWeekStart } from '../lib/useCurrentDate';
import { fromLocalISODate } from '../lib/week';
import { useAuthStore } from '../store/authStore';

/** Tout ce que l'espace Forme affiche : profil, programme, bilans, séances faites, planning. */
export function useFitness() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const today = useToday();
  const weekStart = useWeekStart();
  const enabled = !!userId && isPremium;

  const profileQuery = useQuery({ queryKey: ['fitnessProfile', userId], queryFn: () => fetchFitnessProfile(userId!), enabled });
  // Programme en cours + précédent : sert à montrer ce que le dernier bilan a changé.
  const plansQuery = useQuery({ queryKey: ['fitnessPlans', userId], queryFn: () => fetchLatestFitnessPlans(userId!, 2), enabled });
  const checkinsQuery = useQuery({ queryKey: ['fitnessCheckins', userId], queryFn: () => fetchRecentCheckins(userId!, 8), enabled });
  const scheduleQuery = useQuery({ queryKey: ['trainingSchedule', userId], queryFn: () => fetchTrainingSchedule(userId!), enabled });
  const planCountQuery = useQuery({ queryKey: ['fitnessPlanCount', userId], queryFn: () => countFitnessPlans(userId!), enabled });
  const logsQuery = useQuery({
    queryKey: ['workoutLogs', userId, weekStart],
    queryFn: () => {
      // 4 semaines : la semaine en cours pour le suivi, les précédentes pour la progression.
      const since = fromLocalISODate(weekStart);
      since.setDate(since.getDate() - 21);
      return fetchWorkoutLogs(userId!, since.toISOString());
    },
    enabled,
  });

  const profile = profileQuery.data ?? null;
  const plans = plansQuery.data ?? [];
  const plan = plans[0] ?? null;
  const checkins = checkinsQuery.data ?? [];
  const lastCheckin = checkins[0] ?? null;
  const logs = logsQuery.data ?? [];
  const weekStartIso = fromLocalISODate(weekStart).toISOString();
  const logsThisWeek = logs.filter((log) => log.completed_at >= weekStartIso);
  const schedule = scheduleQuery.data ?? { training_slot: null, training_days: null };
  const days = profile ? trainingDays(schedule.training_days, profile.days_per_week) : [];

  const adjustments =
    profile && lastCheckin && plan && plan.created_at > lastCheckin.created_at
      ? summarizeAdjustments({
          previous: plans[1] ?? null,
          next: plan,
          checkin: lastCheckin,
          daysPerWeek: profile.days_per_week,
          previousWeightKg: checkins[1]?.weight_kg ?? null,
          newWeightKg: lastCheckin.weight_kg,
        })
      : null;

  return {
    userId,
    today,
    weekStart,
    isPremium,
    premiumLoading,
    profile,
    plan,
    checkins,
    lastCheckin,
    logs,
    logsThisWeek,
    schedule,
    days,
    targets: plan?.targets ?? (profile ? targetsForProfile(profile) : null),
    weekNumber: planCountQuery.data ?? null,
    adjustments,
    deload: profile ? isDeloadWeek(plan, lastCheckin, profile.days_per_week) : false,
    next:
      plan && profile
        ? nextWorkout({
            weekStart,
            today,
            days,
            slot: schedule.training_slot,
            sessionsCount: plan.program.length,
            logsThisWeek,
          })
        : null,
    tracker: profile ? buildWeekTracker({ weekStart, today, days, logs: logsThisWeek }) : [],
    isLoading: premiumLoading || (enabled && (profileQuery.isLoading || plansQuery.isLoading)),
    isError: profileQuery.isError || plansQuery.isError,
    refetch: () => Promise.all([profileQuery.refetch(), plansQuery.refetch(), checkinsQuery.refetch(), logsQuery.refetch(), scheduleQuery.refetch()]),
    isRefetching: profileQuery.isRefetching || plansQuery.isRefetching,
  };
}
