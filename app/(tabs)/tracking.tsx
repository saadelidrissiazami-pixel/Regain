import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import { CategoryBadge } from '../../src/components/CategoryBadge';
import { ProgressRing } from '../../src/components/ProgressRing';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../src/features/planning/types';
import { formatDayLabel } from '../../src/lib/formatDate';
import { fetchCompletedActivities, markActivityUndone } from '../../src/lib/planning';
import { fetchStreak, fetchWeekStats } from '../../src/lib/tracking';
import { useWeekStart } from '../../src/lib/useToday';
import { useAuthStore } from '../../src/store/authStore';

export default function TrackingScreen() {
  const weekStart = useWeekStart();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user.id;
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: ['trackingStats', userId, weekStart],
    queryFn: () => fetchWeekStats(userId!, weekStart),
    enabled: !!userId,
  });

  const streakQuery = useQuery({
    queryKey: ['streak', userId],
    queryFn: () => fetchStreak(userId!),
    enabled: !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['completedActivities', userId],
    queryFn: () => fetchCompletedActivities(userId!),
    enabled: !!userId,
  });

  const undoMutation = useMutation({
    mutationFn: (plannedActivityId: string) => markActivityUndone(userId!, plannedActivityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['completedActivities', userId] });
      queryClient.invalidateQueries({ queryKey: ['weekPlan', userId, weekStart] });
      queryClient.invalidateQueries({ queryKey: ['trackingStats', userId] });
      queryClient.invalidateQueries({ queryKey: ['streak', userId] });
    },
  });

  const stats = statsQuery.data;
  const categoryEntries = Object.entries(stats?.minutesByCategory ?? {}) as [
    keyof typeof CATEGORY_LABELS,
    number,
  ][];
  const maxMinutes = Math.max(1, ...categoryEntries.map(([, minutes]) => minutes));

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([statsQuery.refetch(), streakQuery.refetch(), historyQuery.refetch()]);
    setRefreshing(false);
  }, [statsQuery.refetch, streakQuery.refetch, historyQuery.refetch]);

  return (
    <ScrollView
      className="flex-1 bg-paper px-5 pt-16"
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B57" />}
    >
      <Text className="font-label mb-1 text-sm text-primary">
        Continuez comme ça
      </Text>
      <Text className="font-display mb-6 text-[28px] leading-8 text-ink">
        Votre progression
      </Text>

      <View className="mb-6 flex-row items-center justify-around rounded-2xl border border-line bg-surface p-5 shadow-sm">
        <ProgressRing
          progress={(streakQuery.data ?? 0) / 7}
          value={`${streakQuery.data ?? 0}`}
          label="jours de suite"
          color="#FF6B57"
          trackColor="#FFE4DD"
        />
        <ProgressRing
          progress={stats ? (stats.totalCount > 0 ? stats.completedCount / stats.totalCount : 0) : 0}
          value={stats ? `${stats.completedCount}/${stats.totalCount}` : '0/0'}
          label="activités faites"
          color="#1E9C86"
          trackColor="#D9F1EB"
        />
      </View>

      <Text className="font-display mb-3 text-sm text-ink-soft">
        Temps par catégorie cette semaine
      </Text>
      {categoryEntries.length === 0 ? (
        <Text className="font-body mb-6 text-sm text-ink-soft">
          Aucune activité réalisée pour l'instant — cochez-les depuis votre planning.
        </Text>
      ) : (
        <View className="mb-6">
          {categoryEntries.map(([category, minutes]) => (
            <View key={category} className="mb-3">
              <View className="mb-1.5 flex-row justify-between">
                <Text className="font-label text-sm text-ink">
                  {CATEGORY_LABELS[category]}
                </Text>
                <Text className="font-body text-sm text-ink-soft">{minutes} min</Text>
              </View>
              <View className="h-2.5 overflow-hidden rounded-full bg-line">
                <View
                  className="h-2.5 rounded-full"
                  style={{ width: `${(minutes / maxMinutes) * 100}%`, backgroundColor: CATEGORY_COLORS[category] }}
                />
              </View>
            </View>
          ))}
        </View>
      )}

      <Text className="font-display mb-3 text-sm text-ink-soft">
        Historique
      </Text>
      {historyQuery.isLoading ? <ActivityIndicator color="#FF6B57" /> : null}
      {historyQuery.data?.length === 0 ? (
        <Text className="font-body text-sm text-ink-soft">Rien de coché pour l'instant.</Text>
      ) : null}
      {historyQuery.data?.map((item) => (
        <View key={item.id} className="mb-2.5 flex-row items-center rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <View className="flex-1 pr-3">
            <CategoryBadge category={item.activities_catalog.category} />
            <Text className="font-label mt-2 text-base text-ink">
              {item.activities_catalog.title}
            </Text>
            <Text className="font-body mt-0.5 text-xs text-ink-soft">{formatDayLabel(item.date)}</Text>
          </View>
          <Pressable onPress={() => undoMutation.mutate(item.id)} disabled={undoMutation.isPending}>
            {undoMutation.isPending && undoMutation.variables === item.id ? (
              <ActivityIndicator size="small" color="#FF6B57" />
            ) : (
              <Text className="font-label text-sm text-accent">
                Annuler
              </Text>
            )}
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}
