import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { haptic } from '../components/ui/motion';
import type { AvailabilitySlot } from '../features/availability/types';
import { resolveStartTime } from '../features/planning/schedule';
import { buildWeekView } from '../features/planning/weekView';
import { fetchAvailabilitySlots } from '../lib/availability';
import { autoSyncWeekPlan, syncWeekPlanToCalendar } from '../lib/deviceCalendar';
import { scheduleActivityReminders } from '../lib/notifications';
import {
  fetchPreferences,
  fetchWeekPlan,
  generateAndSaveWeekPlan,
  markActivityDone,
  markActivityUndone,
  type PlannedActivityRow,
} from '../lib/planning';
import { fetchProfile } from '../lib/profile';
import { useToday, useWeekStart } from '../lib/useCurrentDate';
import { useAuthStore } from '../store/authStore';

/** Données et actions du planning de la semaine, partagées par l'accueil et la vue semaine. */
export function usePlanning() {
  const userId = useAuthStore((s) => s.session?.user.id);
  const queryClient = useQueryClient();
  const weekStart = useWeekStart();
  const today = useToday();

  const availabilityQuery = useQuery({
    queryKey: ['availability', userId],
    queryFn: () => fetchAvailabilitySlots(userId!),
    enabled: !!userId,
  });
  const planQuery = useQuery({
    queryKey: ['weekPlan', userId, weekStart],
    queryFn: () => fetchWeekPlan(userId!, weekStart),
    enabled: !!userId,
  });
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
  const preferencesQuery = useQuery({
    queryKey: ['preferences', userId],
    queryFn: () => fetchPreferences(userId!),
    enabled: !!userId,
  });

  const availability: AvailabilitySlot[] = availabilityQuery.data ?? [];

  const invalidateProgress = () => {
    queryClient.invalidateQueries({ queryKey: ['weekPlan', userId] });
    queryClient.invalidateQueries({ queryKey: ['planRange', userId] });
    queryClient.invalidateQueries({ queryKey: ['trackingStats', userId] });
    queryClient.invalidateQueries({ queryKey: ['streak', userId] });
    queryClient.invalidateQueries({ queryKey: ['completedActivities', userId] });
    queryClient.invalidateQueries({ queryKey: ['completedCount', userId] });
  };

  const generateMutation = useMutation({
    mutationFn: () => generateAndSaveWeekPlan(userId!, weekStart),
    onSuccess: (data) => {
      haptic.success();
      queryClient.setQueryData(['weekPlan', userId, weekStart], data);
      queryClient.invalidateQueries({ queryKey: ['planRange', userId] });
      scheduleActivityReminders(data, availability).catch(() => {});
      autoSyncWeekPlan(data, availability, weekStart).catch(() => {});
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (item: PlannedActivityRow) =>
      item.status === 'realise' ? markActivityUndone(userId!, item.id) : markActivityDone(userId!, item.id),
    onSuccess: invalidateProgress,
  });

  const calendarSyncMutation = useMutation({
    mutationFn: () => syncWeekPlanToCalendar(planQuery.data ?? [], availability, weekStart),
    onSuccess: () => haptic.success(),
  });

  const [refreshing, setRefreshing] = useState(false);
  const refetchAvailability = availabilityQuery.refetch;
  const refetchPlan = planQuery.refetch;
  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchAvailability(), refetchPlan()]);
    setRefreshing(false);
  }, [refetchAvailability, refetchPlan]);

  const items = planQuery.data ?? [];
  const view = buildWeekView(items, today);

  return {
    userId,
    today,
    weekStart,
    items,
    view,
    availability,
    profile: profileQuery.data,
    preferences: preferencesQuery.data,
    planQuery,
    availabilityQuery,
    generateMutation,
    toggleMutation,
    calendarSyncMutation,
    refreshing,
    refresh,
    startOf: (item: PlannedActivityRow) => resolveStartTime(item, availability),
    toggle: (item: PlannedActivityRow) => toggleMutation.mutate(item),
    isToggling: (item: PlannedActivityRow) => toggleMutation.isPending && toggleMutation.variables?.id === item.id,
  };
}

export type PlanningData = ReturnType<typeof usePlanning>;
